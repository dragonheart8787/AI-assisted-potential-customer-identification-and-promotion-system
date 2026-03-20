# AI 輔助潛在客戶探勘與推廣系統（原型）

**一句話**：以 AI 與公開網站訊號輔助辨識商家／B2B 潛在客戶、評分與追蹤，並支援推廣工作流程與 KPI 展示之**學習歷程原型**（非 production）。

## 核心功能

1. **潛在客戶名單**：CRM 整合、手動／CSV／搜尋擴充（Google Maps、社群、招募頁等，視設定與登入而定）。
2. **三項可解釋評分**：`website_need_score`、`security_need_score`、`lead_score`，介面附**判斷原因**（非僅數字）。
3. **網站與公開資訊分析**：CTA、表單、SEO 基礎、安全標頭、security.txt 等（合法、低侵擾）。
4. **推廣工作流程**：訊息撰寫、AI 輔助、合規紀錄、後端代理與追蹤 API（選用）。
5. **CRM／KPI／報告範例**：`kpi-dashboard.html` 為唯一正式 KPI 頁；內建報告與 `demo/sample_reports/` 範本。
6. **Demo 展示模式**：**預設展示路徑**，無 API 金鑰、無 OAuth 亦可瀏覽範例名單與圖表。
7. **桌面版（選用）**：`npm start` 以 Electron 載入與瀏覽器相同之 `app-new.html`。

## 如何啟動（瀏覽器）

1. 安裝 [Node.js](https://nodejs.org/)（測試與後端需要）。
2. 專案根目錄執行：**雙擊 `run-demo.bat`**（或手動 `node backend-server.js`）。
3. 瀏覽器開啟：**http://localhost:3856/app-new.html**（根路徑 `/` 亦會導向同一頁）。

> 僅開啟本機 HTML 檔（`file://`）時，Demo 範例 JSON 可能無法載入；**請優先使用後端伺服器**。

## 展示路徑（給評審／教授）

| 項目 | 路徑 |
|------|------|
| **主介面（唯一主入口）** | `app-new.html`；`index.html` 會轉址至此 |
| KPI 儀表板 | `kpi-dashboard.html` |
| CRM | `crm-interface.html`（或由主介面按鈕開啟） |
| 評分說明 | `scoring-explained.html` |
| 系統架構圖文 | `SYSTEM-ARCHITECTURE-DIAGRAMS.md`（同 repo 內） |

除錯與舊版介面已移至 **`archive/`**，請勿當作主線展示。

## Demo 模式

- **首次開啟且 CRM 為空**時，會自動載入 `demo/sample_crm_records.json`（並標記為 Demo）。
- 亦可至 **設定 → 啟用 Demo 模式** 手動載入／**離開 Demo 模式**還原備份。
- KPI 範例事件：`demo/sample_kpi_events.json`（與後端事件合併顯示）。

若要再次觸發「首次自動 Demo」，可清除瀏覽器本機儲存的鍵 `promo_showcase_auto_demo_v1` 後重新整理。

## 測試方式

- **雙擊 `run-tests.bat`**（等同 `node run-tests.js`）。  
- **請先啟動後端**（`run-demo.bat` 或 `node backend-server.js`），測試會連線 `http://localhost:3856`。

## 延伸文件（不在此重複長篇內容）

| 位置 | 說明 |
|------|------|
| `LEARNING-PORTFOLIO.md` | 學習歷程與反思 |
| `CAPABILITY-PERFORMANCE-REPORT.md` | 能力與效能報告 |
| `SYSTEM-ARCHITECTURE-DIAGRAMS.md` | 架構圖與說明 |
| `docs/` | 安裝、批次、專題舊稿等參考文件 |
| `reports/` | 長篇測試／分析報告彙整 |
| `archive/` | 舊首頁、debug 頁、封存 UI |

## 技術備註

- 後端預設埠號：**3856**（`backend-server.js`）。
- 真實寄信／OAuth 等需另行設定 `backend-config.json`；**交作業展示以 Demo 模式為主即可**。
