/**
 * 網站與公開資訊分析模組
 * 速度、SSL、header、技術堆疊、SEO 基礎、資安線索
 * 僅做合法、低侵擾的公開資訊分析
 */
class WebsiteAnalyzer {
    constructor() {
        this.analysisCache = new Map();
        this.cacheTimeout = 24 * 60 * 60 * 1000; // 24h
    }

    normalizeUrl(url) {
        if (!url || typeof url !== 'string') return '';
        const u = url.trim();
        return u.startsWith('http') ? u : 'https://' + u;
    }

    getCached(url) {
        const key = this.normalizeUrl(url);
        const item = this.analysisCache.get(key);
        if (!item || Date.now() - item.timestamp > this.cacheTimeout) return null;
        return item.data;
    }

    setCached(url, data) {
        this.analysisCache.set(this.normalizeUrl(url), { data, timestamp: Date.now() });
    }

    /**
     * 分析網站（透過 fetch + 公開 API，無侵入式掃描）
     */
    async analyze(url) {
        const normalized = this.normalizeUrl(url);
        const cached = this.getCached(normalized);
        if (cached) return cached;

        const result = {
            url: normalized,
            analyzedAt: new Date().toISOString(),
            success: false,
            speed: null,
            hasHttps: false,
            sslValid: null,
            securityHeaders: {},
            techStack: [],
            seo: {},
            issues: [],
            recommendations: [],
            leadSignals: []
        };

        try {
            const start = Date.now();
            let html = '';
            let statusCode = 0;
            let responseHeaders = {};

            try {
                const res = await fetch(normalized, { method: 'GET', mode: 'cors', credentials: 'omit', redirect: 'follow' });
                statusCode = res.status;
                html = await res.text();
                res.headers.forEach((v, k) => { responseHeaders[k.toLowerCase()] = v; });
            } catch (directErr) {
                const proxyUrl = `${window.location.origin}/api/proxy?url=${encodeURIComponent(normalized)}`;
                const proxyRes = await fetch(proxyUrl);
                const proxyData = await proxyRes.json();
                if (proxyData.error) throw new Error(proxyData.error);
                statusCode = proxyData.status || 0;
                html = proxyData.body || '';
                if (proxyData.headers) responseHeaders = proxyData.headers;
            }

            result.success = statusCode >= 200 && statusCode < 400;
            result.speed = Date.now() - start;
            result.statusCode = statusCode;

            const headers = responseHeaders;
            result.hasHttps = normalized.startsWith('https');
            result.securityHeaders = {
                'strict-transport-security': headers['strict-transport-security'] || null,
                'x-content-type-options': headers['x-content-type-options'] || null,
                'x-frame-options': headers['x-frame-options'] || null,
                'content-security-policy': headers['content-security-policy'] ? 'present' : null
            };

            result.techStack = this.detectTechStack(html, headers);
            result.seo = this.analyzeSeo(html);
            result.content = this.analyzeContent(html);
            result.security = await this.analyzeSecurity(normalized, html);
            result.issues = this.findIssues(result);
            result.recommendations = this.generateRecommendations(result);
            result.website_need_score = this.computeWebsiteNeedScore(result);
            result.security_need_score = this.computeSecurityNeedScore(result);
            result.leadSignals = this.extractLeadSignals(result);
            result.contactInfo = this.extractContactInfo(html, normalized);

            this.setCached(normalized, result);
        } catch (e) {
            result.error = e.message;
            result.issues.push('無法連線或 CORS 限制');
        }
        return result;
    }

    detectTechStack(html, headers) {
        const tech = [];
        const server = headers['server'] || headers['x-powered-by'];
        if (server) tech.push(server);
        if (/wp-content|wordpress|wp-includes/i.test(html)) tech.push('WordPress');
        if (/react|__NEXT_DATA__|_next/i.test(html)) tech.push('React');
        if (/vue\.|v-bind|v-model/i.test(html)) tech.push('Vue');
        if (/cloudflare/i.test(html) || headers['cf-ray']) tech.push('Cloudflare');
        if (/google-analytics|gtag|ga\(/i.test(html)) tech.push('Google Analytics');
        if (/jquery/i.test(html)) tech.push('jQuery');
        return [...new Set(tech)];
    }

    analyzeSeo(html) {
        const seo = { title: null, description: null, hasH1: false, hasH2: false, ogTags: {} };
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) seo.title = titleMatch[1].trim();
        const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
            html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
        if (descMatch) seo.description = descMatch[1].trim();
        seo.hasH1 = /<h1[^>]*>/i.test(html);
        seo.hasH2 = /<h2[^>]*>/i.test(html);
        return seo;
    }

    /** 分析內容結構：CTA、表單、響應式、作品集等 */
    analyzeContent(html) {
        const ctaPattern = /(聯絡|聯繫|contact|預約|詢價|立即|報價|諮詢|免費|試用|demo)/i;
        const hasCta = ctaPattern.test(html) && (/<a[^>]+href/i.test(html) || /<button/i.test(html));
        const hasForm = /<form[^>]*>/i.test(html) && /type=["']?(submit|button)/i.test(html);
        const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
        const yearMatch = html.match(/(?:©|copyright|©)\s*(\d{4})/i) || html.match(/\b(20\d{2})\s*[-–]/);
        const copyrightYear = yearMatch ? parseInt(yearMatch[1], 10) : null;
        const isOutdated = copyrightYear && copyrightYear < new Date().getFullYear() - 2;
        const portfolioPattern = /(作品|案例|portfolio|projects|服務|關於|about|service)/i;
        const hasPortfolioOrService = portfolioPattern.test(html);
        return { hasCta, hasForm, hasViewport, copyrightYear, isOutdated, hasPortfolioOrService };
    }

    /** 資安相關檢查（security.txt 需額外 fetch） */
    async analyzeSecurity(baseUrl, html) {
        const hasExposedTech = /(Server|X-Powered-By):/i.test(html) || /wordpress\/\d+\.\d+/i.test(html);
        const hasRobots = /robots\.txt/i.test(html) || /<link[^>]+robots/i.test(html);
        const hasSitemap = /sitemap/i.test(html);
        const hasPrivacy = /(privacy|隱私|個資)/i.test(html);
        let hasSecurityTxt = false;
        try {
            const u = new URL(baseUrl);
            const secUrl = `${u.origin}/.well-known/security.txt`;
            const proxyUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/proxy?url=${encodeURIComponent(secUrl)}` : secUrl;
            const r = await fetch(proxyUrl).catch(() => null);
            if (r) {
                const data = typeof r.json === 'function' ? await r.json().catch(() => ({})) : {};
                hasSecurityTxt = !data.error && data.status === 200;
            }
        } catch (_) {}
        return { hasExposedTech, hasRobots, hasSitemap, hasPrivacy, hasSecurityTxt };
    }

    findIssues(result) {
        const issues = [];
        if (result.speed > 3000) issues.push('載入速度慢（>3秒）');
        if (!result.hasHttps) issues.push('未使用 HTTPS');
        if (!result.securityHeaders['x-content-type-options']) issues.push('缺少 X-Content-Type-Options');
        if (!result.seo.title) issues.push('缺少 meta title');
        if (!result.seo.description) issues.push('缺少 meta description');
        if (!result.seo.hasH1) issues.push('缺少 H1 標題');
        if (result.techStack.includes('WordPress') && !result.securityHeaders['content-security-policy']) {
            issues.push('WordPress 常見資安強化建議');
        }
        return issues;
    }

    generateRecommendations(result) {
        const recs = [];
        if (result.issues.includes('載入速度慢')) recs.push('優化圖片、啟用快取、考慮 CDN');
        if (result.issues.includes('未使用 HTTPS')) recs.push('申請 SSL 憑證並啟用 HTTPS');
        if (!result.seo.title) recs.push('設定明確的頁面標題');
        if (result.techStack.length === 0) recs.push('可考慮現代化技術堆疊');
        if (recs.length === 0) recs.push('網站基礎良好，可進一步優化轉換率');
        return recs;
    }

    /** 網站撰寫需求分數 0–100：越高表示越需要網站重做/優化 */
    computeWebsiteNeedScore(result) {
        let score = 0;
        const c = result.content || {};
        const seo = result.seo || {};
        if (!c.hasCta) score += 20;
        if (!c.hasForm) score += 15;
        if (!c.hasViewport) score += 15;
        if (c.isOutdated) score += 10;
        if (!seo.title) score += 10;
        if (!seo.description) score += 10;
        if (!seo.hasH1) score += 5;
        if (!c.hasPortfolioOrService) score += 10;
        if (result.speed > 3000) score += 10;
        return Math.min(100, score);
    }

    /** 資安需求分數 0–100：越高表示越需要資安強化 */
    computeSecurityNeedScore(result) {
        let score = 0;
        const sec = result.security || {};
        const h = result.securityHeaders || {};
        if (!result.hasHttps) score += 30;
        if (!h['strict-transport-security']) score += 15;
        if (!h['x-content-type-options']) score += 10;
        if (!h['x-frame-options']) score += 10;
        if (!sec.hasSecurityTxt) score += 10;
        if (sec.hasExposedTech) score += 10;
        if (result.techStack?.includes('WordPress') && !h['content-security-policy']) score += 15;
        return Math.min(100, score);
    }

    extractLeadSignals(result) {
        const signals = [];
        const ws = result.website_need_score ?? this.computeWebsiteNeedScore(result);
        const ss = result.security_need_score ?? this.computeSecurityNeedScore(result);
        if (ws >= 50) signals.push({ type: 'website_redo', score: ws, reason: `網站需求分數 ${ws}，建議優先聯繫` });
        if (ss >= 50) signals.push({ type: 'security', score: ss, reason: `資安需求分數 ${ss}，資安強化機會` });
        if (result.issues?.length >= 3) signals.push({ type: 'website_redo', score: 70, reason: '多項網站問題' });
        if (result.techStack?.includes('WordPress') && result.issues?.some(i => i.includes('資安'))) {
            signals.push({ type: 'security', score: 60, reason: 'WordPress 資安強化機會' });
        }
        if (!result.seo?.description) signals.push({ type: 'seo', score: 50, reason: 'SEO 優化空間' });
        if (result.speed > 3000) signals.push({ type: 'performance', score: 55, reason: '效能改善需求' });
        return signals;
    }

    /**
     * 從官網 HTML 抓取聯絡資訊（mailto、表單、聯絡區塊）
     */
    extractContactInfo(html, baseUrl) {
        const result = { emails: [], phones: [], forms: [], contactLinks: [] };
        if (!html || typeof html !== 'string') return result;

        const mailtoMatch = html.match(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi);
        if (mailtoMatch) {
            result.emails = [...new Set(mailtoMatch.map(m => m.replace(/^mailto:/i, '').toLowerCase()))];
        }
        const emailInText = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
        if (emailInText) {
            const filtered = emailInText.filter(e => !/\.(png|jpg|gif|css|js|woff|svg)$/i.test(e) && !/example\.com|test@|noreply|no-reply/i.test(e));
            result.emails = [...new Set([...result.emails, ...filtered.map(e => e.toLowerCase())])];
        }

        const telMatch = html.match(/(?:tel:|電話|phone|聯絡)[:\s]*([0-9\-\(\)\s]{7,15})/gi);
        if (telMatch) {
            const nums = telMatch.map(m => (m.match(/[0-9\-\(\)\s]{7,15}/) || [])[0]).filter(Boolean);
            result.phones = [...new Set(nums.map(n => n.replace(/\s/g, '').trim()))];
        }

        const formMatch = html.match(/<form[^>]*action=["']([^"']+)["'][^>]*>/gi);
        if (formMatch) {
            formMatch.forEach(f => {
                const action = f.match(/action=["']([^"']+)["']/i);
                if (action) result.forms.push(action[1].startsWith('http') ? action[1] : new URL(action[1], baseUrl || 'https://example.com').href);
            });
        }
        if (/<form/i.test(html) && result.forms.length === 0) result.forms.push(baseUrl || '有表單');

        const contactPattern = /(聯絡|contact|關於|about|諮詢|詢價)[^"']*href=["']([^"']+)["']/gi;
        let m;
        while ((m = contactPattern.exec(html)) !== null) {
            const href = m[2].startsWith('http') ? m[2] : new URL(m[2], baseUrl || 'https://example.com').href;
            if (!result.contactLinks.includes(href)) result.contactLinks.push(href);
        }
        return result;
    }

    /**
     * 產出「流失客戶的 N 個原因」摘要
     */
    getLossReasonsSummary(analysis) {
        const reasons = [];
        if (analysis.issues?.includes('載入速度慢')) reasons.push('載入過慢導致用戶離開');
        if (analysis.issues?.includes('未使用 HTTPS')) reasons.push('缺乏 HTTPS 影響信任與 SEO');
        if (!analysis.seo?.description) reasons.push('搜尋結果缺乏吸引人的描述');
        if (!analysis.seo?.hasH1) reasons.push('頁面結構不清晰，影響理解');
        if (analysis.issues?.length >= 3) reasons.push('整體網站體驗有待提升');
        return reasons.slice(0, 5);
    }
}
window.websiteAnalyzer = new WebsiteAnalyzer();
