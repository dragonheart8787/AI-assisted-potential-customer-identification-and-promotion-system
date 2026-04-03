/**
 * Express 應用：API + 靜態檔（path traversal 仍用 lib/static-path）
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const cookieParser = require('cookie-parser');
const { resolveStaticPath } = require('../lib/static-path.js');
const {
  MAX_JSON_BODY,
  validateProxyUrlParam,
  validateSendEmailPayload,
  validateOAuthPayload,
  validateEventPayload
} = require('../lib/api-validate.js');
const { corsDynamicMiddleware } = require('./middleware/cors-dynamic.js');
const { createSessionAuth } = require('./middleware/session-auth.js');
const { proxyLimiter, emailLimiter } = require('./middleware/rate-limit.js');
const { registerAuthRoutes } = require('./routes/auth-routes.js');
const { registerCrmRoutes } = require('./routes/crm-routes.js');
const { registerAccountRoutes } = require('./routes/account-routes.js');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json'
};

function createExpressApp({
  ROOT,
  PORT,
  config,
  nodemailer,
  db
}) {
  const DATA_DIR = path.join(ROOT, 'data');
  const EVENTS_FILE = path.join(DATA_DIR, 'kpi-events.json');
  const LEGACY_EVENTS_FILE = path.join(ROOT, 'kpi-events.json');

  function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  function migrateLegacyEventsFile() {
    try {
      if (!fs.existsSync(EVENTS_FILE) && fs.existsSync(LEGACY_EVENTS_FILE)) {
        ensureDataDir();
        fs.renameSync(LEGACY_EVENTS_FILE, EVENTS_FILE);
      }
    } catch (e) { /* ignore */ }
  }
  migrateLegacyEventsFile();

  function loadEventsFromFile() {
    try {
      if (fs.existsSync(EVENTS_FILE)) {
        return JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));
      }
    } catch (e) { /* ignore */ }
    return [];
  }

  function saveEventToFile(ev, userId) {
    ensureDataDir();
    const events = loadEventsFromFile();
    const row = { ...ev, ts: ev.ts || new Date().toISOString() };
    events.push(row);
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(events.slice(-5000)), 'utf8');
    if (userId) {
      try {
        db.prepare('INSERT INTO kpi_events (user_id, type, payload, ts) VALUES (?, ?, ?, ?)').run(
          userId,
          ev.type || null,
          JSON.stringify(ev),
          row.ts
        );
      } catch (e) { /* ignore db */ }
    }
  }

  async function fetchWithProxy(targetUrl) {
    const https = require('https');
    const httpMod = require('http');
    const u = new URL(targetUrl);
    const lib = u.protocol === 'https:' ? https : httpMod;
    const opts = { headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' }, timeout: 15000 };
    if (u.protocol === 'https:') opts.rejectUnauthorized = false;
    return new Promise((resolve, reject) => {
      const req = lib.get(targetUrl, opts, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
      });
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('timeout'));
      });
    });
  }

  async function handleProxy(decodedUrl) {
    try {
      if (!decodedUrl.startsWith('http://') && !decodedUrl.startsWith('https://')) {
        return { error: 'Invalid URL' };
      }
      const result = await fetchWithProxy(decodedUrl);
      const headers = {};
      if (result.headers) {
        for (const [k, v] of Object.entries(result.headers)) {
          headers[k.toLowerCase()] = v;
        }
      }
      return { status: result.status, body: result.body, headers };
    } catch (e) {
      return { error: e.message };
    }
  }

  async function handleSendEmail(body) {
    if (!nodemailer) {
      return { success: false, error: 'nodemailer 未安裝，請執行 npm install nodemailer' };
    }
    const cfg = config.smtp || {};
    if (!cfg.host || !cfg.user) {
      return { success: false, error: '請在 backend-config.json 設定 SMTP' };
    }
    const trackingId = body.trackingId || `em_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const baseUrl = config.oauthRedirectBase || `http://localhost:${PORT}`;
    let html = body.html || body.text || '';
    if (body.trackOpen && html) {
      const pixel = `<img src="${baseUrl}/api/track?type=open&id=${trackingId}" width="1" height="1" style="display:none" alt="">`;
      html = html.includes('</body>')
        ? html.replace('</body>', pixel + '</body>')
        : html + pixel;
    }
    try {
      const transporter = nodemailer.createTransport({
        host: cfg.host,
        port: cfg.port || 587,
        secure: cfg.secure || false,
        auth: cfg.user ? { user: cfg.user, pass: cfg.pass || '' } : undefined
      });
      await transporter.sendMail({
        from: body.from || cfg.user,
        to: body.to,
        subject: body.subject || '(無主旨)',
        text: body.text || (body.html ? body.html.replace(/<[^>]+>/g, '') : ''),
        html: html || undefined
      });
      saveEventToFile({
        type: 'email_sent',
        trackingId,
        to: body.to,
        customerId: body.customerId,
        templateId: body.templateId,
        campaignId: body.campaignId,
        source: body.source
      }, null);
      return { success: true, trackingId };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async function handleOAuthToken(platform, code, redirectUri, clientId, clientSecret, appId, appSecret) {
    const https = require('https');
    const cId = clientId || appId;
    const cSecret = clientSecret || appSecret;
    const endpoints = {
      linkedin: { url: 'https://www.linkedin.com/oauth/v2/accessToken', body: { grant_type: 'authorization_code', code, client_id: cId, client_secret: cSecret, redirect_uri: redirectUri } },
      facebook: { url: 'https://graph.facebook.com/v18.0/oauth/access_token', body: { grant_type: 'authorization_code', code, client_id: cId, client_secret: cSecret, redirect_uri: redirectUri } },
      instagram: { url: 'https://graph.instagram.com/oauth/access_token', body: { grant_type: 'authorization_code', code, client_id: cId, client_secret: cSecret, redirect_uri: redirectUri } }
    };
    const ep = endpoints[platform];
    if (!ep) return { error: 'Unsupported platform' };
    const body = new URLSearchParams(ep.body).toString();
    const u = new URL(ep.url);
    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
      }, (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve({ error: data });
          }
        });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  const sessionAuth = createSessionAuth(db);
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: MAX_JSON_BODY }));
  app.use(cookieParser());
  app.use(corsDynamicMiddleware);
  app.use(sessionAuth.attachUserMiddleware);

  registerAuthRoutes(app, { db, sessionAuth });
  registerCrmRoutes(app, { db, sessionAuth });
  registerAccountRoutes(app, { db, sessionAuth });

  app.get('/api/proxy', proxyLimiter, async (req, res) => {
    const raw = req.query.url;
    const v = validateProxyUrlParam(raw);
    if (!v.ok) {
      res.json({ error: v.error });
      return;
    }
    const result = await handleProxy(v.url);
    res.json(result);
  });

  app.post('/api/send-email', emailLimiter, async (req, res) => {
    try {
      const v = validateSendEmailPayload(req.body);
      if (!v.ok) {
        res.status(400).json({ success: false, error: v.error });
        return;
      }
      const result = await handleSendEmail(req.body);
      res.json(result);
    } catch (e) {
      res.status(400).json({ success: false, error: e.message });
    }
  });

  app.post('/api/oauth/token', async (req, res) => {
    try {
      const v = validateOAuthPayload(req.body);
      if (!v.ok) {
        res.status(400).json({ error: v.error });
        return;
      }
      const { platform, code, redirectUri, clientId, clientSecret, appId, appSecret } = req.body;
      const token = await handleOAuthToken(platform, code, redirectUri, clientId, clientSecret, appId, appSecret);
      res.json(token);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get('/api/google-places', async (req, res) => {
    const apiKey = config.googlePlacesApiKey;
    if (!apiKey) {
      res.json({ error: '請在 backend-config.json 設定 googlePlacesApiKey' });
      return;
    }
    const query = req.query.query || '';
    const location = req.query.location || '';
    const type = req.query.type || '';
    const language = req.query.language || 'zh-TW';
    if (query.length > 500 || location.length > 200 || type.length > 80 || language.length > 20) {
      res.json({ error: '查詢參數過長' });
      return;
    }
    if (!query.trim()) {
      res.json({ error: '請提供 query 參數' });
      return;
    }
    const params = new URLSearchParams({ query: query.trim(), key: apiKey, language });
    if (location) params.set('location', location);
    if (type) params.set('type', type);
    const textUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`;
    try {
      const result = await fetchWithProxy(textUrl);
      const data = JSON.parse(result.body || '{}');
      if (data.status === 'REQUEST_DENIED' || data.status === 'INVALID_REQUEST') {
        res.json({ error: data.error_message || data.status });
        return;
      }
      const places = (data.results || []).slice(0, 20);
      const enriched = [];
      for (const p of places) {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${p.place_id}&fields=name,formatted_address,formatted_phone_number,website,url&key=${apiKey}`;
        try {
          const dr = await fetchWithProxy(detailsUrl);
          const dd = JSON.parse(dr.body || '{}');
          const d = dd.result || {};
          enriched.push({
            place_id: p.place_id,
            name: p.name || d.name,
            address: p.formatted_address || d.formatted_address,
            phone: d.formatted_phone_number || '',
            website: d.website || '',
            url: d.url || `https://www.google.com/maps/place/?q=place_id:${p.place_id}`,
            rating: p.rating,
            types: p.types || []
          });
        } catch {
          enriched.push({
            place_id: p.place_id,
            name: p.name,
            address: p.formatted_address,
            phone: '',
            website: '',
            url: `https://www.google.com/maps/place/?q=place_id:${p.place_id}`,
            rating: p.rating,
            types: p.types || []
          });
        }
      }
      res.json({ places: enriched });
    } catch (e) {
      res.json({ error: e.message });
    }
  });

  app.get('/api/facebook-places', async (req, res) => {
    const token = req.query.access_token;
    const q = req.query.q || '';
    const center = req.query.center || '';
    if (!token || !q.trim()) {
      res.json({ error: '需 access_token 與 q 參數' });
      return;
    }
    let fbUrl = `https://graph.facebook.com/v18.0/search?type=place&q=${encodeURIComponent(q)}&access_token=${token}&fields=name,location,website,phone,single_line_address`;
    if (center) fbUrl += `&center=${center}`;
    try {
      const result = await fetchWithProxy(fbUrl);
      const data = JSON.parse(result.body || '{}');
      if (data.error) {
        res.json({ error: data.error.message });
        return;
      }
      const places = (data.data || []).map((p) => ({
        id: p.id,
        name: p.name,
        address: p.single_line_address || (p.location && p.location.street),
        phone: p.phone || '',
        website: p.website || '',
        url: p.id ? `https://www.facebook.com/${p.id}` : ''
      }));
      res.json({ places });
    } catch (e) {
      res.json({ error: e.message });
    }
  });

  app.get('/api/track', (req, res) => {
    const type = req.query.type || 'open';
    const id = req.query.id || '';
    if (id) {
      saveEventToFile({ type: type === 'open' ? 'email_open' : type, trackingId: id }, req.userId || null);
    }
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-store');
    res.send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
  });

  app.get('/api/redirect', (req, res) => {
    const to = req.query.to;
    const id = req.query.id || req.query.trackingId || '';
    if (id) {
      saveEventToFile({ type: 'link_click', trackingId: id, destination: to }, req.userId || null);
    }
    if (to) {
      res.redirect(302, decodeURIComponent(to));
    } else {
      res.status(400).send('Missing to parameter');
    }
  });

  app.post('/api/events', (req, res) => {
    try {
      const ev = req.body;
      const v = validateEventPayload(ev);
      if (!v.ok) {
        res.status(400).json({ error: v.error });
        return;
      }
      saveEventToFile(ev, req.userId || null);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get('/api/events', (req, res) => {
    const since = req.query.since;
    const type = req.query.type;
    let events = loadEventsFromFile();
    if (since) {
      const t = new Date(since).getTime();
      events = events.filter((e) => new Date(e.ts).getTime() >= t);
    }
    if (type) events = events.filter((e) => e.type === type);
    res.json({ events: events.slice(-500) });
  });

  app.get('/api/kpi', (req, res) => {
    const events = loadEventsFromFile();
    const sent = events.filter((e) => e.type === 'email_sent').length;
    const opened = events.filter((e) => e.type === 'email_open').length;
    const clicked = events.filter((e) => e.type === 'link_click').length;
    const byDay = {};
    events.forEach((e) => {
      const d = (e.ts || '').slice(0, 10);
      if (d) byDay[d] = (byDay[d] || 0) + 1;
    });
    res.json({
      emailSent: sent,
      emailOpened: opened,
      linkClicked: clicked,
      openRate: sent > 0 ? ((opened / sent) * 100).toFixed(1) : 0,
      clickRate: sent > 0 ? ((clicked / sent) * 100).toFixed(1) : 0,
      byDay
    });
  });

  app.get('/api/config', (req, res) => {
    res.json({
      hasSmtp: !!(config.smtp && config.smtp.host && config.smtp.user),
      hasNodemailer: !!nodemailer,
      hasGooglePlacesApiKey: !!(config.googlePlacesApiKey && String(config.googlePlacesApiKey).trim()),
      oauthRedirectBase: config.oauthRedirectBase || `http://localhost:${PORT}`,
      serverCrmEnabled: true
    });
  });

  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next();
      return;
    }
    const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
    const pathname = url.pathname;
    const filePath = resolveStaticPath(ROOT, pathname);
    if (!filePath) {
      res.status(403).send('Forbidden');
      return;
    }
    const ext = path.extname(filePath);
    const mime = MIME[ext] || 'application/octet-stream';
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.status(404).send('Not Found');
        return;
      }
      res.setHeader('Content-Type', mime);
      res.send(data);
    });
  });

  app.use((err, req, res, next) => {
    if (err && err.type === 'entity.too.large') {
      res.status(413).json({ error: '請求體過大' });
      return;
    }
    next(err);
  });

  return { app, sessionAuth, saveEventToFile, loadEventsFromFile };
}

module.exports = { createExpressApp };
