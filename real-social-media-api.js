/**
 * 真實社群媒體API整合模組
 * 支援Twitter/X、LinkedIn、Instagram、Facebook的真實API連接
 */

class RealSocialMediaAPI {
    constructor() {
        this.apiEndpoints = {
            twitter: {
                baseUrl: 'https://api.twitter.com/2',
                authUrl: 'https://api.twitter.com/oauth/authenticate',
                tokenUrl: 'https://api.twitter.com/oauth/access_token'
            },
            linkedin: {
                baseUrl: 'https://api.linkedin.com/v2',
                authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
                tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken'
            },
            instagram: {
                baseUrl: 'https://graph.instagram.com/v12.0',
                authUrl: 'https://www.facebook.com/v12.0/dialog/oauth',
                tokenUrl: 'https://graph.facebook.com/v12.0/oauth/access_token'
            },
            facebook: {
                baseUrl: 'https://graph.facebook.com/v12.0',
                authUrl: 'https://www.facebook.com/v12.0/dialog/oauth',
                tokenUrl: 'https://graph.facebook.com/v12.0/oauth/access_token'
            }
        };
        
        this.authenticatedAccounts = {};
        this.apiKeys = this.loadAPIKeys();
        this.init();
    }

    // 載入API金鑰配置
    loadAPIKeys() {
        const savedKeys = localStorage.getItem('socialMediaAPIKeys');
        if (savedKeys) {
            return JSON.parse(savedKeys);
        }
        
        // 預設配置（需要用戶填入真實的API金鑰）
        return {
            twitter: {
                apiKey: '',
                apiSecret: '',
                bearerToken: '',
                accessToken: '',
                accessTokenSecret: ''
            },
            linkedin: {
                clientId: '',
                clientSecret: '',
                redirectUri: 'http://localhost:3856/oauth-callback.html'
            },
            instagram: {
                appId: '',
                appSecret: '',
                redirectUri: 'http://localhost:3856/oauth-callback.html'
            },
            facebook: {
                appId: '',
                appSecret: '',
                redirectUri: 'http://localhost:3856/oauth-callback.html'
            }
        };
    }

    // 保存API金鑰
    saveAPIKeys() {
        localStorage.setItem('socialMediaAPIKeys', JSON.stringify(this.apiKeys));
    }

    // 初始化
    init() {
        this.loadAuthenticatedAccounts();
        this.setupEventListeners();
    }

    // 載入已認證的帳號
    loadAuthenticatedAccounts() {
        const saved = localStorage.getItem('authenticatedSocialAccounts');
        if (saved) {
            this.authenticatedAccounts = JSON.parse(saved);
        }
    }

    // 保存認證帳號
    saveAuthenticatedAccounts() {
        localStorage.setItem('authenticatedSocialAccounts', JSON.stringify(this.authenticatedAccounts));
    }

    // 設置事件監聽器
    setupEventListeners() {
        // 監聽來自OAuth回調的訊息
        window.addEventListener('message', (event) => {
            if (event.data.type === 'OAUTH_CALLBACK') {
                this.handleOAuthCallback(event.data.platform, event.data.code);
            }
        });
    }

    // 真實登入功能
    async realLogin(platform, username, password) {
        try {
            this.showNotification(`正在連接到 ${platform} API...`, 'info');
            
            switch (platform) {
                case 'twitter':
                    return await this.loginTwitter(username, password);
                case 'linkedin':
                    return await this.loginLinkedIn(username, password);
                case 'instagram':
                    return await this.loginInstagram(username, password);
                case 'facebook':
                    return await this.loginFacebook(username, password);
                default:
                    throw new Error(`不支援的平台: ${platform}`);
            }
        } catch (error) {
            this.showNotification(`登入失敗: ${error.message}`, 'error');
            throw error;
        }
    }

    // Twitter/X 登入
    async loginTwitter(username, password) {
        if (!this.apiKeys.twitter.bearerToken) {
            throw new Error('請先在設定中配置Twitter API金鑰');
        }

        try {
            // 使用Bearer Token進行API認證
            const response = await fetch(`${this.apiEndpoints.twitter.baseUrl}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKeys.twitter.bearerToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Twitter API錯誤: ${response.status}`);
            }

            const userData = await response.json();
            
            // 保存認證資訊
            this.authenticatedAccounts.twitter = {
                username: username,
                userId: userData.data.id,
                accessToken: this.apiKeys.twitter.bearerToken,
                authenticatedAt: new Date().toISOString()
            };
            
            this.saveAuthenticatedAccounts();
            this.showNotification('Twitter登入成功！', 'success');
            
            return {
                success: true,
                platform: 'twitter',
                userData: userData.data
            };
        } catch (error) {
            throw new Error(`Twitter登入失敗: ${error.message}`);
        }
    }

    // LinkedIn 登入
    async loginLinkedIn(username, password) {
        if (!this.apiKeys.linkedin.clientId) {
            throw new Error('請先在設定中配置LinkedIn API金鑰');
        }

        try {
            // 啟動OAuth流程
            const authUrl = `${this.apiEndpoints.linkedin.authUrl}?` +
                `response_type=code&` +
                `client_id=${this.apiKeys.linkedin.clientId}&` +
                `redirect_uri=${encodeURIComponent(this.apiKeys.linkedin.redirectUri)}&` +
                `scope=r_liteprofile%20w_member_social&` +
                `state=${this.generateState()}`;

            // 開啟OAuth視窗
            const authWindow = window.open(authUrl, 'linkedin_oauth', 
                'width=600,height=700,scrollbars=yes,resizable=yes');

            // 等待OAuth回調
            return new Promise((resolve, reject) => {
                const checkClosed = setInterval(() => {
                    if (authWindow.closed) {
                        clearInterval(checkClosed);
                        reject(new Error('OAuth流程被取消'));
                    }
                }, 1000);

                // 設置回調處理器
                window.linkedinOAuthCallback = async (code) => {
                    clearInterval(checkClosed);
                    authWindow.close();
                    
                    try {
                        const tokenResponse = await this.getLinkedInAccessToken(code);
                        
                        this.authenticatedAccounts.linkedin = {
                            username: username,
                            accessToken: tokenResponse.access_token,
                            authenticatedAt: new Date().toISOString()
                        };
                        
                        this.saveAuthenticatedAccounts();
                        this.showNotification('LinkedIn登入成功！', 'success');
                        
                        resolve({
                            success: true,
                            platform: 'linkedin',
                            accessToken: tokenResponse.access_token
                        });
                    } catch (error) {
                        reject(error);
                    }
                };
            });
        } catch (error) {
            throw new Error(`LinkedIn登入失敗: ${error.message}`);
        }
    }

    // Instagram 登入
    async loginInstagram(username, password) {
        if (!this.apiKeys.instagram.appId) {
            throw new Error('請先在設定中配置Instagram API金鑰');
        }

        try {
            // 啟動OAuth流程
            const authUrl = `${this.apiEndpoints.instagram.authUrl}?` +
                `client_id=${this.apiKeys.instagram.appId}&` +
                `redirect_uri=${encodeURIComponent(this.apiKeys.instagram.redirectUri)}&` +
                `scope=instagram_basic,instagram_content_publish&` +
                `response_type=code&` +
                `state=${this.generateState()}`;

            const authWindow = window.open(authUrl, 'instagram_oauth', 
                'width=600,height=700,scrollbars=yes,resizable=yes');

            return new Promise((resolve, reject) => {
                const checkClosed = setInterval(() => {
                    if (authWindow.closed) {
                        clearInterval(checkClosed);
                        reject(new Error('OAuth流程被取消'));
                    }
                }, 1000);

                window.instagramOAuthCallback = async (code) => {
                    clearInterval(checkClosed);
                    authWindow.close();
                    
                    try {
                        const tokenResponse = await this.getInstagramAccessToken(code);
                        
                        this.authenticatedAccounts.instagram = {
                            username: username,
                            accessToken: tokenResponse.access_token,
                            authenticatedAt: new Date().toISOString()
                        };
                        
                        this.saveAuthenticatedAccounts();
                        this.showNotification('Instagram登入成功！', 'success');
                        
                        resolve({
                            success: true,
                            platform: 'instagram',
                            accessToken: tokenResponse.access_token
                        });
                    } catch (error) {
                        reject(error);
                    }
                };
            });
        } catch (error) {
            throw new Error(`Instagram登入失敗: ${error.message}`);
        }
    }

    // Facebook 登入
    async loginFacebook(username, password) {
        if (!this.apiKeys.facebook.appId) {
            throw new Error('請先在設定中配置Facebook API金鑰');
        }

        try {
            // 啟動OAuth流程
            const authUrl = `${this.apiEndpoints.facebook.authUrl}?` +
                `client_id=${this.apiKeys.facebook.appId}&` +
                `redirect_uri=${encodeURIComponent(this.apiKeys.facebook.redirectUri)}&` +
                `scope=pages_manage_posts,pages_read_engagement&` +
                `response_type=code&` +
                `state=${this.generateState()}`;

            const authWindow = window.open(authUrl, 'facebook_oauth', 
                'width=600,height=700,scrollbars=yes,resizable=yes');

            return new Promise((resolve, reject) => {
                const checkClosed = setInterval(() => {
                    if (authWindow.closed) {
                        clearInterval(checkClosed);
                        reject(new Error('OAuth流程被取消'));
                    }
                }, 1000);

                window.facebookOAuthCallback = async (code) => {
                    clearInterval(checkClosed);
                    authWindow.close();
                    
                    try {
                        const tokenResponse = await this.getFacebookAccessToken(code);
                        
                        this.authenticatedAccounts.facebook = {
                            username: username,
                            accessToken: tokenResponse.access_token,
                            authenticatedAt: new Date().toISOString()
                        };
                        
                        this.saveAuthenticatedAccounts();
                        this.showNotification('Facebook登入成功！', 'success');
                        
                        resolve({
                            success: true,
                            platform: 'facebook',
                            accessToken: tokenResponse.access_token
                        });
                    } catch (error) {
                        reject(error);
                    }
                };
            });
        } catch (error) {
            throw new Error(`Facebook登入失敗: ${error.message}`);
        }
    }

    async getBackendUrl() {
        return (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'http://localhost:3856';
    }

    async getLinkedInAccessToken(code) {
        const backendUrl = await this.getBackendUrl();
        const keys = this.apiKeys.linkedin;
        const res = await fetch(`${backendUrl}/api/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                platform: 'linkedin',
                code,
                redirectUri: keys.redirectUri,
                clientId: keys.clientId,
                clientSecret: keys.clientSecret
            })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        return data;
    }

    async getInstagramAccessToken(code) {
        const backendUrl = await this.getBackendUrl();
        const keys = this.apiKeys.instagram;
        const res = await fetch(`${backendUrl}/api/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                platform: 'instagram',
                code,
                redirectUri: keys.redirectUri,
                appId: keys.appId,
                appSecret: keys.appSecret
            })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        return data;
    }

    async getFacebookAccessToken(code) {
        const backendUrl = await this.getBackendUrl();
        const keys = this.apiKeys.facebook;
        const res = await fetch(`${backendUrl}/api/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                platform: 'facebook',
                code,
                redirectUri: keys.redirectUri,
                appId: keys.appId,
                appSecret: keys.appSecret
            })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        return data;
    }

    // 發送真實訊息
    async sendRealMessage(platform, recipientId, message) {
        if (!this.authenticatedAccounts[platform]) {
            throw new Error(`${platform} 帳號未認證`);
        }

        try {
            switch (platform) {
                case 'twitter':
                    return await this.sendTwitterMessage(recipientId, message);
                case 'linkedin':
                    return await this.sendLinkedInMessage(recipientId, message);
                case 'instagram':
                    return await this.sendInstagramMessage(recipientId, message);
                case 'facebook':
                    return await this.sendFacebookMessage(recipientId, message);
                default:
                    throw new Error(`不支援的平台: ${platform}`);
            }
        } catch (error) {
            this.showNotification(`發送失敗: ${error.message}`, 'error');
            throw error;
        }
    }

    // 發送Twitter訊息
    async sendTwitterMessage(recipientId, message) {
        const response = await fetch(`${this.apiEndpoints.twitter.baseUrl}/direct_messages/events/new`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.authenticatedAccounts.twitter.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event: {
                    type: 'message_create',
                    message_create: {
                        target: { recipient_id: recipientId },
                        message_data: { text: message }
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Twitter發送失敗: ${response.status}`);
        }

        return await response.json();
    }

    // 發送LinkedIn訊息
    async sendLinkedInMessage(recipientId, message) {
        const response = await fetch(`${this.apiEndpoints.linkedin.baseUrl}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.authenticatedAccounts.linkedin.accessToken}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            },
            body: JSON.stringify({
                recipients: [{ person: { id: recipientId } }],
                subject: '新訊息',
                body: message,
                messageType: 'INMAIL'
            })
        });

        if (!response.ok) {
            throw new Error(`LinkedIn發送失敗: ${response.status}`);
        }

        return await response.json();
    }

    // 發送Instagram訊息
    async sendInstagramMessage(recipientId, message) {
        const response = await fetch(`${this.apiEndpoints.instagram.baseUrl}/me/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.authenticatedAccounts.instagram.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipient: { id: recipientId },
                message: { text: message }
            })
        });

        if (!response.ok) {
            throw new Error(`Instagram發送失敗: ${response.status}`);
        }

        return await response.json();
    }

    // 發送Facebook訊息
    async sendFacebookMessage(recipientId, message) {
        const response = await fetch(`${this.apiEndpoints.facebook.baseUrl}/me/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.authenticatedAccounts.facebook.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipient: { id: recipientId },
                message: { text: message }
            })
        });

        if (!response.ok) {
            throw new Error(`Facebook發送失敗: ${response.status}`);
        }

        return await response.json();
    }

    // 登出
    logout(platform) {
        if (this.authenticatedAccounts[platform]) {
            delete this.authenticatedAccounts[platform];
            this.saveAuthenticatedAccounts();
            this.showNotification(`${platform} 已登出`, 'info');
        }
    }

    // 清除所有登入
    clearAllLogins() {
        this.authenticatedAccounts = {};
        this.saveAuthenticatedAccounts();
        this.showNotification('所有帳號已登出', 'info');
    }

    // 檢查是否有認證帳號
    hasAuthenticatedAccounts() {
        return Object.keys(this.authenticatedAccounts).length > 0;
    }

    // 獲取已認證的平台
    getAuthenticatedPlatforms() {
        return Object.keys(this.authenticatedAccounts);
    }

    // 生成隨機狀態碼
    generateState() {
        return Math.random().toString(36).substring(2, 15);
    }

    // 顯示通知
    showNotification(message, type = 'info') {
        if (window.accountLoginManager && window.accountLoginManager.showNotification) {
            window.accountLoginManager.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // 測試連接
    async testConnection(platform) {
        if (!this.authenticatedAccounts[platform]) {
            return { success: false, message: '帳號未認證' };
        }

        try {
            switch (platform) {
                case 'twitter':
                    const twitterResponse = await fetch(`${this.apiEndpoints.twitter.baseUrl}/users/me`, {
                        headers: {
                            'Authorization': `Bearer ${this.authenticatedAccounts.twitter.accessToken}`
                        }
                    });
                    return { success: twitterResponse.ok, message: twitterResponse.ok ? '連接正常' : '連接失敗' };
                
                case 'linkedin':
                    const linkedinResponse = await fetch(`${this.apiEndpoints.linkedin.baseUrl}/me`, {
                        headers: {
                            'Authorization': `Bearer ${this.authenticatedAccounts.linkedin.accessToken}`
                        }
                    });
                    return { success: linkedinResponse.ok, message: linkedinResponse.ok ? '連接正常' : '連接失敗' };
                
                case 'instagram':
                    const instagramResponse = await fetch(`${this.apiEndpoints.instagram.baseUrl}/me`, {
                        headers: {
                            'Authorization': `Bearer ${this.authenticatedAccounts.instagram.accessToken}`
                        }
                    });
                    return { success: instagramResponse.ok, message: instagramResponse.ok ? '連接正常' : '連接失敗' };
                
                case 'facebook':
                    const facebookResponse = await fetch(`${this.apiEndpoints.facebook.baseUrl}/me`, {
                        headers: {
                            'Authorization': `Bearer ${this.authenticatedAccounts.facebook.accessToken}`
                        }
                    });
                    return { success: facebookResponse.ok, message: facebookResponse.ok ? '連接正常' : '連接失敗' };
                
                default:
                    return { success: false, message: '不支援的平台' };
            }
        } catch (error) {
            return { success: false, message: `測試失敗: ${error.message}` };
        }
    }

    // 開啟API設定頁面
    openAPISettings() {
        const settingsWindow = window.open('api-settings.html', 'api_settings', 
            'width=800,height=600,scrollbars=yes,resizable=yes');
    }
}

// 創建全域實例
window.realSocialMediaAPI = new RealSocialMediaAPI();

// 暴露全域函數
window.realLogin = (platform, username, password) => {
    return window.realSocialMediaAPI.realLogin(platform, username, password);
};

window.sendRealMessage = (platform, recipientId, message) => {
    return window.realSocialMediaAPI.sendRealMessage(platform, recipientId, message);
};

window.testRealConnection = (platform) => {
    return window.realSocialMediaAPI.testConnection(platform);
};

window.openAPISettings = () => {
    window.realSocialMediaAPI.openAPISettings();
};
