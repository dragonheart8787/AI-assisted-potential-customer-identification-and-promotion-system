# 科技高層自動訊息發送與AI推銷系統｜技術報告

## 1. 專案概述
- 目標：以AI驅動自動化推銷，實際整合社群帳號登入與批量外聯，提升回覆率與轉換率。
- 範疇：潛在客戶發現、訊息最佳化、批量發送、自動跟進、績效監控、AI聊天輔助。
- 技術：HTML5、CSS3、JavaScript ES6+、localStorage；可延伸至 Electron 與後端API代理。

## 2. 系統架構與模組
- 主介面與導航：`index.html` / `index-real-google.html`、`style.css`
- OAuth/社群整合：`real-google-oauth.js`、`google-api-settings.html`、`real-social-media-api.js`
- 帳號管理：`account-login-manager.js`
- AI聊天：`advanced-ai-chat-engine.js`、`smart-chat-interface.html`
- AI推銷：`ai-sales-bot.js`、`ai-sales-bot-interface.html`
- 潛客發現：`intelligent-prospect-discovery.js`、`prospect-discovery-interface.html`
- 智能最佳化：`smart-sales-optimization.js`
- 儀表板：`real-time-analytics-dashboard.html`
- CRM/其他：`crm-database.js`、`ab-testing.js`、`auto-followup.js`、`unified-inbox.js`

## 3. 核心流程
1) 設定 Google Client ID 並登入平台帳號 → 2) 智能客戶發現（篩選/評分）→ 3) 加入推銷名單 → 4) 批量推銷（AI個性化與延遲節流）→ 5) 自動跟進 → 6) 儀表板監控與優化（A/B、時機/主旨/內容最佳化）。

## 4. 重要功能
- Google OAuth 帳號選擇器體驗（`real-google-oauth.js`），設定入口 `google-api-settings.html`。
- 真實社群API抽象（`real-social-media-api.js`）：登入、發送、登出、測試。
- 進階AI聊天（`advanced-ai-chat-engine.js`）：情感/意圖/緊急度分析，回覆建議與自動回覆。
- AI推銷機器人（`ai-sales-bot.js`）：投資人/CEO 模板、個性化產生、批量推銷、跟進流程、成效指標。
- 潛客發現（`intelligent-prospect-discovery.js`）：多來源（模擬）搜尋、評分、排序、導出/加入Sales Bot。
- 智能最佳化（`smart-sales-optimization.js`）：主旨/內容/時機最佳化與期望提升估計。
- 儀表板（`real-time-analytics-dashboard.html`）：即時指標、趨勢、警報、活動流。

## 5. 資料與安全
- localStorage：儲存 OAuth 設定、登入狀態、名單、績效與搜尋結果。
- 請勿提交 API 金鑰至版本控制；建議以後端安全代理與環境變數管理。

## 6. 佈署與匯出
- 直接以瀏覽器開啟 HTML 檔；建議以靜態伺服器（如 GitHub Pages）佈署。
- 匯出 PDF：
  - 報告：在瀏覽器開啟 `PROJECT-REPORT.md`（建議轉為 `PROJECT-REPORT.html` 或用 VSCode Markdown PDF 外掛）後列印為 PDF。
  - 投影片：開啟 `PROJECT-SLIDES.html` → 瀏覽器列印（含背景圖形），選擇「另存 PDF」。

## 7. 已知限制與下一步
- 目前API呼叫多為前端模擬；上線需：
  - 後端OAuth回調與API代理（Node/Express/Serverless）
  - 速率限制、退避重試、任務佇列（BullMQ）
  - 真實社群API整合（LinkedIn/X/Meta）
- 加值：Chart.js 圖表、雲端數據倉儲、A/B 顯著性檢定、自動ROI報告。

## 8. 附錄：快速檔案索引
`index.html`, `index-real-google.html`, `style.css`, `real-google-oauth.js`, `google-api-settings.html`, `real-social-media-api.js`, `account-login-manager.js`, `advanced-ai-chat-engine.js`, `smart-chat-interface.html`, `ai-sales-bot.js`, `ai-sales-bot-interface.html`, `intelligent-prospect-discovery.js`, `prospect-discovery-interface.html`, `smart-sales-optimization.js`, `real-time-analytics-dashboard.html`, `crm-database.js`, `ab-testing.js`, `auto-followup.js`, `unified-inbox.js`





