/**
 * AI推銷機器人 - 專門用於自動推銷給老闆和投資人
 */

class AISalesBot {
    constructor() {
        this.salesStrategies = new Map();
        this.investorProfiles = new Map();
        this.salesTemplates = new Map();
        this.conversationFlows = new Map();
        this.performanceMetrics = {
            messagesSent: 0,
            responsesReceived: 0,
            meetingsScheduled: 0,
            dealsClosed: 0,
            conversionRate: 0
        };
        
        this.init();
    }
    
    init() {
        this.loadSalesStrategies();
        this.loadInvestorProfiles();
        this.loadSalesTemplates();
        this.loadConversationFlows();
        this.loadPerformanceMetrics();
        
        console.log('🤖 AI推銷機器人已初始化');
    }
    
    // 載入推銷策略
    loadSalesStrategies() {
        this.salesStrategies.set('cold_outreach', {
            name: '冷推銷',
            description: '首次接觸潛在客戶',
            steps: ['建立信任', '展示價值', '創造需求', '推進下一步'],
            successRate: 0.15
        });
        
        this.salesStrategies.set('warm_introduction', {
            name: '溫和介紹',
            description: '通過推薦或介紹接觸',
            steps: ['感謝推薦', '建立關係', '了解需求', '提供解決方案'],
            successRate: 0.35
        });
        
        this.salesStrategies.set('investment_pitch', {
            name: '投資推銷',
            description: '向投資人推銷商業機會',
            steps: ['問題陳述', '解決方案', '市場機會', '商業模式', '財務預測', '融資需求'],
            successRate: 0.08
        });
        
        this.salesStrategies.set('partnership_proposal', {
            name: '合作提案',
            description: '提出商業合作機會',
            steps: ['共同利益', '合作模式', '資源互補', '風險分擔', '預期收益'],
            successRate: 0.25
        });
    }
    
    // 載入投資人資料
    loadInvestorProfiles() {
        this.investorProfiles.set('venture_capitalist', {
            type: 'VC',
            focus: ['早期投資', '高成長潛力', '創新技術'],
            investmentRange: '100萬-5000萬',
            decisionFactors: ['團隊', '市場規模', '技術優勢', '商業模式'],
            preferredContact: 'LinkedIn',
            responseRate: 0.12
        });
        
        this.investorProfiles.set('angel_investor', {
            type: '天使投資人',
            focus: ['早期創業', '個人興趣', '行業經驗'],
            investmentRange: '10萬-500萬',
            decisionFactors: ['創始人', '市場需求', '產品創新', '執行能力'],
            preferredContact: 'Email',
            responseRate: 0.18
        });
        
        this.investorProfiles.set('corporate_investor', {
            type: '企業投資',
            focus: ['戰略投資', '技術整合', '市場擴展'],
            investmentRange: '500萬-2億',
            decisionFactors: ['戰略價值', '技術協同', '市場機會', '財務回報'],
            preferredContact: 'LinkedIn',
            responseRate: 0.08
        });
        
        this.investorProfiles.set('private_equity', {
            type: '私募股權',
            focus: ['成熟企業', '現金流', '成長潛力'],
            investmentRange: '5000萬-10億',
            decisionFactors: ['財務表現', '市場地位', '管理團隊', '增長機會'],
            preferredContact: 'LinkedIn',
            responseRate: 0.05
        });
    }
    
    // 載入推銷模板
    loadSalesTemplates() {
        // 投資人推銷模板
        this.salesTemplates.set('investment_pitch_email', {
            subject: '【投資機會】{company_name} - {industry}領域的創新解決方案',
            content: `
尊敬的{investor_name}先生/女士，

我是{your_name}，{your_company}的創始人。

我注意到您在{investor_focus}方面的專業經驗，相信您會對我們的商業機會感興趣。

【市場問題】
{market_problem}

【我們的解決方案】
{solution_description}

【市場機會】
- 市場規模：{market_size}
- 年增長率：{growth_rate}%
- 目標客戶：{target_customers}

【商業模式】
{business_model}

【財務亮點】
- 年收入：{annual_revenue}
- 增長率：{revenue_growth}%
- 融資需求：{funding_need}

【為什麼現在投資】
{investment_rationale}

我很樂意與您安排15分鐘的電話會議，詳細介紹我們的商業計劃。

期待您的回覆。

此致
{your_name}
{your_contact}
            `,
            personalization: ['investor_name', 'investor_focus', 'company_name', 'industry']
        });
        
        // 企業合作模板
        this.salesTemplates.set('partnership_proposal', {
            subject: '【合作提案】{your_company} x {target_company} 戰略合作機會',
            content: `
尊敬的{contact_name}先生/女士，

我是{your_name}，{your_company}的{your_title}。

我對{target_company}在{target_expertise}領域的成就印象深刻，相信我們有巨大的合作潛力。

【合作機會】
{partnership_opportunity}

【共同利益】
- 市場擴展：{market_expansion}
- 技術協同：{technology_synergy}
- 成本優化：{cost_optimization}

【合作模式】
{partnership_model}

【預期收益】
- 收入增長：{revenue_increase}
- 市場份額：{market_share_increase}
- 品牌價值：{brand_value_increase}

【下一步】
我建議我們安排一次30分鐘的會議，深入討論合作細節。

期待與您進一步溝通。

此致
{your_name}
{your_contact}
            `,
            personalization: ['contact_name', 'target_company', 'target_expertise']
        });
        
        // 產品推銷模板
        this.salesTemplates.set('product_sales', {
            subject: '【產品推薦】{product_name} - 提升{target_benefit}的創新解決方案',
            content: `
尊敬的{prospect_name}先生/女士，

我是{your_name}，{your_company}的{your_title}。

我了解到{prospect_company}在{prospect_challenge}方面面臨挑戰，我們的{product_name}正是為此而設計。

【產品優勢】
{product_benefits}

【客戶成功案例】
{success_stories}

【ROI分析】
- 投資回報期：{payback_period}
- 成本節省：{cost_savings}
- 效率提升：{efficiency_improvement}

【免費試用】
我們提供{free_trial_period}天的免費試用，讓您親身體驗產品價值。

【下一步】
我建議我們安排一次產品演示，展示如何為{prospect_company}創造價值。

期待您的回覆。

此致
{your_name}
{your_contact}
            `,
            personalization: ['prospect_name', 'prospect_company', 'prospect_challenge']
        });
    }
    
    // 載入對話流程
    loadConversationFlows() {
        this.conversationFlows.set('investment_follow_up', {
            name: '投資跟進流程',
            triggers: ['initial_interest', 'request_info', 'schedule_meeting'],
            steps: [
                {
                    step: 1,
                    condition: 'initial_interest',
                    action: 'send_deck',
                    template: 'investment_deck_follow_up',
                    delay: 0
                },
                {
                    step: 2,
                    condition: 'no_response_3_days',
                    action: 'send_reminder',
                    template: 'investment_reminder',
                    delay: 3 * 24 * 60 * 60 * 1000
                },
                {
                    step: 3,
                    condition: 'no_response_7_days',
                    action: 'send_alternative',
                    template: 'investment_alternative',
                    delay: 7 * 24 * 60 * 60 * 1000
                }
            ]
        });
        
        this.conversationFlows.set('partnership_follow_up', {
            name: '合作跟進流程',
            triggers: ['partnership_inquiry', 'meeting_request'],
            steps: [
                {
                    step: 1,
                    condition: 'meeting_request',
                    action: 'schedule_meeting',
                    template: 'meeting_scheduler',
                    delay: 0
                },
                {
                    step: 2,
                    condition: 'meeting_confirmed',
                    action: 'send_agenda',
                    template: 'meeting_agenda',
                    delay: 24 * 60 * 60 * 1000
                }
            ]
        });
    }
    
    // 載入績效指標
    loadPerformanceMetrics() {
        const saved = localStorage.getItem('aiSalesBotMetrics');
        if (saved) {
            this.performanceMetrics = JSON.parse(saved);
        }
    }
    
    // 保存績效指標
    savePerformanceMetrics() {
        localStorage.setItem('aiSalesBotMetrics', JSON.stringify(this.performanceMetrics));
    }
    
    // 自動推銷給投資人
    async autoPitchToInvestors(investorList, pitchData) {
        console.log('🚀 開始自動推銷給投資人...');
        
        const results = [];
        
        for (const investor of investorList) {
            try {
                const result = await this.pitchToInvestor(investor, pitchData);
                results.push(result);
                
                // 更新績效指標
                this.performanceMetrics.messagesSent++;
                if (result.responseReceived) {
                    this.performanceMetrics.responsesReceived++;
                }
                if (result.meetingScheduled) {
                    this.performanceMetrics.meetingsScheduled++;
                }
                
                // 延遲避免被限制
                await this.delay(this.getRandomDelay(30000, 120000));
                
            } catch (error) {
                console.error('推銷失敗:', investor.name, error);
                results.push({
                    investor: investor.name,
                    success: false,
                    error: error.message
                });
            }
        }
        
        this.updateConversionRate();
        this.savePerformanceMetrics();
        
        return results;
    }
    
    // 推銷給單個投資人
    async pitchToInvestor(investor, pitchData) {
        console.log(`📧 推銷給 ${investor.name} (${investor.type})`);
        
        // 分析投資人資料
        const investorProfile = this.investorProfiles.get(investor.type);
        
        // 選擇推銷策略
        const strategy = this.selectStrategy(investor, pitchData);
        
        // 生成個性化訊息
        const message = await this.generatePersonalizedMessage(investor, pitchData, strategy);
        
        // 發送訊息
        const result = await this.sendMessage(investor, message);
        
        // 設置跟進流程
        this.setupFollowUpFlow(investor, strategy);
        
        return {
            investor: investor.name,
            strategy: strategy.name,
            message: message,
            success: result.success,
            responseReceived: result.responseReceived,
            meetingScheduled: result.meetingScheduled,
            timestamp: new Date().toISOString()
        };
    }
    
    // 選擇推銷策略
    selectStrategy(investor, pitchData) {
        const investorProfile = this.investorProfiles.get(investor.type);
        
        // 根據投資人類型和專注領域選擇策略
        if (investor.type === 'venture_capitalist') {
            return this.salesStrategies.get('investment_pitch');
        } else if (investor.type === 'angel_investor') {
            return this.salesStrategies.get('warm_introduction');
        } else if (investor.type === 'corporate_investor') {
            return this.salesStrategies.get('partnership_proposal');
        } else {
            return this.salesStrategies.get('cold_outreach');
        }
    }
    
    // 生成個性化訊息 - 優先使用 AI 助手
    async generatePersonalizedMessage(investor, pitchData, strategy) {
        // 若 AI 助手可用，使用 AI 生成
        if (window.aiAssistant) {
            try {
                const result = await window.aiAssistant.generatePromotionMessage({
                    target: investor,
                    product: pitchData,
                    userProfile: {
                        name: pitchData.yourName,
                        company: pitchData.companyName,
                        title: pitchData.yourTitle
                    },
                    template: 'product_intro'
                });
                if (result.success && result.content) {
                    return {
                        subject: `【合作機會】${pitchData.companyName || '我們'} - 與 ${investor.name} 的交流`,
                        content: result.content,
                        strategy: strategy?.name || 'AI 生成'
                    };
                }
            } catch (e) {
                console.warn('AI 生成失敗，使用模板:', e);
            }
        }

        const template = this.salesTemplates.get('investment_pitch_email');
        
        // 替換模板變數
        let message = template.content;
        const personalization = template.personalization;
        
        for (const key of personalization) {
            const value = this.getPersonalizationValue(key, investor, pitchData);
            message = message.replace(new RegExp(`{${key}}`, 'g'), value);
        }
        
        // 替換其他變數
        message = message.replace(/{your_name}/g, pitchData.yourName || 'AI推銷機器人');
        message = message.replace(/{your_company}/g, pitchData.companyName || '創新科技公司');
        message = message.replace(/{your_title}/g, pitchData.yourTitle || '創始人');
        message = message.replace(/{your_contact}/g, pitchData.contactInfo || '聯繫方式');
        
        // 替換投資人相關變數
        message = message.replace(/{investor_name}/g, investor.name);
        message = message.replace(/{investor_focus}/g, investor.focus || '投資');
        
        // 替換商業數據
        message = message.replace(/{market_problem}/g, pitchData.marketProblem || '市場面臨的挑戰');
        message = message.replace(/{solution_description}/g, pitchData.solution || '我們的創新解決方案');
        message = message.replace(/{market_size}/g, pitchData.marketSize || '100億市場');
        message = message.replace(/{growth_rate}/g, pitchData.growthRate || '25%');
        message = message.replace(/{funding_need}/g, pitchData.fundingNeed || '500萬');
        
        return {
            subject: template.subject.replace(/{company_name}/g, pitchData.companyName || '創新科技公司')
                                   .replace(/{industry}/g, pitchData.industry || '科技'),
            content: message,
            strategy: strategy.name
        };
    }
    
    // 獲取個性化值
    getPersonalizationValue(key, investor, pitchData) {
        switch (key) {
            case 'investor_name':
                return investor.name;
            case 'investor_focus':
                return investor.focus || '投資';
            case 'company_name':
                return pitchData.companyName || '創新科技公司';
            case 'industry':
                return pitchData.industry || '科技';
            default:
                return '';
        }
    }
    
    // 發送訊息
    async sendMessage(investor, message) {
        console.log(`📤 發送訊息給 ${investor.name}:`, message.subject);
        
        // 模擬發送過程
        const success = Math.random() > 0.1; // 90% 成功率
        const responseReceived = success && Math.random() > 0.7; // 30% 回應率
        const meetingScheduled = responseReceived && Math.random() > 0.8; // 20% 會議安排率
        
        return {
            success,
            responseReceived,
            meetingScheduled,
            messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
    }
    
    // 設置跟進流程
    setupFollowUpFlow(investor, strategy) {
        const flow = this.conversationFlows.get('investment_follow_up');
        
        if (flow) {
            // 設置跟進任務
            flow.steps.forEach(step => {
                setTimeout(() => {
                    this.executeFollowUpStep(investor, step);
                }, step.delay);
            });
        }
    }
    
    // 執行跟進步驟
    async executeFollowUpStep(investor, step) {
        console.log(`🔄 執行跟進步驟: ${step.action} for ${investor.name}`);
        
        // 這裡可以實現具體的跟進行動
        switch (step.action) {
            case 'send_deck':
                await this.sendInvestmentDeck(investor);
                break;
            case 'send_reminder':
                await this.sendReminder(investor);
                break;
            case 'send_alternative':
                await this.sendAlternative(investor);
                break;
        }
    }
    
    // 發送投資簡報
    async sendInvestmentDeck(investor) {
        console.log(`📊 發送投資簡報給 ${investor.name}`);
        // 實現發送簡報邏輯
    }
    
    // 發送提醒
    async sendReminder(investor) {
        console.log(`⏰ 發送提醒給 ${investor.name}`);
        // 實現發送提醒邏輯
    }
    
    // 發送替代方案
    async sendAlternative(investor) {
        console.log(`🔄 發送替代方案給 ${investor.name}`);
        // 實現發送替代方案邏輯
    }
    
    // 自動推銷給企業老闆
    async autoPitchToCEOs(ceoList, pitchData) {
        console.log('🚀 開始自動推銷給企業老闆...');
        
        const results = [];
        
        for (const ceo of ceoList) {
            try {
                const result = await this.pitchToCEO(ceo, pitchData);
                results.push(result);
                
                // 更新績效指標
                this.performanceMetrics.messagesSent++;
                if (result.responseReceived) {
                    this.performanceMetrics.responsesReceived++;
                }
                if (result.meetingScheduled) {
                    this.performanceMetrics.meetingsScheduled++;
                }
                
                // 延遲避免被限制
                await this.delay(this.getRandomDelay(45000, 180000));
                
            } catch (error) {
                console.error('推銷失敗:', ceo.name, error);
                results.push({
                    ceo: ceo.name,
                    success: false,
                    error: error.message
                });
            }
        }
        
        this.updateConversionRate();
        this.savePerformanceMetrics();
        
        return results;
    }
    
    // 推銷給單個CEO
    async pitchToCEO(ceo, pitchData) {
        console.log(`📧 推銷給 ${ceo.name} (${ceo.company})`);
        
        // 選擇推銷策略
        const strategy = this.salesStrategies.get('partnership_proposal');
        
        // 生成個性化訊息
        const message = await this.generateCEOMessage(ceo, pitchData, strategy);
        
        // 發送訊息
        const result = await this.sendMessage(ceo, message);
        
        return {
            ceo: ceo.name,
            company: ceo.company,
            strategy: strategy.name,
            message: message,
            success: result.success,
            responseReceived: result.responseReceived,
            meetingScheduled: result.meetingScheduled,
            timestamp: new Date().toISOString()
        };
    }
    
    // 生成CEO訊息
    async generateCEOMessage(ceo, pitchData, strategy) {
        const template = this.salesTemplates.get('partnership_proposal');
        
        // 替換模板變數
        let message = template.content;
        
        message = message.replace(/{contact_name}/g, ceo.name);
        message = message.replace(/{target_company}/g, ceo.company);
        message = message.replace(/{target_expertise}/g, ceo.expertise || '行業領先');
        message = message.replace(/{your_name}/g, pitchData.yourName || 'AI推銷機器人');
        message = message.replace(/{your_company}/g, pitchData.companyName || '創新科技公司');
        message = message.replace(/{your_title}/g, pitchData.yourTitle || '創始人');
        
        return {
            subject: template.subject.replace(/{your_company}/g, pitchData.companyName || '創新科技公司')
                                   .replace(/{target_company}/g, ceo.company),
            content: message,
            strategy: strategy.name
        };
    }
    
    // 獲取績效報告
    getPerformanceReport() {
        return {
            ...this.performanceMetrics,
            conversionRate: this.performanceMetrics.responsesReceived / this.performanceMetrics.messagesSent * 100,
            meetingRate: this.performanceMetrics.meetingsScheduled / this.performanceMetrics.responsesReceived * 100,
            lastUpdated: new Date().toISOString()
        };
    }
    
    // 更新轉換率
    updateConversionRate() {
        if (this.performanceMetrics.messagesSent > 0) {
            this.performanceMetrics.conversionRate = 
                this.performanceMetrics.responsesReceived / this.performanceMetrics.messagesSent;
        }
    }
    
    // 延遲函數
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // 獲取隨機延遲
    getRandomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // 批量推銷
    async batchPitch(targets, pitchData, type = 'mixed') {
        console.log(`🚀 開始批量推銷 (${type})...`);
        
        const investors = targets.filter(t => t.type && t.type.includes('investor'));
        const ceos = targets.filter(t => t.type && t.type.includes('ceo'));
        
        const results = {
            investors: [],
            ceos: [],
            summary: {}
        };
        
        // 推銷給投資人
        if (investors.length > 0) {
            results.investors = await this.autoPitchToInvestors(investors, pitchData);
        }
        
        // 推銷給CEO
        if (ceos.length > 0) {
            results.ceos = await this.autoPitchToCEOs(ceos, pitchData);
        }
        
        // 生成總結
        results.summary = {
            totalTargets: targets.length,
            investorsContacted: investors.length,
            ceosContacted: ceos.length,
            totalMessagesSent: results.investors.length + results.ceos.length,
            totalResponses: results.investors.filter(r => r.responseReceived).length + 
                           results.ceos.filter(r => r.responseReceived).length,
            totalMeetings: results.investors.filter(r => r.meetingScheduled).length + 
                          results.ceos.filter(r => r.meetingScheduled).length
        };
        
        return results;
    }
}

// 創建全域實例
window.aiSalesBot = new AISalesBot();

console.log('🤖 AI推銷機器人已載入');




