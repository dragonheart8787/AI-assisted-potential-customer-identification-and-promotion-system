/**
 * 資料去重與清洗模組
 * 同公司、網域、email 去重，錯誤 email 過濾，過期資料標記
 */
class DataDeduplication {
    constructor() {
        this.emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        this.init();
    }

    init() {
        this.loadBlacklist();
    }

    loadBlacklist() {
        const saved = localStorage.getItem('dedup_blacklist_domains');
        this.blacklistDomains = saved ? JSON.parse(saved) : ['example.com', 'test.com', 'mailinator.com'];
    }

    saveBlacklist() {
        localStorage.setItem('dedup_blacklist_domains', JSON.stringify(this.blacklistDomains));
    }

    /**
     * 從 URL 提取網域
     */
    extractDomain(url) {
        if (!url || typeof url !== 'string') return '';
        try {
            const u = url.startsWith('http') ? url : 'https://' + url;
            return new URL(u).hostname.replace(/^www\./, '').toLowerCase();
        } catch {
            return '';
        }
    }

    /**
     * 從 email 提取網域
     */
    extractEmailDomain(email) {
        if (!email) return '';
        const parts = String(email).split('@');
        return parts.length === 2 ? parts[1].toLowerCase() : '';
    }

    /**
     * 正規化公司名稱（去空白、小寫、移除常見後綴）
     */
    normalizeCompanyName(name) {
        if (!name) return '';
        return String(name)
            .replace(/\s+/g, ' ')
            .replace(/有限公司|股份有限公司|股份有限公司|Ltd\.?|Inc\.?|Co\.?/gi, '')
            .trim()
            .toLowerCase();
    }

    /**
     * 驗證 email 格式
     */
    isValidEmail(email) {
        if (!email || typeof email !== 'string') return false;
        const e = email.trim().toLowerCase();
        if (!this.emailRegex.test(e)) return false;
        const domain = this.extractEmailDomain(e);
        return !this.blacklistDomains.includes(domain);
    }

    /**
     * 檢查是否為重複客戶（依 email、網域、公司名）
     */
    findDuplicate(existingList, candidate) {
        const email = (candidate.email || '').trim().toLowerCase();
        const domain = this.extractDomain(candidate.website || candidate.url || '') || this.extractEmailDomain(email);
        const companyNorm = this.normalizeCompanyName(candidate.company || candidate.name);

        for (const existing of existingList) {
            const exEmail = (existing.email || '').trim().toLowerCase();
            const exDomain = this.extractDomain(existing.website || existing.url || '') || this.extractEmailDomain(exEmail);
            const exCompanyNorm = this.normalizeCompanyName(existing.company || existing.name);

            if (email && exEmail && email === exEmail) return { duplicate: true, reason: 'email', existing };
            if (domain && exDomain && domain === exDomain) return { duplicate: true, reason: 'domain', existing };
            if (companyNorm && exCompanyNorm && companyNorm === exCompanyNorm && companyNorm.length > 2) {
                return { duplicate: true, reason: 'company', existing };
            }
        }
        return { duplicate: false };
    }

    /**
     * 清洗客戶資料
     */
    sanitizeCustomer(data) {
        const out = { ...data };
        if (out.email) out.email = out.email.trim().toLowerCase();
        if (out.website && !out.website.startsWith('http')) out.website = 'https://' + out.website;
        if (out.company) out.company = out.company.trim();
        if (out.name) out.name = out.name.trim();
        out.lastVerifiedAt = out.lastVerifiedAt || new Date().toISOString();
        return out;
    }

    /**
     * 標記過期資料（超過 N 天未驗證）
     */
    markStale(items, daysThreshold = 180) {
        const cutoff = Date.now() - daysThreshold * 24 * 60 * 60 * 1000;
        return items.map(item => {
            const verified = item.lastVerifiedAt ? new Date(item.lastVerifiedAt).getTime() : 0;
            return { ...item, isStale: verified < cutoff };
        });
    }

    /**
     * 批次去重
     */
    deduplicateBatch(candidates, existingList) {
        const seen = new Set();
        const results = { added: [], duplicates: [], invalid: [] };

        for (const c of candidates) {
            const sanitized = this.sanitizeCustomer(c);
            if (!this.isValidEmail(sanitized.email) && !sanitized.phone) {
                results.invalid.push({ ...sanitized, reason: 'invalid_email' });
                continue;
            }
            const dup = this.findDuplicate(existingList, sanitized);
            if (dup.duplicate) {
                results.duplicates.push({ candidate: sanitized, ...dup });
                continue;
            }
            const key = sanitized.email || sanitized.phone || this.normalizeCompanyName(sanitized.company);
            if (seen.has(key)) {
                results.duplicates.push({ candidate: sanitized, reason: 'batch_duplicate' });
                continue;
            }
            seen.add(key);
            results.added.push(sanitized);
        }
        return results;
    }
}
window.dataDeduplication = new DataDeduplication();
