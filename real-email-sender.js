/**
 * 真實 Email 發送模組
 * 透過後端 SMTP 或前端備援（當後端不可用時提示）
 */
const RealEmailSender = {
    backendUrl: null,

    init() {
        this.backendUrl = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'http://localhost:3856';
    },

    async send(options) {
        this.init();
        const { to, subject, text, html, from, trackOpen = true, customerId, templateId, campaignId, source } = options;
        if (!to) throw new Error('缺少收件人');

        const trackingId = `em_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        const res = await fetch(`${this.backendUrl}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to,
                subject: subject || '(無主旨)',
                text: text || html || '',
                html: html || text,
                from,
                trackOpen,
                trackingId,
                customerId,
                templateId,
                campaignId,
                source
            })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || '發送失敗');
        return { ...data, trackingId: data.trackingId || trackingId };
    },

    /** 將報告連結改為可追蹤的 redirect 連結 */
    trackableLink(url, trackingId) {
        this.init();
        if (!url || !trackingId) return url;
        return `${this.backendUrl}/api/redirect?to=${encodeURIComponent(url)}&id=${trackingId}`;
    },

    async checkBackend() {
        this.init();
        try {
            const res = await fetch(`${this.backendUrl}/api/config`);
            const data = await res.json();
            return data.hasSmtp && data.hasNodemailer;
        } catch {
            return false;
        }
    }
};
window.realEmailSender = RealEmailSender;
