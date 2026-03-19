@echo off
echo ========================================
echo 🚀 持續強化訓練測試系統
echo ========================================
echo.

echo 📋 檢查Python安裝...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python未安裝或未添加到PATH
    echo 請先安裝Python: https://www.python.org/downloads/
    pause
    exit /b 1
) else (
    echo ✅ Python已安裝
)

echo.
echo 🌐 啟動本地HTTP伺服器...
echo 📍 伺服器地址: http://localhost:8000
echo 📄 測試頁面: http://localhost:8000/ai-chat-test.html
echo.

start python -m http.server 8000

echo ⏳ 等待伺服器啟動...
timeout /t 2 /nobreak >nul

echo 🌐 開啟測試頁面...
start http://localhost:8000/ai-chat-test.html

echo.
echo ========================================
echo 🎯 持續強化訓練測試指南
echo ========================================
echo.
echo 📌 測試步驟:
echo 1. 在AI聊天界面中，找到"記憶管理"面板
echo 2. 查看新增的"🎯 持續強化訓練"區塊
echo 3. 測試以下功能:
echo    - 🎯 手動強化: 立即執行強化訓練
echo    - 📊 強化狀態: 查看各項訓練狀態
echo    - 📈 訓練統計: 查看詳細訓練數據
echo    - 🔄 持續模式: 切換自動強化模式
echo.
echo 🔄 持續強化訓練功能:
echo - 每30分鐘自動執行強化學習
echo - 每小時自動執行深度學習優化
echo - 每2小時自動執行智能優化
echo - 每5分鐘檢查實時學習機會
echo - 每6小時執行預測分析
echo - 每4小時調整動態參數
echo.
echo 📊 監控指標:
echo - 深度學習準確率
echo - 強化學習分數
echo - 自適應訓練進度
echo - 多模態學習效率
echo.
echo ⚠️  注意事項:
echo - 持續強化模式會自動在背景運行
echo - 可以通過"持續模式"按鈕控制啟用/停用
echo - 所有訓練數據會自動保存到本地存儲
echo - 訓練進度會實時更新到UI界面
echo.
echo 🎉 開始測試持續強化訓練系統！
echo.
pause 