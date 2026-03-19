@echo off
chcp 65001 >nul
title AI 推銷助手桌面應用程式

echo.
echo ========================================
echo    AI 推銷助手桌面應用程式啟動器
echo ========================================
echo.

:: 檢查 Node.js 是否安裝
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [錯誤] 未檢測到 Node.js
    echo.
    echo 請先安裝 Node.js：
    echo 1. 前往 https://nodejs.org/
    echo 2. 下載並安裝最新的 LTS 版本
    echo 3. 重新啟動命令提示字元
    echo.
    pause
    exit /b 1
)

echo [資訊] Node.js 版本：
node --version

:: 檢查是否已安裝依賴
if not exist "node_modules" (
    echo.
    echo [資訊] 首次運行，正在安裝依賴...
    echo.
    npm install
    if %errorlevel% neq 0 (
        echo [錯誤] 依賴安裝失敗
        pause
        exit /b 1
    )
    echo.
    echo [成功] 依賴安裝完成
)

echo.
echo 選擇啟動模式：
echo.
echo 1. 開發模式 (包含開發者工具)
echo 2. 生產模式 (標準運行)
echo 3. 打包應用程式
echo 4. 退出
echo.

set /p choice="請選擇 (1-4): "

if "%choice%"=="1" (
    echo.
    echo [資訊] 啟動開發模式...
    npm run dev
) else if "%choice%"=="2" (
    echo.
    echo [資訊] 啟動生產模式...
    npm start
) else if "%choice%"=="3" (
    echo.
    echo [資訊] 開始打包應用程式...
    echo 這可能需要幾分鐘時間...
    echo.
    npm run build
    if %errorlevel% equ 0 (
        echo.
        echo [成功] 應用程式打包完成！
        echo 安裝檔案位於 dist 資料夾中
        echo.
        pause
    ) else (
        echo.
        echo [錯誤] 打包失敗
        pause
    )
) else if "%choice%"=="4" (
    echo.
    echo 再見！
    exit /b 0
) else (
    echo.
    echo [錯誤] 無效的選擇
    pause
    goto :eof
)

echo.
pause 