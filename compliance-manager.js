/**
 * 合規與風控模組
 * 發信頻率限制、黑名單、退訂、robots 風險判斷
 */
class ComplianceManager {
    constructor() {
        this.rateLimits = {
            email: { perHour: 50, perDay: 200 },
            linkedin: { perHour: 20, perDay: 100 },
            facebook: { perHour: 30, perDay: 150 },
            instagram: { perHour: 30, perDay: 150 },
            twitter: { perHour: 50, perDay: 200 }
        };
        this.sendHistory = [];
        this.blacklist = [];
        this.unsubscribes = [];
        this.init();
    }

    init() {
        this.loadData();
    }

    loadData() {
        const h = localStorage.getItem('compliance_send_history');
        if (h) this.sendHistory = JSON.parse(h);
        const b = localStorage.getItem('compliance_blacklist');
        if (b) this.blacklist = JSON.parse(b);
        const u = localStorage.getItem('compliance_unsubscribes');
        if (u) this.unsubscribes = JSON.parse(u);
    }

    saveData() {
        localStorage.setItem('compliance_send_history', JSON.stringify(this.sendHistory));
        localStorage.setItem('compliance_blacklist', JSON.stringify(this.blacklist));
        localStorage.setItem('compliance_unsubscribes', JSON.stringify(this.unsubscribes));
    }

    /**
     * 檢查是否可發送（頻率限制）
     */
    canSend(platform, recipientId) {
        if (this.isBlacklisted(recipientId)) return { ok: false, reason: 'blacklisted' };
        if (this.hasUnsubscribed(recipientId)) return { ok: false, reason: 'unsubscribed' };

        const now = Date.now();
        const hourAgo = now - 60 * 60 * 1000;
        const dayAgo = now - 24 * 60 * 60 * 1000;
        const limits = this.rateLimits[platform] || this.rateLimits.email;

        const recent = this.sendHistory.filter(s => s.platform === platform && s.timestamp > hourAgo);
        if (recent.length >= limits.perHour) return { ok: false, reason: 'hourly_limit', limit: limits.perHour };

        const dayRecent = this.sendHistory.filter(s => s.platform === platform && s.timestamp > dayAgo);
        if (dayRecent.length >= limits.perDay) return { ok: false, reason: 'daily_limit', limit: limits.perDay };

        return { ok: true };
    }

    /**
     * 記錄發送
     */
    recordSend(platform, recipientId, recipientEmail) {
        this.sendHistory.push({
            platform,
            recipientId: recipientId || recipientEmail,
            recipientEmail,
            timestamp: Date.now()
        });
        const maxEntries = 10000;
        if (this.sendHistory.length > maxEntries) {
            this.sendHistory = this.sendHistory.slice(-maxEntries);
        }
        this.saveData();
    }

    isBlacklisted(idOrEmail) {
        const key = String(idOrEmail).toLowerCase();
        return this.blacklist.some(b => 
            (b.email && b.email.toLowerCase() === key) || 
            (b.id && String(b.id) === key)
        );
    }

    addToBlacklist(item) {
        if (!this.isBlacklisted(item.email || item.id)) {
            this.blacklist.push({ ...item, addedAt: new Date().toISOString() });
            this.saveData();
        }
    }

    hasUnsubscribed(idOrEmail) {
        const key = String(idOrEmail).toLowerCase();
        return this.unsubscribes.some(u => u.toLowerCase() === key);
    }

    addUnsubscribe(idOrEmail) {
        const key = String(idOrEmail).toLowerCase();
        if (!this.unsubscribes.includes(key)) {
            this.unsubscribes.push(key);
            this.saveData();
        }
    }

    /**
     * 取得發送統計
     */
    getSendStats(platform, hours = 24) {
        const cutoff = Date.now() - hours * 60 * 60 * 1000;
        const filtered = this.sendHistory.filter(s => s.timestamp > cutoff && (!platform || s.platform === platform));
        return {
            count: filtered.length,
            byPlatform: filtered.reduce((acc, s) => { acc[s.platform] = (acc[s.platform] || 0) + 1; return acc; }, {})
        };
    }

    /**
     * 合規邊界說明（僅做合法公開分析）
     */
    getAllowedActions() {
        return {
            allowed: ['公開網站分析', 'HTTP header 檢查', 'SSL 基本檢查', '公開資訊蒐集', 'robots.txt 檢查'],
            forbidden: ['未授權滲透', '弱點利用', '暴力測試', '繞過驗證', '未授權掃描']
        };
    }
}
window.complianceManager = new ComplianceManager();
