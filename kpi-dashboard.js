/**
 * KPI 儀表板 - 後端 events + CRM；Demo 模式合併 sample_kpi_events.json
 */
const KPIDashboard = {
    backendUrl: null,

    init() {
        this.backendUrl = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'http://localhost:3856';
    },

    isDemo() {
        return typeof localStorage !== 'undefined' && localStorage.getItem('demo_mode') === '1';
    },

    async fetchKpi() {
        this.init();
        try {
            const res = await fetch(`${this.backendUrl}/api/kpi`);
            return await res.json();
        } catch (e) {
            return { error: e.message, emailSent: 0, emailOpened: 0, linkClicked: 0, openRate: 0, clickRate: 0 };
        }
    },

    async fetchEvents() {
        this.init();
        let apiEvents = [];
        try {
            const res = await fetch(`${this.backendUrl}/api/events`);
            const data = await res.json();
            apiEvents = data.events || [];
        } catch (_) {}
        if (this.isDemo() && window.demoMode) {
            const sample = await window.demoMode.getSampleKpiEvents();
            return [...sample, ...apiEvents];
        }
        return apiEvents;
    },

    computeKpiFromEvents(events) {
        const sent = events.filter(e => e.type === 'email_sent').length;
        const opened = events.filter(e => e.type === 'email_open').length;
        const clicked = events.filter(e => e.type === 'link_click').length;
        const followScheduled = events.filter(e => e.type === 'followup_scheduled').length;
        const followSent = events.filter(e => e.type === 'followup_sent').length;
        return {
            emailSent: sent,
            emailOpened: opened,
            linkClicked: clicked,
            followupScheduled: followScheduled,
            followupSent: followSent,
            openRate: sent > 0 ? ((opened / sent) * 100).toFixed(1) : 0,
            clickRate: sent > 0 ? ((clicked / sent) * 100).toFixed(1) : 0
        };
    },

    getCrmMetrics() {
        if (typeof window === 'undefined' || !window.crmDatabase) return null;
        const customers = window.crmDatabase.getAllCustomers?.() || [];
        const contacted = customers.filter(c => ['contacted', 'responded', 'needs_confirmed', 'quoted', 'negotiating', 'closed'].includes(c.stage));
        const responded = customers.filter(c => ['responded', 'needs_confirmed', 'quoted', 'negotiating', 'closed'].includes(c.stage));
        const closed = customers.filter(c => c.stage === 'closed');
        const quoted = customers.filter(c => ['quoted', 'negotiating', 'closed'].includes(c.stage));
        const highScore = customers.filter(c => (c.leadScore || 0) >= 70).length;
        const pipelineCounts = {};
        customers.forEach(c => {
            const s = c.stage || 'new';
            pipelineCounts[s] = (pipelineCounts[s] || 0) + 1;
        });
        const industryCounts = {};
        const needCounts = {};
        const websiteBuckets = { '低 (0–33)': 0, '中 (34–66)': 0, '高 (67–100)': 0 };
        const securityBuckets = { '低 (0–33)': 0, '中 (34–66)': 0, '高 (67–100)': 0 };
        function bucket(v) {
            if (v == null || Number.isNaN(Number(v))) return null;
            const n = Number(v);
            if (n <= 33) return '低 (0–33)';
            if (n <= 66) return '中 (34–66)';
            return '高 (67–100)';
        }
        customers.forEach(c => {
            const ind = c.industry || '未分類';
            industryCounts[ind] = (industryCounts[ind] || 0) + 1;
            const n = c.needType || '未標記';
            needCounts[n] = (needCounts[n] || 0) + 1;
            const wb = bucket(c.website_need_score);
            if (wb) websiteBuckets[wb]++;
            const sb = bucket(c.security_need_score);
            if (sb) securityBuckets[sb]++;
        });
        return {
            total: customers.length,
            contacted: contacted.length,
            responded: responded.length,
            quoted: quoted.length,
            closed: closed.length,
            highScore,
            contactRate: customers.length ? (contacted.length / customers.length * 100).toFixed(1) : 0,
            replyRate: contacted.length ? (responded.length / contacted.length * 100).toFixed(1) : 0,
            closeRate: quoted.length ? (closed.length / quoted.length * 100).toFixed(1) : 0,
            pipelineCounts,
            industryCounts,
            needCounts,
            websiteBuckets,
            securityBuckets
        };
    },

    renderBars(containerId, counts, labels) {
        const el = document.getElementById(containerId);
        if (!el || !counts) return;
        const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        const max = Math.max(...entries.map(([, v]) => v), 1);
        el.innerHTML = entries.map(([k, v]) => `
            <div class="bar-wrap">
                <div class="bar-label"><span>${labels?.[k] || k}</span><span>${v}</span></div>
                <div class="bar-track"><div class="bar-fill" style="width:${(v / max) * 100}%"></div></div>
            </div>
        `).join('') || '<p class="muted">尚無資料</p>';
    },

    pipelineLabels() {
        return {
            new: '新名單', analyzed: '已分析', contacted: '已聯繫', responded: '已回覆',
            needs_confirmed: '需求確認', quoted: '已報價', negotiating: '談判中', closed: '成交', lost: '流失'
        };
    },

    async render() {
        const demoBadge = document.getElementById('demo-badge');
        if (demoBadge) demoBadge.style.display = this.isDemo() ? 'inline-block' : 'none';
        const hint = document.getElementById('hint-text');
        if (hint) hint.textContent = this.isDemo() ? '目前使用 Demo 範例事件 + 本地 CRM' : '';

        const apiKpi = await this.fetchKpi();
        const events = await this.fetchEvents();
        const fromEvents = this.computeKpiFromEvents(events);

        let emailSent = fromEvents.emailSent || apiKpi.emailSent || 0;
        let emailOpened = fromEvents.emailOpened || apiKpi.emailOpened || 0;
        let linkClicked = fromEvents.linkClicked || apiKpi.linkClicked || 0;
        if (this.isDemo() && fromEvents.emailSent > 0) {
            emailSent = fromEvents.emailSent;
            emailOpened = fromEvents.emailOpened;
            linkClicked = fromEvents.linkClicked;
        }
        const openRate = emailSent > 0 ? ((emailOpened / emailSent) * 100).toFixed(1) : (apiKpi.openRate || 0);
        const clickRate = emailSent > 0 ? ((linkClicked / emailSent) * 100).toFixed(1) : (apiKpi.clickRate || 0);

        const crm = this.getCrmMetrics();
        const cards = document.getElementById('kpi-cards');
        if (cards) {
            const items = [
                { label: '名單總數', val: crm?.total ?? 0, cls: '' },
                { label: '高分 Lead (≥70)', val: crm?.highScore ?? 0, cls: 'warn' },
                { label: '寄信數', val: emailSent, cls: '' },
                { label: '開信數', val: emailOpened, cls: '' },
                { label: '點擊連結數', val: linkClicked, cls: '' },
                { label: '開信率', val: openRate + '%', cls: 'warn' },
                { label: '點擊率', val: clickRate + '%', cls: 'low' },
                { label: '跟進排程', val: fromEvents.followupScheduled || 0, cls: '' },
                { label: '跟進已發', val: fromEvents.followupSent || 0, cls: '' }
            ];
            cards.innerHTML = items.map(i => `
                <div class="card">
                    <h3>${i.label}</h3>
                    <div class="val ${i.cls}">${i.val}</div>
                </div>
            `).join('');
        }

        if (crm?.pipelineCounts) {
            const labels = this.pipelineLabels();
            const mapped = {};
            Object.entries(crm.pipelineCounts).forEach(([k, v]) => { mapped[k] = v; });
            this.renderBars('pipeline-bars', mapped, labels);
        }
        if (crm?.websiteBuckets) {
            this.renderBars('website-score-bars', crm.websiteBuckets, { '低 (0–33)': '低 (0–33)', '中 (34–66)': '中 (34–66)', '高 (67–100)': '高 (67–100)' });
        }
        if (crm?.securityBuckets) {
            this.renderBars('security-score-bars', crm.securityBuckets);
        }
        if (crm?.industryCounts) this.renderBars('industry-bars', crm.industryCounts);

        const byDay = {};
        events.forEach(e => {
            const d = (e.ts || '').slice(0, 10);
            if (!d) return;
            if (!byDay[d]) byDay[d] = { sent: 0, open: 0, click: 0 };
            if (e.type === 'email_sent') byDay[d].sent++;
            if (e.type === 'email_open') byDay[d].open++;
            if (e.type === 'link_click') byDay[d].click++;
        });
        const rows = Object.entries(byDay).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 14);
        const tbody = document.querySelector('#events-table tbody');
        if (tbody) {
            tbody.innerHTML = rows.map(([d, v]) => `<tr><td>${d}</td><td>${v.sent}</td><td>${v.open}</td><td>${v.click}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">尚無資料（可啟用 Demo 模式）</td></tr>';
        }

    }
};

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        KPIDashboard.render();
        document.getElementById('btn-refresh')?.addEventListener('click', () => KPIDashboard.render());
    });
}
