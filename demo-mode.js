/**
 * Demo 模式 - 載入固定範例資料，供簡報／學習歷程穩定展示（展示主模式）
 * localStorage: demo_mode = '1' 時啟用
 * app-new 會在「首次空名單」時自動 apply()，無需 API／OAuth 即可展示。
 */
const DemoMode = {
    KEY: 'demo_mode',
    BACKUP_KEY: 'crm_customers_pre_demo',

    /** 自 pages/ 子路徑開啟時改為 ../demo/ */
    _demoFile(name) {
        try {
            const p = window.location.pathname || '';
            if (p.includes('/pages/')) return '../demo/' + name;
        } catch (_) {}
        return 'demo/' + name;
    },

    isActive() {
        return localStorage.getItem(this.KEY) === '1';
    },

    async apply() {
        const res = await fetch(this._demoFile('sample_crm_records.json'));
        if (!res.ok) throw new Error('無法載入 demo/sample_crm_records.json');
        const customers = await res.json();
        const backup = localStorage.getItem('crm_customers');
        if (backup && !localStorage.getItem(this.BACKUP_KEY)) {
            localStorage.setItem(this.BACKUP_KEY, backup);
        }
        localStorage.setItem('crm_customers', JSON.stringify(customers));
        localStorage.setItem(this.KEY, '1');
        localStorage.setItem('crm_interaction_history', '[]');
        return customers.length;
    },

    restore() {
        const backup = localStorage.getItem(this.BACKUP_KEY);
        if (backup) {
            localStorage.setItem('crm_customers', backup);
            localStorage.removeItem(this.BACKUP_KEY);
        } else {
            localStorage.removeItem('crm_customers');
        }
        localStorage.removeItem(this.KEY);
    },

    /** KPI 用：Demo 事件（不寫後端檔案） */
    async getSampleKpiEvents() {
        try {
            const res = await fetch(this._demoFile('sample_kpi_events.json'));
            if (!res.ok) return [];
            return await res.json();
        } catch {
            return [];
        }
    }
};

window.demoMode = DemoMode;
