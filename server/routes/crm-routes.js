const {
  validateCustomerPayload,
  validateInteractionPayload,
  validateTagsPayload
} = require('../../lib/api-validate.js');

const DEFAULT_TAGS = ['新名單', '已回覆', '有興趣', '拒絕', '高價值', '冷名單', '熱門潛在客戶'];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function registerCrmRoutes(app, { db, sessionAuth }) {
  const { attachUserMiddleware, requireAuth } = sessionAuth;
  const auth = [attachUserMiddleware, requireAuth];

  app.get('/api/crm/customers', ...auth, (req, res) => {
    const rows = db
      .prepare('SELECT id, payload, updated_at FROM customers WHERE user_id = ? ORDER BY updated_at DESC')
      .all(req.userId);
    const customers = rows.map((r) => {
      try {
        return JSON.parse(r.payload);
      } catch {
        return null;
      }
    }).filter(Boolean);
    res.json({ customers });
  });

  app.post('/api/crm/customers', ...auth, (req, res) => {
    const v = validateCustomerPayload(req.body);
    if (!v.ok) {
      res.status(400).json({ error: v.error });
      return;
    }
    const body = { ...req.body };
    if (!body.id) body.id = generateId();
    const now = new Date().toISOString();
    body.updatedAt = body.updatedAt || now;
    body.createdAt = body.createdAt || now;
    const payload = JSON.stringify(body);
    try {
      db.prepare(
        'INSERT INTO customers (user_id, id, payload, updated_at) VALUES (?, ?, ?, ?)'
      ).run(req.userId, body.id, payload, now);
    } catch (e) {
      if (String(e.message).includes('UNIQUE')) {
        res.status(409).json({ error: '客戶 id 已存在' });
        return;
      }
      throw e;
    }
    res.status(201).json({ customer: body });
  });

  app.put('/api/crm/customers/:cid', ...auth, (req, res) => {
    const v = validateCustomerPayload(req.body);
    if (!v.ok) {
      res.status(400).json({ error: v.error });
      return;
    }
    const cid = req.params.cid;
    const existing = db
      .prepare('SELECT payload FROM customers WHERE user_id = ? AND id = ?')
      .get(req.userId, cid);
    if (!existing) {
      res.status(404).json({ error: '找不到客戶' });
      return;
    }
    let prev;
    try {
      prev = JSON.parse(existing.payload);
    } catch {
      prev = {};
    }
    const merged = { ...prev, ...req.body, id: cid, updatedAt: new Date().toISOString() };
    const payload = JSON.stringify(merged);
    db.prepare('UPDATE customers SET payload = ?, updated_at = ? WHERE user_id = ? AND id = ?').run(
      payload,
      merged.updatedAt,
      req.userId,
      cid
    );
    res.json({ customer: merged });
  });

  app.delete('/api/crm/customers/:cid', ...auth, (req, res) => {
    const cid = req.params.cid;
    const info = db.prepare('DELETE FROM customers WHERE user_id = ? AND id = ?').run(req.userId, cid);
    db.prepare('DELETE FROM interactions WHERE user_id = ? AND customer_id = ?').run(req.userId, cid);
    if (info.changes === 0) {
      res.status(404).json({ error: '找不到客戶' });
      return;
    }
    res.json({ ok: true });
  });

  app.get('/api/crm/interactions', ...auth, (req, res) => {
    const customerId = req.query.customerId;
    let rows;
    if (customerId) {
      rows = db
        .prepare(
          'SELECT id, customer_id, payload, created_at FROM interactions WHERE user_id = ? AND customer_id = ? ORDER BY created_at DESC'
        )
        .all(req.userId, String(customerId));
    } else {
      rows = db
        .prepare(
          'SELECT id, customer_id, payload, created_at FROM interactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 500'
        )
        .all(req.userId);
    }
    const interactions = rows.map((r) => {
      try {
        return JSON.parse(r.payload);
      } catch {
        return null;
      }
    }).filter(Boolean);
    res.json({ interactions });
  });

  app.post('/api/crm/interactions', ...auth, (req, res) => {
    const v = validateInteractionPayload(req.body);
    if (!v.ok) {
      res.status(400).json({ error: v.error });
      return;
    }
    const body = { ...req.body };
    if (!body.id) body.id = generateId();
    const now = new Date().toISOString();
    body.timestamp = body.timestamp || now;
    const cust = db
      .prepare('SELECT 1 FROM customers WHERE user_id = ? AND id = ?')
      .get(req.userId, body.customerId);
    if (!cust) {
      res.status(400).json({ error: '客戶不存在' });
      return;
    }
    const payload = JSON.stringify(body);
    db.prepare(
      'INSERT INTO interactions (user_id, id, customer_id, payload, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(req.userId, body.id, body.customerId, payload, now);
    res.status(201).json({ interaction: body });
  });

  app.get('/api/crm/meta', ...auth, (req, res) => {
    const row = db.prepare('SELECT tags_json FROM user_crm_meta WHERE user_id = ?').get(req.userId);
    let tags = DEFAULT_TAGS;
    if (row && row.tags_json) {
      try {
        const t = JSON.parse(row.tags_json);
        if (Array.isArray(t) && t.length) tags = t;
      } catch { /* ignore */ }
    }
    res.json({ tags });
  });

  app.put('/api/crm/meta', ...auth, (req, res) => {
    const v = validateTagsPayload(req.body);
    if (!v.ok) {
      res.status(400).json({ error: v.error });
      return;
    }
    const tagsJson = JSON.stringify(v.tags);
    db.prepare(
      'INSERT INTO user_crm_meta (user_id, tags_json) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET tags_json = excluded.tags_json'
    ).run(req.userId, tagsJson);
    res.json({ tags: v.tags });
  });
}

module.exports = { registerCrmRoutes, DEFAULT_TAGS };
