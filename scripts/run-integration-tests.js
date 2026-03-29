/**
 * 背景啟動 backend-server.js，執行 run-tests.js，然後關閉伺服器
 * 環境變數: NO_OPEN_BROWSER=1（由本腳本設定）
 */
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const root = path.join(__dirname, '..');
const backendJs = path.join(root, 'backend-server.js');
const runTestsJs = path.join(root, 'run-tests.js');
const PORT = 3856;

function waitForServer(retries = 40) {
  return new Promise((resolve, reject) => {
    const tryOnce = (n) => {
      const req = http.get(`http://127.0.0.1:${PORT}/api/config`, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (n <= 0) return reject(new Error('後端在逾時內未就緒'));
        setTimeout(() => tryOnce(n - 1), 250);
      });
    };
    tryOnce(retries);
  });
}

const env = { ...process.env, NO_OPEN_BROWSER: '1' };
const srv = spawn(process.execPath, [backendJs], {
  cwd: root,
  env,
  stdio: 'ignore',
  windowsHide: true
});

let finished = false;
function exit(code) {
  if (finished) return;
  finished = true;
  try {
    srv.kill('SIGTERM');
  } catch (_) {}
  setTimeout(() => process.exit(code), 300);
}

srv.on('error', (err) => {
  console.error(err);
  exit(1);
});

(async () => {
  try {
    await waitForServer();
    const testProc = spawn(process.execPath, [runTestsJs], {
      cwd: root,
      stdio: 'inherit',
      env
    });
    testProc.on('close', (code) => exit(code === 0 ? 0 : 1));
  } catch (e) {
    console.error(e.message);
    exit(1);
  }
})();

process.on('SIGINT', () => exit(1));
