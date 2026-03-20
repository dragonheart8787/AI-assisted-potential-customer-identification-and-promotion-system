/**
 * 後端伺服器 - CORS 代理、SMTP 發信、OAuth 回調
 * 執行: node backend-server.js
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = 3856;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
};

// 載入 nodemailer（若已安裝）
let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  nodemailer = null;
}

function loadConfig() {
  const configPath = path.join(__dirname, 'backend-config.json');
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  return {
    smtp: { host: '', port: 587, secure: false, user: '', pass: '' },
    googlePlacesApiKey: '',
    oauthRedirectBase: `http://localhost:${PORT}`
  };
}

const config = loadConfig();

// 事件儲存（開信、點擊、發信等 KPI 用）— 置於 data/ 以保持根目錄簡潔
const DATA_DIR = path.join(__dirname, 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'kpi-events.json');
const LEGACY_EVENTS_FILE = path.join(__dirname, 'kpi-events.json');
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}
function migrateLegacyEventsFile() {
  try {
    if (!fs.existsSync(EVENTS_FILE) && fs.existsSync(LEGACY_EVENTS_FILE)) {
      ensureDataDir();
      fs.renameSync(LEGACY_EVENTS_FILE, EVENTS_FILE);
    }
  } catch (e) {}
}
migrateLegacyEventsFile();

function loadEvents() {
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      return JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));
    }
  } catch (e) {}
  return [];
}
function saveEvent(ev) {
  ensureDataDir();
  const events = loadEvents();
  events.push({ ...ev, ts: ev.ts || new Date().toISOString() });
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(events.slice(-5000)), 'utf8');
}

async function fetchWithProxy(targetUrl) {
  const https = require('https');
  const httpMod = require('http');
  const u = new URL(targetUrl);
  const lib = u.protocol === 'https:' ? https : httpMod;
  const opts = { headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' }, timeout: 15000 };
  if (u.protocol === 'https:') opts.rejectUnauthorized = false; // 避免 "unable to get local issuer certificate"
  return new Promise((resolve, reject) => {
    const req = lib.get(targetUrl, opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function handleProxy(url) {
  try {
    const decoded = decodeURIComponent(url);
    if (!decoded.startsWith('http://') && !decoded.startsWith('https://')) {
      return { error: 'Invalid URL' };
    }
    const result = await fetchWithProxy(decoded);
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
    html = (html.includes('</body>') ? html.replace('</body>', pixel + '</body>') : html + pixel);
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
    saveEvent({ type: 'email_sent', trackingId, to: body.to, customerId: body.customerId, templateId: body.templateId, campaignId: body.campaignId, source: body.source });
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
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve({ error: data }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '', `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API: CORS 代理
  if (pathname === '/api/proxy' && url.searchParams.has('url')) {
    const result = await handleProxy(url.searchParams.get('url'));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  // API: 發送 Email
  if (pathname === '/api/send-email' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const result = await handleSendEmail(parsed);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // API: OAuth 取得 token（後端代為請求，避免 client_secret 暴露）
  if (pathname === '/api/oauth/token' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const { platform, code, redirectUri, clientId, clientSecret, appId, appSecret } = JSON.parse(body || '{}');
        const token = await handleOAuthToken(platform, code, redirectUri, clientId, clientSecret, appId, appSecret);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(token));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // API: Google Places 搜尋
  if (pathname === '/api/google-places' && req.method === 'GET') {
    const apiKey = config.googlePlacesApiKey;
    if (!apiKey) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '請在 backend-config.json 設定 googlePlacesApiKey' }));
      return;
    }
    const query = url.searchParams.get('query') || '';
    const location = url.searchParams.get('location') || '';
    const type = url.searchParams.get('type') || '';
    const language = url.searchParams.get('language') || 'zh-TW';
    if (!query.trim()) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '請提供 query 參數' }));
      return;
    }
    const params = new URLSearchParams({
      query: query.trim(),
      key: apiKey,
      language
    });
    if (location) params.set('location', location);
    if (type) params.set('type', type);
    const textUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`;
    try {
      const result = await fetchWithProxy(textUrl);
      const data = JSON.parse(result.body || '{}');
      if (data.status === 'REQUEST_DENIED' || data.status === 'INVALID_REQUEST') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: data.error_message || data.status }));
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
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ places: enriched }));
    } catch (e) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // API: Facebook Places 搜尋（需 access_token）
  if (pathname === '/api/facebook-places' && req.method === 'GET') {
    const token = url.searchParams.get('access_token');
    const q = url.searchParams.get('q') || '';
    const center = url.searchParams.get('center') || '';
    if (!token || !q.trim()) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '需 access_token 與 q 參數' }));
      return;
    }
    let fbUrl = `https://graph.facebook.com/v18.0/search?type=place&q=${encodeURIComponent(q)}&access_token=${token}&fields=name,location,website,phone,single_line_address`;
    if (center) fbUrl += `&center=${center}`;
    try {
      const result = await fetchWithProxy(fbUrl);
      const data = JSON.parse(result.body || '{}');
      if (data.error) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: data.error.message }));
        return;
      }
      const places = (data.data || []).map(p => ({
        id: p.id,
        name: p.name,
        address: p.single_line_address || (p.location && p.location.street),
        phone: p.phone || '',
        website: p.website || '',
        url: p.id ? `https://www.facebook.com/${p.id}` : ''
      }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ places }));
    } catch (e) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // API: 開信追蹤 pixel
  if (pathname === '/api/track' && req.method === 'GET') {
    const type = url.searchParams.get('type') || 'open';
    const id = url.searchParams.get('id') || '';
    if (id) saveEvent({ type: type === 'open' ? 'email_open' : type, trackingId: id });
    res.writeHead(200, { 'Content-Type': 'image/gif', 'Cache-Control': 'no-store' });
    res.end(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
    return;
  }

  // API: 點擊追蹤並 302 跳轉
  if (pathname === '/api/redirect' && req.method === 'GET') {
    const to = url.searchParams.get('to');
    const id = url.searchParams.get('id') || url.searchParams.get('trackingId') || '';
    if (id) saveEvent({ type: 'link_click', trackingId: id, destination: to });
    if (to) {
      res.writeHead(302, { Location: decodeURIComponent(to) });
      res.end();
    } else {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing to parameter');
    }
    return;
  }

  // API: 事件記錄與查詢
  if (pathname === '/api/events') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', c => body += c);
      req.on('end', () => {
        try {
          const ev = JSON.parse(body || '{}');
          saveEvent(ev);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }
    const since = url.searchParams.get('since');
    const type = url.searchParams.get('type');
    let events = loadEvents();
    if (since) {
      const t = new Date(since).getTime();
      events = events.filter(e => new Date(e.ts).getTime() >= t);
    }
    if (type) events = events.filter(e => e.type === type);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ events: events.slice(-500) }));
    return;
  }

  // API: KPI 彙總
  if (pathname === '/api/kpi') {
    const events = loadEvents();
    const sent = events.filter(e => e.type === 'email_sent').length;
    const opened = events.filter(e => e.type === 'email_open').length;
    const clicked = events.filter(e => e.type === 'link_click').length;
    const byDay = {};
    events.forEach(e => {
      const d = (e.ts || '').slice(0, 10);
      if (d) byDay[d] = (byDay[d] || 0) + 1;
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      emailSent: sent,
      emailOpened: opened,
      linkClicked: clicked,
      openRate: sent > 0 ? ((opened / sent) * 100).toFixed(1) : 0,
      clickRate: sent > 0 ? ((clicked / sent) * 100).toFixed(1) : 0,
      byDay
    }));
    return;
  }

  // API: 後端設定
  if (pathname === '/api/config') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      hasSmtp: !!(config.smtp && config.smtp.host && config.smtp.user),
      hasNodemailer: !!nodemailer,
      hasGooglePlacesApiKey: !!(config.googlePlacesApiKey && String(config.googlePlacesApiKey).trim()),
      oauthRedirectBase: config.oauthRedirectBase || `http://localhost:${PORT}`
    }));
    return;
  }

  // 靜態檔案
  let reqPath = pathname === '/' ? '/app-new.html' : pathname;
  const filePath = path.join(__dirname, reqPath.replace(/^\//, ''));
  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`推廣中心後端已啟動: http://localhost:${PORT}`);
  console.log('  - CORS 代理: /api/proxy?url=...');
  console.log('  - 發送 Email: POST /api/send-email');
  console.log('  - OAuth token: POST /api/oauth/token');
  const { exec } = require('child_process');
  exec(`start http://localhost:${PORT}/app-new.html`, () => {});
});
