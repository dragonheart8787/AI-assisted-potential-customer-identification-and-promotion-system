/**
 * 招募頁爬蟲 - 104、1111、Cake 等
 * 透過後端代理取得公開職缺，作為 B2B/招聘需求訊號
 */
const JobBoardCrawler = {
    backendUrl: null,

    init() {
        this.backendUrl = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'http://localhost:3856';
    },

    /**
     * 從 104 搜尋職缺（需後端代理，回傳結構化名單）
     * 104 公開搜尋頁：https://www.104.com.tw/jobs/search/?keyword=xxx
     */
    async search104(keyword, options = {}) {
        this.init();
        const { maxResults = 20 } = options;
        const url = `https://www.104.com.tw/jobs/search/?keyword=${encodeURIComponent(keyword)}`;
        try {
            const res = await fetch(`${this.backendUrl}/api/proxy?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            if (data.error) return { error: data.error, jobs: [] };
            const html = data.body || '';
            const jobs = this.parse104Html(html, maxResults);
            return { jobs, source: '104', keyword };
        } catch (e) {
            return { error: e.message, jobs: [] };
        }
    },

    parse104Html(html, max) {
        const jobs = [];
        const companyMatch = html.match(/data-comp-name="([^"]+)"/g);
        const titleMatch = html.match(/data-job-name="([^"]+)"/g);
        const linkMatch = html.match(/href="(\/job\/[^"]+)"/g);
        if (companyMatch && titleMatch) {
            const companies = companyMatch.map(m => m.replace(/data-comp-name="|"/g, ''));
            const titles = titleMatch.map(m => m.replace(/data-job-name="|"/g, ''));
            const links = (linkMatch || []).map(m => m.replace(/href="|"/g, ''));
            for (let i = 0; i < Math.min(companies.length, titles.length, max); i++) {
                jobs.push({
                    company: companies[i],
                    title: titles[i],
                    url: links[i] ? `https://www.104.com.tw${links[i]}` : '',
                    source: '104'
                });
            }
        }
        if (jobs.length === 0 && html.includes('104')) {
            const fallback = html.match(/<a[^>]+href="(\/job\/[^"]+)"[^>]*>([^<]+)<\/a>/gi);
            if (fallback) {
                fallback.slice(0, max).forEach(f => {
                    const m = f.match(/href="([^"]+)"[^>]*>([^<]+)</i);
                    if (m) jobs.push({ company: '', title: m[2], url: `https://www.104.com.tw${m[1]}`, source: '104' });
                });
            }
        }
        return jobs;
    },

    /**
     * 從 1111 搜尋（結構類似）
     */
    async search1111(keyword, options = {}) {
        this.init();
        const { maxResults = 20 } = options;
        const url = `https://www.1111.com.tw/search/job?ks=${encodeURIComponent(keyword)}`;
        try {
            const res = await fetch(`${this.backendUrl}/api/proxy?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            if (data.error) return { error: data.error, jobs: [] };
            const html = data.body || '';
            const jobs = this.parse1111Html(html, maxResults);
            return { jobs, source: '1111', keyword };
        } catch (e) {
            return { error: e.message, jobs: [] };
        }
    },

    parse1111Html(html, max) {
        const jobs = [];
        const itemMatch = html.match(/<a[^>]+href="([^"]*\/job\/[^"]+)"[^>]*>([^<]+)<\/a>/gi);
        if (itemMatch) {
            itemMatch.slice(0, max).forEach(f => {
                const m = f.match(/href="([^"]+)"[^>]*>([^<]+)</i);
                if (m && m[2].length > 2) {
                    jobs.push({
                        company: '',
                        title: m[2].trim(),
                        url: m[1].startsWith('http') ? m[1] : `https://www.1111.com.tw${m[1]}`,
                        source: '1111'
                    });
                }
            });
        }
        return jobs;
    },

    /**
     * 統一搜尋：依序嘗試 104、1111
     */
    async search(keyword, options = {}) {
        const r104 = await this.search104(keyword, options);
        if (r104.jobs?.length > 0) return r104;
        const r1111 = await this.search1111(keyword, options);
        return r1111.jobs?.length > 0 ? r1111 : r104;
    },

    /**
     * 轉為 CRM 可匯入的潛在客戶格式
     */
    toProspects(jobs, keyword) {
        return jobs.map(j => ({
            name: j.company || '待確認',
            company: j.company || j.title,
            title: j.title,
            source: 'job_board',
            sourceUrl: j.url,
            sourceKeyword: keyword,
            tags: ['招聘需求', '招募頁']
        }));
    }
};
window.jobBoardCrawler = JobBoardCrawler;
