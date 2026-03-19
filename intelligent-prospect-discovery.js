/**
 * 智能潛在客戶發現系統
 * 自動發現和評分潛在客戶
 */

class IntelligentProspectDiscovery {
    constructor() {
        this.prospectSources = new Map();
        this.scoringCriteria = new Map();
        this.discoveryRules = new Map();
        this.prospectDatabase = new Map();
        
        this.init();
    }
    
    init() {
        this.loadProspectSources();
        this.loadScoringCriteria();
        this.loadDiscoveryRules();
        this.loadProspectDatabase();
        
        console.log('🔍 智能潛在客戶發現系統已初始化');
    }
    
    // 載入潛在客戶來源
    loadProspectSources() {
        this.prospectSources.set('linkedin', {
            name: 'LinkedIn',
            description: '專業社交網絡',
            searchFields: ['title', 'company', 'industry', 'location'],
            apiEndpoint: 'linkedin-search-api',
            dailyLimit: 1000,
            successRate: 0.85
        });
        
        this.prospectSources.set('crunchbase', {
            name: 'Crunchbase',
            description: '創業公司數據庫',
            searchFields: ['company', 'funding', 'industry', 'location'],
            apiEndpoint: 'crunchbase-api',
            dailyLimit: 500,
            successRate: 0.75
        });
        
        this.prospectSources.set('angellist', {
            name: 'AngelList',
            description: '天使投資平台',
            searchFields: ['investor', 'startup', 'industry', 'location'],
            apiEndpoint: 'angellist-api',
            dailyLimit: 300,
            successRate: 0.70
        });
        
        this.prospectSources.set('google_search', {
            name: 'Google搜索',
            description: '網頁搜索發現',
            searchFields: ['keywords', 'industry', 'company'],
            apiEndpoint: 'google-custom-search',
            dailyLimit: 100,
            successRate: 0.60
        });
    }
    
    // 載入評分標準
    loadScoringCriteria() {
        this.scoringCriteria.set('company_size', {
            weight: 0.15,
            criteria: {
                'startup': 20,
                'small': 40,
                'medium': 60,
                'large': 80,
                'enterprise': 100
            }
        });
        
        this.scoringCriteria.set('funding_stage', {
            weight: 0.20,
            criteria: {
                'seed': 30,
                'series_a': 50,
                'series_b': 70,
                'series_c': 85,
                'ipo': 95,
                'public': 100
            }
        });
        
        this.scoringCriteria.set('industry_match', {
            weight: 0.25,
            criteria: {
                'exact_match': 100,
                'related': 70,
                'adjacent': 40,
                'unrelated': 10
            }
        });
        
        this.scoringCriteria.set('decision_maker', {
            weight: 0.20,
            criteria: {
                'ceo': 100,
                'cto': 90,
                'vp': 80,
                'director': 60,
                'manager': 40,
                'other': 20
            }
        });
        
        this.scoringCriteria.set('engagement_level', {
            weight: 0.20,
            criteria: {
                'high_activity': 90,
                'medium_activity': 60,
                'low_activity': 30,
                'inactive': 10
            }
        });
    }
    
    // 載入發現規則
    loadDiscoveryRules() {
        this.discoveryRules.set('tech_companies', {
            name: '科技公司',
            keywords: ['technology', 'software', 'AI', 'tech', 'digital', 'innovation'],
            industries: ['Technology', 'Software', 'Internet', 'Mobile'],
            companySize: ['medium', 'large', 'enterprise'],
            fundingStage: ['series_a', 'series_b', 'series_c', 'ipo']
        });
        
        this.discoveryRules.set('venture_capitalists', {
            name: '風險投資人',
            keywords: ['venture', 'capital', 'investment', 'fund', 'vc'],
            industries: ['Financial Services', 'Investment'],
            companySize: ['medium', 'large'],
            fundingStage: ['series_a', 'series_b', 'series_c', 'ipo']
        });
        
        this.discoveryRules.set('startup_founders', {
            name: '創業公司創始人',
            keywords: ['founder', 'co-founder', 'startup', 'entrepreneur'],
            industries: ['Technology', 'Software', 'Internet', 'Mobile'],
            companySize: ['startup', 'small'],
            fundingStage: ['seed', 'series_a']
        });
        
        // 商家與隱藏客群發現規則
        this.discoveryRules.set('all_merchants', {
            name: '所有商家',
            keywords: ['店主', '負責人', '店長', '老闆', '商家', '零售', '餐飲', '服務'],
            industries: ['Retail', 'Food', 'Service', 'E-commerce', 'Retail', 'Fashion'],
            companySize: ['startup', 'small', 'medium'],
            fundingStage: ['seed', 'series_a', 'public']
        });
        
        this.discoveryRules.set('hidden_customers', {
            name: '隱藏客群',
            keywords: ['社群', '團購', '在地', '小眾', '網紅', '加盟', '經銷'],
            industries: ['Technology', 'Retail', 'Service', 'E-commerce'],
            companySize: ['startup', 'small'],
            fundingStage: ['seed']
        });
    }
    
    // 智能搜索潛在客戶
    async intelligentSearch(searchCriteria) {
        console.log('🔍 開始智能搜索潛在客戶...');
        
        const results = [];
        const sources = Array.from(this.prospectSources.keys());
        
        for (const source of sources) {
            try {
                const sourceResults = await this.searchFromSource(source, searchCriteria);
                results.push(...sourceResults);
                
                // 避免API限制
                await this.delay(1000);
                
            } catch (error) {
                console.error(`搜索來源 ${source} 失敗:`, error);
            }
        }
        
        // 評分和排序
        const scoredResults = this.scoreProspects(results);
        const topProspects = scoredResults
            .sort((a, b) => b.score - a.score)
            .slice(0, 50); // 取前50名
        
        // 保存到數據庫
        this.saveProspects(topProspects);
        
        return topProspects;
    }
    
    async searchFromSource(source, searchCriteria) {
        const sourceConfig = this.prospectSources.get(source);
        if (!sourceConfig) return [];
        console.log(`🔍 從 ${sourceConfig.name} 搜索...`);
        // 需配置各來源 API 以啟用真實搜尋，目前回傳空陣列
        return [];
    }
    
    // 生成模擬結果
    generateMockResults(source, searchCriteria) {
        const results = [];
        const count = Math.floor(Math.random() * 20) + 10; // 10-30個結果
        
        for (let i = 0; i < count; i++) {
            const result = {
                id: `${source}_${Date.now()}_${i}`,
                name: this.generateRandomName(),
                company: this.generateRandomCompany(),
                title: this.generateRandomTitle(),
                industry: this.generateRandomIndustry(),
                location: this.generateRandomLocation(),
                companySize: this.generateRandomCompanySize(),
                fundingStage: this.generateRandomFundingStage(),
                email: this.generateRandomEmail(),
                linkedin: `https://linkedin.com/in/${this.generateRandomSlug()}`,
                phone: this.generateRandomPhone(),
                website: `https://${this.generateRandomSlug()}.com`,
                description: this.generateRandomDescription(),
                socialMedia: {
                    twitter: `@${this.generateRandomSlug()}`,
                    facebook: `https://facebook.com/${this.generateRandomSlug()}`
                },
                engagement: {
                    linkedinPosts: Math.floor(Math.random() * 50),
                    twitterActivity: Math.floor(Math.random() * 100),
                    companyUpdates: Math.floor(Math.random() * 20)
                }
            };
            
            results.push(result);
        }
        
        return results;
    }
    
    // 評分潛在客戶
    scoreProspects(prospects) {
        return prospects.map(prospect => {
            let totalScore = 0;
            let totalWeight = 0;
            
            for (const [criteria, config] of this.scoringCriteria) {
                const value = this.getCriteriaValue(prospect, criteria);
                const score = config.criteria[value] || 0;
                const weightedScore = score * config.weight;
                
                totalScore += weightedScore;
                totalWeight += config.weight;
            }
            
            const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
            
            return {
                ...prospect,
                score: Math.round(finalScore),
                scoreBreakdown: this.getScoreBreakdown(prospect)
            };
        });
    }
    
    // 獲取評分細項
    getScoreBreakdown(prospect) {
        const breakdown = {};
        
        for (const [criteria, config] of this.scoringCriteria) {
            const value = this.getCriteriaValue(prospect, criteria);
            const score = config.criteria[value] || 0;
            breakdown[criteria] = {
                value: value,
                score: score,
                weight: config.weight,
                weightedScore: score * config.weight
            };
        }
        
        return breakdown;
    }
    
    // 獲取評分標準值
    getCriteriaValue(prospect, criteria) {
        switch (criteria) {
            case 'company_size':
                return prospect.companySize;
            case 'funding_stage':
                return prospect.fundingStage;
            case 'industry_match':
                return this.getIndustryMatch(prospect.industry);
            case 'decision_maker':
                return this.getDecisionMakerLevel(prospect.title);
            case 'engagement_level':
                return this.getEngagementLevel(prospect.engagement);
            default:
                return 'unknown';
        }
    }
    
    // 獲取行業匹配度
    getIndustryMatch(industry) {
        const techIndustries = ['Technology', 'Software', 'Internet', 'Mobile', 'AI', 'Fintech'];
        const relatedIndustries = ['Healthcare', 'Finance', 'Education', 'Retail'];
        
        if (techIndustries.includes(industry)) return 'exact_match';
        if (relatedIndustries.includes(industry)) return 'related';
        return 'unrelated';
    }
    
    // 獲取決策者級別
    getDecisionMakerLevel(title) {
        const titleLower = title.toLowerCase();
        
        if (titleLower.includes('ceo') || titleLower.includes('chief executive')) return 'ceo';
        if (titleLower.includes('cto') || titleLower.includes('chief technology')) return 'cto';
        if (titleLower.includes('vp') || titleLower.includes('vice president')) return 'vp';
        if (titleLower.includes('director')) return 'director';
        if (titleLower.includes('manager')) return 'manager';
        return 'other';
    }
    
    // 獲取參與度級別
    getEngagementLevel(engagement) {
        const totalActivity = (engagement.linkedinPosts || 0) + 
                             (engagement.twitterActivity || 0) + 
                             (engagement.companyUpdates || 0);
        
        if (totalActivity > 100) return 'high_activity';
        if (totalActivity > 50) return 'medium_activity';
        if (totalActivity > 10) return 'low_activity';
        return 'inactive';
    }
    
    // 保存潛在客戶
    saveProspects(prospects) {
        prospects.forEach(prospect => {
            this.prospectDatabase.set(prospect.id, prospect);
        });
        
        // 保存到localStorage
        const saved = Array.from(this.prospectDatabase.values());
        localStorage.setItem('intelligentProspects', JSON.stringify(saved));
        
        console.log(`💾 保存了 ${prospects.length} 個潛在客戶`);
    }
    
    // 載入潛在客戶數據庫
    loadProspectDatabase() {
        const saved = localStorage.getItem('intelligentProspects');
        if (saved) {
            const prospects = JSON.parse(saved);
            prospects.forEach(prospect => {
                this.prospectDatabase.set(prospect.id, prospect);
            });
            console.log(`📊 載入了 ${prospects.length} 個潛在客戶`);
        }
    }
    
    // 獲取潛在客戶列表
    getProspects(filter = {}) {
        let prospects = Array.from(this.prospectDatabase.values());
        
        // 應用篩選器
        if (filter.minScore) {
            prospects = prospects.filter(p => p.score >= filter.minScore);
        }
        
        if (filter.industry) {
            prospects = prospects.filter(p => p.industry === filter.industry);
        }
        
        if (filter.companySize) {
            prospects = prospects.filter(p => p.companySize === filter.companySize);
        }
        
        if (filter.source) {
            prospects = prospects.filter(p => p.source === filter.source);
        }
        
        return prospects.sort((a, b) => b.score - a.score);
    }
    
    // 獲取潛在客戶統計
    getProspectStats() {
        const prospects = Array.from(this.prospectDatabase.values());
        
        const stats = {
            total: prospects.length,
            byScore: {
                high: prospects.filter(p => p.score >= 80).length,
                medium: prospects.filter(p => p.score >= 60 && p.score < 80).length,
                low: prospects.filter(p => p.score < 60).length
            },
            byIndustry: {},
            byCompanySize: {},
            bySource: {},
            averageScore: prospects.length > 0 ? 
                Math.round(prospects.reduce((sum, p) => sum + p.score, 0) / prospects.length) : 0
        };
        
        // 按行業統計
        prospects.forEach(p => {
            stats.byIndustry[p.industry] = (stats.byIndustry[p.industry] || 0) + 1;
        });
        
        // 按公司規模統計
        prospects.forEach(p => {
            stats.byCompanySize[p.companySize] = (stats.byCompanySize[p.companySize] || 0) + 1;
        });
        
        // 按來源統計
        prospects.forEach(p => {
            stats.bySource[p.source] = (stats.bySource[p.source] || 0) + 1;
        });
        
        return stats;
    }
    
    // 生成隨機數據的輔助函數
    generateRandomName() {
        const firstNames = ['張', '李', '王', '陳', '劉', '楊', '黃', '趙', '周', '吳'];
        const lastNames = ['偉', '強', '磊', '軍', '勇', '峰', '濤', '明', '超', '亮'];
        return firstNames[Math.floor(Math.random() * firstNames.length)] + 
               lastNames[Math.floor(Math.random() * lastNames.length)];
    }
    
    generateRandomCompany() {
        const companyTypes = ['科技', '創新', '智能', '數位', '雲端', '數據'];
        const companySuffixes = ['有限公司', '股份有限公司', '科技公司', '創新公司'];
        const type = companyTypes[Math.floor(Math.random() * companyTypes.length)];
        const suffix = companySuffixes[Math.floor(Math.random() * companySuffixes.length)];
        return `${type}${suffix}`;
    }
    
    generateRandomTitle() {
        const titles = ['CEO', 'CTO', 'VP Technology', 'Director', 'Manager', 'Founder', 'Co-Founder', '店長', '負責人', '店主', '老闆', '加盟主', '電商賣家'];
        return titles[Math.floor(Math.random() * titles.length)];
    }
    
    generateRandomIndustry() {
        const industries = ['Technology', 'Software', 'Internet', 'Mobile', 'AI', 'Fintech', 'Healthcare'];
        return industries[Math.floor(Math.random() * industries.length)];
    }
    
    generateRandomLocation() {
        const locations = ['台北', '新竹', '台中', '高雄', '上海', '北京', '深圳', '杭州'];
        return locations[Math.floor(Math.random() * locations.length)];
    }
    
    generateRandomCompanySize() {
        const sizes = ['startup', 'small', 'medium', 'large', 'enterprise'];
        return sizes[Math.floor(Math.random() * sizes.length)];
    }
    
    generateRandomFundingStage() {
        const stages = ['seed', 'series_a', 'series_b', 'series_c', 'ipo', 'public'];
        return stages[Math.floor(Math.random() * stages.length)];
    }
    
    generateRandomEmail() {
        const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'company.com'];
        const domain = domains[Math.floor(Math.random() * domains.length)];
        const username = this.generateRandomSlug();
        return `${username}@${domain}`;
    }
    
    generateRandomPhone() {
        return `+886-${Math.floor(Math.random() * 900000000) + 100000000}`;
    }
    
    generateRandomSlug() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    generateRandomDescription() {
        const descriptions = [
            '專注於AI技術的創新公司',
            '提供雲端解決方案的科技企業',
            '致力於數位轉型的技術公司',
            '專精於大數據分析的創新團隊',
            '專注於物聯網技術的科技公司'
        ];
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    }
    
    // 延遲函數
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 創建全域實例
window.intelligentProspectDiscovery = new IntelligentProspectDiscovery();

console.log('🔍 智能潛在客戶發現系統已載入');



