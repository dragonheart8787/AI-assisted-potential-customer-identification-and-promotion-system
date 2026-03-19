@echo off
echo ========================================
echo 🧪 科技高層自動訊息發送系統 - 功能測試
echo ========================================
echo.

echo 📋 測試項目：
echo 1. 主系統 (index.html)
echo 2. CRM管理介面 (crm-interface.html)
echo 3. 功能測試頁面 (quick-test.html)
echo 4. API設定頁面 (api-settings.html)
echo.

echo 🚀 正在啟動所有系統...
echo.

echo 1. 啟動主系統...
start index.html
timeout /t 2 /nobreak >nul

echo 2. 啟動CRM管理介面...
start crm-interface.html
timeout /t 2 /nobreak >nul

echo 3. 啟動功能測試頁面...
start quick-test.html
timeout /t 2 /nobreak >nul

echo 4. 啟動API設定頁面...
start api-settings.html
timeout /t 2 /nobreak >nul

echo.
echo ✅ 所有系統已啟動！
echo.
echo 📊 系統功能說明：
echo - 主系統：完整的訊息發送和AI功能
echo - CRM管理：客戶資料庫、Pipeline、A/B測試
echo - 功能測試：自動測試所有模組功能
echo - API設定：配置真實社群媒體API
echo.
echo 💡 使用提示：
echo 1. 先在API設定頁面配置您的API金鑰
echo 2. 在CRM管理介面匯入客戶名單
echo 3. 在主系統中開始發送訊息
echo 4. 使用功能測試頁面驗證所有功能
echo.
pause

