# 真實功能設定指南

## 一、後端伺服器

執行 `開啟新介面.bat` 或 `npm run backend` 會啟動完整後端（port 3856），提供：

- **CORS 代理**：網站分析可繞過跨域限制
- **SMTP 發信**：真實 Email 發送
- **OAuth 回調**：社群平台 token 交換

### 1. 安裝依賴

```bash
npm install
```

### 2. SMTP 設定（Email 發送）

編輯 `backend-config.json`：

```json
{
  "smtp": {
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": false,
    "user": "your-email@gmail.com",
    "pass": "your-app-password"
  }
}
```

Gmail 需使用「應用程式密碼」，非一般登入密碼。

---

## 二、社群媒體 OAuth

1. 前往 **帳號登入** 頁面
2. 點擊 **API 設定** 進入 api-settings.html
3. 填入各平台金鑰：
   - **LinkedIn**：clientId、clientSecret，redirect 設為 `http://localhost:3856/oauth-callback.html`
   - **Facebook / Instagram**：appId、appSecret，redirect 同上
   - **Twitter**：bearerToken 或 API 金鑰

4. 在各平台開發者後台將 `http://localhost:3856/oauth-callback.html` 加入授權 redirect URI

---

## 三、潛在客戶來源（發現客戶）

- **Google Maps**：從 Google 地圖搜尋商家
  - 在 `backend-config.json` 設定 `googlePlacesApiKey`
  - 至 [Google Cloud Console](https://console.cloud.google.com/) 啟用 Places API
- **社群媒體**：從 Facebook 搜尋商家
  - 需先登入 Facebook（帳號登入頁）並完成 OAuth
- **手動新增**：在發現客戶彈窗填寫
- **CSV 匯入**：貼上 CSV（欄位：name, email, company, title, phone, industry, website）

---

## 四、已移除的模擬功能

| 原功能 | 現況 |
|--------|------|
| 示範搜尋 | 改為 CSV 匯入 |
| 假預設客戶 | 無資料時顯示空列表 |
| 模擬登入 | 改為真實 OAuth（需 API 金鑰） |
| 模擬發送 | 改為真實 SMTP / 社群 API |
| 模擬收件箱 | 改為空（需 Gmail API 等整合） |

---

## 五、網站分析

使用後端 CORS 代理，多數網站可正常分析。若直接 fetch 失敗，會自動改用 `/api/proxy`。
