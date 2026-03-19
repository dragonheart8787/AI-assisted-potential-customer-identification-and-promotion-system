# 推廣中心 - 能力與效能測試報告

## 測試方式

1. **啟動伺服器**：執行 `開啟新介面.bat` 或 `node serve-new-ui.js`
2. **開啟測試頁**：瀏覽器開啟 `http://localhost:3856/test-app-new.html`
3. **執行測試**：點擊「執行全部測試」或「僅效能基準」

---

## 測試項目一覽

### 模組載入 (10 項)
| 模組 | 說明 |
|------|------|
| dataDeduplication | 去重與清洗 |
| complianceManager | 合規與風控 |
| websiteAnalyzer | 網站分析 |
| aiKnowledgeBase | AI 知識庫 |
| reportGenerator | 報告產生 |
| crmDatabase | CRM 資料庫 |
| socialMediaProspectCrawler | 潛在客戶搜尋 |
| aiAssistant | AI 推廣助手 |
| aiPromotionWorkflow | AI 工作流程 |
| getTargetProspects | 目標客戶合併 |

### 功能正確性
- **去重**：email 驗證、重複偵測
- **合規**：canSend、邊界說明
- **知識庫**：產品數、context 生成
- **CRM**：Pipeline 階段、待跟進、績效指標
- **AI**：classifyCustomer（lead_score、need_type）

### 效能基準
- getTargetProspects 單次耗時
- CRM searchCustomers 單次耗時
- AI generatePromotionMessage 耗時
- 批次效能（100 次 getTargetProspects、100 次 search 等）

### 整合流程
- 新增 CRM 客戶（含去重檢查）
- 網站分析（可能因 CORS 失敗）
- 健檢報告產生

---

## 預期效能參考

| 操作 | 預期耗時 | 說明 |
|------|----------|------|
| getTargetProspects | < 5ms | 合併 CRM + 社交發現 |
| CRM searchCustomers | < 2ms | 關鍵字搜尋 |
| AI generatePromotionMessage (local) | < 50ms | 本地規則引擎 |
| AI classifyCustomer | < 10ms | 規則評分 |
| 網站分析 | 500–3000ms | 依目標網站與 CORS |
| 報告產生 | 500–3000ms | 依網站分析 |

---

## 已知限制

1. **網站分析**：跨域 (CORS) 可能導致部分網站無法分析
2. **AI OpenAI 模式**：需 API 金鑰，未設定時自動降級為本地模式
3. **quick-test.html**：使用 `test@example.com` 會因黑名單失敗，請改用 test-app-new.html

---

*報告產生：test-app-new.html*
