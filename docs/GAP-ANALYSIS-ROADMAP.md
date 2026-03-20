# 推廣中心 - 缺口分析與實作路線圖

> **核心問題**：系統「看起來很多功能，但成交不起來」。  
> 以下五大缺口不補，難以從「商家名單工具」升級為「高意圖客戶探勘系統」。

---

## 缺口一：名單來源太窄

### 現狀
- ✅ Google Places API
- ✅ Facebook Places API
- ❌ 僅適合本地商家，對 B2B、SaaS、新創、招聘需求弱

### 還缺的來源

| 來源類型 | 說明 | 難度 | 優先級 |
|----------|------|------|--------|
| LinkedIn 公司頁 / 職缺 | B2B、招聘需求訊號 | 高（API 限制） | P1 |
| 104 / 1111 / Indeed / Cake | 台灣招募頁、需求訊號 | 中（爬蟲） | P1 |
| 公司登記 / 展覽 / 協會 | 結構化名單 | 中 | P2 |
| 官網聯絡頁抓取 | 從已知網域抓 email/表單 | 低 | P1 |
| GitHub / Product Hunt / App 市集 | SaaS、新創 | 中 | P2 |
| 新聞 / 公告 / 招聘資訊 | 需求訊號 | 中 | P2 |

### 實作建議
1. **官網聯絡頁抓取**：擴充 `website-analyzer.js`，新增 `extractContactInfo(html, url)` 抓取 mailto、表單 action、聯絡區塊
2. **招募頁爬蟲**：新增 `job-board-crawler.js`，支援 104、1111 關鍵字搜尋（需遵守 robots.txt）
3. **LinkedIn**：需申請 Marketing API，或使用第三方整合（如 PhantomBuster）

---

## 缺口二：AI 判斷還不夠像真正的 Lead Scoring

### 現狀
- ✅ `website-analyzer.js`：基礎 issues、leadSignals（website_redo, security, seo, performance）
- ✅ `ai-assistant.js`：classifyCustomers、generatePromotionMessage
- ❌ 分數維度少、未區分「網站撰寫需求」與「資安需求」
- ❌ 缺乏可解釋的評分邏輯

### 還缺的判斷維度

#### 網站撰寫需求分數 (website_need_score)
| 項目 | 權重 | 偵測方式 |
|------|------|----------|
| 首頁文案是否混亂 | 高 | 段落長度、關鍵字密度、結構 |
| CTA 是否缺失 | 高 | 按鈕、表單、聯絡區塊 |
| 手機版是否爛 | 中 | viewport、responsive 標記 |
| SEO 結構殘缺 | 中 | title/desc/h1/h2 完整性 |
| 多年沒更新 | 中 | copyright 年份、最後修改 |
| 載入速度慢 | 中 | 已有 speed |
| 缺作品集/服務頁/表單 | 高 | 連結結構、表單存在 |

#### 資安需求分數 (security_need_score)
| 項目 | 權重 | 偵測方式 |
|------|------|----------|
| HTTPS / TLS 狀態 | 高 | 已有 hasHttps |
| security.txt | 中 | `/.well-known/security.txt` |
| 基本安全標頭 | 中 | 已有 securityHeaders |
| robots / sitemap / privacy | 低 | 檢查檔案存在 |
| 外露技術資訊 | 低 | Server、X-Powered-By |
| CMS 舊版跡象 | 中 | 版本字串、已知漏洞 |
| 徵才顯示資安需求 | 高 | 職缺頁關鍵字 |

### 實作建議
1. 擴充 `website-analyzer.js`：
   - 新增 `computeWebsiteNeedScore(analysis)` → 0–100
   - 新增 `computeSecurityNeedScore(analysis)` → 0–100
   - 擴充 `extractLeadSignals` 回傳 `website_need_score`、`security_need_score`
2. 整合至 CRM：`addCustomer` 時寫入 `website_need_score`、`security_need_score`
3. 篩選器：Pipeline 可依分數排序、篩選「值得打」的客戶

---

## 缺口三：缺少真正的多步驟自動外聯閉環

### 現狀
- ✅ `/api/send-email` 單次發信
- ✅ `auto-followup.js`：規則、排程、模板（需 messageSent 事件）
- ❌ 未串接「開信/點擊」追蹤
- ❌ 無「第 3 天追蹤」「已開信改寫」等自動流程
- ❌ 無產業切換話術、回覆內容建議下一步

### 還缺的流程

| 步驟 | 觸發條件 | 動作 |
|------|----------|------|
| 第一封開發信 | 新 lead | 發送 |
| 未回覆第 3 天 | 發信後 3 天、無回覆 | 追蹤信 |
| 已開信未回覆 | 開信但無回覆 | 改寫版（強調報告/預約） |
| 已點擊報告未預約 | 追蹤 pixel 點擊 | 提醒信 |
| 產業切換 | 客戶產業標籤 | 不同話術模板 |
| 回覆建議 | 對方回覆內容 | AI 建議下一步 |

### 實作建議
1. **開信追蹤**：發信時嵌入 1x1 追蹤圖（`/api/track?type=open&id=xxx`），後端記錄
2. **點擊追蹤**：報告連結改為 `https://xxx/api/redirect?to=報告URL&id=xxx`，記錄後 302 跳轉
3. **自動跟進排程**：擴充 `auto-followup.js`，新增預設流程「發信 → 3 天 → 7 天 → 14 天」
4. **產業話術**：`ai-knowledge-base.js` 依 `industry` 回傳不同 tone、案例
5. **回覆分析**：`ai-assistant.js` 新增 `suggestNextStep(replyText, customer)` → 建議動作

---

## 缺口四：報告生成器缺成交導向版本

### 現狀
- ✅ 健檢、SEO、資安報告
- ✅ `toHtml()` 輸出
- ❌ 輸出像「驗屍報告」，客戶不想看
- ❌ 缺「可成交」的摘要與提案格式

### 還缺的模板

| 模板 | 用途 | 格式 |
|------|------|------|
| 3 分鐘版摘要 | 老闆快速看懂 | 一頁、3  bullet、1 CTA |
| 一頁式提案 | 正式報價前 | 問題 + 解法 + 下一步 |
| 風險說明 | 資安報告 | 老闆看得懂的風險、影響、建議 |
| 「流失客戶的 5 個地方」 | 網站健檢 | 已有 lossReasons，需視覺化 |
| 「最值得先修的 3 個資安問題」 | 資安報告 | 優先排序、影響說明 |
| 「我可以怎麼幫你」頁面 | 結尾 CTA | 明確行動、預約連結 |

### 實作建議
1. `report-generator.js` 新增：
   - `generateExecutiveSummary(report)` → 3 分鐘版
   - `generateOnePageProposal(report)` → 一頁提案
   - `generateSecurityRiskBrief(report)` → 風險說明
2. 擴充 `toHtml()`：支援 `template: 'executive' | 'proposal' | 'risk'`
3. 報告底部固定加入「我可以怎麼幫你」區塊（可配置預約連結）

---

## 缺口五：缺少 KPI 與轉換優化層

### 現狀
- ✅ `run-tests.js`：技術效能（API 毫秒、模組載入）
- ❌ 無營運 KPI：lead 數、開信率、回覆率、成交率
- ❌ 無話術 A/B、產業/來源成效分析

### 還缺的 KPI

| KPI | 說明 | 資料來源 |
|-----|------|----------|
| 每天新增 lead 數 | 名單成長 | CRM addCustomer |
| 高分 lead 比例 | 品質 | leadScore >= 70 |
| 寄信數 | 外聯量 | send-email 記錄 |
| 開信率 | 追蹤 pixel | track API |
| 回覆率 | 統一收件箱 / 手動標記 | interactionHistory |
| 預約率 | 預約連結點擊 / 手動 | CRM stage |
| 報價率 | 已報價 / 已聯繫 | pipelineStages |
| 成交率 | 成交 / 已報價 | pipelineStages |
| 話術表現 | 各模板轉換 | templateId + 結果 |
| 產業/來源成效 | 哪種最容易成交 | source + industry |

### 實作建議
1. **事件記錄**：後端新增 `/api/events` 記錄 `{ type, data, ts }`（發信、開信、點擊、回覆、預約、報價、成交）
2. **KPI 儀表板**：新增 `kpi-dashboard.js` + `kpi-dashboard.html`，讀取 events 彙總
3. **CRM 擴充**：`recordInteraction` 時寫入 `eventType`，支援 `source`、`templateId`、`campaignId`
4. **定期報表**：`report-generator.js` 新增 `generateKPIReport(period)` → 每日/每週摘要

---

## 實作優先級總覽

| 優先級 | 項目 | 預估工時 | 影響 |
|--------|------|----------|------|
| P0 | 缺口二：Lead Scoring 擴充 | 2–3 天 | 判斷「誰值得打」 |
| P0 | 缺口四：成交導向報告 | 1–2 天 | 客戶願意看、願意約 |
| P1 | 缺口五：KPI 儀表板 | 2 天 | 營運決策依據 |
| P1 | 缺口三：多步驟外聯（開信/點擊追蹤） | 2–3 天 | 自動跟進閉環 |
| P1 | 官網聯絡頁抓取 | 1 天 | 擴充名單來源 |
| P2 | 招募頁爬蟲 | 2 天 | B2B/招聘需求 |
| P2 | 產業話術、回覆建議 | 1–2 天 | 提升轉換 |

---

## 實作狀態（已完成）

| 項目 | 狀態 |
|------|------|
| 缺口一：官網聯絡頁抓取 | ✅ `website-analyzer.extractContactInfo()` |
| 缺口一：招募頁爬蟲 | ✅ `job-board-crawler.js`（104、1111） |
| 缺口二：Lead Scoring | ✅ 已完成 |
| 缺口三：開信/點擊追蹤 | ✅ `/api/track`、`/api/redirect` |
| 缺口三：多步驟跟進 | ✅ `auto-followup` 預設 3 天、7 天 |
| 缺口三：產業話術 | ✅ `ai-knowledge-base.getIndustryTemplates()` |
| 缺口三：回覆建議 | ✅ `ai-assistant.suggestNextStep()` |
| 缺口四：成交導向報告 | ✅ 已完成 |
| 缺口五：KPI 儀表板 | ✅ `kpi-dashboard.html`、`/api/kpi`、`/api/events` |

---

## 下一步

系統已從「可以寄信」升級為「會自己跑業務節奏、能判斷誰值得打、報告能促成預約」。
