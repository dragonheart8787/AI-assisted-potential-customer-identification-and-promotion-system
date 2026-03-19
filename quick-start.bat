@echo off
chcp 65001 >nul
title AI推銷助手快速啟動

echo.
echo ========================================
echo   AI推銷助手快速啟動器
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

echo 🚀 正在啟動AI推銷助手伺服器...
echo.

:: 啟動HTTP伺服器
start "AI推銷助手伺服器" cmd /c "python -m http.server 8000"

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

echo 🌐 正在開啟AI聊天測試頁面...
start "" "http://localhost:8000/ai-chat-test.html"

echo.
echo 🎯 使用說明：
echo.
echo 1. 選擇目標領袖
echo 2. 與AI對話測試推銷策略
echo 3. 使用快速測試功能
echo 4. 查看測試結果
echo.
echo 💡 快速測試：
echo    - 點擊側邊欄的測試按鈕
echo    - 使用快速操作按鈕
echo    - 與AI進行自然對話
echo.
echo ⚠️  按任意鍵關閉伺服器...
pause >nul

taskkill /f /im python.exe >nul 2>&1
echo ✅ 伺服器已關閉 