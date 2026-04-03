@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 建議使用：npm test （含單元測試並自動啟動後端）
echo 或僅整合測試（請先已啟動 server\backend-server.js）：node scripts\run-tests.js
echo.
where npm >nul 2>&1
if %errorlevel% equ 0 (
  call npm test
) else (
  node scripts\run-tests.js
)
echo.
pause
