# 推廣中心 - 能力與效能分析報告

**測試日期**：2025-03-19  
**測試方式**：`node run-tests.js`（後端）、`pages/test-app-new.html`（瀏覽器）

---

## 一、測試結果摘要

| 項目 | 結果 | 說明 |
|------|------|------|
| 後端 API | ✅ 通過 | config、nodemailer 正常 |
| CORS 代理 | ⚠️ 視環境 | Node 可能遇 SSL 憑證問題，瀏覽器正常 |
| 靜態檔案 | ✅ 通過 | app-new.html 約 23KB |
| 模組載入 | ✅ 9/9 | 所有核心模組存在 |
| API 回應 | ~1ms | 本地請求平均耗時 |

---

## 二、能力清單

### 核心模組
| 模組 | 功能 | 狀態 |
|------|------|------|
| data-deduplication | 去重、email 驗證、過期標記 | ✅ |
| compliance-manager | 頻率限制、黑名單、退訂 | ✅ |
| website-analyzer | 網站分析（CORS 代理） | ✅ |
| ai-knowledge-base | 產品、案例、語氣 | ✅ |
| report-generator | 健檢、SEO、資安報告 | ✅ |
| crm-database | 客戶 CRUD、Pipeline、互動 | ✅ |
| google-places-crawler | Google Maps 搜尋 | ✅ |
| social-places-crawler | Facebook Places 搜尋 | ✅ |
| ai-assistant | 訊息生成、客戶分類 | ✅ |
| ai-promotion-workflow | 工作流程 | ✅ |

### 後端 API
| 端點 | 用途 | 需設定 |
|------|------|--------|
| GET /api/config | 後端狀態 | - |
| GET /api/proxy?url= | CORS 代理 | - |
| POST /api/send-email | 發送 Email | SMTP |
| POST /api/oauth/token | OAuth 交換 | - |
| GET /api/google-places | Google 搜尋 | googlePlacesApiKey |
| GET /api/facebook-places | Facebook 搜尋 | access_token |

---

## 三、效能基準

| 操作 | 預期耗時 | 實測 |
|------|----------|------|
| getTargetProspects | < 5ms | 瀏覽器測試 |
| CRM searchCustomers | < 2ms | 瀏覽器測試 |
| AI generatePromotionMessage (local) | < 50ms | 瀏覽器測試 |
| API config | ~1ms | 1ms |
| 靜態檔案 | < 10ms | 2ms |

---

## 四、執行測試

### 命令行（後端）
```bash
cd "C:\Users\User\Desktop\推廣"
node backend-server.js
```
另開終端：
```bash
node run-tests.js
```

### 瀏覽器（完整）
1. 啟動 `開啟新介面.bat`
2. 開啟 `http://localhost:3856/pages/test-app-new.html`
3. 點擊「執行全部測試」

---

## 五、已知限制

- **CORS 代理**：Node 環境可能因 SSL 憑證報錯，瀏覽器無此問題
- **網站分析**：需後端運行，直接 fetch 失敗時改用代理
- **Google Places**：需 API 金鑰與計費帳戶
- **Facebook 搜尋**：需 OAuth 完成
