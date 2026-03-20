# 根目錄檔案政策（維持「收尾版」觀感）

為避免根目錄堆滿報告與過渡頁面，請遵守以下約定：

## 應保留在根目錄的 Markdown（僅此四份＋README）

| 檔案 | 用途 |
|------|------|
| `README.md` | 專案總覽與啟動方式 |
| `LEARNING-PORTFOLIO.md` | 學習歷程 |
| `CAPABILITY-PERFORMANCE-REPORT.md` | 能力與效能 |
| `SYSTEM-ARCHITECTURE-DIAGRAMS.md` | 架構圖文 |

其餘指南、論文稿、摘要、測試長報告請放在 **`docs/`** 或 **`reports/`**。

## 應保留在根目錄的 HTML（僅此三份）

| 檔案 | 用途 |
|------|------|
| `app-new.html` | **唯一主展示** |
| `index.html` | 轉址至 `app-new.html` |
| `oauth-callback.html` | OAuth redirect（路徑勿隨意改動） |

其餘介面頁請放在 **`pages/`**（正式子頁）、**`debug/`**（除錯）、**`archive/`**（封存）。

## 執行庫與設定

- 後端：`backend-server.js`、`package.json`、`run-demo.bat`、`run-tests.bat`、`run-tests.js` 等維持在根目錄（與 `app-new.html` 同層的 `.js` 為模組依賴）。
- KPI 事件檔：執行後寫入 **`data/kpi-events.json`**（勿手動堆在根目錄）。

## 若合併舊分支後根目錄又出現雜檔

可在專案根目錄執行（PowerShell）：

```powershell
.\scripts\sweep-stray-root-docs.ps1
```

會將「非白名單」的 `*.md` 移到 `docs/swept-from-root/`（執行前請先 commit）。
