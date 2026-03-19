@echo off
chcp 65001 >nul
title 商家推廣系統

cd /d "%~dp0"

echo.
echo ========================================
echo    商家推廣系統 - 啟動中
echo ========================================
echo.

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [錯誤] 未檢測到 Node.js
    echo 請先安裝 Node.js：https://nodejs.org/
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [資訊] 首次運行，正在安裝依賴...
    npm install
    if %errorlevel% neq 0 (
        echo [錯誤] 依賴安裝失敗
        pause
        exit /b 1
    )
)

echo [資訊] 正在啟動應用程式...
echo.
npm start

pause
