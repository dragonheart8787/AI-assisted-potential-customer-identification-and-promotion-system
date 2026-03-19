/**
 * KPI 儀表板 - 讀取後端 events 與 CRM 資料
 */
const KPIDashboard = {
    backendUrl: null,

    init() {
        this.backendUrl = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'http://localhost:3856';
    },

    async fetchKpi() {
        this.init();
        try {
            const res = await fetch(`${this.backendUrl}/api/kpi`);
            return await res.json();
        } catch (e) {
            return { error: e.message };
        }
    },

    async fetchEvents() {
        this.init();
        try {
            const res = await fetch(`${this.backendUrl}/api/events`);
            const data = await res.json();
            return data.events || [];
        } catch (e) {
            return [];
        }
    },

    getCrmMetrics() {
        if (typeof window === 'undefined' || !window.crmDatabase) return null;
        const customers = window.crmDatabase.getAllCustomers?.() || [];
        const contacted = customers.filter(c => ['contacted', 'responded', 'needs_confirmed', 'quoted', 'negotiating', 'closed'].includes(c.stage));
        const responded = customers.filter(c => ['responded', 'needs_confirmed', 'quoted', 'negotiating', 'closed'].includes(c.stage));
        const closed = customers.filter(c => c.stage === 'closed');
        const quoted = customers.filter(c => ['quoted', 'negotiating', 'closed'].includes(c.stage));
        const highScore = customers.filter(c => (c.leadScore || 0) >= 70).length;
        return {
            total: customers.length,
            contacted: contacted.length,
            responded: responded.length,
            quoted: quoted.length,
            closed: closed.length,
            highScore,
            contactRate: customers.length ? (contacted.length / customers.length * 100).toFixed(1) : 0,
            replyRate: contacted.length ? (responded.length / contacted.length * 100).toFixed(1) : 0,
            closeRate: quoted.length ? (closed.length / quoted.length * 100).toFixed(1) : 0
        };
    },

    render() {
        this.fetchKpi().then(kpi => {
            const cards = document.getElementById('kpi-cards');
            if (!cards) return;
            if (kpi.error) {
                cards.innerHTML = `<div class="card"><p class="muted">無法載入：${kpi.error}</p></div>`;
                return;
            }
            const crm = this.getCrmMetrics();
            const items = [
                { label: '寄信數', val: kpi.emailSent || 0, cls: '' },
                { label: '開信數', val: kpi.emailOpened || 0, cls: '' },
                { label: '點擊數', val: kpi.linkClicked || 0, cls: '' },
                { label: '開信率', val: (kpi.openRate || 0) + '%', cls: 'warn' },
                { label: '點擊率', val: (kpi.clickRate || 0) + '%', cls: 'low' },
                { label: '總 Lead 數', val: crm?.total || 0, cls: '' },
                { label: '高分 Lead', val: crm?.highScore || 0, cls: '' },
                { label: '已聯繫', val: crm?.contacted || 0, cls: '' },
                { label: '已回覆', val: crm?.responded || 0, cls: '' },
                { label: '已報價', val: crm?.quoted || 0, cls: '' },
                { label: '成交', val: crm?.closed || 0, cls: 'val' },
                { label: '回覆率', val: (crm?.replyRate || 0) + '%', cls: 'warn' },
                { label: '成交率', val: (crm?.closeRate || 0) + '%', cls: 'low' }
            ];
            cards.innerHTML = items.map(i => `
                <div class="card">
                    <h3>${i.label}</h3>
                    <div class="val ${i.cls}">${i.val}</div>
                </div>
            `).join('');
        });

        this.fetchEvents().then(events => {
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
                tbody.innerHTML = rows.map(([d, v]) => `<tr><td>${d}</td><td>${v.sent}</td><td>${v.open}</td><td>${v.click}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">尚無資料</td></tr>';
            }
        });

        const funnel = document.getElementById('crm-funnel');
        if (funnel) {
            const crm = this.getCrmMetrics();
            if (crm) {
                funnel.innerHTML = [
                    { label: '總名單', val: crm.total },
                    { label: '已聯繫', val: crm.contacted },
                    { label: '已回覆', val: crm.responded },
                    { label: '已報價', val: crm.quoted },
                    { label: '成交', val: crm.closed }
                ].map(i => `
                    <div class="card">
                        <h3>${i.label}</h3>
                        <div class="val">${i.val}</div>
                    </div>
                `).join('');
            } else {
                funnel.innerHTML = '<div class="card"><p class="muted">請在 app-new 開啟以載入 CRM 資料</p></div>';
            }
        }
    }
};

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        KPIDashboard.render();
        document.getElementById('btn-refresh')?.addEventListener('click', () => KPIDashboard.render());
    });
}
