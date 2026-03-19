/**
 * AI 推廣工作流程 - 整合自動推廣、聯絡客戶、分類與搜尋
 * 統一協調 CRM、AI 助手、推銷機器人
 */

class AIPromotionWorkflow {
    constructor() {
        this.state = {
            isRunning: false,
            currentBatch: 0,
            totalProcessed: 0,
            lastError: null
        };
        
        this.init();
    }
    
    init() {
        this.ensureDependencies();
        console.log('🔄 AI 推廣工作流程已初始化');
    }
    
    ensureDependencies() {
        if (!window.crmDatabase) {
            console.warn('CRM 資料庫未載入');
        }
        if (!window.aiAssistant) {
            console.warn('AI 助手未載入');
        }
        if (!window.aiSalesBot) {
            console.warn('AI 推銷機器人未載入');
        }
    }
    
    /**
     * 執行完整推廣流程：分類 -> 搜尋 -> 生成 -> 聯絡
     */
    async runFullWorkflow(options = {}) {
        const {
            customerFilter = {},
            productInfo = {},
            userProfile = null,
            dryRun = true,
            batchSize = 5
        } = options;
        
        if (this.state.isRunning) {
            return { success: false, error: '工作流程已在執行中' };
        }
        
        this.state.isRunning = true;
        this.state.lastError = null;
        
        const results = {
            classified: [],
            contacted: [],
            failed: [],
            summary: {}
        };
        
        try {
            // 1. 取得客戶名單
            let customers = window.crmDatabase?.getAllCustomers() || [];
            
            if (Object.keys(customerFilter).length > 0) {
                if (customerFilter.stage) {
                    customers = customers.filter(c => c.stage === customerFilter.stage);
                }
                if (customerFilter.tag) {
                    customers = customers.filter(c => (c.tags || []).includes(customerFilter.tag));
                }
                if (customerFilter.minScore) {
                    const classified = await window.aiAssistant?.classifyCustomers(customers) || [];
                    customers = classified
                        .filter(c => c.score >= customerFilter.minScore)
                        .map(c => c.customer);
                }
            }
            
            if (customers.length === 0) {
                return { success: true, message: '沒有符合條件的客戶', results };
            }
            
            // 2. AI 分類客戶
            if (window.aiAssistant) {
                results.classified = await window.aiAssistant.classifyCustomers(customers);
                // 按分數排序，優先處理高價值客戶
                results.classified.sort((a, b) => b.score - a.score);
            } else {
                results.classified = customers.map(c => ({ customer: c, score: 50, category: 'standard' }));
            }
            
            // 3. 生成並發送訊息 (可選 dryRun)
            const toProcess = results.classified.slice(0, batchSize);
            const profile = userProfile || JSON.parse(localStorage.getItem('userProfile') || '{}');
            
            for (const item of toProcess) {
                const customer = item.customer || item;
                
                try {
                    const messageResult = await this.generateAndPrepareMessage(customer, productInfo, profile);
                    
                    if (!dryRun && messageResult.success) {
                        // 實際發送 (需整合 realSocialMediaAPI)
                        const sendResult = await this.sendToCustomer(customer, messageResult.content);
                        if (sendResult.success) {
                            results.contacted.push({ customer, message: messageResult.content });
                            window.crmDatabase?.recordInteraction({
                                customerId: customer.id,
                                type: 'email',
                                platform: 'workflow',
                                content: messageResult.content,
                                sentiment: 'neutral',
                                status: 'sent'
                            });
                        } else {
                            results.failed.push({ customer, error: sendResult.error });
                        }
                    } else {
                        results.contacted.push({ customer, message: messageResult.content, dryRun: true });
                    }
                    
                    this.state.totalProcessed++;
                } catch (error) {
                    results.failed.push({ customer, error: error.message });
                    this.state.lastError = error.message;
                }
                
                await this.delay(500); // 避免過快
            }
            
            results.summary = {
                total: customers.length,
                processed: toProcess.length,
                contacted: results.contacted.length,
                failed: results.failed.length,
                dryRun
            };
            
        } catch (error) {
            this.state.lastError = error.message;
            results.summary = { error: error.message };
        } finally {
            this.state.isRunning = false;
        }
        
        return { success: true, results };
    }
    
    /**
     * 生成並準備訊息
     */
    async generateAndPrepareMessage(customer, productInfo, userProfile) {
        if (window.aiAssistant) {
            const result = await window.aiAssistant.generatePromotionMessage({
                target: customer,
                product: productInfo,
                userProfile,
                template: 'product_intro'
            });
            return { success: result.success, content: result.content };
        }
        
        // 後備：使用 aiSalesBot
        if (window.aiSalesBot) {
            const pitchData = {
                yourName: userProfile?.name,
                companyName: userProfile?.company || productInfo?.name,
                yourTitle: userProfile?.title
            };
            const message = await window.aiSalesBot.generatePersonalizedMessage(
                { name: customer.name, company: customer.company, focus: [customer.industry || '科技'] },
                pitchData,
                { name: '合作提案' }
            );
            return { success: true, content: message.content };
        }
        
        return { success: false, content: '', error: '無可用 AI 模組' };
    }
    
    /**
     * 發送訊息給客戶 (整合現有發送邏輯)
     */
    async sendToCustomer(customer, content) {
        const email = customer.email || customer.platforms?.email?.handle;
        if (email && window.realEmailSender) {
            const ok = await window.realEmailSender.checkBackend();
            if (ok) {
                try {
                    await window.realEmailSender.send({ to: email, subject: '合作提案', text: content });
                    return { success: true };
                } catch (e) {
                    console.warn('Email 發送失敗:', e);
                }
            }
        }
        if (window.realSocialMediaAPI?.authenticatedAccounts) {
            const platforms = ['linkedin', 'twitter', 'facebook', 'instagram'];
            for (const platform of platforms) {
                if (window.realSocialMediaAPI.authenticatedAccounts[platform]) {
                    const handle = customer[platform] || customer.linkedin || customer.twitter || customer.email;
                    if (handle) {
                        try {
                            await window.realSocialMediaAPI.sendRealMessage(platform, handle, content);
                            return { success: true };
                        } catch (e) {
                            console.warn(`發送到 ${platform} 失敗:`, e);
                        }
                    }
                }
            }
        }
        return { success: false, error: '無可用發送管道，請設定 SMTP 或社群帳號' };
    }
    
    /**
     * 智能搜尋客戶並匯出
     */
    async searchAndExport(query) {
        const customers = window.crmDatabase?.getAllCustomers() || [];
        
        if (window.aiAssistant) {
            const results = await window.aiAssistant.smartSearch(customers, query);
            return { customers: results, count: results.length };
        }
        
        const results = window.crmDatabase?.searchCustomers(query) || [];
        return { customers: results, count: results.length };
    }
    
    /**
     * 取得工作流程狀態
     */
    getStatus() {
        return { ...this.state };
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

window.aiPromotionWorkflow = new AIPromotionWorkflow();
console.log('🔄 AI 推廣工作流程模組已載入');
