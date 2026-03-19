/**
 * Google Maps / Places API 爬取模組
 * 從 Google Maps 搜尋商家並轉為目標客戶格式
 */
class GooglePlacesCrawler {
    constructor() {
        this.baseUrl = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'http://localhost:3856';
        this.results = [];
    }

    async search(options = {}) {
        const { query = '', location = '', type = '', language = 'zh-TW' } = options;
        if (!query.trim()) return [];

        const params = new URLSearchParams({ query, language });
        if (location) params.set('location', location);
        if (type) params.set('type', type);

        const res = await fetch(`${this.baseUrl}/api/google-places?${params}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const places = data.places || [];
        this.results = places.map(p => this.toProspect(p));
        return this.results;
    }

    toProspect(place) {
        return {
            id: 'gm_' + (place.place_id || Date.now() + Math.random().toString(36).slice(2)),
            name: place.name || '未命名',
            company: place.name || '未命名',
            title: '負責人',
            address: place.address,
            phone: place.phone,
            website: place.website,
            email: '',
            source: 'google_maps',
            sourceUrl: place.url,
            rating: place.rating,
            type: this.inferType(place.types)
        };
    }

    inferType(types) {
        if (!types || !types.length) return '其他';
        const map = {
            restaurant: '餐飲業', cafe: '餐飲業', food: '餐飲業',
            store: '零售業', shopping_mall: '零售業',
            beauty_salon: '美容美髮', hair_care: '美容美髮',
            pet_store: '寵物用品', electronics_store: '3C電子',
            gym: '運動休閒', school: '教育培訓',
            doctor: '醫療保健', pharmacy: '醫療保健'
        };
        for (const t of types) {
            const v = map[t];
            if (v) return v;
        }
        return '其他';
    }

    getResults() {
        return this.results;
    }
}
window.googlePlacesCrawler = new GooglePlacesCrawler();
