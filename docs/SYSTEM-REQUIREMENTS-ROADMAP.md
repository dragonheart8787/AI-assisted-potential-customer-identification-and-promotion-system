# 系統需求與實作路線圖

> 依據您提出的核心模組規格，對照現有系統的差距分析與建議實作順序。

---

## 一、核心模組現況與差距

### 1. 潛在客戶搜尋模組

| 規格需求 | 現況 | 差距 | 優先級 |
|---------|------|------|--------|
| **來源：公司官網** | ❌ 無 | 需新增網址爬取、網域解析 | P1 |
| **來源：Google Maps 商家** | ❌ 無 | 需 Google Places API 整合 | P1 |
| **來源：LinkedIn 公司/個人頁** | ⚠️ 有框架，僅模擬 | `social-media-prospect-crawler.js` 需接真實 API | P0 |
| **來源：Facebook 粉專 / IG 商業帳號** | ⚠️ 同上 | 同上 | P0 |
| **來源：104/1111/Indeed 徵才** | ❌ 無 | 需爬蟲或 API（注意 robots.txt） | P2 |
| **來源：新創名單、展覽協會** | ⚠️ 部分 | `intelligent-prospect-discovery.js` 有 Crunchbase/AngelList 框架，僅模擬 | P2 |
| **來源：政府公司登記** | ❌ 無 | 需整合經濟部商業司 API | P2 |
| **來源：GitHub/Product Hunt/App Store** | ❌ 無 | 需各平台 API | P3 |
| **來源：網站品質差/缺資安對象** | ❌ 無 | 需網站分析模組先完成 | P1 |
| **資料欄位：公司名、產業、官網、聯絡、地區、規模** | ⚠️ 部分 | CRM 有基本欄位，缺：規模、官網品質、技術痕跡 | P0 |
| **資料欄位：徵才、技術痕跡、資安線索、網站品質** | ❌ 無 | 需網站分析模組 | P1 |

**現有模組**：`social-media-prospect-crawler.js`、`intelligent-prospect-discovery.js`（皆為模擬/框架）

---

### 2. AI 需求判斷模組

| 規格需求 | 現況 | 差距 | 優先級 |
|---------|------|------|--------|
| **lead_score 0–100** | ⚠️ 部分 | `intelligent-prospect-discovery.js` 有評分框架，未接網站分析 | P0 |
| **need_type：網站重做/SEO/資安** | ❌ 無 | AI 需新 prompt 與判斷邏輯 | P1 |
| **urgency：高/中/低** | ❌ 無 | 需新增欄位與 AI 判斷 | P1 |
| **reason_summary、outreach_angle** | ⚠️ 部分 | `ai-assistant.js` 有 `classifyCustomer`，可擴充 | P0 |
| **next_action 建議** | ❌ 無 | 需新增輸出欄位 | P2 |
| **判斷訊號：網站老舊、CTA、HTTPS、Security.txt** | ❌ 無 | 需網站分析模組產出結構化資料 | P1 |

**現有模組**：`ai-assistant.js`（OpenAI + 本地規則）、`classifyCustomer()`、`smartSearch()`

---

### 3. 網站與公開資訊分析模組

| 規格需求 | 現況 | 差距 | 優先級 |
|---------|------|------|--------|
| **網站速度、行動版、SEO 結構** | ❌ 無 | 需新增模組（可考慮 Lighthouse API、PageSpeed） | P0 |
| **技術堆疊辨識** | ❌ 無 | 需 HTTP header、HTML 分析 | P1 |
| **HTTP 安全標頭、SSL/TLS** | ❌ 無 | 需新增檢查邏輯 | P1 |
| **robots.txt、sitemap、死連結** | ❌ 無 | 需爬蟲/檢查器 | P2 |
| **自動截圖首頁** | ❌ 無 | 需 Puppeteer 或第三方截圖 API | P2 |
| **自動產出「流失客戶的 5 個原因」** | ❌ 無 | 需 AI 整合分析結果 | P1 |

**現有模組**：無。**建議**：新增 `website-analyzer.js`，可先做 CORS 友善的公開檢查（速度、SSL、基本 header）。

---

### 4. 客戶分群模組

| 規格需求 | 現況 | 差距 | 優先級 |
|---------|------|------|--------|
| **行業、規模、地區、需求、數位成熟度** | ⚠️ 部分 | CRM 有 tags、industry，缺：規模、數位成熟度、成交可能性 | P0 |
| **冷/溫/熱** | ⚠️ 部分 | 有「冷名單」「熱門潛在客戶」標籤，未系統化 | P0 |
| **決定寄什麼內容、價格帶、通路** | ❌ 無 | 需分群邏輯與規則引擎 | P1 |

**現有模組**：`crm-database.js`（tags、pipeline）、`ai-assistant.js`（classifyCustomer）

---

### 5. AI 自動開發信 / 私訊生成模組

| 規格需求 | 現況 | 差距 | 優先級 |
|---------|------|------|--------|
| **冷開發 email、LinkedIn、FB/IG 私訊** | ⚠️ 有 | `ai-assistant.js`、`templates.js`、`messaging.js` | P0 |
| **引用對方網站實際問題** | ❌ 無 | 需網站分析結果作為 context | P1 |
| **不同口吻：正式/簡潔/顧問式/資安警示** | ⚠️ 部分 | 模板有，AI 生成可擴充 tone 參數 | P0 |
| **自動主旨、A/B 開頭** | ⚠️ 部分 | `ab-testing.js`、`smart-sales-optimization.js` 有框架 | P0 |
| **根據已讀/未回覆改寫第二封信** | ❌ 無 | 需開信追蹤 + AI 改寫邏輯 | P2 |

**現有模組**：`ai-assistant.js`、`templates.js`、`messaging.js`、`ab-testing.js`

---

### 6. CRM 客戶管理模組

| 規格需求 | 現況 | 差距 | 優先級 |
|---------|------|------|--------|
| **客戶資料、聯絡歷史、需求類型** | ✅ 有 | 基本完整 | - |
| **報價狀態、提案狀態** | ⚠️ 部分 | 有 stage，可擴充欄位 | P0 |
| **下次跟進日期、成交機率** | ⚠️ 部分 | 有 lastInteraction，缺 nextFollowUp、probability | P0 |
| **附件/報告/audit 連結** | ❌ 無 | 需新增欄位與儲存 | P1 |
| **Pipeline：新名單→已分析→已聯絡→已回覆→...→流失** | ✅ 有 | 階段略不同，可對齊 | P0 |

**現有模組**：`crm-database.js`（完整 CRUD、Pipeline、互動紀錄）

---

### 7. AI 跟單助理模組

| 規格需求 | 現況 | 差距 | 優先級 |
|---------|------|------|--------|
| **自動提醒誰該追** | ⚠️ 部分 | `auto-followup.js` 有排程與規則 | P0 |
| **根據對話產生 follow-up 建議** | ❌ 無 | 需 AI 讀取互動紀錄並生成 | P1 |
| **偵測高意向、預測成交** | ❌ 無 | 需 AI 或規則引擎 | P1 |
| **會議摘要、報價建議範本** | ❌ 無 | 需 AI 生成 | P2 |
| **推薦下一個最值得投入的 lead** | ❌ 無 | 需 ranking / 優先級邏輯 | P1 |

**現有模組**：`auto-followup.js`（規則、排程、模板）

---

### 8. 自動化提案 / 報告模組

| 規格需求 | 現況 | 差距 | 優先級 |
|---------|------|------|--------|
| **網站健檢、SEO 分析、資安摘要** | ❌ 無 | 需報告生成器 + 網站分析資料 | P1 |
| **首頁文案改善、Landing Page 建議** | ❌ 無 | 需 AI 生成 + 模板 | P2 |
| **PDF、網頁分享、Email 摘要** | ❌ 無 | 需報告模組（可考慮 jsPDF、HTML 轉 PDF） | P1 |

**現有模組**：無

---

### 9. 多通路觸達模組

| 規格需求 | 現況 | 差距 | 優先級 |
|---------|------|------|--------|
| **Gmail/SMTP** | ⚠️ 部分 | 有發送邏輯，需確認實際 SMTP 整合 | P0 |
| **LinkedIn、FB、IG** | ⚠️ 有 | `real-social-media-api.js` 有 OAuth 與發送 | P0 |
| **Telegram / LINE Notify** | ❌ 無 | 需新增 | P2 |
| **聯絡表單自動填寫** | ❌ 無 | 合規風險高，建議謹慎 | P3 |
| **記錄：開信、點擊、回覆、會議** | ⚠️ 部分 | 有 sentMessages，缺開信/點擊追蹤 | P1 |

**現有模組**：`real-social-media-api.js`、`messaging.js`

---

### 10. 數據分析與成效儀表板

| 規格需求 | 現況 | 差距 | 優先級 |
|---------|------|------|--------|
| **每天新 lead、高分比例、來源轉換率** | ❌ 無 | 需儀表板與統計邏輯 | P1 |
| **開信率、回覆率、會議率、成交率** | ⚠️ 部分 | `ab-testing.js`、`ai-sales-bot` 有部分指標 | P1 |
| **哪種文案/產業/話術最有效** | ❌ 無 | 需結構化紀錄與分析 | P2 |
| **AI 優化方向** | ❌ 無 | 需 A/B 結果與 AI 反饋迴路 | P2 |

**現有模組**：`real-time-analytics-dashboard.html`、`ab-testing.js`、`smart-sales-optimization.js`

---

## 二、易被忽略但重要的功能

### 1. 去重與資料清洗

| 功能 | 現況 | 建議 |
|------|------|------|
| 同公司/網域/email 去重 | ⚠️ 僅 email | CRM `findCustomerByEmail` 有，需擴充網域、公司名正規化 |
| 錯誤 email 過濾 | ❌ 無 | 新增 `email-validator` 或 regex 驗證 |
| 無效網站過濾 | ❌ 無 | 網站分析模組產出後可標記 |
| 過期資料標記 | ❌ 無 | 新增 `lastVerifiedAt`、過期規則 |

**建議**：新增 `data-deduplication.js` 模組，整合至 CRM 與搜尋流程。

---

### 2. 合規與風控

| 功能 | 現況 | 建議 |
|------|------|------|
| 發信頻率限制 | ❌ 無 | 新增 rate limiter（每平台/每小時） |
| 黑名單管理 | ❌ 無 | 新增 `blacklist` 表與檢查 |
| 退訂機制 | ❌ 無 | 新增 unsubscribe 連結與紀錄 |
| robots/TOS 風險判斷 | ❌ 無 | 爬蟲前檢查 robots.txt |
| 僅做合法公開分析 | ⚠️ 需明確 | 文件化：不做滲透、暴力測試、未授權掃描 |

**建議**：新增 `compliance-manager.js`，並在規格中明確「可做 / 不可做」邊界。

---

### 3. AI 知識庫

| 功能 | 現況 | 建議 |
|------|------|------|
| 產品服務說明、價格、案例 | ❌ 無 | 新增 `knowledge-base.js` 或 RAG 資料源 |
| 成交話術、行業模板 | ⚠️ 部分 | `templates.js` 有，可結構化為知識庫 |
| 品牌語氣、風格 | ❌ 無 | 新增設定檔，餵給 AI prompt |

**建議**：新增 `ai-knowledge-base.js`，用 RAG/embedding 或簡單關鍵字注入 prompt。

---

## 三、系統架構建議（對照現況）

| 層級 | 規格建議 | 現況 | 建議 |
|------|----------|------|------|
| **前端** | Dashboard、lead 列表、報告預覽、KPI 圖表 | ✅ `app-new.html` 有儀表板、目標客戶 | 補報告預覽、KPI 圖表 |
| **後端** | crawler、analyzer、AI、CRM、outreach、scheduler | ⚠️ 全在前端，無獨立後端 | 短期可維持；規模大時拆出 Node.js 服務 |
| **資料庫** | PostgreSQL、Redis、Object Storage | ❌ 僅 localStorage | 遷移時考慮 SQLite（Electron）或雲端 DB |
| **AI 層** | LLM、embedding、ranking、classifier | ⚠️ 僅 OpenAI chat | 可加 embedding（lead scoring）、RAG |

---

## 四、實作路線圖（建議順序）

### Phase 0：基礎強化（1–2 週）
1. **CRM 欄位擴充**：`nextFollowUp`、`leadScore`、`needType`、`urgency`、`sourceUrl`
2. **去重模組**：`data-deduplication.js`（email、網域、公司名）
3. **合規骨架**：`compliance-manager.js`（頻率限制、黑名單、退訂）

### Phase 1：潛在客戶與分析（2–4 週）
4. **網站分析模組**：`website-analyzer.js`（速度、SSL、基本 header、技術痕跡）
5. **AI 需求判斷**：擴充 `ai-assistant.js`，產出 `lead_score`、`need_type`、`urgency`、`outreach_angle`
6. **潛在客戶來源**：接真實 LinkedIn/FB API（若可行），或先做 Google Maps / 公司官網列表匯入

### Phase 2：觸達與跟單（2–3 週）
7. **AI 知識庫**：`ai-knowledge-base.js`，餵產品、案例、話術給 AI
8. **開發信引用網站問題**：整合網站分析結果到 `generatePromotionMessage` context
9. **跟單助理**：擴充 `auto-followup.js`，加入 AI 建議、優先級排序

### Phase 3：報告與儀表板（2–3 週）
10. **報告模組**：`report-generator.js`（網站健檢、SEO 摘要、PDF/網頁）
11. **成效儀表板**：KPI 圖表、來源轉換、開信/回覆率（需追蹤機制）

### Phase 4：進階（依資源）
12. 更多潛在客戶來源（104、政府登記、GitHub 等）
13. 開信/點擊追蹤、第二封信 AI 改寫
14. 後端遷移、PostgreSQL、排程服務

---

## 五、快速對照表

| 模組 | 現有 | 缺什麼 |
|------|------|--------|
| 潛在客戶搜尋 | 社交媒體框架（模擬） | 真實 API、官網、Maps、徵才、政府資料 |
| AI 需求判斷 | 基本分類 | lead_score、need_type、urgency、網站訊號 |
| 網站分析 | 無 | 速度、SSL、header、技術、截圖 |
| 客戶分群 | tags、pipeline | 規模、數位成熟度、冷溫熱系統化 |
| AI 開發信 | 有 | 引用網站問題、多口吻、A/B |
| CRM | 完整 | 報價/提案狀態、下次跟進、附件 |
| 跟單助理 | 規則排程 | AI 建議、高意向偵測、優先級 |
| 報告模組 | 無 | 健檢、SEO、資安摘要、PDF |
| 多通路 | 有 | 開信追蹤、Telegram/LINE |
| 儀表板 | 基本 | KPI、轉換率、來源分析 |
| 去重 | 僅 email | 網域、公司、過期標記 |
| 合規 | 無 | 頻率、黑名單、退訂 |
| AI 知識庫 | 無 | 產品、案例、話術、RAG |

---

---

## 六、已實作項目（2025-03-15 更新）

| 模組 | 狀態 | 檔案 |
|------|------|------|
| 去重與清洗 | ✅ | data-deduplication.js |
| 合規與風控 | ✅ | compliance-manager.js |
| 網站分析 | ✅ | website-analyzer.js |
| AI 知識庫 | ✅ | ai-knowledge-base.js、ai-knowledge-base.html |
| 報告模組 | ✅ | report-generator.js |
| CRM 擴充 | ✅ | crm-database.js（新欄位、Pipeline、去重整合） |
| AI 需求判斷 | ✅ | ai-assistant.js（lead_score、need_type、urgency、outreach_angle） |
| 成效儀表板 | ✅ | app-new 成效分析頁 |
| 開發信引用網站問題 | ✅ | ai-assistant + app-new.js |
| 待跟進提醒 | ✅ | 儀表板待跟進區塊 |
| 分析網站按鈕 | ✅ | 目標客戶卡片 |

*文件建立日期：2025-03-15*
