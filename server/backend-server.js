/**
 * 後端伺服器 - Express、SQLite（sql.js）、CRM API、CORS 代理、SMTP、OAuth
 * 執行: node server/backend-server.js
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { createDb } = require('./db/index.js');
const { createExpressApp } = require('./express-app.js');
const { maybeBootstrapAdmin } = require('./bootstrap-admin.js');
const { printStartupInfo } = require('../lib/startup-info.js');

const ROOT = path.join(__dirname, '..');
const PORT = 3856;

let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  nodemailer = null;
}

function loadConfig() {
  const configPath = path.join(ROOT, 'backend-config.json');
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
const DATA_DIR = path.join(ROOT, 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'kpi-events.json');

(async () => {
  try {
    const db = await createDb(ROOT);
    maybeBootstrapAdmin(db);
    const { app } = createExpressApp({
      ROOT,
      PORT,
      config,
      nodemailer,
      db
    });

    const server = http.createServer(app);
    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.error(`[推廣中心] 埠 ${PORT} 已被佔用（可能已有另一個後端在跑）。請關閉該視窗，或在 PowerShell 執行：netstat -ano | findstr :${PORT} 再 taskkill /PID <PID> /F`);
      } else {
        console.error('[推廣中心] 伺服器錯誤:', err);
      }
      process.exit(1);
    });
    server.listen(PORT, () => {
      const configPath = path.join(ROOT, 'backend-config.json');
      printStartupInfo({
        port: PORT,
        __dirname: ROOT,
        configPath,
        dataDir: DATA_DIR,
        eventsFile: EVENTS_FILE,
        nodemailer,
        config
      });
      console.log(`推廣中心後端已啟動: http://localhost:${PORT}`);
      console.log('  - 上線模式 CRM: POST /api/auth/register | /api/auth/login');
      console.log('  - CORS 代理: /api/proxy?url=...');
      console.log('  - 發送 Email: POST /api/send-email');

      if (process.env.NODE_ENV === 'production' && (!process.env.SESSION_SECRET || String(process.env.SESSION_SECRET).length < 16)) {
        console.warn('[推廣中心] 警告: 生產環境請設定 SESSION_SECRET（至少 16 字元），見 docs/PRODUCTION-ARCHITECTURE.md');
      }

      const noOpen = process.env.NO_OPEN_BROWSER === '1' || process.env.CI === 'true';
      if (!noOpen && process.platform === 'win32') {
        const { exec } = require('child_process');
        exec(`start http://localhost:${PORT}/app-new.html`, () => {});
      }
    });
  } catch (err) {
    console.error('[推廣中心] 啟動失敗:', err);
    process.exit(1);
  }
})();
