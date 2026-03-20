@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 執行 node run-tests.js （請先已啟動 backend-server.js）
node run-tests.js
echo.
pause
