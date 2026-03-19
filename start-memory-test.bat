@echo off
chcp 65001 >nul
title AI記憶管理系統測試

echo.
echo ========================================
echo    🤖 AI記憶管理系統測試啟動器
echo ========================================
echo.

echo 🚀 正在啟動AI記憶管理系統...
echo.

REM 檢查Python是否安裝
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 錯誤：未找到Python，請先安裝Python
    echo 下載地址：https://www.python.org/downloads/
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

echo 🧠 記憶管理功能：
echo   • 記憶鞏固 - 防止重要記憶遺忘
echo   • 後訓練 - 持續學習和改進
echo   • 記憶回顧 - 分析歷史數據
echo   • 記憶優化 - 清理和壓縮數據
echo.

echo 🎯 測試步驟：
echo   1. 在瀏覽器中開啟 http://localhost:8000/ai-chat-test.html
echo   2. 選擇目標領袖
echo   3. 與AI進行對話
echo   4. 測試記憶管理功能
echo   5. 查看學習進度和記憶統計
echo.

echo ⚠️  注意：按 Ctrl+C 停止服務器
echo.

REM 啟動Python HTTP服務器
python -m http.server 8000

echo.
echo 👋 服務器已停止
pause 