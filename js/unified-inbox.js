/**
 * 統一收件箱系統
 * 整合Email和社群媒體回覆，提供統一的管理介面
 */

class UnifiedInbox {
    constructor() {
        this.messages = [];
        this.filters = {
            platform: 'all',
            status: 'all',
            sentiment: 'all',
            dateRange: 'all'
        };
        this.isConnected = false;
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.startPolling();
    }

    // 載入資料
    loadData() {
        const savedMessages = localStorage.getItem('unified_inbox_messages');
        if (savedMessages) {
            this.messages = JSON.parse(savedMessages);
        }
    }

    // 保存資料
    saveData() {
        localStorage.setItem('unified_inbox_messages', JSON.stringify(this.messages));
    }

    // 設置事件監聽器
    setupEventListeners() {
        // 監聽回覆事件
        document.addEventListener('messageReplied', (event) => {
            this.addMessage(event.detail);
        });

        // 監聽訊息發送事件
        document.addEventListener('messageSent', (event) => {
            this.addOutgoingMessage(event.detail);
        });
    }

    // 開始輪詢
    startPolling() {
        // 每30秒檢查一次新訊息
        this.pollingInterval = setInterval(() => {
            this.checkForNewMessages();
        }, 30000);
    }

    // 停止輪詢
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    // 檢查新訊息
    async checkForNewMessages() {
        try {
            // 檢查各個平台的訊息
            await this.checkEmailMessages();
            await this.checkSocialMediaMessages();
        } catch (error) {
            console.error('Error checking for new messages:', error);
        }
    }

    async checkEmailMessages() {
        // 需整合 Gmail API 或 IMAP 以取得真實郵件，目前不加入假資料
    }

    // 檢查社群媒體訊息
    async checkSocialMediaMessages() {
        if (window.realSocialMediaAPI && window.realSocialMediaAPI.hasAuthenticatedAccounts()) {
            const platforms = window.realSocialMediaAPI.getAuthenticatedPlatforms();
            
            for (const platform of platforms) {
                try {
                    const messages = await this.fetchSocialMediaMessages(platform);
                    messages.forEach(message => this.addMessage(message));
                } catch (error) {
                    console.error(`Error fetching ${platform} messages:`, error);
                }
            }
        }
    }

    async fetchSocialMediaMessages(platform) {
        // 需各平台 Messaging API 以取得真實私訊，目前回傳空陣列
        return [];
    }

    // 添加訊息
    addMessage(messageData) {
        const message = {
            id: this.generateId(),
            ...messageData,
            receivedAt: messageData.receivedAt || new Date().toISOString(),
            isRead: false,
            isArchived: false,
            tags: messageData.tags || [],
            sentiment: messageData.sentiment || 'neutral',
            priority: messageData.priority || 'normal',
            threadId: messageData.threadId || this.generateThreadId(messageData)
        };

        // 檢查是否已存在（避免重複）
        const existingMessage = this.messages.find(m => 
            m.threadId === message.threadId && 
            m.content === message.content &&
            Math.abs(new Date(m.receivedAt) - new Date(message.receivedAt)) < 60000 // 1分鐘內
        );

        if (!existingMessage) {
            this.messages.push(message);
            this.saveData();
            this.triggerEvent('newMessage', message);
        }
    }

    // 添加外發訊息
    addOutgoingMessage(messageData) {
        const message = {
            id: this.generateId(),
            ...messageData,
            type: 'outgoing',
            receivedAt: new Date().toISOString(),
            isRead: true,
            isArchived: false,
            tags: [],
            sentiment: 'neutral',
            priority: 'normal',
            threadId: messageData.threadId || this.generateThreadId(messageData)
        };

        this.messages.push(message);
        this.saveData();
        this.triggerEvent('outgoingMessageAdded', message);
    }

    // 生成對話串ID
    generateThreadId(messageData) {
        const { from, to, platform } = messageData;
        return `${platform}_${from}_${to}`.replace(/[^a-zA-Z0-9_]/g, '_');
    }

    // 獲取訊息列表
    getMessages(filters = {}) {
        let filteredMessages = [...this.messages];

        // 應用篩選器
        if (filters.platform && filters.platform !== 'all') {
            filteredMessages = filteredMessages.filter(m => m.platform === filters.platform);
        }

        if (filters.status && filters.status !== 'all') {
            switch (filters.status) {
                case 'unread':
                    filteredMessages = filteredMessages.filter(m => !m.isRead);
                    break;
                case 'read':
                    filteredMessages = filteredMessages.filter(m => m.isRead);
                    break;
                case 'archived':
                    filteredMessages = filteredMessages.filter(m => m.isArchived);
                    break;
            }
        }

        if (filters.sentiment && filters.sentiment !== 'all') {
            filteredMessages = filteredMessages.filter(m => m.sentiment === filters.sentiment);
        }

        if (filters.dateRange && filters.dateRange !== 'all') {
            const now = new Date();
            let startDate;

            switch (filters.dateRange) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                    break;
            }

            if (startDate) {
                filteredMessages = filteredMessages.filter(m => 
                    new Date(m.receivedAt) >= startDate
                );
            }
        }

        // 按時間排序（最新的在前）
        return filteredMessages.sort((a, b) => 
            new Date(b.receivedAt) - new Date(a.receivedAt)
        );
    }

    // 獲取對話串
    getThread(threadId) {
        return this.messages
            .filter(m => m.threadId === threadId)
            .sort((a, b) => new Date(a.receivedAt) - new Date(b.receivedAt));
    }

    // 標記為已讀
    markAsRead(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            message.isRead = true;
            this.saveData();
            this.triggerEvent('messageRead', message);
        }
    }

    // 標記為未讀
    markAsUnread(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            message.isRead = false;
            this.saveData();
            this.triggerEvent('messageUnread', message);
        }
    }

    // 封存訊息
    archiveMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            message.isArchived = true;
            this.saveData();
            this.triggerEvent('messageArchived', message);
        }
    }

    // 取消封存訊息
    unarchiveMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            message.isArchived = false;
            this.saveData();
            this.triggerEvent('messageUnarchived', message);
        }
    }

    // 刪除訊息
    deleteMessage(messageId) {
        const index = this.messages.findIndex(m => m.id === messageId);
        if (index !== -1) {
            const message = this.messages[index];
            this.messages.splice(index, 1);
            this.saveData();
            this.triggerEvent('messageDeleted', message);
        }
    }

    // 添加標籤
    addTag(messageId, tag) {
        const message = this.messages.find(m => m.id === messageId);
        if (message && !message.tags.includes(tag)) {
            message.tags.push(tag);
            this.saveData();
            this.triggerEvent('messageTagged', { message, tag });
        }
    }

    // 移除標籤
    removeTag(messageId, tag) {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            message.tags = message.tags.filter(t => t !== tag);
            this.saveData();
            this.triggerEvent('messageUntagged', { message, tag });
        }
    }

    // 更新情感分析
    updateSentiment(messageId, sentiment) {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            message.sentiment = sentiment;
            this.saveData();
            this.triggerEvent('sentimentUpdated', { message, sentiment });
        }
    }

    // 回覆訊息
    async replyToMessage(messageId, replyContent) {
        const originalMessage = this.messages.find(m => m.id === messageId);
        if (!originalMessage) return;

        const reply = {
            id: this.generateId(),
            type: 'outgoing',
            platform: originalMessage.platform,
            from: originalMessage.to,
            to: originalMessage.from,
            subject: `Re: ${originalMessage.subject || ''}`,
            content: replyContent,
            receivedAt: new Date().toISOString(),
            isRead: true,
            isArchived: false,
            tags: [],
            sentiment: 'neutral',
            priority: 'normal',
            threadId: originalMessage.threadId,
            replyTo: messageId
        };

        this.messages.push(reply);
        this.saveData();

        // 發送回覆
        if (window.realSocialMediaAPI && window.realSocialMediaAPI.hasAuthenticatedAccounts()) {
            try {
                await window.realSocialMediaAPI.sendRealMessage(
                    originalMessage.platform,
                    originalMessage.from,
                    replyContent
                );
            } catch (error) {
                console.error('Error sending reply:', error);
            }
        }

        this.triggerEvent('messageReplied', reply);
        return reply;
    }

    // 獲取統計資料
    getStats() {
        const total = this.messages.length;
        const unread = this.messages.filter(m => !m.isRead).length;
        const archived = this.messages.filter(m => m.isArchived).length;
        const byPlatform = this.getMessagesByPlatform();
        const bySentiment = this.getMessagesBySentiment();

        return {
            total,
            unread,
            archived,
            byPlatform,
            bySentiment,
            unreadRate: total > 0 ? (unread / total * 100).toFixed(2) : 0
        };
    }

    // 按平台分組訊息
    getMessagesByPlatform() {
        const platforms = {};
        this.messages.forEach(message => {
            platforms[message.platform] = (platforms[message.platform] || 0) + 1;
        });
        return platforms;
    }

    // 按情感分組訊息
    getMessagesBySentiment() {
        const sentiments = {};
        this.messages.forEach(message => {
            sentiments[message.sentiment] = (sentiments[message.sentiment] || 0) + 1;
        });
        return sentiments;
    }

    // 搜索訊息
    searchMessages(query) {
        const searchTerm = query.toLowerCase();
        return this.messages.filter(message => 
            message.content.toLowerCase().includes(searchTerm) ||
            message.subject?.toLowerCase().includes(searchTerm) ||
            message.from?.toLowerCase().includes(searchTerm) ||
            message.to?.toLowerCase().includes(searchTerm)
        );
    }

    // 生成模擬Email訊息
    generateMockEmailMessages() {
        // 這裡返回模擬的Email訊息
        return [];
    }

    // 生成模擬社群媒體訊息
    generateMockSocialMessages(platform) {
        // 這裡返回模擬的社群媒體訊息
        return [];
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

    // 匯出訊息
    exportMessages(format = 'csv') {
        if (format === 'csv') {
            const headers = ['ID', 'Platform', 'From', 'To', 'Subject', 'Content', 'Received At', 'Is Read', 'Sentiment'];
            const rows = this.messages.map(message => [
                message.id,
                message.platform,
                message.from,
                message.to,
                message.subject || '',
                message.content,
                message.receivedAt,
                message.isRead,
                message.sentiment
            ]);

            return [headers, ...rows].map(row => 
                row.map(field => `"${field}"`).join(',')
            ).join('\n');
        }
        return null;
    }
}

// 創建全域實例
window.unifiedInbox = new UnifiedInbox();

