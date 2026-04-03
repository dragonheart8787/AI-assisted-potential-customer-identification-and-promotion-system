// 真實帳號整合模組 - 提供實際API連接和訊息發送功能
class RealAccountIntegration {
    constructor() {
        this.apiEndpoints = {
            twitter: 'https://api.twitter.com/2/',
            linkedin: 'https://api.linkedin.com/v2/',
            instagram: 'https://graph.instagram.com/',
            facebook: 'https://graph.facebook.com/',
            weibo: 'https://api.weibo.com/2/'
        };
        
        this.authenticatedAccounts = {};
        this.isConnected = false;
        
        this.init();
    }
    
    init() {
        this.loadAuthenticatedAccounts();
        this.setupAPIHandlers();
    }
    
    // 載入已認證的帳號
    loadAuthenticatedAccounts() {
        const savedAccounts = localStorage.getItem('authenticatedAccounts');
        if (savedAccounts) {
            this.authenticatedAccounts = JSON.parse(savedAccounts);
        }
    }
    
    // 設置API處理器
    setupAPIHandlers() {
        // 為每個平台設置API處理器
        Object.keys(this.apiEndpoints).forEach(platform => {
            this.setupPlatformHandler(platform);
        });
    }
    
    // 設置平台處理器
    setupPlatformHandler(platform) {
        const handler = {
            twitter: this.handleTwitterAPI.bind(this),
            linkedin: this.handleLinkedInAPI.bind(this),
            instagram: this.handleInstagramAPI.bind(this),
            facebook: this.handleFacebookAPI.bind(this),
            weibo: this.handleWeiboAPI.bind(this)
        };
        
        this[`${platform}Handler`] = handler[platform];
    }
    
    // Twitter API 處理
    async handleTwitterAPI(action, data) {
        const account = this.authenticatedAccounts.twitter;
        if (!account || !account.accessToken) {
            throw new Error('Twitter 帳號未認證');
        }
        
        const headers = {
            'Authorization': `Bearer ${account.accessToken}`,
            'Content-Type': 'application/json'
        };
        
        switch (action) {
            case 'send_dm':
                return await this.sendTwitterDM(data, headers);
            case 'send_tweet':
                return await this.sendTwitterTweet(data, headers);
            case 'get_user_info':
                return await this.getTwitterUserInfo(data, headers);
            default:
                throw new Error('不支援的 Twitter 操作');
        }
    }
    
    // 發送 Twitter 私訊
    async sendTwitterDM(data, headers) {
        const url = `${this.apiEndpoints.twitter}dm_events`;
        const payload = {
            event: {
                type: 'message_create',
                message_create: {
                    target: {
                        recipient_id: data.recipientId
                    },
                    message_data: {
                        text: data.message
                    }
                }
            }
        };
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`Twitter API 錯誤: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Twitter DM 發送失敗:', error);
            throw error;
        }
    }
    
    // 發送 Twitter 推文
    async sendTwitterTweet(data, headers) {
        const url = `${this.apiEndpoints.twitter}tweets`;
        const payload = {
            text: data.message
        };
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`Twitter API 錯誤: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Twitter 推文發送失敗:', error);
            throw error;
        }
    }
    
    // 獲取 Twitter 用戶資訊
    async getTwitterUserInfo(data, headers) {
        const url = `${this.apiEndpoints.twitter}users/by/username/${data.username}`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });
            
            if (!response.ok) {
                throw new Error(`Twitter API 錯誤: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('獲取 Twitter 用戶資訊失敗:', error);
            throw error;
        }
    }
    
    // LinkedIn API 處理
    async handleLinkedInAPI(action, data) {
        const account = this.authenticatedAccounts.linkedin;
        if (!account || !account.accessToken) {
            throw new Error('LinkedIn 帳號未認證');
        }
        
        const headers = {
            'Authorization': `Bearer ${account.accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
        };
        
        switch (action) {
            case 'send_message':
                return await this.sendLinkedInMessage(data, headers);
            case 'get_profile':
                return await this.getLinkedInProfile(data, headers);
            default:
                throw new Error('不支援的 LinkedIn 操作');
        }
    }
    
    // 發送 LinkedIn 訊息
    async sendLinkedInMessage(data, headers) {
        const url = `${this.apiEndpoints.linkedin}messages`;
        const payload = {
            recipients: [{
                person: {
                    id: data.recipientId
                }
            }],
            subject: data.subject,
            body: data.message,
            messageType: 'INMAIL'
        };
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`LinkedIn API 錯誤: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('LinkedIn 訊息發送失敗:', error);
            throw error;
        }
    }
    
    // 獲取 LinkedIn 個人資料
    async getLinkedInProfile(data, headers) {
        const url = `${this.apiEndpoints.linkedin}me`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });
            
            if (!response.ok) {
                throw new Error(`LinkedIn API 錯誤: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('獲取 LinkedIn 個人資料失敗:', error);
            throw error;
        }
    }
    
    // Instagram API 處理
    async handleInstagramAPI(action, data) {
        const account = this.authenticatedAccounts.instagram;
        if (!account || !account.accessToken) {
            throw new Error('Instagram 帳號未認證');
        }
        
        const headers = {
            'Authorization': `Bearer ${account.accessToken}`,
            'Content-Type': 'application/json'
        };
        
        switch (action) {
            case 'send_dm':
                return await this.sendInstagramDM(data, headers);
            case 'get_user_info':
                return await this.getInstagramUserInfo(data, headers);
            default:
                throw new Error('不支援的 Instagram 操作');
        }
    }
    
    // 發送 Instagram 私訊
    async sendInstagramDM(data, headers) {
        const url = `${this.apiEndpoints.instagram}me/messages`;
        const payload = {
            recipient_id: data.recipientId,
            message: data.message
        };
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`Instagram API 錯誤: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Instagram DM 發送失敗:', error);
            throw error;
        }
    }
    
    // 獲取 Instagram 用戶資訊
    async getInstagramUserInfo(data, headers) {
        const url = `${this.apiEndpoints.instagram}me`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });
            
            if (!response.ok) {
                throw new Error(`Instagram API 錯誤: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('獲取 Instagram 用戶資訊失敗:', error);
            throw error;
        }
    }
    
    // Facebook API 處理
    async handleFacebookAPI(action, data) {
        const account = this.authenticatedAccounts.facebook;
        if (!account || !account.accessToken) {
            throw new Error('Facebook 帳號未認證');
        }
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        switch (action) {
            case 'send_message':
                return await this.sendFacebookMessage(data, account.accessToken);
            case 'get_page_info':
                return await this.getFacebookPageInfo(data, account.accessToken);
            default:
                throw new Error('不支援的 Facebook 操作');
        }
    }
    
    // 發送 Facebook 訊息
    async sendFacebookMessage(data, accessToken) {
        const url = `${this.apiEndpoints.facebook}me/messages?access_token=${accessToken}`;
        const payload = {
            recipient: {
                id: data.recipientId
            },
            message: {
                text: data.message
            }
        };
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`Facebook API 錯誤: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Facebook 訊息發送失敗:', error);
            throw error;
        }
    }
    
    // 獲取 Facebook 頁面資訊
    async getFacebookPageInfo(data, accessToken) {
        const url = `${this.apiEndpoints.facebook}me?access_token=${accessToken}`;
        
        try {
            const response = await fetch(url, {
                method: 'GET'
            });
            
            if (!response.ok) {
                throw new Error(`Facebook API 錯誤: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('獲取 Facebook 頁面資訊失敗:', error);
            throw error;
        }
    }
    
    // 微博 API 處理
    async handleWeiboAPI(action, data) {
        const account = this.authenticatedAccounts.weibo;
        if (!account || !account.accessToken) {
            throw new Error('微博帳號未認證');
        }
        
        const headers = {
            'Authorization': `OAuth2 ${account.accessToken}`,
            'Content-Type': 'application/json'
        };
        
        switch (action) {
            case 'send_dm':
                return await this.sendWeiboDM(data, headers);
            case 'get_user_info':
                return await this.getWeiboUserInfo(data, headers);
            default:
                throw new Error('不支援的微博操作');
        }
    }
    
    // 發送微博私訊
    async sendWeiboDM(data, headers) {
        const url = `${this.apiEndpoints.weibo}direct_messages/new`;
        const payload = {
            uid: data.recipientId,
            text: data.message
        };
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`微博 API 錯誤: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('微博私訊發送失敗:', error);
            throw error;
        }
    }
    
    // 獲取微博用戶資訊
    async getWeiboUserInfo(data, headers) {
        const url = `${this.apiEndpoints.weibo}users/show?screen_name=${data.username}`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });
            
            if (!response.ok) {
                throw new Error(`微博 API 錯誤: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('獲取微博用戶資訊失敗:', error);
            throw error;
        }
    }
    
    // 測試帳號連接
    async testAccountConnection(platform) {
        try {
            const account = this.authenticatedAccounts[platform];
            if (!account) {
                throw new Error(`${platform} 帳號未設定`);
            }
            
            // 根據平台測試連接
            switch (platform) {
                case 'twitter':
                    return await this.handleTwitterAPI('get_user_info', { username: account.username });
                case 'linkedin':
                    return await this.handleLinkedInAPI('get_profile', {});
                case 'instagram':
                    return await this.handleInstagramAPI('get_user_info', {});
                case 'facebook':
                    return await this.handleFacebookAPI('get_page_info', {});
                case 'weibo':
                    return await this.handleWeiboAPI('get_user_info', { username: account.username });
                default:
                    throw new Error(`不支援的平台: ${platform}`);
            }
        } catch (error) {
            console.error(`${platform} 連接測試失敗:`, error);
            throw error;
        }
    }
    
    // 發送真實訊息
    async sendRealMessage(platform, messageData) {
        try {
            const account = this.authenticatedAccounts[platform];
            if (!account) {
                throw new Error(`${platform} 帳號未設定`);
            }
            
            // 根據平台發送訊息
            switch (platform) {
                case 'twitter':
                    return await this.handleTwitterAPI('send_dm', messageData);
                case 'linkedin':
                    return await this.handleLinkedInAPI('send_message', messageData);
                case 'instagram':
                    return await this.handleInstagramAPI('send_dm', messageData);
                case 'facebook':
                    return await this.handleFacebookAPI('send_message', messageData);
                case 'weibo':
                    return await this.handleWeiboAPI('send_dm', messageData);
                default:
                    throw new Error(`不支援的平台: ${platform}`);
            }
        } catch (error) {
            console.error(`${platform} 訊息發送失敗:`, error);
            throw error;
        }
    }
    
    // 批量發送訊息
    async sendBatchMessages(messages) {
        const results = [];
        
        for (const message of messages) {
            try {
                const result = await this.sendRealMessage(message.platform, message.data);
                results.push({
                    success: true,
                    platform: message.platform,
                    result: result
                });
            } catch (error) {
                results.push({
                    success: false,
                    platform: message.platform,
                    error: error.message
                });
            }
        }
        
        return results;
    }
    
    // 獲取平台狀態
    getPlatformStatus(platform) {
        const account = this.authenticatedAccounts[platform];
        return {
            connected: !!account,
            username: account ? account.username : null,
            lastTest: account ? account.lastTest : null
        };
    }
    
    // 獲取所有平台狀態
    getAllPlatformStatus() {
        const platforms = ['twitter', 'linkedin', 'instagram', 'facebook', 'weibo'];
        const status = {};
        
        platforms.forEach(platform => {
            status[platform] = this.getPlatformStatus(platform);
        });
        
        return status;
    }
    
    // 更新帳號資訊
    updateAccountInfo(platform, accountInfo) {
        this.authenticatedAccounts[platform] = {
            ...this.authenticatedAccounts[platform],
            ...accountInfo,
            lastUpdated: new Date().toISOString()
        };
        
        this.saveAuthenticatedAccounts();
    }
    
    // 保存已認證帳號
    saveAuthenticatedAccounts() {
        localStorage.setItem('authenticatedAccounts', JSON.stringify(this.authenticatedAccounts));
    }
    
    // 移除帳號
    removeAccount(platform) {
        delete this.authenticatedAccounts[platform];
        this.saveAuthenticatedAccounts();
    }
    
    // 獲取支援的平台列表
    getSupportedPlatforms() {
        return Object.keys(this.apiEndpoints);
    }
    
    // 檢查是否有任何已認證的帳號
    hasAuthenticatedAccounts() {
        return Object.keys(this.authenticatedAccounts).length > 0;
    }
    
    // 獲取認證的帳號列表
    getAuthenticatedAccounts() {
        return Object.keys(this.authenticatedAccounts);
    }
}

// 全局函數
window.testRealAccount = async function(platform) {
    try {
        const result = await window.realAccountIntegration.testAccountConnection(platform);
        console.log(`${platform} 連接測試成功:`, result);
        return { success: true, data: result };
    } catch (error) {
        console.error(`${platform} 連接測試失敗:`, error);
        return { success: false, error: error.message };
    }
};

window.sendRealMessage = async function(platform, messageData) {
    try {
        const result = await window.realAccountIntegration.sendRealMessage(platform, messageData);
        console.log(`${platform} 訊息發送成功:`, result);
        return { success: true, data: result };
    } catch (error) {
        console.error(`${platform} 訊息發送失敗:`, error);
        return { success: false, error: error.message };
    }
};

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    window.realAccountIntegration = new RealAccountIntegration();
}); 