/**
 * 本地伺服器 - 用於開啟新介面（避免路徑編碼問題）
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3856;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/app-new.html';
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
  const url = `http://localhost:${PORT}/app-new.html`;
  console.log('推廣中心已啟動: ' + url);
  exec(`start ${url}`, () => {});
});
