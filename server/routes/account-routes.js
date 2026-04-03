/**
 * 資料主體最小權利：匯出、軟刪除帳號（階段 6）
 */
function registerAccountRoutes(app, { db, sessionAuth }) {
  const { attachUserMiddleware, requireAuth, logout } = sessionAuth;
  const auth = [attachUserMiddleware, requireAuth];

  app.get('/api/account/export', ...auth, (req, res) => {
    const userId = req.userId;
    const customers = db
      .prepare('SELECT id, payload, updated_at FROM customers WHERE user_id = ?')
      .all(userId)
      .map((r) => {
        try {
          return JSON.parse(r.payload);
        } catch {
          return { id: r.id, _parseError: true };
        }
      });
    const interactions = db
      .prepare('SELECT id, customer_id, payload, created_at FROM interactions WHERE user_id = ?')
      .all(userId)
      .map((r) => {
        try {
          return JSON.parse(r.payload);
        } catch {
          return { id: r.id, _parseError: true };
        }
      });
    const meta = db.prepare('SELECT tags_json FROM user_crm_meta WHERE user_id = ?').get(userId);
    res.json({
      version: 1,
      exportedAt: new Date().toISOString(),
      user: req.user,
      tags: meta && meta.tags_json ? JSON.parse(meta.tags_json) : null,
      customers,
      interactions
    });
  });

  app.post('/api/account/delete', ...auth, (req, res) => {
    const userId = req.userId;
    const sid = req.promoSid;
    db.prepare('DELETE FROM interactions WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM customers WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM user_crm_meta WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM kpi_events WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
    const now = new Date().toISOString();
    db.prepare('UPDATE users SET deleted_at = ? WHERE id = ?').run(now, userId);
    logout(res, sid);
    res.json({ ok: true, message: '帳號已標記刪除並清除工作階段' });
  });
}

module.exports = { registerAccountRoutes };
