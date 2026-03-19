/**
 * 自動跟進排程系統
 * 支援自動跟進訊息、排程管理、情感分析分類
 */

class AutoFollowupSystem {
    constructor() {
        this.followupRules = [];
        this.scheduledFollowups = [];
        this.templates = [];
        this.isRunning = false;
        this.init();
    }

    init() {
        this.loadData();
        this.ensureDefaultFlow();
        this.setupEventListeners();
        this.startScheduler();
    }

    /** 預設多步驟跟進流程：發信 → 3 天 → 7 天 */
    ensureDefaultFlow() {
        if (this.followupRules.some(r => r.name === '預設外聯流程')) return;

        const day3 = this.createTemplate({
            name: '第 3 天追蹤',
            type: 'day3_followup',
            subject: '關於上次的訊息 - {company}',
            content: `{name} 您好，

前幾天曾與您聯繫，想確認是否有機會進一步交流。

若您對我們的服務有興趣，歡迎回覆或預約 15 分鐘免費諮詢。

此致
敬上`
        });
        const day7 = this.createTemplate({
            name: '第 7 天追蹤',
            type: 'day7_followup',
            subject: '最後一次跟進 - {company}',
            content: `{name} 您好，

這是我們最後一次跟進。若您之後有網站或資安相關需求，歡迎隨時聯繫。

祝商祺`
        });

        this.createFollowupRule({
            name: '預設外聯流程',
            description: '發信後第 3、7 天自動追蹤',
            conditions: [{ field: 'platform', operator: 'equals', value: 'email' }],
            actions: [
                { type: 'email', delay: 3, templateId: day3?.id },
                { type: 'email', delay: 7, templateId: day7?.id }
            ].filter(a => a.templateId),
            isActive: true,
            priority: 1
        });
    }

    // 載入資料
    loadData() {
        const savedRules = localStorage.getItem('followup_rules');
        if (savedRules) {
            this.followupRules = JSON.parse(savedRules);
        }

        const savedScheduled = localStorage.getItem('scheduled_followups');
        if (savedScheduled) {
            this.scheduledFollowups = JSON.parse(savedScheduled);
        }

        const savedTemplates = localStorage.getItem('followup_templates');
        if (savedTemplates) {
            this.templates = JSON.parse(savedTemplates);
        }
    }

    // 保存資料
    saveData() {
        localStorage.setItem('followup_rules', JSON.stringify(this.followupRules));
        localStorage.setItem('scheduled_followups', JSON.stringify(this.scheduledFollowups));
        localStorage.setItem('followup_templates', JSON.stringify(this.templates));
    }

    // 設置事件監聽器
    setupEventListeners() {
        // 監聽訊息發送事件
        document.addEventListener('messageSent', (event) => {
            this.scheduleFollowup(event.detail);
        });

        // 監聽回覆事件
        document.addEventListener('messageReplied', (event) => {
            this.handleReply(event.detail);
        });

        // 監聽客戶狀態更新
        document.addEventListener('customerUpdated', (event) => {
            this.updateFollowupSchedule(event.detail);
        });
    }

    // 創建跟進規則
    createFollowupRule(ruleData) {
        const rule = {
            id: this.generateId(),
            name: ruleData.name,
            description: ruleData.description,
            conditions: ruleData.conditions, // [{ field, operator, value }]
            actions: ruleData.actions, // [{ type, delay, templateId }]
            isActive: ruleData.isActive !== false,
            priority: ruleData.priority || 1,
            createdAt: new Date().toISOString()
        };

        this.followupRules.push(rule);
        this.saveData();
        this.triggerEvent('followupRuleCreated', rule);
        return rule;
    }

    // 更新跟進規則
    updateFollowupRule(ruleId, updates) {
        const rule = this.followupRules.find(r => r.id === ruleId);
        if (rule) {
            Object.assign(rule, updates);
            rule.updatedAt = new Date().toISOString();
            this.saveData();
            this.triggerEvent('followupRuleUpdated', rule);
        }
    }

    // 刪除跟進規則
    deleteFollowupRule(ruleId) {
        const index = this.followupRules.findIndex(r => r.id === ruleId);
        if (index !== -1) {
            const rule = this.followupRules[index];
            this.followupRules.splice(index, 1);
            this.saveData();
            this.triggerEvent('followupRuleDeleted', rule);
        }
    }

    // 排程跟進
    scheduleFollowup(messageData) {
        const applicableRules = this.getApplicableRules(messageData);
        
        applicableRules.forEach(rule => {
            rule.actions.forEach(action => {
                const followup = {
                    id: this.generateId(),
                    ruleId: rule.id,
                    customerId: messageData.customerId,
                    platform: messageData.platform,
                    templateId: action.templateId,
                    scheduledFor: this.calculateScheduledTime(action.delay),
                    status: 'scheduled', // 'scheduled', 'sent', 'cancelled'
                    priority: rule.priority,
                    createdAt: new Date().toISOString()
                };

                this.scheduledFollowups.push(followup);
            });
        });

        this.saveData();
    }

    // 處理回覆
    handleReply(replyData) {
        const { customerId, sentiment, platform } = replyData;
        
        // 分析情感並更新客戶狀態
        this.updateCustomerSentiment(customerId, sentiment);
        
        // 取消或修改相關的跟進排程
        this.updateFollowupsForReply(customerId, sentiment);
        
        // 根據情感創建新的跟進規則
        this.createSentimentBasedFollowup(customerId, sentiment, platform);
    }

    // 更新客戶情感狀態
    updateCustomerSentiment(customerId, sentiment) {
        if (window.crmDatabase) {
            const customer = window.crmDatabase.findCustomerById(customerId);
            if (customer) {
                // 更新標籤
                if (sentiment === 'positive') {
                    window.crmDatabase.addTagToCustomer(customerId, '有興趣');
                    window.crmDatabase.removeTagFromCustomer(customerId, '拒絕');
                } else if (sentiment === 'negative') {
                    window.crmDatabase.addTagToCustomer(customerId, '拒絕');
                    window.crmDatabase.removeTagFromCustomer(customerId, '有興趣');
                }

                // 更新Pipeline階段
                if (sentiment === 'positive') {
                    window.crmDatabase.updateCustomerStage(customerId, 'interested');
                } else if (sentiment === 'negative') {
                    window.crmDatabase.updateCustomerStage(customerId, 'closed');
                }
            }
        }
    }

    // 更新回覆相關的跟進排程
    updateFollowupsForReply(customerId, sentiment) {
        const activeFollowups = this.scheduledFollowups.filter(
            f => f.customerId === customerId && f.status === 'scheduled'
        );

        activeFollowups.forEach(followup => {
            if (sentiment === 'positive') {
                // 正面回覆：提前跟進或調整內容
                followup.scheduledFor = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 1天後
                followup.priority = 1; // 高優先級
            } else if (sentiment === 'negative') {
                // 負面回覆：取消跟進
                followup.status = 'cancelled';
            } else {
                // 中性回覆：延遲跟進
                followup.scheduledFor = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7天後
            }
        });

        this.saveData();
    }

    // 創建基於情感的跟進
    createSentimentBasedFollowup(customerId, sentiment, platform) {
        let templateId = null;
        let delay = 0;

        switch (sentiment) {
            case 'positive':
                templateId = this.getTemplateByType('positive_followup');
                delay = 1; // 1天
                break;
            case 'negative':
                templateId = this.getTemplateByType('negative_followup');
                delay = 7; // 7天
                break;
            case 'neutral':
                templateId = this.getTemplateByType('neutral_followup');
                delay = 3; // 3天
                break;
        }

        if (templateId) {
            const followup = {
                id: this.generateId(),
                ruleId: 'sentiment_based',
                customerId,
                platform,
                templateId,
                scheduledFor: this.calculateScheduledTime(delay),
                status: 'scheduled',
                priority: sentiment === 'positive' ? 1 : 3,
                createdAt: new Date().toISOString()
            };

            this.scheduledFollowups.push(followup);
            this.saveData();
        }
    }

    // 獲取適用的規則
    getApplicableRules(messageData) {
        return this.followupRules.filter(rule => {
            if (!rule.isActive) return false;
            
            return rule.conditions.every(condition => {
                return this.evaluateCondition(condition, messageData);
            });
        });
    }

    // 評估條件
    evaluateCondition(condition, data) {
        const { field, operator, value } = condition;
        const fieldValue = this.getFieldValue(field, data);

        switch (operator) {
            case 'equals':
                return fieldValue === value;
            case 'not_equals':
                return fieldValue !== value;
            case 'contains':
                return fieldValue && fieldValue.toString().includes(value);
            case 'greater_than':
                return parseFloat(fieldValue) > parseFloat(value);
            case 'less_than':
                return parseFloat(fieldValue) < parseFloat(value);
            default:
                return false;
        }
    }

    // 獲取欄位值
    getFieldValue(field, data) {
        const fieldMap = {
            'platform': data.platform,
            'customer_stage': this.getCustomerStage(data.customerId),
            'customer_tags': this.getCustomerTags(data.customerId),
            'days_since_last_contact': this.getDaysSinceLastContact(data.customerId),
            'interaction_count': this.getInteractionCount(data.customerId)
        };

        return fieldMap[field] || data[field];
    }

    // 獲取客戶階段
    getCustomerStage(customerId) {
        if (window.crmDatabase) {
            const customer = window.crmDatabase.findCustomerById(customerId);
            return customer ? customer.stage : null;
        }
        return null;
    }

    // 獲取客戶標籤
    getCustomerTags(customerId) {
        if (window.crmDatabase) {
            const customer = window.crmDatabase.findCustomerById(customerId);
            return customer ? customer.tags : [];
        }
        return [];
    }

    // 獲取距離上次聯繫的天數
    getDaysSinceLastContact(customerId) {
        if (window.crmDatabase) {
            const customer = window.crmDatabase.findCustomerById(customerId);
            if (customer && customer.lastInteraction) {
                const lastContact = new Date(customer.lastInteraction);
                const now = new Date();
                return Math.floor((now - lastContact) / (1000 * 60 * 60 * 24));
            }
        }
        return 0;
    }

    // 獲取互動次數
    getInteractionCount(customerId) {
        if (window.crmDatabase) {
            const customer = window.crmDatabase.findCustomerById(customerId);
            return customer ? customer.interactionCount : 0;
        }
        return 0;
    }

    // 計算排程時間
    calculateScheduledTime(delay) {
        const now = new Date();
        const scheduledTime = new Date(now.getTime() + delay * 24 * 60 * 60 * 1000);
        return scheduledTime.toISOString();
    }

    // 啟動排程器
    startScheduler() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.schedulerInterval = setInterval(() => {
            this.processScheduledFollowups();
        }, 60000); // 每分鐘檢查一次
    }

    // 停止排程器
    stopScheduler() {
        if (this.schedulerInterval) {
            clearInterval(this.schedulerInterval);
            this.schedulerInterval = null;
        }
        this.isRunning = false;
    }

    // 處理排程的跟進
    processScheduledFollowups() {
        const now = new Date();
        const dueFollowups = this.scheduledFollowups.filter(followup => {
            return followup.status === 'scheduled' && 
                   new Date(followup.scheduledFor) <= now;
        });

        dueFollowups.forEach(followup => {
            this.sendFollowup(followup);
        });
    }

    // 發送跟進訊息
    async sendFollowup(followup) {
        try {
            const template = this.getTemplateById(followup.templateId);
            if (!template) {
                console.error('Template not found:', followup.templateId);
                return;
            }

            // 獲取客戶資料
            const customer = window.crmDatabase ? 
                window.crmDatabase.findCustomerById(followup.customerId) : null;

            if (!customer) {
                console.error('Customer not found:', followup.customerId);
                return;
            }

            // 個人化訊息內容
            const personalizedContent = this.personalizeContent(template.content, customer);
            const personalizedSubject = this.personalizeContent(template.subject, customer);

            // 發送訊息
            if (window.realSocialMediaAPI && window.realSocialMediaAPI.hasAuthenticatedAccounts()) {
                await window.realSocialMediaAPI.sendRealMessage(
                    followup.platform,
                    customer.email, // 這裡需要根據平台調整
                    personalizedContent
                );
            } else {
                // 模擬發送
                console.log('Sending followup:', {
                    to: customer.email,
                    subject: personalizedSubject,
                    content: personalizedContent
                });
            }

            // 更新跟進狀態
            followup.status = 'sent';
            followup.sentAt = new Date().toISOString();

            // 記錄互動
            if (window.crmDatabase) {
                window.crmDatabase.recordInteraction({
                    customerId: followup.customerId,
                    type: 'followup',
                    platform: followup.platform,
                    content: personalizedContent,
                    sentiment: 'neutral',
                    status: 'completed'
                });
            }

            this.saveData();
            this.triggerEvent('followupSent', followup);

        } catch (error) {
            console.error('Error sending followup:', error);
            followup.status = 'failed';
            followup.error = error.message;
            this.saveData();
        }
    }

    // 個人化內容
    personalizeContent(content, customer) {
        let personalized = content;
        
        // 替換變數
        personalized = personalized.replace(/\{name\}/g, customer.name || '');
        personalized = personalized.replace(/\{company\}/g, customer.company || '');
        personalized = personalized.replace(/\{title\}/g, customer.title || '');
        personalized = personalized.replace(/\{platform\}/g, customer.platform || '');
        
        return personalized;
    }

    // 創建訊息模板
    createTemplate(templateData) {
        const template = {
            id: this.generateId(),
            name: templateData.name,
            type: templateData.type, // 'positive_followup', 'negative_followup', 'neutral_followup'
            subject: templateData.subject,
            content: templateData.content,
            variables: templateData.variables || ['name', 'company', 'title'],
            isActive: templateData.isActive !== false,
            createdAt: new Date().toISOString()
        };

        this.templates.push(template);
        this.saveData();
        this.triggerEvent('templateCreated', template);
        return template;
    }

    // 根據ID獲取模板
    getTemplateById(templateId) {
        return this.templates.find(t => t.id === templateId);
    }

    // 根據類型獲取模板
    getTemplateByType(type) {
        const template = this.templates.find(t => t.type === type && t.isActive);
        return template ? template.id : null;
    }

    // 獲取所有模板
    getAllTemplates() {
        return this.templates;
    }

    // 獲取排程的跟進
    getScheduledFollowups() {
        return this.scheduledFollowups.sort((a, b) => 
            new Date(a.scheduledFor) - new Date(b.scheduledFor)
        );
    }

    // 取消跟進
    cancelFollowup(followupId) {
        const followup = this.scheduledFollowups.find(f => f.id === followupId);
        if (followup) {
            followup.status = 'cancelled';
            this.saveData();
            this.triggerEvent('followupCancelled', followup);
        }
    }

    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 觸發自定義事件
    triggerEvent(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }

    // 獲取統計資料
    getStats() {
        const totalScheduled = this.scheduledFollowups.length;
        const sent = this.scheduledFollowups.filter(f => f.status === 'sent').length;
        const pending = this.scheduledFollowups.filter(f => f.status === 'scheduled').length;
        const cancelled = this.scheduledFollowups.filter(f => f.status === 'cancelled').length;

        return {
            totalScheduled,
            sent,
            pending,
            cancelled,
            successRate: totalScheduled > 0 ? (sent / totalScheduled * 100).toFixed(2) : 0
        };
    }
}

// 創建全域實例
window.autoFollowupSystem = new AutoFollowupSystem();

