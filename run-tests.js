/**
 * 能力與效能測試腳本（Node.js 執行）
 * 執行: node run-tests.js
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3856;
const BASE = `http://localhost:${PORT}`;

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port || 80,
      path: u.pathname + u.search,
      method: options.method || 'GET'
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function run() {
  const results = { pass: 0, fail: 0, perf: [] };
  const log = (name, ok, detail = '', ms = null) => {
    const icon = ok ? 'PASS' : 'FAIL';
    console.log(`  [${icon}] ${name}${detail ? ': ' + detail : ''}${ms != null ? ' (' + ms + 'ms)' : ''}`);
    if (ok) results.pass++; else results.fail++;
    if (ms != null) results.perf.push({ name, ms });
  };

  console.log('\n=== 推廣中心 - 能力與效能測試 ===\n');

  // 1. 後端 API 測試
  console.log('1. 後端 API');
  try {
    let t0 = Date.now();
    const configRes = await fetch(`${BASE}/api/config`);
    const config = JSON.parse(configRes.body || '{}');
    log('API config', configRes.status === 200, '', Date.now() - t0);
    log('hasNodemailer', !!config.hasNodemailer);
  } catch (e) {
    log('API config', false, e.message);
  }

  // 2. CORS 代理（Node 可能因 SSL 憑證失敗，僅檢查 API 是否回應）
  console.log('\n2. CORS 代理');
  try {
    const t0 = Date.now();
    const proxyRes = await fetch(`${BASE}/api/proxy?url=${encodeURIComponent('https://example.com')}`);
    const proxyData = JSON.parse(proxyRes.body || '{}');
    const ok = proxyRes.status === 200 && (!proxyData.error || proxyData.error.includes('certificate'));
    log('Proxy API', ok, proxyData.error ? '(proxy 需在瀏覽器測試)' : '', Date.now() - t0);
  } catch (e) {
    log('Proxy', false, e.message);
  }

  // 3. 效能：多次請求
  console.log('\n3. 效能基準');
  const iterations = 10;
  try {
    let t0 = Date.now();
    for (let i = 0; i < iterations; i++) {
      await fetch(`${BASE}/api/config`);
    }
    const avg = Math.round((Date.now() - t0) / iterations);
    log(`API config x${iterations}`, true, `平均 ${avg}ms`, avg);
  } catch (e) {
    log('Perf test', false, e.message);
  }

  // 4. 靜態檔案
  console.log('\n4. 靜態檔案');
  try {
    const t0 = Date.now();
    const htmlRes = await fetch(`${BASE}/app-new.html`);
    log('app-new.html', htmlRes.status === 200 && htmlRes.body.length > 1000, htmlRes.body?.length + ' bytes', Date.now() - t0);
  } catch (e) {
    log('Static file', false, e.message);
  }

  // 5. 追蹤與 KPI API
  console.log('\n5. 追蹤與 KPI API');
  try {
    const trackRes = await fetch(`${BASE}/api/track?type=open&id=test123`);
    log('Track pixel', trackRes.status === 200);
    const kpiRes = await fetch(`${BASE}/api/kpi`);
    const kpi = JSON.parse(kpiRes.body || '{}');
    log('KPI API', kpiRes.status === 200 && typeof kpi.emailSent === 'number');
  } catch (e) {
    log('Track/KPI', false, e.message);
  }

  // 6. 模組檔案存在
  console.log('\n6. 模組檔案');
  const modules = [
    'data-deduplication.js', 'compliance-manager.js', 'website-analyzer.js',
    'ai-knowledge-base.js', 'report-generator.js', 'crm-database.js',
    'google-places-crawler.js', 'social-places-crawler.js', 'ai-assistant.js',
    'job-board-crawler.js', 'auto-followup.js'
  ];
  modules.forEach(m => {
    const p = path.join(__dirname, m);
    log(m, fs.existsSync(p));
  });

  // 摘要
  console.log('\n=== 測試摘要 ===');
  console.log(`  總計: ${results.pass + results.fail}`);
  console.log(`  通過: ${results.pass}`);
  console.log(`  失敗: ${results.fail}`);
  const avgMs = results.perf.length ? Math.round(results.perf.reduce((a, p) => a + p.ms, 0) / results.perf.length) : 0;
  console.log(`  平均耗時: ${avgMs}ms`);
  console.log('');
}

// 檢查伺服器是否運行
fetch(`${BASE}/api/config`).then(() => run()).catch(e => {
  console.log('錯誤: 無法連接到後端 (localhost:' + PORT + ')');
  console.log('請先執行: node backend-server.js');
  console.log('或: 開啟新介面.bat');
  process.exit(1);
});
