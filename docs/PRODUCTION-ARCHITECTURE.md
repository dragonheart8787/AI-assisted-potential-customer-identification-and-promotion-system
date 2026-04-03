# 推廣中心｜接近上線架構決策

> 本文件對齊「接近上線」分階段計畫之**階段 0**，作為實作與部署的單一依據。

## 主交付物與產品線

| 項目 | 決策 |
|------|------|
| **上線主線** | **Web**：瀏覽器 + Node 後端（`server/backend-server.js` 內嵌 Express）。 |
| **Electron** | 保留為**單機桌面版**；預設仍載入 `app-new.html`，CRM 以 **localStorage** 為主，除非使用者另行登入並連到本機/遠端後端（與 Web 共用同一套 API）。 |
| **不做範圍** | 完整 GDPR/個資法法遵審計、多租戶計費、正式 OAuth 上架審核、LinkedIn 等受限制 API 之商業合規聲明（僅提供技術雛形與文件提醒）。 |

## 資料庫

| 環境 | 引擎 | 說明 |
|------|------|------|
| **預設（本機／Docker 單容器）** | **SQLite**（[`sql.js`](https://github.com/sql-js/sql.js/) 寫入 `data/app.db`） | 無原生編譯，利於 Windows／CI；檔案預設 `data/app.db`。 |
| **未來擴充** | **PostgreSQL** | 建議正式環境改用託管 Postgres，以 `DATABASE_URL` 連線；schema 可對照 `server/migrations/` 手動轉寫或另開遷移工具。 |

## 驗證與 Session

| 項目 | 決策 |
|------|------|
| 登入方式 | Email + 密碼（`bcryptjs` 雜湊）。 |
| Session | **自管 Session**：隨機 `sid` 存於 **`sessions` 表**，**httpOnly** Cookie（`promo_sid`）、`SameSite=Lax`；生產環境請設 `NODE_ENV=production` 並啟用 HTTPS 以搭配 `Secure`。 |
| Redis | **首版不強制**；併發叢集時再改接 Redis 或 JWT + 短期 access。 |

## CORS 與來源

- 以環境變數 **`ALLOWED_ORIGINS`**（逗號分隔）控制；未設定時預設允許本機 `http://localhost:3856`、`http://127.0.0.1:3856`。
- 需帶 Cookie 的請求：前端 `fetch(..., { credentials: 'include' })`。

## 速率限制

- 記憶體內滑動視窗（程序重啟即重置）：登入、代理、寄信等敏感路徑優先限制；細則見 `server/middleware/rate-limit.js`。

## 目錄對照

| 路徑 | 用途 |
|------|------|
| `server/migrations/` | SQL 遷移檔 |
| `server/db/` | 開啟 DB、套用遷移 |
| `server/middleware/` | CORS、Session、限流 |
| `server/routes/` | Express 路由（auth、crm、legacy API） |
| `server/express-app.js` | 組裝 Express 與靜態檔 |
| `lib/api-validate.js` | 共用輸入驗證（含 CRM／Auth） |

## 環境變數摘要

| 變數 | 說明 |
|------|------|
| `SESSION_SECRET` | HMAC／簽名用密鑰；**生產必填**（未設則使用不安全的開發預設並於啟動時警告）。 |
| `ALLOWED_ORIGINS` | CORS 白名單，逗號分隔。 |
| `SQLITE_PATH` | 可選，覆寫 SQLite 檔案路徑。 |
| `BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD` | 可選；資料庫為空且設定時，啟動時建立第一個管理員帳號。 |
| `NO_OPEN_BROWSER` | `1` 時不自動開瀏覽器。 |

## HTTPS

- Node 程序可僅聽 HTTP；**生產環境建議**由 Nginx、Caddy 或雲端 LB 做 TLS termination，並將 `ALLOWED_ORIGINS` 設為 `https://你的網域`。
