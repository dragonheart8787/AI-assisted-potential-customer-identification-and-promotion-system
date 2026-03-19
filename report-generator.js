/**
 * 自動化提案與報告模組
 * 網站健檢、SEO 摘要、資安初步檢查、PDF/網頁輸出
 */
class ReportGenerator {
    constructor() {
        this.reports = [];
        this.init();
    }

    init() {
        const saved = localStorage.getItem('report_generator_reports');
        if (saved) this.reports = JSON.parse(saved);
    }

    saveReports() {
        localStorage.setItem('report_generator_reports', JSON.stringify(this.reports.slice(-100)));
    }

    /**
     * 產生網站健檢報告
     */
    async generateWebsiteAudit(companyName, websiteUrl) {
        const analyzer = window.websiteAnalyzer;
        if (!analyzer) return { error: '網站分析模組未載入' };

        const analysis = await analyzer.analyze(websiteUrl);
        const lossReasons = analyzer.getLossReasonsSummary?.(analysis) || [];

        const report = {
            id: 'audit_' + Date.now(),
            type: 'website_audit',
            companyName,
            websiteUrl,
            generatedAt: new Date().toISOString(),
            summary: {
                score: analysis.success ? Math.max(0, 100 - (analysis.issues?.length || 0) * 15) : 0,
                issuesCount: analysis.issues?.length || 0,
                techStack: analysis.techStack || [],
                speed: analysis.speed,
                hasHttps: analysis.hasHttps,
                website_need_score: analysis.website_need_score ?? null,
                security_need_score: analysis.security_need_score ?? null
            },
            issues: analysis.issues || [],
            recommendations: analysis.recommendations || [],
            lossReasons,
            leadSignals: analysis.leadSignals || [],
            fullAnalysis: analysis
        };

        this.reports.push(report);
        this.saveReports();
        if (window.operationLogger) window.operationLogger.log('report_generated', { type: 'website_audit', companyName, websiteUrl });
        return report;
    }

    /**
     * 產生 SEO 初步分析
     */
    async generateSeoReport(companyName, websiteUrl) {
        const analyzer = window.websiteAnalyzer;
        if (!analyzer) return { error: '網站分析模組未載入' };

        const analysis = await analyzer.analyze(websiteUrl);
        const seo = analysis.seo || {};

        const report = {
            id: 'seo_' + Date.now(),
            type: 'seo_analysis',
            companyName,
            websiteUrl,
            generatedAt: new Date().toISOString(),
            title: seo.title,
            description: seo.description,
            hasH1: seo.hasH1,
            suggestions: []
        };

        if (!seo.title) report.suggestions.push('建議設定 50–60 字元的 meta title');
        if (!seo.description) report.suggestions.push('建議設定 150–160 字元的 meta description');
        if (!seo.hasH1) report.suggestions.push('建議每頁有明確的 H1 標題');

        this.reports.push(report);
        this.saveReports();
        if (window.operationLogger) window.operationLogger.log('report_generated', { type: 'seo_analysis', companyName, websiteUrl });
        return report;
    }

    /**
     * 產生資安初步檢查摘要
     */
    async generateSecuritySummary(companyName, websiteUrl) {
        const analyzer = window.websiteAnalyzer;
        if (!analyzer) return { error: '網站分析模組未載入' };

        const analysis = await analyzer.analyze(websiteUrl);
        const headers = analysis.securityHeaders || {};

        const report = {
            id: 'security_' + Date.now(),
            type: 'security_summary',
            companyName,
            websiteUrl,
            generatedAt: new Date().toISOString(),
            hasHttps: analysis.hasHttps,
            headers: {
                hsts: !!headers['strict-transport-security'],
                xContentTypeOptions: !!headers['x-content-type-options'],
                xFrameOptions: !!headers['x-frame-options'],
                csp: !!headers['content-security-policy']
            },
            recommendations: []
        };

        if (!analysis.hasHttps) report.recommendations.push('啟用 HTTPS');
        if (!headers['x-content-type-options']) report.recommendations.push('設定 X-Content-Type-Options: nosniff');
        if (!headers['x-frame-options']) report.recommendations.push('設定 X-Frame-Options 防 clickjacking');

        this.reports.push(report);
        this.saveReports();
        if (window.operationLogger) window.operationLogger.log('report_generated', { type: 'security_summary', companyName, websiteUrl });
        return report;
    }

    /** 3 分鐘版摘要：老闆快速看懂 */
    generateExecutiveSummary(report) {
        const r = report;
        const bullets = [];
        if (r.type === 'website_audit') {
            const top3 = (r.lossReasons || r.issues || []).slice(0, 3);
            bullets.push(...top3.map((x, i) => `${i + 1}. ${x}`));
        } else if (r.type === 'security_summary') {
            const risks = (r.recommendations || []).slice(0, 3);
            bullets.push(...risks.map((x, i) => `${i + 1}. ${x}`));
        } else if (r.type === 'seo_analysis') {
            bullets.push(...(r.suggestions || []).slice(0, 3).map((x, i) => `${i + 1}. ${x}`));
        }
        return {
            companyName: r.companyName,
            websiteUrl: r.websiteUrl,
            type: r.type,
            bullets,
            cta: '我可以協助您改善以上問題，歡迎預約 15 分鐘免費諮詢。'
        };
    }

    /** 一頁式提案：問題 + 解法 + 下一步 */
    generateOnePageProposal(report) {
        const r = report;
        const problems = r.type === 'website_audit' ? (r.lossReasons || r.issues || []).slice(0, 5) :
            r.type === 'security_summary' ? (r.recommendations || []).slice(0, 5) :
            (r.suggestions || []).slice(0, 5);
        const solutions = (r.recommendations || r.suggestions || []).slice(0, 3);
        return {
            companyName: r.companyName,
            websiteUrl: r.websiteUrl,
            problems,
            solutions,
            nextStep: '預約 15 分鐘諮詢，討論優先改善項目與預算'
        };
    }

    /** 資安風險說明：老闆看得懂 */
    generateSecurityRiskBrief(report) {
        if (report.type !== 'security_summary') return null;
        const r = report;
        const risks = [];
        if (!r.hasHttps) risks.push({ 風險: '資料傳輸未加密', 影響: '客戶個資可能被竊聽', 建議: '啟用 HTTPS' });
        if (!r.headers?.hsts) risks.push({ 風險: '可能被降級攻擊', 影響: '連線可能被劫持', 建議: '設定 HSTS' });
        if (!r.headers?.xFrameOptions) risks.push({ 風險: 'Clickjacking', 影響: '用戶可能被誘導點擊', 建議: '設定 X-Frame-Options' });
        return { companyName: r.companyName, risks, top3: '以上為最值得優先修復的 3 個資安問題' };
    }

    /**
     * 輸出為 HTML（可列印/另存 PDF）
     * @param {object} report - 報告物件
     * @param {string} template - 'executive' | 'proposal' | 'risk' | 'full'（預設）
     */
    toHtml(report, template = 'full') {
        const r = report;
        const ctaBlock = (cta, bookingUrl = '#') => `
<div style="margin-top:32px;padding:20px;background:#f8f9fa;border-radius:8px;text-align:center">
<strong>我可以怎麼幫你</strong><p>${cta}</p>
<a href="${bookingUrl}" style="display:inline-block;padding:12px 24px;background:#3498db;color:#fff;text-decoration:none;border-radius:6px">預約免費諮詢</a>
</div>`;
        const bookingUrl = localStorage.getItem('booking_url') || '#';

        if (template === 'executive') {
            const sum = this.generateExecutiveSummary(r);
            return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>3 分鐘摘要 - ${sum.companyName}</title>
<style>body{font-family:sans-serif;max-width:600px;margin:40px auto;padding:24px;line-height:1.8}
h1{color:#333;font-size:1.4em}ul{list-style:none;padding:0}.score{color:#2ecc71}</style></head><body>
<h1>${sum.companyName} · 3 分鐘摘要</h1>
<p>${sum.websiteUrl}</p>
<ul>${sum.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
<p><strong>${sum.cta}</strong></p>
${ctaBlock(sum.cta, bookingUrl)}
</body></html>`;
        }
        if (template === 'proposal') {
            const prop = this.generateOnePageProposal(r);
            return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>一頁提案 - ${prop.companyName}</title>
<style>body{font-family:sans-serif;max-width:700px;margin:40px auto;padding:24px;line-height:1.7}
h1{color:#333}h2{color:#555;font-size:1.1em;margin-top:20px}ul{margin:8px 0}
.issue{color:#e74c3c}.sol{color:#27ae60}</style></head><body>
<h1>${prop.companyName} · 一頁提案</h1>
<h2>發現的問題</h2><ul class="issue">${prop.problems.map(p => `<li>${p}</li>`).join('')}</ul>
<h2>建議解法</h2><ul class="sol">${prop.solutions.map(s => `<li>${s}</li>`).join('')}</ul>
<p><strong>下一步：</strong>${prop.nextStep}</p>
${ctaBlock(prop.nextStep, bookingUrl)}
</body></html>`;
        }
        if (template === 'risk' && r.type === 'security_summary') {
            const brief = this.generateSecurityRiskBrief(r);
            if (!brief) return this.toHtml(r, 'full');
            return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>資安風險說明 - ${brief.companyName}</title>
<style>body{font-family:sans-serif;max-width:600px;margin:40px auto;padding:24px}
table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:10px;text-align:left}
th{background:#f5f5f5}</style></head><body>
<h1>${brief.companyName} · 資安風險說明</h1>
<table><tr><th>風險</th><th>影響</th><th>建議</th></tr>
${brief.risks.map(x => `<tr><td>${x.風險}</td><td>${x.影響}</td><td>${x.建議}</td></tr>`).join('')}
</table>
<p>${brief.top3}</p>
${ctaBlock('我可以協助您修復以上資安問題', bookingUrl)}
</body></html>`;
        }

        if (r.type === 'website_audit') {
            return `
<!DOCTYPE html><html><head><meta charset="UTF-8"><title>網站健檢報告 - ${r.companyName}</title>
<style>body{font-family:sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.6}
h1{color:#333}h2{color:#555;margin-top:24px}ul{list-style:disc;margin-left:20px}
.score{font-size:2em;color:#2ecc71}.issue{color:#e74c3c}</style></head><body>
<h1>網站健檢報告</h1>
<p><strong>${r.companyName}</strong> · ${r.websiteUrl}</p>
<p>報告日期：${new Date(r.generatedAt).toLocaleDateString('zh-TW')}</p>
<p class="score">綜合評分：${r.summary?.score ?? '-'} / 100</p>
<h2>發現問題</h2><ul>${(r.issues || []).map(i => `<li class="issue">${i}</li>`).join('')}</ul>
<h2>改善建議</h2><ul>${(r.recommendations || []).map(x => `<li>${x}</li>`).join('')}</ul>
<h2>可能流失客戶的原因</h2><ul>${(r.lossReasons || []).map(x => `<li>${x}</li>`).join('')}</ul>
${ctaBlock('我可以協助您改善以上問題，歡迎預約 15 分鐘免費諮詢。', bookingUrl)}
</body></html>`;
        }
        if (r.type === 'seo_analysis') {
            return `
<!DOCTYPE html><html><head><meta charset="UTF-8"><title>SEO 分析 - ${r.companyName}</title>
<style>body{font-family:sans-serif;max-width:800px;margin:40px auto;padding:20px}</style></head><body>
<h1>SEO 初步分析</h1>
<p><strong>${r.companyName}</strong> · ${r.websiteUrl}</p>
<p>Title: ${r.title || '未設定'}</p>
<p>Description: ${r.description || '未設定'}</p>
<p>H1: ${r.hasH1 ? '有' : '無'}</p>
<h2>建議</h2><ul>${(r.suggestions || []).map(s => `<li>${s}</li>`).join('')}</ul>
${ctaBlock('我可以協助您優化 SEO，歡迎預約諮詢。', bookingUrl)}
</body></html>`;
        }
        if (r.type === 'security_summary') {
            return `
<!DOCTYPE html><html><head><meta charset="UTF-8"><title>資安摘要 - ${r.companyName}</title>
<style>body{font-family:sans-serif;max-width:800px;margin:40px auto;padding:20px}</style></head><body>
<h1>資安初步檢查</h1>
<p><strong>${r.companyName}</strong> · ${r.websiteUrl}</p>
<p>HTTPS: ${r.hasHttps ? '有' : '無'}</p>
<h2>建議</h2><ul>${(r.recommendations || []).map(x => `<li>${x}</li>`).join('')}</ul>
${ctaBlock('我可以協助您強化資安，歡迎預約諮詢。', bookingUrl)}
</body></html>`;
        }
        return `<pre>${JSON.stringify(r, null, 2)}</pre>`;
    }

    getReport(id) {
        return this.reports.find(r => r.id === id);
    }

    getAllReports() {
        return [...this.reports].reverse();
    }

    /** 產生 KPI 報表（每日/每週摘要） */
    async generateKPIReport(period = 'week') {
        const base = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'http://localhost:3856';
        let kpi = {}, events = [];
        try {
            const [kRes, eRes] = await Promise.all([
                fetch(`${base}/api/kpi`),
                fetch(`${base}/api/events`)
            ]);
            kpi = await kRes.json();
            const eData = await eRes.json();
            events = eData.events || [];
        } catch (e) {
            return { error: e.message };
        }
        const crm = window.crmDatabase ? {
            total: window.crmDatabase.customers?.length || 0,
            contacted: window.crmDatabase.customers?.filter(c => ['contacted', 'responded', 'needs_confirmed', 'quoted', 'negotiating', 'closed'].includes(c.stage)).length || 0,
            closed: window.crmDatabase.customers?.filter(c => c.stage === 'closed').length || 0
        } : null;
        const byDay = {};
        events.forEach(ev => {
            const d = (ev.ts || '').slice(0, 10);
            if (d) byDay[d] = { ...(byDay[d] || {}), [ev.type]: (byDay[d]?.[ev.type] || 0) + 1 };
        });
        const days = Object.entries(byDay).sort((a, b) => b[0].localeCompare(a[0])).slice(0, period === 'week' ? 7 : 30);
        return {
            generatedAt: new Date().toISOString(),
            period,
            kpi: { emailSent: kpi.emailSent, emailOpened: kpi.emailOpened, linkClicked: kpi.linkClicked, openRate: kpi.openRate, clickRate: kpi.clickRate },
            crm,
            byDay: days
        };
    }
}
window.reportGenerator = new ReportGenerator();
