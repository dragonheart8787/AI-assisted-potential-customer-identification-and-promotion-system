/**
 * Google OAuth整合模組
 * 支援使用Google帳號登入各種社群媒體平台
 */

class GoogleOAuthIntegration {
    constructor() {
        this.clientId = null;
        this.apiKey = null;
        this.initialized = false;
        this.authenticatedAccounts = {};
        
        this.init();
    }
    
    async init() {
        try {
            // 載入Google API設定
            this.loadGoogleSettings();
            
            // 載入Google API
            await this.loadGoogleAPI();
            
            this.initialized = true;
            console.log('✅ Google OAuth整合已初始化');
        } catch (error) {
            console.error('❌ Google OAuth初始化失敗:', error);
        }
    }
    
    // 載入Google API設定
    loadGoogleSettings() {
        const settings = localStorage.getItem('googleOAuthSettings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.clientId = parsed.clientId;
            this.apiKey = parsed.apiKey;
        }
    }
    
    // 保存Google API設定
    saveGoogleSettings() {
        const settings = {
            clientId: this.clientId,
            apiKey: this.apiKey
        };
        localStorage.setItem('googleOAuthSettings', JSON.stringify(settings));
    }
    
    // 載入Google API
    async loadGoogleAPI() {
        return new Promise((resolve, reject) => {
            if (window.google && window.google.accounts) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.onload = () => {
                console.log('✅ Google API已載入');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ 載入Google API失敗');
                reject(new Error('無法載入Google API'));
            };
            document.head.appendChild(script);
        });
    }
    
    // 設定Google OAuth配置
    configureGoogleOAuth(clientId, apiKey) {
        this.clientId = clientId;
        this.apiKey = apiKey;
        this.saveGoogleSettings();
        
        if (window.google && window.google.accounts) {
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: this.handleGoogleResponse.bind(this)
            });
        }
    }
    
    // 處理Google登入回應
    handleGoogleResponse(response) {
        try {
            const token = response.credential;
            const payload = this.decodeJWT(token);
            
            console.log('Google登入成功:', payload);
            
            // 通知其他模組登入成功
            this.onGoogleLoginSuccess(payload);
            
        } catch (error) {
            console.error('處理Google回應失敗:', error);
            this.onGoogleLoginError(error);
        }
    }
    
    // 解碼JWT token
    decodeJWT(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        return JSON.parse(jsonPayload);
    }
    
    // Google登入成功處理
    onGoogleLoginSuccess(payload) {
        // 更新UI狀態
        this.updateLoginStatus('success', payload);
        
        // 保存登入資訊
        this.authenticatedAccounts.google = {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            accessToken: payload.sub,
            loginTime: new Date().toISOString()
        };
        
        this.saveAuthenticatedAccounts();
    }
    
    // Google登入錯誤處理
    onGoogleLoginError(error) {
        console.error('Google登入錯誤:', error);
        this.updateLoginStatus('error', error);
    }
    
    // 更新登入狀態
    updateLoginStatus(status, data) {
        const event = new CustomEvent('googleLoginStatus', {
            detail: { status, data }
        });
        document.dispatchEvent(event);
    }
    
    // 使用Google帳號登入社群媒體平台
    async loginSocialPlatformWithGoogle(platform) {
        try {
            if (!this.initialized) {
                throw new Error('Google OAuth尚未初始化');
            }
            
            // 檢查是否有Google登入
            if (!this.authenticatedAccounts.google) {
                await this.promptGoogleLogin();
                return;
            }
            
            // 使用Google帳號登入指定平台
            const result = await this.authenticateWithPlatform(platform);
            
            if (result.success) {
                // 更新平台登入狀態
                this.updatePlatformLoginStatus(platform, 'logged-in');
                return result;
            } else {
                throw new Error(result.error || '平台登入失敗');
            }
            
        } catch (error) {
            console.error(`${platform} Google登入失敗:`, error);
            this.updatePlatformLoginStatus(platform, 'error');
            throw error;
        }
    }
    
    // 提示Google登入
    async promptGoogleLogin() {
        return new Promise((resolve, reject) => {
            if (window.google && window.google.accounts) {
                window.google.accounts.id.prompt((notification) => {
                    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                        reject(new Error('Google登入被取消'));
                    }
                });
                
                // 監聽登入成功事件
                document.addEventListener('googleLoginStatus', (event) => {
                    if (event.detail.status === 'success') {
                        resolve(event.detail.data);
                    } else if (event.detail.status === 'error') {
                        reject(event.detail.data);
                    }
                });
            } else {
                reject(new Error('Google API未載入'));
            }
        });
    }
    
    // 使用Google帳號認證社群媒體平台
    async authenticateWithPlatform(platform) {
        const googleAccount = this.authenticatedAccounts.google;
        
        // 模擬不同平台的認證流程
        switch (platform) {
            case 'twitter':
                return await this.authenticateTwitterWithGoogle(googleAccount);
            case 'linkedin':
                return await this.authenticateLinkedInWithGoogle(googleAccount);
            case 'instagram':
                return await this.authenticateInstagramWithGoogle(googleAccount);
            case 'facebook':
                return await this.authenticateFacebookWithGoogle(googleAccount);
            default:
                throw new Error(`不支援的平台: ${platform}`);
        }
    }
    
    // Twitter Google認證
    async authenticateTwitterWithGoogle(googleAccount) {
        // 模擬Twitter OAuth流程
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    platform: 'twitter',
                    account: {
                        username: googleAccount.name.toLowerCase().replace(/\s+/g, ''),
                        email: googleAccount.email,
                        displayName: googleAccount.name,
                        profilePicture: googleAccount.picture
                    }
                });
            }, 1500);
        });
    }
    
    // LinkedIn Google認證
    async authenticateLinkedInWithGoogle(googleAccount) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    platform: 'linkedin',
                    account: {
                        email: googleAccount.email,
                        name: googleAccount.name,
                        profilePicture: googleAccount.picture
                    }
                });
            }, 1500);
        });
    }
    
    // Instagram Google認證
    async authenticateInstagramWithGoogle(googleAccount) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    platform: 'instagram',
                    account: {
                        username: googleAccount.name.toLowerCase().replace(/\s+/g, ''),
                        email: googleAccount.email,
                        displayName: googleAccount.name,
                        profilePicture: googleAccount.picture
                    }
                });
            }, 1500);
        });
    }
    
    // Facebook Google認證
    async authenticateFacebookWithGoogle(googleAccount) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    platform: 'facebook',
                    account: {
                        email: googleAccount.email,
                        name: googleAccount.name,
                        profilePicture: googleAccount.picture
                    }
                });
            }, 1500);
        });
    }
    
    // 更新平台登入狀態
    updatePlatformLoginStatus(platform, status) {
        const event = new CustomEvent('platformLoginStatus', {
            detail: { platform, status }
        });
        document.dispatchEvent(event);
    }
    
    // 保存已認證帳號
    saveAuthenticatedAccounts() {
        localStorage.setItem('googleAuthenticatedAccounts', JSON.stringify(this.authenticatedAccounts));
    }
    
    // 載入已認證帳號
    loadAuthenticatedAccounts() {
        const saved = localStorage.getItem('googleAuthenticatedAccounts');
        if (saved) {
            this.authenticatedAccounts = JSON.parse(saved);
        }
    }
    
    // 登出Google帳號
    logoutGoogle() {
        if (window.google && window.google.accounts) {
            window.google.accounts.id.disableAutoSelect();
        }
        
        this.authenticatedAccounts = {};
        this.saveAuthenticatedAccounts();
        
        console.log('✅ Google帳號已登出');
    }
    
    // 檢查是否已登入Google
    isGoogleLoggedIn() {
        return !!this.authenticatedAccounts.google;
    }
    
    // 取得Google帳號資訊
    getGoogleAccountInfo() {
        return this.authenticatedAccounts.google || null;
    }
}

// 創建全域實例
window.googleOAuthIntegration = new GoogleOAuthIntegration();

// 監聽平台登入狀態事件
document.addEventListener('platformLoginStatus', (event) => {
    const { platform, status } = event.detail;
    
    // 更新UI狀態
    const statusElement = document.getElementById(`${platform}-status`);
    if (statusElement) {
        switch (status) {
            case 'logged-in':
                statusElement.textContent = '已登入';
                statusElement.className = 'status logged-in';
                break;
            case 'error':
                statusElement.textContent = '登入失敗';
                statusElement.className = 'status logged-out';
                break;
            case 'connecting':
                statusElement.textContent = '正在登入...';
                statusElement.className = 'status connecting';
                break;
        }
    }
});

console.log('🚀 Google OAuth整合模組已載入');




