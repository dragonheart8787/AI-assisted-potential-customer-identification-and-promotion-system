# 推廣中心 - Demo 展示流程

> 供學習歷程或評審時穩定重現成果

## 前置

1. 執行 `node backend-server.js` 或 `開啟新介面.bat`
2. 瀏覽器開啟 `http://localhost:3856/app-new.html`

---

## 展示流程（約 10 分鐘）

### 1. 系統架構（1 分鐘）

開啟 `http://localhost:3856/system-overview.html`

- 展示架構圖、模組清單、API、評分機制
- 說明：名單 → 去重 → 分析 → AI → CRM → 報告

### 2. 名單蒐集（2 分鐘）

發現客戶 → 選擇分頁：

- **手動新增**：輸入一筆範例（姓名、公司、Email、官網）
- **Google Maps**：若有 API 金鑰，輸入「咖啡廳 台北」搜尋
- **招募頁**：輸入「網站工程師」搜尋 104/1111
- 加入 1–2 筆到目標客戶

### 3. 網站分析與評分（2 分鐘）

- 對有官網的客戶，點「分析」或進入報告頁
- 產生網站健檢報告
- 展示 website_need_score、security_need_score、leadSignals

### 4. AI 生成訊息（1 分鐘）

- 撰寫訊息 → 選擇目標 → 點「AI 生成」
- 展示個人化推廣訊息
- 可切換產業，展示不同話術

### 5. 報告輸出（2 分鐘）

- 成效分析 → 產生健檢/SEO/資安報告
- 展示 3 分鐘摘要、一頁提案
- 點「列印」或「匯出 HTML」→ 可另存 PDF

### 6. 測試與 KPI（2 分鐘）

- 開啟 `http://localhost:3856/test-app-new.html` → 執行全部測試
- 開啟 `http://localhost:3856/kpi-dashboard.html` → 展示 KPI
- 命令列執行 `node run-tests.js` 展示後端測試

---

## 截圖建議

| 畫面 | 路徑 |
|------|------|
| 主介面 | app-new.html 儀表板 |
| 發現客戶 | 發現客戶彈窗、各分頁 |
| 目標客戶列表 | 目標客戶頁 |
| 報告輸出 | 健檢報告、3 分鐘摘要 |
| AI 生成 | 撰寫訊息 + AI 生成結果 |
| 系統架構 | system-overview.html |
| 測試通過 | test-app-new.html、run-tests.js |
| KPI 儀表板 | kpi-dashboard.html |

---

## 備用：無 API 時

若 Google/Facebook API 未設定：

- 用手動新增 + CSV 匯入 demo 資料
- 使用 `demo/sample_leads.json` 結構匯入
- 網站分析可輸入任一公開網址（如 example.com）示範
