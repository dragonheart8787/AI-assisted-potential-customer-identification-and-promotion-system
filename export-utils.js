/**
 * 匯出工具 - CSV、JSON、報告列印(可另存 PDF)
 * 供學習歷程展示「成果可交付」
 */
const ExportUtils = {
    /** 下載字串為檔案 */
    download(content, filename, mime = 'text/plain;charset=utf-8') {
        const blob = new Blob([content], { type: mime });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
    },

    /** 匯出 CRM 客戶為 CSV */
    exportCustomersCSV(customers) {
        const list = customers || (window.crmDatabase?.customers || []);
        const headers = ['姓名', 'Email', '公司', '職位', '電話', '產業', '官網', '階段', '標籤', 'lead_score', 'website_need_score', 'security_need_score'];
        const rows = list.map(c => [
            c.name || '',
            c.email || '',
            c.company || '',
            c.title || '',
            c.phone || '',
            c.industry || '',
            c.website || '',
            c.stage || '',
            (c.tags || []).join(';'),
            c.leadScore ?? '',
            c.website_need_score ?? '',
            c.security_need_score ?? ''
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
        const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
        this.download(csv, `customers_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8');
    },

    /** 匯出報告為 JSON */
    exportReportJSON(report) {
        const json = JSON.stringify(report, null, 2);
        this.download(json, `report_${report?.id || Date.now()}.json`, 'application/json');
    },

    /** 匯出報告為 HTML（可列印另存 PDF） */
    exportReportHTML(report, template = 'full') {
        const gen = window.reportGenerator;
        if (!gen) return;
        const html = gen.toHtml(report, template);
        const full = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${report.companyName || '報告'}</title></head><body>${html}</body></html>`;
        this.download(full, `report_${report.companyName || 'export'}_${new Date().toISOString().slice(0, 10)}.html`, 'text/html;charset=utf-8');
    },

    /** 開啟列印視窗（瀏覽器可另存 PDF） */
    printReport(report, template = 'full') {
        const gen = window.reportGenerator;
        if (!gen) return;
        const html = gen.toHtml(report, template);
        const w = window.open('', '_blank');
        w.document.write(html);
        w.document.close();
        w.print();
    },

    /** 匯出操作日誌 */
    exportLogsCSV() {
        const logs = window.operationLogger?.getAll() || [];
        const headers = ['時間', '類型', '詳情'];
        const rows = logs.map(l => [
            l.ts || '',
            l.type || '',
            JSON.stringify(l).replace(/"/g, '""')
        ].map(v => `"${String(v)}"`).join(','));
        const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
        this.download(csv, `operation_logs_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8');
    }
};

window.exportUtils = ExportUtils;
