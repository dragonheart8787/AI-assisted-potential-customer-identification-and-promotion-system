/**
 * 社交媒體潛在客戶發現模組
 * 從 LinkedIn、Facebook、Instagram、Twitter 等平台搜尋適合的商家與隱藏客群
 * 支援 API 整合與模擬搜尋
 */

class SocialMediaProspectCrawler {
    constructor() {
        this.platforms = {
            linkedin: {
                name: 'LinkedIn',
                icon: '💼',
                searchTypes: ['商家', '企業主', '採購決策者', '店長'],
                apiReady: false
            },
            facebook: {
                name: 'Facebook',
                icon: '📘',
                searchTypes: ['粉絲專頁', '社團成員', '在地商家', '隱藏客群'],
                apiReady: false
            },
            instagram: {
                name: 'Instagram',
                icon: '📸',
                searchTypes: ['品牌帳號', '商家帳號', '網紅', '小眾社群'],
                apiReady: false
            },
            twitter: {
                name: 'X (Twitter)',
                icon: '🐦',
                searchTypes: ['品牌帳號', '業界意見領袖', '話題參與者'],
                apiReady: false
            }
        };
        
        this.merchantCategories = [
            '零售業', '餐飲業', '服飾業', '美妝保養', '3C電子', '家具家飾',
            '寵物用品', '母嬰用品', '運動休閒', '教育培訓', '醫療保健',
            '美容美髮', '旅遊住宿', '批發商', '製造商', '電商賣家', '實體店面'
        ];
        
        this.hiddenCustomerGroups = [
            { id: 'niche_community', name: '小眾社群', desc: '特定興趣、嗜好的緊密社群', platforms: ['facebook', 'instagram'] },
            { id: 'local_business', name: '在地商家', desc: '區域性實體店家', platforms: ['facebook', 'instagram'] },
            { id: 'group_buyers', name: '團購群組', desc: '團購、揪團社群成員', platforms: ['facebook'] },
            { id: 'micro_influencers', name: '微網紅', desc: '中小型影響力創作者', platforms: ['instagram', 'twitter'] },
            { id: 'startup_founders', name: '新創店主', desc: '剛起步的創業者', platforms: ['linkedin', 'twitter'] },
            { id: 'franchise_owners', name: '加盟主', desc: '連鎖加盟店負責人', platforms: ['linkedin', 'facebook'] },
            { id: 'reseller_network', name: '經銷商網絡', desc: '經銷、代理體系', platforms: ['linkedin'] },
            { id: 'interest_based', name: '興趣導向客群', desc: '依興趣標籤聚集的潛在客戶', platforms: ['instagram', 'twitter'] }
        ];
        
        this.discoveredProspects = [];
        this.searchHistory = [];
        this.init();
    }
    
    init() {
        this.loadDiscoveredProspects();
        this.checkAPIStatus();
        console.log('🔍 社交媒體潛在客戶發現模組已初始化');
    }
    
    loadDiscoveredProspects() {
        const saved = localStorage.getItem('social_media_prospects');
        if (saved) {
            try {
                this.discoveredProspects = JSON.parse(saved);
            } catch (e) {
                console.warn('載入發現的潛在客戶失敗:', e);
            }
        }
    }
    
    saveDiscoveredProspects() {
        localStorage.setItem('social_media_prospects', JSON.stringify(this.discoveredProspects));
    }
    
    checkAPIStatus() {
        // 檢查是否有配置 API（可從 realSocialMediaAPI 等取得）
        if (window.realSocialMediaAPI?.authenticatedAccounts) {
            Object.keys(this.platforms).forEach(platform => {
                this.platforms[platform].apiReady = !!window.realSocialMediaAPI.authenticatedAccounts[platform];
            });
        }
    }
    
    /**
     * 從社交媒體搜尋潛在客戶
     * @param {Object} options - 搜尋選項
     * @param {string} options.keywords - 關鍵字
     * @param {string} options.category - 商家類別
     * @param {string} options.platform - 平台 (linkedin|facebook|instagram|twitter)
     * @param {string} options.customerGroup - 隱藏客群類型
     * @param {string} options.location - 地區
     * @param {number} options.limit - 結果數量
     */
    async searchProspects(options = {}) {
        const {
            keywords = '',
            category = '',
            platform = 'all',
            customerGroup = '',
            location = '',
            limit = 20
        } = options;
        
        this.searchHistory.push({ ...options, timestamp: new Date().toISOString() });
        
        const platformsToSearch = platform === 'all' 
            ? Object.keys(this.platforms) 
            : [platform];
        
        const results = [];
        
        for (const plat of platformsToSearch) {
            try {
                const platformResults = await this.searchFromPlatform(plat, {
                    keywords,
                    category,
                    customerGroup,
                    location,
                    limit: Math.ceil(limit / platformsToSearch.length)
                });
                results.push(...platformResults);
            } catch (error) {
                console.warn(`從 ${plat} 搜尋失敗:`, error);
            }
        }
        
        // 去重並評分
        const uniqueResults = this.deduplicateAndScore(results);
        this.discoveredProspects = [...this.discoveredProspects, ...uniqueResults];
        this.saveDiscoveredProspects();
        
        return uniqueResults;
    }
    
    /**
     * 從單一平台搜尋
     */
    async searchFromPlatform(platform, params) {
        const config = this.platforms[platform];
        if (!config) return [];
        
        // 若有真實 API，可在此呼叫
        if (config.apiReady && this[`search${platform.charAt(0).toUpperCase() + platform.slice(1)}`]) {
            return await this[`search${platform.charAt(0).toUpperCase() + platform.slice(1)}`](params);
        }
        
        // 需配置各平台 API 金鑰並完成 OAuth 以啟用真實搜尋，目前回傳空陣列
        return [];
    }
    
    /**
     * 生成模擬搜尋結果 - 模擬從各平台「爬取」到的商家與隱藏客群
     */
    generateMockProspects(platform, params) {
        const { keywords = '', category = '', customerGroup = '', location = '', limit = 15 } = params;
        const results = [];
        const count = Math.min(limit, 15);
        
        const merchants = [
            { name: '王小明', company: '陽光咖啡館', title: '店長', type: '餐飲業' },
            { name: '陳美玲', company: '美美服飾', title: '負責人', type: '服飾業' },
            { name: '林志豪', company: '3C 達人', title: '老闆', type: '3C電子' },
            { name: '張雅婷', company: '寵物天堂', title: '店主', type: '寵物用品' },
            { name: '黃建國', company: '建國五金行', title: '負責人', type: '批發商' },
            { name: '李淑芬', company: '淑芬美髮', title: '設計師/老闆', type: '美容美髮' },
            { name: '吳志明', company: '志明運動用品', title: '店長', type: '運動休閒' },
            { name: '鄭雅惠', company: '雅惠嬰幼兒', title: '負責人', type: '母嬰用品' },
            { name: '劉大偉', company: '大偉電商', title: '電商賣家', type: '電商賣家' },
            { name: '周欣怡', company: '欣怡手作', title: '創辦人', type: '零售業' },
            { name: '許志偉', company: '志偉餐飲', title: '加盟主', type: '餐飲業' },
            { name: '楊雅筑', company: '雅筑美學', title: '負責人', type: '美妝保養' },
            { name: '謝俊宏', company: '俊宏家具', title: '老闆', type: '家具家飾' },
            { name: '蔡佳玲', company: '佳玲補習班', title: '負責人', type: '教育培訓' },
            { name: '曾志祥', company: '志祥批發', title: '經理', type: '批發商' }
        ];
        
        const locations = location ? [location] : ['台北', '新北', '台中', '高雄', '桃園', '台南', '新竹'];
        
        for (let i = 0; i < count; i++) {
            const base = merchants[i % merchants.length];
            const prospect = {
                id: `sm_${platform}_${Date.now()}_${i}`,
                name: base.name,
                company: base.company,
                title: base.title,
                type: base.type,
                category: category || base.type,
                platform,
                platformHandle: this.getPlatformHandle(platform, base, i),
                location: locations[i % locations.length],
                source: 'social_media',
                discoveredAt: new Date().toISOString(),
                customerGroup: customerGroup || (i % 4 === 0 ? 'local_business' : ''),
                avatar: this.getAvatarForType(base.type),
                focus: this.getFocusForCategory(base.type),
                platforms: this.buildPlatformsForProspect(platform, base, i)
            };
            
            if (keywords && !prospect.company.includes(keywords) && !prospect.name.includes(keywords)) {
                prospect.relevanceScore = 60 + Math.floor(Math.random() * 30);
            } else {
                prospect.relevanceScore = 85 + Math.floor(Math.random() * 15);
            }
            
            results.push(prospect);
        }
        
        return results;
    }
    
    getPlatformHandle(platform, base, index) {
        const handles = {
            linkedin: `linkedin.com/in/${base.name.replace(/\s/g, '').toLowerCase()}${index}`,
            facebook: `${base.company}${index}`,
            instagram: `@${base.company.replace(/\s/g, '')}_${index}`,
            twitter: `@${base.company.replace(/\s/g, '')}${index}`
        };
        return handles[platform] || '';
    }
    
    getAvatarForType(type) {
        const avatars = { '餐飲業': '🍽️', '服飾業': '👗', '3C電子': '📱', '寵物用品': '🐾', '美妝保養': '💄', '電商賣家': '🛒', '零售業': '🏪' };
        return avatars[type] || '🏢';
    }
    
    getFocusForCategory(category) {
        const focusMap = {
            '餐飲業': ['餐飲管理', '食材採購', '店面經營'],
            '服飾業': ['流行趨勢', '庫存管理', '電商銷售'],
            '3C電子': ['產品代理', '維修服務', '線上銷售'],
            '電商賣家': ['電商營運', '行銷推廣', '物流管理']
        };
        return focusMap[category] || ['經營管理', '成本控制', '客戶服務'];
    }
    
    buildPlatformsForProspect(platform, base, index) {
        const handle = this.getPlatformHandle(platform, base, index);
        return {
            [platform]: {
                handle,
                url: platform === 'linkedin' ? `https://${handle}` : `https://${platform}.com/${handle.replace('@', '')}`,
                active: true
            }
        };
    }
    
    deduplicateAndScore(prospects) {
        const seen = new Set();
        return prospects.filter(p => {
            const key = `${p.platform}_${p.company}_${p.name}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }
    
    /**
     * 取得所有發現的潛在客戶
     */
    getDiscoveredProspects(filter = {}) {
        let prospects = [...this.discoveredProspects];
        
        if (filter.platform) {
            prospects = prospects.filter(p => p.platform === filter.platform);
        }
        if (filter.category) {
            prospects = prospects.filter(p => p.category === filter.category || p.type === filter.category);
        }
        if (filter.customerGroup) {
            prospects = prospects.filter(p => p.customerGroup === filter.customerGroup);
        }
        
        return prospects.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    }
    
    /**
     * 匯入到 CRM
     */
    importToCRM(prospectIds) {
        if (!window.crmDatabase) return { success: false, error: 'CRM 未載入' };
        
        let imported = 0;
        const errors = [];
        
        prospectIds.forEach(id => {
            const prospect = this.discoveredProspects.find(p => p.id === id);
            if (!prospect) return;
            
            try {
                window.crmDatabase.addCustomer({
                    name: prospect.name,
                    company: prospect.company,
                    title: prospect.title,
                    email: prospect.email || `${prospect.id}@placeholder.local`,
                    industry: prospect.type,
                    tags: ['社交媒體發現', prospect.platform]
                });
                imported++;
            } catch (e) {
                errors.push({ id, error: e.message });
            }
        });
        
        return { success: true, imported, errors };
    }
    
    /**
     * 取得商家類別列表
     */
    getMerchantCategories() {
        return this.merchantCategories;
    }
    
    /**
     * 取得隱藏客群類型
     */
    getHiddenCustomerGroups() {
        return this.hiddenCustomerGroups;
    }
    
    /**
     * 取得平台列表
     */
    getPlatforms() {
        return this.platforms;
    }
}

window.socialMediaProspectCrawler = new SocialMediaProspectCrawler();
console.log('🔍 社交媒體潛在客戶發現模組已載入');
