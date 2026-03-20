# Demo 模式說明

## 用途

在**未正式上線**、API/OAuth 未設定時，仍能以固定資料展示系統能力（學習歷程、面試、簡報）。

## 啟用方式

1. 開啟 `app-new.html` → **設定**頁
2. 點 **「啟用 Demo 模式」**（頁面會重新載入）
3. 名單、KPI 儀表板會使用 `demo/` 內範例資料

## 還原

點 **「離開 Demo 模式」**，會還原啟用前的 CRM（若有備份）。

## 檔案

| 檔案 | 說明 |
|------|------|
| `sample_crm_records.json` | 5 筆範例客戶（含 pipeline、分數） |
| `sample_kpi_events.json` | 模擬寄信、開信、點擊、跟進事件 |
| `sample_leads.json` | 精簡版名單（可匯入參考） |
| `sample_reports/*.html` | 固定報告範本（可截圖） |

## 固定報告（直接開啟）

- `demo/sample_reports/website-audit-summary.html`
- `demo/sample_reports/security-summary.html`
- `demo/sample_reports/one-page-proposal.html`
