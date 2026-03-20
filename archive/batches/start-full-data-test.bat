@echo off
chcp 65001 >nul
title AI全資料訓練與雲端上傳測試
echo.
echo ========================================
echo    🚀 AI全資料訓練與雲端上傳測試
echo ========================================
echo.
echo 🧠 正在啟動AI全資料訓練系統...
echo.
REM 檢查Python是否安裝
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python未安裝，請先安裝Python
    echo 📥 下載地址：https://www.python.org/downloads/
    pause
    exit /b 1
)
echo ✅ Python已安裝
echo.
REM 啟動HTTP服務器
echo 🌐 正在啟動本地服務器...
echo 📍 服務器地址：http://localhost:8000
echo 📄 測試頁面：http://localhost:8000/ai-chat-test.html
echo.
echo 🚀 全資料訓練功能：
echo   • 收集所有可用資料 - 對話、強化、機器人、模板、聯絡人
echo   • 全資料訓練 - 使用所有資料進行模型訓練
echo   • 雲端模型上傳 - 將訓練好的模型上傳到雲端
echo   • 雲端同步 - 與雲端保持同步
echo   • 雲端狀態檢查 - 查看雲端連接狀態
echo.
echo 🎯 測試步驟：
echo   1. 在瀏覽器中開啟 http://localhost:8000/ai-chat-test.html
echo   2. 選擇目標領袖並進行一些AI對話
echo   3. 點擊「📊 全資料訓練」按鈕
echo   4. 觀察訓練過程和結果
echo   5. 點擊「☁️ 上傳模型」按鈕
echo   6. 點擊「🔄 雲端同步」按鈕
echo   7. 點擊「📡 雲端狀態」查看狀態
echo.
echo 📊 測試資料來源：
echo   • AI對話模型 (ai-conversation-model.js)
echo   • AI強化模組 (ai-enhancement-module.js)
echo   • 智能自動機器人 (intelligent-auto-bot.js)
echo   • 對話增強模組 (conversation-enhancer.js)
echo   • 模板系統 (templates.js)
echo   • 聯絡人系統 (contacts.js)
echo   • 用戶資料 (localStorage)
echo.
echo ⚠️  注意：按 Ctrl+C 停止服務器
echo.
REM 啟動Python HTTP服務器
python -m http.server 8000
echo.
echo 👋 服務器已停止
pause 