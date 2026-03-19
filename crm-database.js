/**
 * CRM客戶資料庫管理系統
 * 支援客戶資料管理、標籤系統、Pipeline視覺化
 */

class CRMDatabase {
    constructor() {
        this.customers = [];
        this.tags = ['新名單', '已回覆', '有興趣', '拒絕', '高價值', '冷名單', '熱門潛在客戶'];
        this.pipelineStages = [
            { id: 'new', name: '新名單', color: '#3498db' },
            { id: 'analyzed', name: '已分析', color: '#9b59b6' },
            { id: 'contacted', name: '已聯繫', color: '#f39c12' },
            { id: 'responded', name: '已回覆', color: '#2ecc71' },
            { id: 'needs_confirmed', name: '需求確認中', color: '#1abc9c' },
            { id: 'quoted', name: '已報價', color: '#e67e22' },
            { id: 'negotiating', name: '談判中', color: '#e74c3c' },
            { id: 'closed', name: '成交', color: '#27ae60' },
            { id: 'lost', name: '流失', color: '#95a5a6' }
        ];
        this.interactionHistory = [];
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
    }

    // 載入資料
    loadData() {
        const savedCustomers = localStorage.getItem('crm_customers');
        if (savedCustomers) {
            this.customers = JSON.parse(savedCustomers);
        }

        const savedHistory = localStorage.getItem('crm_interaction_history');
        if (savedHistory) {
            this.interactionHistory = JSON.parse(savedHistory);
        }

        const savedTags = localStorage.getItem('crm_tags');
        if (savedTags) {
            this.tags = JSON.parse(savedTags);
        }
    }

    // 保存資料
    saveData() {
        localStorage.setItem('crm_customers', JSON.stringify(this.customers));
        localStorage.setItem('crm_interaction_history', JSON.stringify(this.interactionHistory));
        localStorage.setItem('crm_tags', JSON.stringify(this.tags));
    }

    // 設置事件監聽器
    setupEventListeners() {
        // 監聽客戶資料更新事件
        document.addEventListener('customerUpdated', (event) => {
            this.updateCustomer(event.detail);
        });

        // 監聽互動記錄事件
        document.addEventListener('interactionRecorded', (event) => {
            this.recordInteraction(event.detail);
        });
    }

    // 添加客戶（整合去重模組）
    addCustomer(customerData) {
        const dedup = window.dataDeduplication;
        if (dedup) {
            const sanitized = dedup.sanitizeCustomer(customerData);
            if (sanitized.email && !dedup.isValidEmail(sanitized.email)) {
                throw new Error('Email 格式無效或為黑名單網域');
            }
            const dup = dedup.findDuplicate(this.customers, sanitized);
            if (dup.duplicate) {
                throw new Error(`可能重複：${dup.reason === 'email' ? 'Email 已存在' : dup.reason === 'domain' ? '網域已存在' : '公司名稱相似'}`);
            }
            customerData = sanitized;
        } else {
            const existingCustomer = this.findCustomerByEmail(customerData.email);
            if (existingCustomer) throw new Error('客戶已存在，請檢查Email地址');
        }

        const customer = {
            id: this.generateId(),
            ...customerData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastVerifiedAt: new Date().toISOString(),
            stage: 'new',
            tags: customerData.tags || ['新名單'],
            interactionCount: 0,
            lastInteraction: null,
            nextFollowUp: customerData.nextFollowUp || null,
            leadScore: customerData.leadScore ?? null,
            needType: customerData.needType || null,
            urgency: customerData.urgency || null,
            sourceUrl: customerData.sourceUrl || null,
            quoteStatus: customerData.quoteStatus || null,
            proposalStatus: customerData.proposalStatus || null,
            probability: customerData.probability ?? null,
            attachments: customerData.attachments || [],
            status: 'active'
        };

        this.customers.push(customer);
        this.saveData();
        this.triggerEvent('customerAdded', customer);
        return customer;
    }

    // 更新客戶資料
    updateCustomer(customerData) {
        const index = this.customers.findIndex(c => c.id === customerData.id);
        if (index !== -1) {
            this.customers[index] = {
                ...this.customers[index],
                ...customerData,
                updatedAt: new Date().toISOString()
            };
            this.saveData();
            this.triggerEvent('customerUpdated', this.customers[index]);
        }
    }

    // 刪除客戶
    deleteCustomer(customerId) {
        const index = this.customers.findIndex(c => c.id === customerId);
        if (index !== -1) {
            const customer = this.customers[index];
            this.customers.splice(index, 1);
            this.saveData();
            this.triggerEvent('customerDeleted', customer);
        }
    }

    // 根據Email查找客戶
    findCustomerByEmail(email) {
        return this.customers.find(c => c.email.toLowerCase() === email.toLowerCase());
    }

    // 根據ID查找客戶
    findCustomerById(id) {
        return this.customers.find(c => c.id === id);
    }

    // 搜索客戶 - 基礎搜尋
    searchCustomers(query) {
        if (!query || !query.trim()) return this.customers;
        const searchTerm = query.toLowerCase().trim();
        return this.customers.filter(customer => 
            (customer.name && customer.name.toLowerCase().includes(searchTerm)) ||
            (customer.company && customer.company.toLowerCase().includes(searchTerm)) ||
            (customer.email && customer.email.toLowerCase().includes(searchTerm)) ||
            (customer.title && customer.title.toLowerCase().includes(searchTerm)) ||
            (customer.phone && customer.phone.includes(searchTerm)) ||
            (customer.tags && customer.tags.some(t => t.toLowerCase().includes(searchTerm)))
        );
    }

    // AI 智能搜尋 - 語意化搜尋，支援多關鍵字
    async smartSearchCustomers(query) {
        if (!window.aiAssistant) return this.searchCustomers(query);
        return await window.aiAssistant.smartSearch(this.customers, query);
    }

    // AI 客戶分類 - 取得客戶的 AI 分類建議
    async getAIClassification(customerId) {
        const customer = this.findCustomerById(customerId);
        if (!customer || !window.aiAssistant) return null;
        return await window.aiAssistant.classifyCustomer(customer);
    }

    // 批量 AI 分類 - 為所有客戶取得分類建議
    async classifyAllCustomersWithAI() {
        if (!window.aiAssistant) return [];
        return await window.aiAssistant.classifyCustomers(this.customers);
    }

    // 按標籤篩選客戶
    filterCustomersByTag(tag) {
        return this.customers.filter(customer => customer.tags.includes(tag));
    }

    // 按Pipeline階段篩選客戶
    filterCustomersByStage(stage) {
        return this.customers.filter(customer => customer.stage === stage);
    }

    // 更新客戶Pipeline階段
    updateCustomerStage(customerId, newStage) {
        const customer = this.findCustomerById(customerId);
        if (customer) {
            const oldStage = customer.stage;
            customer.stage = newStage;
            customer.updatedAt = new Date().toISOString();
            this.saveData();
            this.triggerEvent('customerStageUpdated', { customer, oldStage, newStage });
        }
    }

    // 添加標籤
    addTagToCustomer(customerId, tag) {
        const customer = this.findCustomerById(customerId);
        if (customer && !customer.tags.includes(tag)) {
            customer.tags.push(tag);
            customer.updatedAt = new Date().toISOString();
            this.saveData();
            this.triggerEvent('customerTagAdded', { customer, tag });
        }
    }

    // 移除標籤
    removeTagFromCustomer(customerId, tag) {
        const customer = this.findCustomerById(customerId);
        if (customer) {
            customer.tags = customer.tags.filter(t => t !== tag);
            customer.updatedAt = new Date().toISOString();
            this.saveData();
            this.triggerEvent('customerTagRemoved', { customer, tag });
        }
    }

    // 記錄互動（支援 eventType、source、templateId、campaignId 供 KPI 追蹤）
    recordInteraction(interactionData) {
        const interaction = {
            id: this.generateId(),
            customerId: interactionData.customerId,
            type: interactionData.type, // 'email', 'social', 'call', 'meeting'
            platform: interactionData.platform,
            content: interactionData.content,
            sentiment: interactionData.sentiment, // 'positive', 'negative', 'neutral'
            timestamp: new Date().toISOString(),
            status: interactionData.status || 'completed',
            eventType: interactionData.eventType || interactionData.type,
            source: interactionData.source || null,
            templateId: interactionData.templateId || null,
            campaignId: interactionData.campaignId || null
        };

        this.interactionHistory.push(interaction);

        // 更新客戶互動統計
        const customer = this.findCustomerById(interactionData.customerId);
        if (customer) {
            customer.interactionCount++;
            customer.lastInteraction = interaction.timestamp;
            customer.updatedAt = new Date().toISOString();
        }

        this.saveData();
        this.triggerEvent('interactionRecorded', interaction);
    }

    // 獲取客戶互動歷史
    getCustomerInteractions(customerId) {
        return this.interactionHistory.filter(i => i.customerId === customerId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // 分析客戶情感
    analyzeCustomerSentiment(customerId) {
        const interactions = this.getCustomerInteractions(customerId);
        const sentiments = interactions.map(i => i.sentiment);
        
        const sentimentCounts = sentiments.reduce((acc, sentiment) => {
            acc[sentiment] = (acc[sentiment] || 0) + 1;
            return acc;
        }, {});

        const total = sentiments.length;
        if (total === 0) return 'neutral';

        const positive = sentimentCounts.positive || 0;
        const negative = sentimentCounts.negative || 0;
        const neutral = sentimentCounts.neutral || 0;

        if (positive > negative && positive > neutral) return 'positive';
        if (negative > positive && negative > neutral) return 'negative';
        return 'neutral';
    }

    // 獲取Pipeline統計
    getPipelineStats() {
        const stats = {};
        this.pipelineStages.forEach(stage => {
            stats[stage.id] = this.filterCustomersByStage(stage.id).length;
        });
        return stats;
    }

    // 獲取標籤統計
    getTagStats() {
        const stats = {};
        this.tags.forEach(tag => {
            stats[tag] = this.filterCustomersByTag(tag).length;
        });
        return stats;
    }

    // 獲取績效指標
    getPerformanceMetrics() {
        const totalCustomers = this.customers.length;
        const contactedStages = ['contacted', 'responded', 'needs_confirmed', 'quoted', 'negotiating', 'closed'];
        const contactedCustomers = this.customers.filter(c => contactedStages.includes(c.stage)).length;
        const respondedCustomers = this.filterCustomersByStage('responded').length + this.filterCustomersByStage('needs_confirmed').length + this.filterCustomersByStage('quoted').length + this.filterCustomersByStage('negotiating').length + this.filterCustomersByStage('closed').length;
        const closedCustomers = this.filterCustomersByStage('closed').length;

        return {
            totalCustomers,
            contactRate: totalCustomers > 0 ? (contactedCustomers / totalCustomers * 100).toFixed(2) : 0,
            responseRate: contactedCustomers > 0 ? (respondedCustomers / contactedCustomers * 100).toFixed(2) : 0,
            conversionRate: totalCustomers > 0 ? (closedCustomers / totalCustomers * 100).toFixed(2) : 0
        };
    }

    // 取得需跟進的客戶（nextFollowUp 已到）
    getDueFollowUps() {
        const now = new Date().toISOString();
        return this.customers.filter(c => c.nextFollowUp && c.nextFollowUp <= now && c.stage !== 'closed' && c.stage !== 'lost');
    }

    // 設定下次跟進
    setNextFollowUp(customerId, dateStr) {
        const customer = this.findCustomerById(customerId);
        if (customer) {
            customer.nextFollowUp = dateStr;
            customer.updatedAt = new Date().toISOString();
            this.saveData();
            this.triggerEvent('customerUpdated', customer);
        }
    }

    // 匯入CSV資料
    importFromCSV(csvData) {
        const lines = csvData.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const importedCustomers = [];
        const errors = [];

        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.trim());
                const customerData = {};

                headers.forEach((header, index) => {
                    const value = values[index] || '';
                    switch (header.toLowerCase()) {
                        case 'name':
                        case '姓名':
                            customerData.name = value;
                            break;
                        case 'email':
                        case '電子郵件':
                            customerData.email = value;
                            break;
                        case 'company':
                        case '公司':
                            customerData.company = value;
                            break;
                        case 'title':
                        case '職位':
                            customerData.title = value;
                            break;
                        case 'phone':
                        case '電話':
                            customerData.phone = value;
                            break;
                        case 'industry':
                        case '產業':
                            customerData.industry = value;
                            break;
                        case 'website':
                        case '官網':
                            customerData.website = value;
                            break;
                        case 'linkedin':
                            customerData.linkedin = value;
                            break;
                        case 'twitter':
                            customerData.twitter = value;
                            break;
                    }
                });

                if (customerData.email) {
                    try {
                        const customer = this.addCustomer(customerData);
                        importedCustomers.push(customer);
                    } catch (error) {
                        errors.push({ row: i + 1, error: error.message, data: customerData });
                    }
                }
            }
        }

        return { importedCustomers, errors };
    }

    // 匯出資料為CSV
    exportToCSV() {
        const headers = ['ID', '姓名', 'Email', '公司', '職位', '電話', 'LinkedIn', 'Twitter', '階段', '標籤', '互動次數', '最後互動', '建立時間'];
        const rows = this.customers.map(customer => [
            customer.id,
            customer.name,
            customer.email,
            customer.company,
            customer.title,
            customer.phone || '',
            customer.linkedin || '',
            customer.twitter || '',
            customer.stage,
            customer.tags.join(';'),
            customer.interactionCount,
            customer.lastInteraction || '',
            customer.createdAt
        ]);

        const csvContent = [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');

        return csvContent;
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

    // 獲取所有客戶
    getAllCustomers() {
        return this.customers;
    }

    // 獲取所有標籤
    getAllTags() {
        return this.tags;
    }

    // 添加新標籤
    addTag(tag) {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
            this.saveData();
            this.triggerEvent('tagAdded', tag);
        }
    }

    // 刪除標籤
    removeTag(tag) {
        const index = this.tags.indexOf(tag);
        if (index !== -1) {
            this.tags.splice(index, 1);
            this.saveData();
            this.triggerEvent('tagRemoved', tag);
        }
    }
}

// 創建全域實例
window.crmDatabase = new CRMDatabase();

