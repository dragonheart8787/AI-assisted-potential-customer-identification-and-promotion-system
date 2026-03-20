# 推廣中心 - 學習歷程專題資料

> 本文件整理專題動機、目標、架構、功能、測試與反思，供學習歷程使用。

---

## 一、專題基本資料

| 項目 | 內容 |
|------|------|
| **專題名稱** | 推廣中心：AI 輔助潛在客戶探勘與推廣系統 |
| **開發環境** | Node.js、瀏覽器端 JavaScript、localStorage |
| **主要技術** | 爬蟲、網站分析、AI 整合、CRM、報告生成 |

---

## 二、專題動機

我發現很多人有網站、行銷、資安需求，但很難精準找到客戶；傳統開發客戶方式很低效，很多時間浪費在無效名單上。

因此我想把 **AI、爬蟲、網站分析、CRM** 整合成一套真正能幫助接案或推廣產品的系統。目標不只是自動找客戶，而是讓系統能**分析需求、產生建議、輔助決策**，從名單蒐集到報告輸出形成完整流程。

---

## 三、專題目標

1. 建立可自動蒐集潛在客戶名單的系統
2. 分析網站與公開資訊，判斷客戶可能需求
3. 透過 AI 生成推廣訊息與客戶分類
4. 建立 CRM 與推廣工作流程
5. 輸出網站健檢、SEO、資安報告
6. 驗證系統在本地環境的功能與效能

---

## 四、系統架構

### 4.1 架構圖（文字版）

```
使用者輸入關鍵字
        ↓
┌─────────────────────────────────────────────────────────────┐
│  名單蒐集層                                                   │
│  Google Places / Facebook Places / 招募頁(104,1111) / 手動   │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│  資料處理層                                                   │
│  data-deduplication（去重、email 驗證、過期標記）              │
│  compliance-manager（頻率限制、黑名單、退訂）                 │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│  分析層                                                       │
│  website-analyzer（網站分析、聯絡資訊抓取）                   │
│  → website_need_score、security_need_score、leadSignals      │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│  AI 層                                                        │
│  ai-assistant（客戶分類、訊息生成、回覆建議）                 │
│  ai-knowledge-base（產品、案例、產業話術）                    │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│  業務層                                                       │
│  crm-database（客戶管理、Pipeline、互動紀錄）                 │
│  auto-followup（多步驟跟進排程）                              │
│  ai-promotion-workflow（整合流程）                            │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│  輸出層                                                       │
│  report-generator（健檢、SEO、資安、3分鐘摘要、一頁提案）     │
│  匯出（CSV、PDF、JSON）                                       │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 資料流程

```
搜尋客戶 → 去重驗證 → 網站分析 → AI 分類 → 推廣訊息生成 → CRM 建檔 → 報告輸出
```

---

## 五、功能清單

| 模組名稱 | 主要功能 | 實際用途 | 學到什麼 |
|----------|----------|----------|----------|
| data-deduplication | 名單去重、email 驗證、過期標記 | 提高資料品質 | 資料清洗、正規化 |
| compliance-manager | 頻率限制、黑名單、退訂 | 降低濫發與合規風險 | 合規設計 |
| website-analyzer | 網站分析、聯絡資訊抓取、評分 | 判斷網站品質與需求線索 | CORS、代理、HTML 解析 |
| ai-knowledge-base | 產品、案例、產業話術 | 讓 AI 生成更貼近需求 | 知識庫設計 |
| report-generator | 健檢、SEO、資安、成交導向報告 | 作為提案素材 | 報告模板、可成交格式 |
| crm-database | 客戶管理、Pipeline、互動紀錄 | 追蹤開發流程 | 資料結構、狀態管理 |
| ai-assistant | 訊息生成、客戶分類、回覆建議 | 協助推廣策略 | AI 整合、規則引擎 |
| ai-promotion-workflow | 整合流程 | 串接各模組 | 工作流設計 |
| auto-followup | 多步驟跟進排程 | 第 3、7 天自動追蹤 | 排程、事件驅動 |
| job-board-crawler | 招募頁搜尋 | B2B、招聘需求訊號 | 爬蟲、資料轉換 |
| 後端 API | CORS 代理、SMTP、OAuth、追蹤 | 支援前端功能 | Node.js、API 設計 |

---

## 六、評分機制（判斷依據，非僅命名）

三個分數皆為 **0–100**，數值越高代表該面向「越需要被服務」或「越值得優先聯繫」。下方為**教授可對照的判斷依據簡表**；加權細節與程式對應見 **`pages/scoring-explained.html`**（或 `website-analyzer.js` 的 `computeWebsiteNeedScore` / `computeSecurityNeedScore`、`ai-assistant.js` 的 `classifyCustomer`）。

### 6.1 分數與判斷依據（總表）

| 分數 | 判斷依據（系統實際檢查什麼） |
|------|------------------------------|
| **website_need_score** | **CTA**（聯絡／預約／詢價等關鍵字＋連結或按鈕）、**聯絡表單**（`form`＋送出）、**SEO**（`title`、`meta description`、H1）、**網站速度**（首頁載入是否 &gt; 3 秒）、**手機版適配**（`meta viewport`）、另含版權年份過舊、作品／服務頁線索等加權。 |
| **security_need_score** | **HTTPS**、**security.txt**（`/.well-known/security.txt`）、**基本安全標頭**（HSTS、X-Content-Type-Options、X-Frame-Options、CSP）、**robots／sitemap／隱私聲明**（首頁 HTML 文字線索）、**外露技術資訊**（Server、CMS 版本字串等）、WordPress 無 CSP 等加權。 |
| **lead_score** | **決策者線索**（職稱含 CEO／Founder／Chief、VP／Director 等）、**需求標籤**（CRM `tags`：高價值、有興趣、拒絕、冷名單等加扣分）、**互動紀錄**（`interactionCount` 門檻加分）、**網站分析訊號**（若有 `websiteAnalysis`：issues 數量、security／seo 類 leadSignals）。**聯絡完整度**（email／電話／官網齊全）可作為後續擴充欄位；目前規則以職稱、標籤、互動、網站訊號為主。 |

### 6.2 與程式的對應

| 分數 | 主要實作位置 |
|------|----------------|
| website_need_score | `website-analyzer.js` → `computeWebsiteNeedScore` |
| security_need_score | `website-analyzer.js` → `computeSecurityNeedScore`、`analyzeSecurity` |
| lead_score | `ai-assistant.js` → `classifyCustomer`（基準分 50 再加減，最後 clamp 0–100） |

---

## 七、測試與效能

### 7.1 測試方式

| 方式 | 指令/路徑 |
|------|------------|
| 後端 API | `node run-tests.js` |
| 瀏覽器完整 | `http://localhost:3856/pages/test-app-new.html` |
| KPI 儀表板 | `http://localhost:3856/pages/kpi-dashboard.html` |

### 7.2 效能數據

| 操作 | 預期 | 實測 |
|------|------|------|
| getTargetProspects | < 5ms | 瀏覽器測試 |
| CRM searchCustomers | < 2ms | 瀏覽器測試 |
| AI generatePromotionMessage (local) | < 50ms | 瀏覽器測試 |
| API config | ~1ms | 1ms |
| 靜態檔案 | < 10ms | 2ms |

### 7.3 驗證意識

本專案不只實作功能，也建立測試腳本與效能基準，確保系統在本地環境可正確運行。

---

## 八、製作過程與困難

| 困難 | 解決方法 |
|------|----------|
| CORS 與代理 | 後端提供 `/api/proxy` 代理請求 |
| Node 環境 SSL 憑證 | 瀏覽器端正常，Node 測試時標註限制 |
| Google Places 需 API 金鑰 | 在 backend-config.json 設定，文件說明 |
| Facebook 需 OAuth | 整合 account-login-manager、oauth-callback |
| 網站分析 fetch 失敗 | 自動改用代理 |
| 名單需去重驗證 | data-deduplication 模組 |
| AI 需搭配知識庫 | ai-knowledge-base 提供產品、案例、語氣 |
| 報告要能促成預約 | 新增 3 分鐘摘要、一頁提案、CTA 區塊 |

---

## 九、使用情境

1. **網站設計工作室**：從 Google/招募頁找潛在客戶，分析官網，生成推廣訊息，產出健檢報告作為提案素材
2. **資安服務**：篩選 security_need_score 高的企業，以資安風險說明切入
3. **接案者**：快速整理高潛力名單，依分數排序，多步驟跟進，KPI 儀表板監控成效

---

## 十、個人貢獻

- 系統構想與架構設計
- 各模組整合與串接
- 後端 API 與測試腳本
- AI 工作流設計
- 名單資料處理與評分機制
- 報告產出與成交導向模板
- 學習歷程與 SOP 文件整理

---

## 十一、成果展示（證據入口）

> 啟動後端後網址皆為 `http://localhost:3856/檔名`。以下為**老師／評審應從哪個檔案看成果**的對照。

### 11.1 核心畫面與模組

| 成果項目 | 檔案或入口 | 說明 |
|----------|------------|------|
| **主畫面（儀表板、名單、撰寫訊息、成效、設定）** | **`app-new.html`** | 專題主要操作介面；內嵌發現客戶、報告產生、Demo 模式開關。 |
| **KPI 儀表板** | **`pages/kpi-dashboard.html`** | 名單數、高分 Lead、Pipeline／產業分布、開信／點擊／跟進；建議截圖。 |
| **CRM 管理（Pipeline、客戶表）** | **`pages/crm-interface.html`** | 獨立 CRM 頁；與主畫面「目標客戶」資料同源（localStorage）。 |
| **AI 推廣工作流程** | **`pages/ai-promotion-workflow.html`** | 批次分類、聯絡流程展示。 |
| **系統架構與 API 一覽** | **`pages/system-overview.html`** | 模組、API、測試方式。 |
| **評分判斷依據（總表＋加權細節）** | **`pages/scoring-explained.html`** | 對應第六節「判斷依據」。 |
| **自動化測試（瀏覽器）** | **`pages/test-app-new.html`** | 模組載入與整合測試。 |
| **報告產出** | **`report-generator.js`**（由 **`app-new.html`** 成效分析區操作） | 健檢／SEO／資安報告與匯出。 |
| **匯出客戶／日誌** | **`export-utils.js`**（**設定**頁按鈕） | CSV、報告 HTML、列印 PDF。 |
| **Demo 穩定展示** | **設定 → 啟用 Demo 模式**；資料見 **`demo/`** | `sample_crm_records.json`、`sample_kpi_events.json`、**`demo/sample_reports/*.html`** 固定範本。 |
| **其他前端頁** | `pages/ai-settings.html`、`pages/ai-knowledge-base.html`、`index.html`（轉址至 app-new）等 | 設定、知識庫；**唯一主展示為 app-new.html**。 |

### 11.2 建議截圖檔名（交件時一目了然）

| 建議檔名 | 內容 |
|----------|------|
| `01-main-app-new.png` | 主畫面 `app-new.html`（儀表板或目標客戶） |
| `02-kpi-dashboard.png` | `pages/kpi-dashboard.html` 全頁或主要指標區 |
| `03-crm-pipeline.png` | `pages/crm-interface.html` 或主畫面客戶列表 |
| `04-report-or-export.png` | 成效分析產生報告或匯出按鈕 |
| `05-test-app-new-pass.png` | `pages/test-app-new.html` 測試通過畫面 |
| `06-run-tests-terminal.png` | 終端機 `node run-tests.js` 通過輸出 |
| `07-scoring-explained.png` | `pages/scoring-explained.html` 總表區 |
| `08-demo-mode-on.png` | 設定頁 Demo 已啟用 + 名單有範例資料 |

### 11.3 書面／簡報一句話導覽

「請先看 **`app-new.html`** 主流程；數據看 **`pages/kpi-dashboard.html`**；客戶管線看 **`pages/crm-interface.html`**；評分邏輯看 **`pages/scoring-explained.html`**；自動測試看 **`pages/test-app-new.html`** 與 **`run-tests.js`**。」

---

## 十二、反思

1. **資料品質比功能數量重要**：一開始以為做完功能就夠，後來發現去重、驗證、評分才是讓名單有用的關鍵。
2. **整合才有商業價值**：真正困難的不只是寫程式，而是如何把模組整合成有商業價值的系統，從名單到報告形成閉環。
3. **AI 要放進工作流程**：AI 不只是生成文字，而是要搭配知識庫、評分、跟進排程，才能發揮價值。
4. **驗證意識**：建立測試與效能基準，讓專案不只「能跑」，還能「證明能跑」。

---

## 十三、未來可延伸

- LinkedIn、更多招募頁整合
- 開信/點擊追蹤與 A/B 測試
- 統一收件箱與回覆分析
- 行動版介面

---

## 十四、Demo 模式（學習歷程穩定展示）

未正式上線時：首次開啟空名單會**自動載入 Demo 範例**；亦可於 **設定 → 啟用 Demo 模式** 手動載入 `demo/sample_crm_records.json` 與 `demo/sample_kpi_events.json`，KPI 儀表板可截圖。固定報告範本見 `demo/sample_reports/`。詳見 `demo/README-DEMO.md`。

---

## 十五、證據資料清單

| 類型 | 路徑/說明 |
|------|-----------|
| 系統截圖 | 檔名建議見**第十一節**；畫面見 app-new、pages/kpi-dashboard、pages/crm-interface |
| 測試結果 | run-tests.js 輸出、pages/test-app-new.html |
| 效能數據 | CAPABILITY-PERFORMANCE-REPORT.md |
| 架構說明 | pages/system-overview.html |
| 報告輸出 | report-generator 各類型報告 |
| 名單分析 | 發現客戶各來源結果 |
| Demo 資料 | `demo/sample_crm_records.json`、`demo/DEMO-展示流程.md` |
| 匯出功能 | 設定頁 → 匯出客戶 CSV、匯出操作日誌 |
| 操作日誌 | operation-logger.js，報告生成、新增客戶時記錄 |

---

## 十六、材料準備檢查表

- [ ] 專題名稱、動機、目標
- [ ] **第十一節成果展示**：對照表 + 建議截圖檔名已備妥
- [ ] **第六節評分**：判斷依據總表（或 pages/scoring-explained.html 截圖）
- [ ] 系統架構圖（pages/system-overview.html 截圖）
- [ ] 功能清單與模組介紹
- [ ] 製作流程與困難
- [ ] 測試與效能證據
- [ ] 反思與學到什麼
- [ ] 系統截圖（主介面、發現客戶、報告、KPI）
- [ ] 測試通過截圖
- [ ] Demo 展示流程演練
