/**
 * 後端啟動時環境與路徑檢查（僅 log，不中斷啟動）
 */
const fs = require('fs');
const path = require('path');

function printStartupInfo({ port, __dirname, configPath, dataDir, eventsFile, nodemailer, config }) {
  const lines = [];
  lines.push('');
  lines.push('=== 推廣中心後端啟動檢查 ===');
  lines.push(`埠號: ${port}`);
  lines.push(`設定檔: ${configPath} ${fs.existsSync(configPath) ? '(存在)' : '(不存在，使用內建預設)'}`);
  lines.push(`資料目錄: ${dataDir} ${fs.existsSync(dataDir) ? '(存在)' : '(將於寫入事件時建立)'}`);
  lines.push(`事件檔: ${eventsFile}`);
  try {
    fs.accessSync(path.dirname(eventsFile), fs.constants.W_OK);
    lines.push('資料目錄寫入: 可寫');
  } catch {
    lines.push('資料目錄寫入: 請確認權限（可能無法儲存 KPI 事件）');
  }
  lines.push(`Nodemailer: ${nodemailer ? '已載入' : '未載入（僅影響實際寄信）'}`);
  lines.push(`SMTP 已設定: ${config.smtp && config.smtp.host && config.smtp.user ? '是' : '否'}`);
  lines.push(`Google Places API: ${config.googlePlacesApiKey && String(config.googlePlacesApiKey).trim() ? '已設定' : '未設定'}`);
  lines.push('==========================');
  lines.push('');
  console.log(lines.join('\n'));
}

module.exports = { printStartupInfo };
