@echo off
cd /d "%~dp0"

echo.
echo ========================================
echo    Starting Backend Server...
echo ========================================
echo.

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install from https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Starting backend server (port 3856)...
echo.
node backend-server.js

echo.
echo Press any key to exit...
pause >nul
taskkill /f /im node.exe >nul 2>&1
