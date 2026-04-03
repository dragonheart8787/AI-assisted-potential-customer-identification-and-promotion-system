/**
 * Cookie Session：sid 對應 sessions 表
 */
const crypto = require('crypto');

const COOKIE = 'promo_sid';
const SESSION_DAYS = 14;

function randomSid() {
  return crypto.randomBytes(32).toString('hex');
}

function createSessionAuth(db) {
  const upsert = db.prepare(
    'INSERT OR REPLACE INTO sessions (sid, user_id, expires_at) VALUES (?, ?, ?)'
  );
  const getSess = db.prepare(
    'SELECT user_id, expires_at FROM sessions WHERE sid = ?'
  );
  const delSess = db.prepare('DELETE FROM sessions WHERE sid = ?');
  const delExpired = db.prepare('DELETE FROM sessions WHERE expires_at < ?');

  function cleanup() {
    delExpired.run(Date.now());
  }

  function setSessionCookie(res, sid) {
    const maxAge = SESSION_DAYS * 24 * 60 * 60;
    const secure = process.env.NODE_ENV === 'production';
    const parts = [
      `${COOKIE}=${sid}`,
      'Path=/',
      `Max-Age=${maxAge}`,
      'HttpOnly',
      'SameSite=Lax'
    ];
    if (secure) parts.push('Secure');
    res.setHeader('Set-Cookie', parts.join('; '));
  }

  function clearSessionCookie(res) {
    res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
  }

  function login(res, userId) {
    cleanup();
    const sid = randomSid();
    const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
    upsert.run(sid, userId, exp);
    setSessionCookie(res, sid);
    return sid;
  }

  function logout(res, sid) {
    if (sid) delSess.run(sid);
    clearSessionCookie(res);
  }

  function parseCookie(req) {
    const raw = req.headers.cookie;
    if (!raw) return null;
    const parts = raw.split(';').map((p) => p.trim());
    for (const p of parts) {
      if (p.startsWith(`${COOKIE}=`)) return p.slice(COOKIE.length + 1);
    }
    return null;
  }

  function attachUserMiddleware(req, res, next) {
    cleanup();
    req.promoSid = null;
    req.userId = null;
    const sid = parseCookie(req);
    if (!sid) return next();
    const row = getSess.get(sid);
    if (!row || row.expires_at < Date.now()) {
      if (sid) delSess.run(sid);
      return next();
    }
    req.promoSid = sid;
    req.userId = row.user_id;
    next();
  }

  function requireAuth(req, res, next) {
    if (!req.userId) {
      res.status(401).json({ error: '需要登入' });
      return;
    }
    const u = db.prepare('SELECT id, email, deleted_at FROM users WHERE id = ?').get(req.userId);
    if (!u || u.deleted_at) {
      res.status(401).json({ error: '帳號無效' });
      return;
    }
    req.user = { id: u.id, email: u.email };
    next();
  }

  return {
    attachUserMiddleware,
    requireAuth,
    login,
    logout,
    parseCookie,
    COOKIE
  };
}

module.exports = { createSessionAuth };
