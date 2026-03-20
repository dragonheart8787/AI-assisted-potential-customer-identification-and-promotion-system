# AI 輔助潛在客戶探勘與推廣系統原型

> Repo：`AI-assisted-potential-customer-identification-and-promotion-system`（學習歷程／原型展示，非 production。）

**開頭一句話：AI 輔助潛在客戶探勘與推廣系統原型** — 從公開與自有名單蒐集潛在客戶，經清洗與合規後，以網站分析與 AI 評分／生成內容，並在 CRM、跟進、KPI 與報告中呈現。

## 功能描述（主線）

| 面向 | 說明 |
|------|------|
| **潛在客戶蒐集** | 手動／CSV、Google Maps／社群／招募頁（視 API 與登入設定）、CRM 統一檢視。 |
| **資料清洗與合規** | 去重與驗證、發送頻率／黑名單／紀錄（`data-deduplication.js`、`compliance-manager.js`）。 |
| **網站分析與需求評分** | 公開頁面分析；`website_need_score`、`security_need_score` 與介面上的**可解釋原因**。 |
| **AI 分類與訊息生成** | 客戶分類、`lead_score`、推廣訊息草稿（`ai-assistant.js` 等；可選接外部模型）。 |
| **CRM／follow-up／KPI／report** | Pipeline、自動跟進、**`pages/kpi-dashboard.html`**（唯一正式 KPI 頁）、報告產生與 `demo/sample_reports/` 範本。 |

## 單一展示入口（不要猜哪一頁才是正式版）

| 角色 | 路徑 |
|------|------|
| **唯一主入口** | **`app-new.html`**（功能主畫面）。**`index.html`** 僅負責轉址到 `app-new.html`。 |
| **子頁／工具頁**（由主介面側欄或設定內連結開啟） | 集中在 **`pages/`**：CRM、KPI、AI 設定、API 設定、工作流程、知識庫、評分說明、架構說明、瀏覽器測試頁。 |
| **OAuth 回調（勿刪）** | 根目錄 **`oauth-callback.html`**（若設定真實社群 OAuth，redirect URI 須與後台一致）。 |

> 舊版首頁、debug 測試頁在 **`debug/`**；更舊的實驗 UI 在 **`archive/`**。評審請**只看 `app-new.html` 主線**。

## 如何啟動

1. 安裝 [Node.js](https://nodejs.org/)。
2. 雙擊 **`run-demo.bat`**（或執行 `node backend-server.js`）。
3. 瀏覽器開啟 **http://localhost:3856/app-new.html**（網址列 `/` 亦會導向同一頁）。

勿只用 `file://` 開 HTML，否則 Demo JSON 可能無法載入。

## Demo 模式

- 首次開啟且 CRM 為空時，會自動載入 `demo/sample_crm_records.json`。
- 設定頁可手動「啟用／離開 Demo 模式」。再次觸發自動載入可清除鍵 `promo_showcase_auto_demo_v1`。

## 測試

- 後端啟動後，雙擊 **`run-tests.bat`**（即 `node run-tests.js`）。
- 瀏覽器整合測試：**`pages/test-app-new.html`**。

## 文件與目錄

| 位置 | 用途 |
|------|------|
| `LEARNING-PORTFOLIO.md` | 學習歷程 |
| `CAPABILITY-PERFORMANCE-REPORT.md` | 能力與效能 |
| `SYSTEM-ARCHITECTURE-DIAGRAMS.md` | 架構圖文 |
| `docs/` | 舊指南、論文稿、批次說明等參考 |
| `reports/` | 長篇測試／分析報告 |
| `archive/` | 封存 UI 與 **`archive/batches/`** 舊啟動批次檔 |
| `debug/` | **僅開發除錯**，非展示主線 |
| `pages/` | **正式子頁**（由 app-new 進入） |

## 技術備註

- 後端預設埠號 **3856**（`backend-server.js`）。
- 選用桌面版：`npm start`（Electron 載入 `app-new.html`）。
