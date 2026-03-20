@echo off
chcp 65001 >nul
title 科技高層自動訊息發送系統 - 主啟動器

echo.
echo ========================================
echo   科技高層自動訊息發送系統
echo   主啟動器
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

echo 📋 請選擇要啟動的系統：
echo.
echo 1. 🚀 主系統 (完整功能)
echo 2. 🔐 安全帳號管理器 (帳號管理)
echo 3. 🤖 AI聊天測試 (AI助手)
echo 4. 🧪 系統測試 (功能測試)
echo 5. 🌐 全系統 (所有功能)
echo 6. ⚡ 快速測試 (快速啟動)
echo 7. 🎯 AI助手 (AI專用)
echo 8. 🔒 安全系統 (安全優先)
echo 9. ❌ 退出
echo.

:menu
set /p choice="請輸入選項 (1-9): "

if "%choice%"=="1" goto main_system
if "%choice%"=="2" goto account_manager
if "%choice%"=="3" goto ai_chat
if "%choice%"=="4" goto test_system
if "%choice%"=="5" goto all_systems
if "%choice%"=="6" goto quick_test
if "%choice%"=="7" goto ai_assistant
if "%choice%"=="8" goto secure_system
if "%choice%"=="9" goto exit
echo 無效選項，請重新輸入
goto menu

:main_system
echo 🚀 正在啟動主系統...
call start-main-system.bat
goto end

:account_manager
echo 🔐 正在啟動安全帳號管理器...
call start-account-manager.bat
goto end

:ai_chat
echo 🤖 正在啟動AI聊天測試...
call start-ai-chat.bat
goto end

:test_system
echo 🧪 正在啟動系統測試...
call start-test.bat
goto end

:all_systems
echo 🌐 正在啟動全系統...
call start-all-systems.bat
goto end

:quick_test
echo ⚡ 正在啟動快速測試...
call start-quick-test.bat
goto end

:ai_assistant
echo 🎯 正在啟動AI助手...
call start-ai-assistant.bat
goto end

:secure_system
echo 🔒 正在啟動安全系統...
call start-secure-system.bat
goto end

:end
echo.
echo ✅ 系統已啟動完成！
echo.
echo 💡 使用提示：
echo    - 每個啟動器都有專門的功能
echo    - 可以同時運行多個系統
echo    - 按任意鍵返回主選單
echo.
pause >nul
goto menu

:exit
echo.
echo 感謝使用科技高層自動訊息發送系統！
echo.
pause 