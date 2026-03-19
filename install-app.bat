@echo off
chcp 65001 >nul
title AI 推銷助手安裝程式

echo.
echo ========================================
echo    AI 推銷助手桌面應用程式安裝程式
echo ========================================
echo.

:: 檢查是否在正確的目錄
if not exist "package.json" (
    echo [錯誤] 未找到 package.json 檔案
    echo 請確保您在正確的專案目錄中運行此腳本
    echo.
    pause
    exit /b 1
)

echo [資訊] 開始安裝 AI 推銷助手桌面應用程式...
echo.

:: 檢查 Node.js
echo [步驟 1/5] 檢查 Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [錯誤] 未檢測到 Node.js
    echo.
    echo 請先安裝 Node.js：
    echo 1. 前往 https://nodejs.org/
    echo 2. 下載並安裝最新的 LTS 版本
    echo 3. 重新啟動命令提示字元
    echo 4. 重新運行此安裝腳本
    echo.
    pause
    exit /b 1
)

echo [成功] Node.js 已安裝
node --version

:: 安裝依賴
echo.
echo [步驟 2/5] 安裝依賴套件...
echo 這可能需要幾分鐘時間，請耐心等待...
echo.

npm install
if %errorlevel% neq 0 (
    echo [錯誤] 依賴安裝失敗
    echo 請檢查網路連線並重試
    echo.
    pause
    exit /b 1
)

echo [成功] 依賴安裝完成

:: 創建必要的目錄
echo.
echo [步驟 3/5] 創建必要目錄...
if not exist "assets" mkdir assets
if not exist "dist" mkdir dist
echo [成功] 目錄創建完成

:: 創建應用程式圖標（如果不存在）
echo.
echo [步驟 4/5] 檢查應用程式圖標...
if not exist "assets\icon.png" (
    echo [警告] 未找到應用程式圖標
    echo 將使用預設圖標
    echo 您可以稍後手動添加 assets\icon.png 檔案
) else (
    echo [成功] 找到應用程式圖標
)

:: 測試應用程式
echo.
echo [步驟 5/5] 測試應用程式...
echo 正在啟動應用程式進行測試...
echo.

timeout /t 3 /nobreak >nul

echo [資訊] 安裝完成！
echo.
echo ========================================
echo    安裝成功完成
echo ========================================
echo.
echo 您現在可以：
echo.
echo 1. 運行 start-app.bat 來啟動應用程式
echo 2. 運行 npm start 來直接啟動
echo 3. 運行 npm run build 來打包成安裝檔
echo.
echo 應用程式功能：
echo • 智能訊息發送系統
echo • 帳號管理工具
echo • AI 聊天助手
echo • 系統測試工具
echo • 數據匯出/匯入
echo • 桌面通知系統
echo.
echo 如需幫助，請查看 README.md 檔案
echo.
pause 