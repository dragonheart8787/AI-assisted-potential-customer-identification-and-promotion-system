/**
 * 社群媒體商家搜尋模組
 * Facebook Places、Instagram 商業帳號（需 OAuth token）
 */
class SocialPlacesCrawler {
    constructor() {
        this.baseUrl = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'http://localhost:3856';
    }

    async searchFacebook(options = {}) {
        const token = window.realSocialMediaAPI?.authenticatedAccounts?.facebook?.accessToken;
        if (!token) throw new Error('請先登入 Facebook 並設定 API');

        const { q = '', center = '' } = options;
        const params = new URLSearchParams({ access_token: token, q });
        if (center) params.set('center', center);

        const res = await fetch(`${this.baseUrl}/api/facebook-places?${params}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        return (data.places || []).map(p => ({
            id: 'fb_' + (p.id || Date.now()),
            name: p.name || '未命名',
            company: p.name || '未命名',
            title: '負責人',
            address: p.address,
            phone: p.phone,
            website: p.website,
            source: 'facebook',
            sourceUrl: p.url
        }));
    }

    async search(options = {}) {
        const { source = 'facebook', ...opts } = options;
        if (source === 'facebook') return this.searchFacebook(opts);
        return [];
    }
}
window.socialPlacesCrawler = new SocialPlacesCrawler();
