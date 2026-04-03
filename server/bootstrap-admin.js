/**
 * 若資料庫無使用者且環境變數有設定，建立第一個管理員。
 */
const bcrypt = require('bcryptjs');

function maybeBootstrapAdmin(db) {
  const row = db.prepare('SELECT COUNT(*) AS n FROM users WHERE deleted_at IS NULL').get();
  if (row.n > 0) return;
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password || String(email).trim().length < 3) return;
  const hash = bcrypt.hashSync(String(password), 10);
  const now = new Date().toISOString();
  db.prepare('INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)').run(
    String(email).trim().toLowerCase(),
    hash,
    now
  );
  console.log('[推廣中心] 已依 BOOTSTRAP_ADMIN_EMAIL 建立啟動帳號');
}

module.exports = { maybeBootstrapAdmin };
