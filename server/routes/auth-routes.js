const bcrypt = require('bcryptjs');
const {
  validateRegisterPayload,
  validateLoginPayload
} = require('../../lib/api-validate.js');
const { loginLimiter } = require('../middleware/rate-limit.js');

function registerAuthRoutes(app, { db, sessionAuth }) {
  const { attachUserMiddleware, login, logout } = sessionAuth;

  app.post('/api/auth/register', loginLimiter, (req, res) => {
    const v = validateRegisterPayload(req.body);
    if (!v.ok) {
      res.status(400).json({ error: v.error });
      return;
    }
    const exists = db.prepare('SELECT id FROM users WHERE email = ? AND deleted_at IS NULL').get(v.email);
    if (exists) {
      res.status(409).json({ error: '此 email 已註冊' });
      return;
    }
    const hash = bcrypt.hashSync(v.password, 10);
    const now = new Date().toISOString();
    const info = db
      .prepare('INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)')
      .run(v.email, hash, now);
    login(res, info.lastInsertRowid);
    res.status(201).json({ user: { id: info.lastInsertRowid, email: v.email } });
  });

  app.post('/api/auth/login', loginLimiter, (req, res) => {
    const v = validateLoginPayload(req.body);
    if (!v.ok) {
      res.status(400).json({ error: v.error });
      return;
    }
    const row = db.prepare('SELECT id, password_hash FROM users WHERE email = ? AND deleted_at IS NULL').get(v.email);
    if (!row || !bcrypt.compareSync(v.password, row.password_hash)) {
      res.status(401).json({ error: '帳號或密碼錯誤' });
      return;
    }
    login(res, row.id);
    res.json({ user: { id: row.id, email: v.email } });
  });

  app.post('/api/auth/logout', attachUserMiddleware, (req, res) => {
    logout(res, req.promoSid);
    res.json({ ok: true });
  });

  app.get('/api/auth/me', attachUserMiddleware, (req, res) => {
    if (!req.userId) {
      res.status(401).json({ error: '未登入' });
      return;
    }
    const u = db.prepare('SELECT id, email FROM users WHERE id = ? AND deleted_at IS NULL').get(req.userId);
    if (!u) {
      res.status(401).json({ error: '未登入' });
      return;
    }
    res.json({ user: { id: u.id, email: u.email } });
  });
}

module.exports = { registerAuthRoutes };
