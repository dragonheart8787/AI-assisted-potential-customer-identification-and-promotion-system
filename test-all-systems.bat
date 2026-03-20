@echo off
chcp 65001 >nul
echo ========================================
echo 推廣中心 - 本機頁面快速開啟（請先 run-demo.bat 啟動後端）
echo ========================================
echo.
echo 1. app-new.html（主展示）
echo 2. crm-interface.html
echo 3. archive\quick-test.html（封存快速測試）
echo 4. ai-settings.html
echo.
start app-new.html
timeout /t 2 /nobreak >nul
start crm-interface.html
timeout /t 2 /nobreak >nul
start archive\quick-test.html
timeout /t 2 /nobreak >nul
start ai-settings.html
echo.
echo 已嘗試開啟上述頁面。
pause
