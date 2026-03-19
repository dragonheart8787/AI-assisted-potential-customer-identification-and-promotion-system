@echo off
chcp 65001 >nul
title AI聊天系統啟動器

echo.
echo ========================================
echo   AI聊天系統啟動器
echo ========================================
echo.

:: 檢查Python是否安裝
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 錯誤：未找到Python，請先安裝Python
    echo 請訪問 https://www.python.org/downloads/ 下載並安裝Python
    pause
    exit /b 1
)

:: 終止佔用端口的Python進程
echo ⏳ 正在檢查並終止可能佔用端口8000的Python進程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    tasklist /fi "PID eq %%a" | findstr /i "python.exe" >nul
    if not errorlevel 1 (
        echo ⚠️  警告：端口8000已被進程PID %%a (Python)佔用，正在嘗試終止...
        taskkill /pid %%a /f >nul 2>&1
        timeout /t 1 >nul
    )
)
echo.

echo 🚀 正在啟動AI聊天系統伺服器...
echo.

:: 啟動HTTP伺服器
start "AI聊天系統伺服器" cmd /c "python -m http.server 8000"

:: 等待伺服器啟動
echo ⏳ 等待伺服器啟動...
timeout /t 3 >nul

:: 檢查伺服器是否成功啟動
netstat -an | findstr :8000 >nul
if errorlevel 1 (
    echo ❌ 伺服器啟動失敗，請檢查日誌或手動啟動。
    pause
    exit /b 1
)

echo ✅ 伺服器已成功啟動！
echo.

:: 顯示訪問選項
echo 📋 請選擇要開啟的頁面：
echo.
echo 1. 🤖 AI聊天測試 (推薦)
echo 2. 🔐 安全帳號管理器
echo 3. 🚀 主系統頁面
echo 4. 🧪 系統測試頁面
echo 5. 🌐 開啟所有頁面
echo 6. ❌ 退出
echo.

:menu
set /p choice="請輸入選項 (1-6): "

if "%choice%"=="1" goto ai_chat
if "%choice%"=="2" goto account_manager
if "%choice%"=="3" goto main_system
if "%choice%"=="4" goto test_system
if "%choice%"=="5" goto all_pages
if "%choice%"=="6" goto exit
echo 無效選項，請重新輸入
goto menu

:ai_chat
echo 🤖 正在開啟AI聊天測試...
start "" "http://localhost:8000/ai-chat-test.html"
goto continue

:account_manager
echo 🔐 正在開啟安全帳號管理器...
start "" "http://localhost:8000/secure-account-manager.html"
goto continue

:main_system
echo 🚀 正在開啟主系統頁面...
start "" "http://localhost:8000/index.html"
goto continue

:test_system
echo 🧪 正在開啟系統測試頁面...
start "" "http://localhost:8000/start-test.html"
goto continue

:all_pages
echo 🌐 正在開啟所有頁面...
start "" "http://localhost:8000/ai-chat-test.html"
timeout /t 1 >nul
start "" "http://localhost:8000/secure-account-manager.html"
timeout /t 1 >nul
start "" "http://localhost:8000/index.html"
timeout /t 1 >nul
start "" "http://localhost:8000/start-test.html"
goto continue

:continue
echo.
echo ✅ 頁面已開啟！
echo.
echo 📝 使用說明：
echo.
echo 🤖 AI聊天測試：
echo    - 與AI推銷助手對話
echo    - 測試各種AI功能
echo    - 選擇目標領袖進行測試
echo    - 查看AI回應和建議
echo.
echo 🔐 安全帳號管理器：
echo    - 安全地管理您的X和LinkedIn帳號
echo    - 使用帳號密碼直接連接
echo    - 測試帳號連接狀態
echo    - 匯入/匯出帳號設定
echo.
echo 🚀 主系統頁面：
echo    - 完整的推銷系統功能
echo    - 直接帳號控制整合
echo    - AI對話和測試功能
echo.
echo 🧪 系統測試頁面：
echo    - 全面系統功能測試
echo    - 直接帳號控制測試
echo    - 查看詳細測試結果
echo.
echo ⚠️  重要提醒：
echo    - 請確保您的帳號資訊安全
echo    - 定期更改密碼
echo    - 不要在公共設備上使用
echo    - 系統使用本地加密存儲
echo.
echo 🔧 故障排除：
echo    - 如果頁面無法載入，請檢查伺服器狀態
echo    - 如果連接失敗，請檢查用戶名和密碼
echo    - 如果發送失敗，請檢查網路連接
echo.
echo 💡 安全建議：
echo    - 使用強密碼
echo    - 啟用雙因素認證
echo    - 定期檢查帳號活動
echo    - 不要分享您的登入資訊
echo.
pause
goto menu

:exit
echo.
echo 🛑 正在關閉伺服器...
taskkill /f /im python.exe >nul 2>&1
echo ✅ 伺服器已關閉
echo.
echo 感謝使用AI聊天系統！
echo.
pause 