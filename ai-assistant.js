/**
 * AI 推廣助手 - 整合外部 AI 模型協助推廣
 * 支援 OpenAI API、本地規則引擎、模擬模式
 */

class AIAssistant {
    constructor() {
        this.config = {
            apiKey: localStorage.getItem('ai_api_key') || '',
            provider: localStorage.getItem('ai_provider') || 'local', // 'openai' | 'local' | 'mock'
            model: localStorage.getItem('ai_model') || 'gpt-3.5-turbo',
            endpoint: localStorage.getItem('ai_endpoint') || 'https://api.openai.com/v1/chat/completions',
            maxTokens: 500,
            temperature: 0.7
        };
        
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 分鐘快取
        
        this.init();
    }
    
    init() {
        this.loadConfig();
        console.log('🤖 AI 推廣助手已初始化 (模式: ' + this.config.provider + ')');
    }
    
    loadConfig() {
        const saved = localStorage.getItem('ai_assistant_config');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.config = { ...this.config, ...parsed };
            } catch (e) {
                console.warn('AI 設定載入失敗:', e);
            }
        }
    }
    
    saveConfig() {
        localStorage.setItem('ai_assistant_config', JSON.stringify(this.config));
        localStorage.setItem('ai_api_key', this.config.apiKey);
        localStorage.setItem('ai_provider', this.config.provider);
        localStorage.setItem('ai_model', this.config.model);
    }
    
    /**
     * 設定 API 金鑰
     */
    setApiKey(key) {
        this.config.apiKey = key;
        this.saveConfig();
    }
    
    /**
     * 設定 AI 提供者
     */
    setProvider(provider) {
        this.config.provider = provider;
        this.saveConfig();
    }
    
    /**
     * 生成推廣訊息 - 主要入口
     */
    async generatePromotionMessage(context) {
        const cacheKey = `promo_${JSON.stringify(context)}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;
        
        let result;
        switch (this.config.provider) {
            case 'openai':
                result = await this.generateWithOpenAI(context);
                break;
            case 'local':
                result = await this.generateWithLocalAI(context);
                break;
            default:
                result = await this.generateWithLocalAI(context);
        }
        
        this.setCached(cacheKey, result);
        return result;
    }
    
    /**
     * 使用 OpenAI API 生成
     */
    async generateWithOpenAI(context) {
        if (!this.config.apiKey) {
            console.warn('OpenAI API 金鑰未設定，使用本地模式');
            return await this.generateWithLocalAI(context);
        }
        
        const prompt = this.buildPrompt(context);
        
        try {
            const response = await fetch(this.config.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body: JSON.stringify({
                    model: this.config.model,
                    messages: [
                        { role: 'system', content: '你是專業的商業推廣專家，擅長撰寫個人化、有說服力的推廣訊息。' },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: this.config.maxTokens,
                    temperature: this.config.temperature
                })
            });
            
            if (!response.ok) {
                throw new Error(`API 錯誤: ${response.status}`);
            }
            
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || '';
            
            return {
                success: true,
                content: content.trim(),
                provider: 'openai',
                model: this.config.model
            };
        } catch (error) {
            console.error('OpenAI 請求失敗:', error);
            return await this.generateWithLocalAI(context);
        }
    }
    
    /**
     * 使用本地規則引擎生成（整合知識庫與網站問題）
     */
    async generateWithLocalAI(context) {
        const { target, product, userProfile, template, websiteIssues } = context;
        
        const name = target?.name || target?.prospectName || '尊敬的客戶';
        const company = target?.company || target?.companyName || '貴公司';
        const focus = target?.focus?.[0] || target?.industry || '創新科技';
        
        const userName = userProfile?.name || '我們';
        const userCompany = userProfile?.company || '創新科技公司';
        const userTitle = userProfile?.title || '業務代表';
        
        const productName = product?.name || '我們的解決方案';
        const productBenefits = product?.benefits || ['提升效率', '降低成本', '增強競爭力'];
        
        const issueLine = websiteIssues?.length ? `\n我們注意到貴公司網站可能有：${websiteIssues.slice(0, 2).join('、')}，我們的服務可協助改善。` : '';
        
        const templates = {
            product_intro: `尊敬的 ${name}，

我是 ${userName}，${userCompany} 的 ${userTitle}。

我注意到 ${company} 在 ${focus} 領域的卓越表現，相信我們的 ${productName} 能為您帶來價值。${issueLine}

【核心優勢】
${productBenefits.map(b => '• ' + b).join('\n')}

期待與您進一步交流。

此致
${userName}`,

            partnership: `尊敬的 ${name}，

我是 ${userName}，來自 ${userCompany}。

${company} 在 ${focus} 的成就令人印象深刻，我們希望探討合作機會。

【合作價值】
• 資源互補
• 市場擴展
• 技術協同

期待您的回覆。

${userName}`,

            follow_up: `尊敬的 ${name}，

前幾天曾與您聯繫關於 ${productName} 的合作機會。

想確認您是否有興趣進一步了解？如有任何問題，歡迎隨時回覆。

此致
${userName}`
        };
        
        const templateKey = template || 'product_intro';
        const content = templates[templateKey] || templates.product_intro;
        
        return {
            success: true,
            content,
            provider: 'local',
            model: 'rule-based'
        };
    }
    
    buildPrompt(context) {
        const { target, product, userProfile, websiteIssues, tone, knowledgeContext } = context;
        const kb = window.aiKnowledgeBase;
        const kbContext = knowledgeContext || (kb ? kb.getContextForAI({ industry: target?.industry, tone }) : '');
        
        let extra = '';
        if (websiteIssues && websiteIssues.length) {
            extra += `\n【對方網站問題】（請在訊息中適度引用，增加說服力）\n${websiteIssues.map(i => '- ' + i).join('\n')}`;
        }
        if (kbContext) {
            extra += `\n【你的產品與案例參考】\n${kbContext}`;
        }
        
        return `請根據以下資訊撰寫一封專業的推廣訊息：

目標對象：${target?.name || '客戶'} - ${target?.company || '公司'} (產業: ${target?.industry || target?.focus?.[0] || '未指定'})
我的資訊：${userProfile?.name || '業務'} - ${userProfile?.company || '公司'}
產品/服務：${product?.name || '解決方案'} - ${product?.description || '創新產品'}
語氣：${tone || 'professional'}${extra}

要求：
1. 簡潔有力，200字以內
2. 個人化開頭
3. 明確價值主張
4. 友善的結尾呼籲
5. 若有網站問題，可輕量引用（不要像群發垃圾信）

請直接輸出訊息內容，不要加標題或說明。`;
    }
    
    /**
     * AI 客戶分類 - 根據客戶資料智能分類（含 lead_score、need_type、urgency、outreach_angle）
     */
    async classifyCustomer(customer) {
        const profile = {
            name: customer.name,
            company: customer.company,
            title: customer.title,
            industry: customer.industry,
            interactionCount: customer.interactionCount || 0,
            lastInteraction: customer.lastInteraction,
            tags: customer.tags || [],
            websiteAnalysis: customer.websiteAnalysis
        };
        
        let category = 'standard';
        let score = 50;
        let reasoning = [];
        let needType = null;
        let urgency = '中';
        let outreachAngle = '';
        
        // 決策者評分
        const titleLower = (customer.title || '').toLowerCase();
        if (titleLower.includes('ceo') || titleLower.includes('founder') || titleLower.includes('chief')) {
            score += 25;
            reasoning.push('高階決策者');
        } else if (titleLower.includes('vp') || titleLower.includes('director')) {
            score += 15;
            reasoning.push('中高階管理');
        }
        
        // 網站分析訊號（若有）
        const analysis = customer.websiteAnalysis || profile.websiteAnalysis;
        if (analysis) {
            const issues = analysis.issues || [];
            const signals = analysis.leadSignals || [];
            if (issues.length >= 3) {
                score += 15;
                needType = needType || '網站重做';
                reasoning.push('網站多項問題');
                outreachAngle = '以網站健檢與改善建議切入';
            }
            if (signals.some(s => s.type === 'security')) {
                score += 10;
                needType = needType || '資安健檢';
                reasoning.push('資安強化機會');
            }
            if (signals.some(s => s.type === 'seo')) {
                score += 5;
                needType = needType || 'SEO文案';
                reasoning.push('SEO 優化空間');
            }
        }
        
        // 互動活躍度
        if (customer.interactionCount > 5) {
            score += 15;
            reasoning.push('高互動客戶');
            urgency = '高';
        } else if (customer.interactionCount > 2) {
            score += 5;
        }
        
        // 標籤分析
        if (customer.tags?.includes('高價值') || customer.tags?.includes('熱門潛在客戶')) {
            score += 20;
            category = 'high_value';
            reasoning.push('高價值標籤');
            urgency = '高';
        } else if (customer.tags?.includes('有興趣')) {
            score += 10;
            category = 'interested';
            reasoning.push('已表達興趣');
        } else if (customer.tags?.includes('拒絕') || customer.tags?.includes('冷名單')) {
            score -= 30;
            category = 'cold';
            reasoning.push('低優先級');
            urgency = '低';
        }
        
        score = Math.max(0, Math.min(100, score));
        
        if (score >= 80) category = 'high_value';
        else if (score >= 60) category = 'interested';
        else if (score >= 40) category = 'standard';
        else category = 'cold';
        
        if (!outreachAngle) outreachAngle = this.getOutreachAngle(category, needType);
        
        return {
            category,
            score,
            reasoning,
            suggestedAction: this.getSuggestedAction(category),
            lead_score: score,
            need_type: needType || '待分析',
            urgency,
            reason_summary: reasoning.join('；'),
            outreach_angle: outreachAngle,
            next_action: this.getNextAction(category)
        };
    }
    
    getOutreachAngle(category, needType) {
        if (needType) return `以${needType}服務價值切入`;
        const angles = { high_value: '優先安排深度會議', interested: '提供案例與報價', standard: '定期價值內容', cold: '輕量級觸達' };
        return angles[category] || '維持現狀';
    }
    
    getNextAction(category) {
        const actions = { high_value: '寄信+打電話', interested: '寄信', standard: 'LinkedIn', cold: '暫緩' };
        return actions[category] || '寄信';
    }
    
    getSuggestedAction(category) {
        const actions = {
            high_value: '優先聯繫，安排深度會議',
            interested: '發送跟進訊息，提供更多資訊',
            standard: '定期維護，發送價值內容',
            cold: '暫緩聯繫，或發送輕量級內容'
        };
        return actions[category] || '維持現狀';
    }
    
    /**
     * AI 智能搜尋 - 語意化客戶搜尋
     */
    async smartSearch(customers, query) {
        const queryLower = query.toLowerCase();
        const keywords = queryLower.split(/\s+/).filter(w => w.length > 1);
        
        const scored = customers.map(customer => {
            let score = 0;
            const searchableText = [
                customer.name,
                customer.company,
                customer.title,
                customer.email,
                customer.industry,
                (customer.tags || []).join(' ')
            ].join(' ').toLowerCase();
            
            keywords.forEach(keyword => {
                if (searchableText.includes(keyword)) {
                    score += 10;
                    if (customer.name?.toLowerCase().includes(keyword)) score += 5;
                    if (customer.company?.toLowerCase().includes(keyword)) score += 5;
                }
            });
            
            return { customer, score };
        });
        
        return scored
            .filter(s => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(s => s.customer);
    }
    
    /**
     * 批量客戶分類
     */
    async classifyCustomers(customers) {
        const results = [];
        for (const customer of customers) {
            const classification = await this.classifyCustomer(customer);
            results.push({ customer, ...classification });
        }
        return results;
    }
    
    /**
     * 根據對方回覆內容建議下一步
     */
    suggestNextStep(replyText, customer) {
        const text = (replyText || '').toLowerCase();
        const suggestions = [];
        if (/有興趣|想了解|可以談|約時間|預約|進一步|詳細|報價|預算/i.test(text)) {
            suggestions.push({ action: '寄送報價或案例', priority: 1, reason: '對方表達興趣' });
            suggestions.push({ action: '安排 15 分鐘通話', priority: 2, reason: '把握熱度' });
        }
        if (/忙|沒空|之後|改天|稍後/i.test(text) && !/有興趣|想了解/i.test(text)) {
            suggestions.push({ action: '3 天後輕量跟進', priority: 2, reason: '對方暫時忙碌' });
        }
        if (/不需要|不用|謝謝|拒絕/i.test(text)) {
            suggestions.push({ action: '標記為冷名單，6 個月後再試', priority: 3, reason: '明確拒絕' });
        }
        if (/誰|哪家|什麼公司|你們是/i.test(text)) {
            suggestions.push({ action: '簡短自我介紹 + 價值主張', priority: 1, reason: '對方想了解你' });
        }
        if (/多少錢|價格|費用|預算/i.test(text)) {
            suggestions.push({ action: '提供價格區間或預約報價說明', priority: 1, reason: '價格詢問' });
        }
        if (suggestions.length === 0) {
            suggestions.push({ action: '寄送 3 分鐘摘要報告', priority: 2, reason: '提供價值再試' });
        }
        suggestions.sort((a, b) => a.priority - b.priority);
        return { suggestions: suggestions.slice(0, 3), primary: suggestions[0] };
    }

    getCached(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        if (Date.now() - item.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }
        return item.value;
    }
    
    setCached(key, value) {
        this.cache.set(key, { value, timestamp: Date.now() });
    }
}

// 全域實例
window.aiAssistant = new AIAssistant();
console.log('🤖 AI 推廣助手模組已載入');
