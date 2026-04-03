# AI 輔助潛在客戶探勘與推廣系統（原型）

您好，感謝您閱讀本專案說明。

本儲存庫為 **AI-assisted-potential-customer-identification-and-promotion-system** 之**學習歷程／原型展示**實作，目標是示範如何從公開與自有資料辨識潛在客戶、進行合規處理、搭配網站訊號評分，並以 AI 輔助分類與訊息草稿，最後在 CRM、跟進紀錄、KPI 與報告中呈現。**本專案並非上線用之 production 系統**，而是以可重現、可展示為優先。

---

## 一、專案簡介（一句話）

**AI 輔助潛在客戶探勘與推廣系統原型** — 協助使用者蒐集與整理名單、分析網站需求與資安訊號、以 AI 產出分類與推廣文案，並透過 CRM 與儀表板追蹤成效。

---

## 二、核心能力概覽

為方便您快速掌握範圍，以下將主線能力分項說明：

| 面向 | 說明 |
|------|------|
| **潛在客戶蒐集** | 支援手動／CSV、地圖與社群搜尋（視 API 與登入設定）、招募頁線索等，並匯入同一套 CRM 檢視。 |
| **資料清洗與合規** | 透過去重、Email 驗證、發送頻率與紀錄等機制，降低重複名單與不當觸達風險。 |
| **網站分析與需求評分** | 對公開網頁做合法、低侵擾分析，產出 **website_need_score**、**security_need_score**，並在介面上附**可解釋之判斷理由**（非僅數字）。 |
| **AI 分類與訊息生成** | 依客戶欄位與（選用）網站分析結果進行分類、估算 **lead_score**，並可產出推廣訊息草稿；可選擇純本機規則或外接模型。 |
| **CRM／跟進／KPI／報告** | Pipeline、跟進規則、**正式 KPI 頁**（位於 `pages/kpi-dashboard.html`）、以及網站健檢／SEO／資安等報告範本（含 `demo/sample_reports/`）。 |

---

## 三、目錄與「單一入口」說明

為讓評審或初次瀏覽者**不必猜測哪一頁才是正式版**，檔案配置如下：

| 位置 | 用途 |
|------|------|
| **`app-new.html`** | **唯一主展示介面**（儀表板、名單、撰寫、成效、設定等）。 |
| **`index.html`** | 僅負責轉址至 `app-new.html`，不作為獨立產品頁。 |
| **`oauth-callback.html`** | OAuth 回調用固定路徑；若您設定真實社群登入，請與開發者後台的 redirect URI 一致。 |
| **`pages/`** | 由主介面連結開啟之**正式子頁**（CRM、KPI、設定、工作流程、知識庫、評分說明、架構說明、瀏覽器測試頁等）。 |
| **`demo/`** | 展示用範例資料與固定報告範本，方便無 API 時仍能截圖簡報。 |
| **`debug/`** | 除錯與舊版實驗頁，**不屬於主線展示**。 |
| **`archive/`** | 封存之舊 UI、舊樣式表等；**請勿當作正式入口**。 |
| **`docs/`**、**`reports/`** | 長篇指南、論文式稿件、測試彙整等參考文件。 |
| **`data/`** | 執行時產生之 KPI 事件檔等（例如 `data/kpi-events.json`），避免堆在根目錄。 |

更細的約定請參考 **`docs/ROOT-FILE-POLICY.md`**。若您從舊分支合併後，根目錄又出現多餘的 `.md`，可執行 **`scripts/sweep-stray-root-docs.ps1`**（會將非白名單之 Markdown 移至 `docs/swept-from-root/`，執行前建議先 commit）。

---

## 四、環境需求與啟動方式

1. 請先安裝 **[Node.js](https://nodejs.org/)**（**18 以上**，建議 LTS）。  
2. 於專案根目錄安裝依賴：`npm install`（若僅跑後端展示，亦可 `npm install --omit=dev`）。  
3. 啟動後端（擇一即可）：  
   - 雙擊 **`run-demo.bat`**（Windows），或  
   - `npm run demo`／`npm run backend`／`node server/backend-server.js`  
4. 以瀏覽器開啟：**http://localhost:3856/app-new.html**（根路徑 `/` 亦會導向同一頁）。

**後端設定（選用）：** 請複製 **`backend-config.example.json`** 為 **`backend-config.json`**，再填入 SMTP、Google Places 等。本儲存庫已將 **`backend-config.json` 列入 `.gitignore`**，避免誤提交密鑰；若您曾於舊版將該檔推上遠端，建議旋轉相關金鑰／密碼。

**不自動開瀏覽器：** 在 Linux、macOS、CI 或 Docker 環境，請設定環境變數 **`NO_OPEN_BROWSER=1`**（本專案之整合測試與 Docker 映像已預設此行為）。Windows 本機若亦不想自動開啟，同樣可設定此變數。

**溫馨提醒：** 若僅以檔案總管雙擊開啟 HTML（`file://`），部分範例 JSON 可能無法載入；**建議一律透過本機伺服器瀏覽**。

### 原型展示模式與自建上線模式

| 模式 | CRM 儲存 | 說明 |
|------|----------|------|
| **原型（預設）** | 瀏覽器 `localStorage` | 不必註冊；適合學習歷程與 Demo。 |
| **上線模式** | 伺服器 `data/app.db`（SQLite 檔，由 sql.js 寫入） | 開啟 **[pages/login.html](pages/login.html)** 註冊／登入後，主畫面會與 **`/api/crm/*`** 同步（設定頁可登出）。 |

- 架構與環境變數：**[docs/PRODUCTION-ARCHITECTURE.md](docs/PRODUCTION-ARCHITECTURE.md)**  
- 生產環境請設定 **`SESSION_SECRET`**（至少 16 字元）與 **`ALLOWED_ORIGINS`**（HTTPS 網域逗號分隔）。  
- 可選：設定 **`BOOTSTRAP_ADMIN_EMAIL`**／**`BOOTSTRAP_ADMIN_PASSWORD`** 可在空資料庫時建立第一個帳號。  
- 資料主體（最小實作）：登入後 **`GET /api/account/export`** 匯出 JSON；**`POST /api/account/delete`** 軟刪除帳號並清除該使用者 CRM 資料。

---

## 五、Demo 模式（建議展示時使用）

- 當 CRM 尚無資料時，系統可**自動載入** `demo/sample_crm_records.json`，讓您無需 API 金鑰或 OAuth 也能展示名單與三項分數。  
- 您亦可於 **設定** 中手動 **啟用／離開 Demo 模式**。  
- KPI 相關範例事件見 `demo/sample_kpi_events.json`（與後端事件合併顯示於 KPI 頁）。

---

## 六、測試與驗證

| 方式 | 說明 |
|------|------|
| **一鍵完整測試** | `npm test`：先跑 **單元測試**，再**背景啟動後端**並執行 `scripts/run-tests.js`（無需手動開兩個終端）。 |
| **僅單元測試** | `npm run test:unit`（`lib/api-validate`、`lib/static-path`、`js/data-deduplication` 等，使用 Node 內建 `node --test`）。 |
| **僅整合測試** | `npm run test:integration`（需可綁定埠 3856；與 `npm test` 內含步驟相同）。 |
| **Windows 批次** | 雙擊 **`run-tests.bat`**（請先已手動啟動後端）或依賴 **`npm test`**。 |
| **瀏覽器** | 開啟 **`pages/test-app-new.html`** 做前端模組載入與整合檢查。 |

**持續整合：** 推送至 GitHub 後，**`.github/workflows/ci.yml`** 會於 Ubuntu 上執行 `npm run test:unit` 與 `npm run test:integration`，協助確認後端與 API 測試仍通過。

---

## 七、Docker（選用）

若希望以容器啟動後端（利於展示環境一致）：

```bash
docker compose up --build
```

瀏覽器開啟 **http://localhost:3856/app-new.html**。專案目錄下的 **`./data`** 會掛載至容器內 **`/app/data`**（含 `kpi-events.json`、`app.db` 等，勿將含密鑰之檔案提交至 Git）。

---

## 八、延伸閱讀（與本 README 分工）

本 README 刻意保持精簡；根目錄僅保留本檔。其餘 Markdown 集中在 **`docs/`**：

- **[`docs/LEARNING-PORTFOLIO.md`](docs/LEARNING-PORTFOLIO.md)** — 學習歷程與反思  
- **[`docs/CAPABILITY-PERFORMANCE-REPORT.md`](docs/CAPABILITY-PERFORMANCE-REPORT.md)** — 能力與效能報告  
- **[`docs/SYSTEM-ARCHITECTURE-DIAGRAMS.md`](docs/SYSTEM-ARCHITECTURE-DIAGRAMS.md)** — 架構圖與說明  
- **[`docs/推廣中心_學習歷程_20260329.md`](docs/推廣中心_學習歷程_20260329.md)** — MechCalc 式學習歷程長文  
- **`docs/`** 其餘檔案 — 安裝／批次／舊稿等參考文件  
- **`reports/`** — 長篇測試與分析報告  

---

## 九、選用：桌面版（Electron）

若需以桌面視窗執行與瀏覽器相同之介面，可於安裝依賴後執行 `npm start`。打包設定見 `package.json` 之 `build` 區塊。

---

## 十、聯絡與致謝

本專案作為教學與原型用途，架構與介面仍可能隨學習過程調整。若您在使用或展示時發現文件與實際路徑不符，建議以本 README 與 **`docs/ROOT-FILE-POLICY.md`** 為準，或依專案內註解與腳本路徑交叉確認。

再次感謝您的耐心閱讀，祝展示與審閱順利。
