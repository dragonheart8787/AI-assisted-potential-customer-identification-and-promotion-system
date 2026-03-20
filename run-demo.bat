@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 啟動後端伺服器 (port 3856)...
start "推廣中心後端" cmd /k "node backend-server.js"
timeout /t 2 /nobreak >nul
echo 開啟主展示頁 app-new.html ...
start "" "http://localhost:3856/app-new.html"
