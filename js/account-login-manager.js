// 帳號登入管理器 - 處理社群媒體帳號的登入、登出和狀態管理
class AccountLoginManager {
    constructor() {
        this.loggedInAccounts = {};
        this.loginStatus = {};
        this.init();
    }
    
    init() {
        this.loadSavedAccounts();
        this.updateUI();
        this.bindEvents();
    }
    
    // 載入已保存的帳號資訊
    loadSavedAccounts() {
        const savedAccounts = localStorage.getItem('loggedInAccounts');
        if (savedAccounts) {
            this.loggedInAccounts = JSON.parse(savedAccounts);
        }
        
        const savedStatus = localStorage.getItem('loginStatus');
        if (savedStatus) {
            this.loginStatus = JSON.parse(savedStatus);
        }
    }
    
    // 綁定事件
    bindEvents() {
        // 監聽登入按鈕點擊
        document.addEventListener('click', (e) => {
            if (e.target.matches('[onclick*="loginPlatform"]')) {
                const platform = e.target.getAttribute('onclick').match(/loginPlatform\('(\w+)'\)/)[1];
                this.handleLogin(platform);
            } else if (e.target.matches('[onclick*="logoutPlatform"]')) {
                const platform = e.target.getAttribute('onclick').match(/logoutPlatform\('(\w+)'\)/)[1];
                this.handleLogout(platform);
            }
        });
    }
    
    // 處理登入
    async handleLogin(platform) {
        const username = document.getElementById(`${platform}-username`)?.value;
        const password = document.getElementById(`${platform}-password`)?.value;
        
        if (!username || !password) {
            this.showNotification('請輸入用戶名和密碼', 'error');
            return;
        }
        
        // 更新狀態為連接中
        this.updateLoginStatus(platform, 'connecting');
        
        try {
            let loginResult;
            if (window.realSocialMediaAPI && this.hasApiKeysFor(platform)) {
                loginResult = await window.realSocialMediaAPI.realLogin(platform, username, password);
            } else {
                loginResult = await this.simulateLogin(platform, username, password);
            }
            
            if (!loginResult?.success) throw new Error(loginResult?.error || '登入失敗');
            
            this.loggedInAccounts[platform] = {
                username: username,
                loginTime: new Date().toISOString(),
                status: 'active',
                ...(window.realSocialMediaAPI?.authenticatedAccounts?.[platform] && { accessToken: window.realSocialMediaAPI.authenticatedAccounts[platform].accessToken })
            };
            
            this.updateLoginStatus(platform, 'logged-in');
            this.saveAccounts();
            this.showNotification(`${this.getPlatformDisplayName(platform)} 登入成功！`, 'success');
            this.updateUI();
            
        } catch (error) {
            this.updateLoginStatus(platform, 'logged-out');
            this.showNotification(`登入失敗：${error.message}`, 'error');
        }
    }
    
    hasApiKeysFor(platform) {
        const keys = window.realSocialMediaAPI?.apiKeys;
        if (!keys) return false;
        const p = keys[platform];
        if (!p) return false;
        if (platform === 'twitter') return !!(p.bearerToken || p.apiKey);
        if (platform === 'linkedin') return !!(p.clientId && p.clientSecret);
        if (platform === 'instagram' || platform === 'facebook') return !!(p.appId && p.appSecret);
        return false;
    }
    
    async simulateLogin(platform, username, password) {
        return new Promise((resolve, reject) => {
            // 模擬網路延遲
            setTimeout(() => {
                // 簡單的驗證邏輯（實際應用中會調用真實API）
                if (username.length > 0 && password.length > 0) {
                    // 模擬成功登入
                    resolve({ success: true, platform, username });
                } else {
                    reject(new Error('用戶名或密碼不能為空'));
                }
            }, 1500);
        });
    }
    
    // 處理登出
    handleLogout(platform) {
        // 清除帳號資訊
        delete this.loggedInAccounts[platform];
        
        // 更新登入狀態
        this.updateLoginStatus(platform, 'logged-out');
        
        // 清除輸入欄位
        const usernameInput = document.getElementById(`${platform}-username`);
        const passwordInput = document.getElementById(`${platform}-password`);
        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';
        
        // 保存到本地存儲
        this.saveAccounts();
        
        this.showNotification(`${this.getPlatformDisplayName(platform)} 已登出`, 'info');
        
        // 更新UI
        this.updateUI();
    }
    
    // 更新登入狀態
    updateLoginStatus(platform, status) {
        this.loginStatus[platform] = status;
        localStorage.setItem('loginStatus', JSON.stringify(this.loginStatus));
        
        // 更新狀態顯示
        const statusElement = document.getElementById(`${platform}-status`);
        if (statusElement) {
            statusElement.textContent = this.getStatusText(status);
            statusElement.className = `status ${status}`;
        }
    }
    
    // 獲取狀態文字
    getStatusText(status) {
        const statusTexts = {
            'logged-in': '已登入',
            'logged-out': '未登入',
            'connecting': '連接中...'
        };
        return statusTexts[status] || '未知';
    }
    
    // 獲取平台顯示名稱
    getPlatformDisplayName(platform) {
        const platformNames = {
            'twitter': 'Twitter/X',
            'linkedin': 'LinkedIn',
            'instagram': 'Instagram',
            'facebook': 'Facebook'
        };
        return platformNames[platform] || platform;
    }
    
    // 更新UI
    updateUI() {
        Object.keys(this.loggedInAccounts).forEach(platform => {
            this.updatePlatformUI(platform);
        });
    }
    
    // 更新平台UI
    updatePlatformUI(platform) {
        const loginBtn = document.querySelector(`[onclick="loginPlatform('${platform}')"]`);
        const logoutBtn = document.querySelector(`[onclick="logoutPlatform('${platform}')"]`);
        const usernameInput = document.getElementById(`${platform}-username`);
        const passwordInput = document.getElementById(`${platform}-password`);
        
        if (this.loggedInAccounts[platform]) {
            // 已登入狀態
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
            if (usernameInput) usernameInput.disabled = true;
            if (passwordInput) passwordInput.disabled = true;
            
            // 更新狀態顯示
            this.updateLoginStatus(platform, 'logged-in');
        } else {
            // 未登入狀態
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (usernameInput) usernameInput.disabled = false;
            if (passwordInput) passwordInput.disabled = false;
            
            // 更新狀態顯示
            this.updateLoginStatus(platform, 'logged-out');
        }
    }
    
    // 保存帳號資訊
    saveAccounts() {
        localStorage.setItem('loggedInAccounts', JSON.stringify(this.loggedInAccounts));
    }
    
    // 測試所有連接
    async testAllConnections() {
        const platforms = Object.keys(this.loggedInAccounts);
        
        if (platforms.length === 0) {
            this.showNotification('沒有已登入的帳號', 'warning');
            return;
        }
        
        this.showNotification('正在測試所有連接...', 'info');
        
        for (const platform of platforms) {
            await this.testConnection(platform);
        }
        
        this.showNotification('所有連接測試完成！', 'success');
    }
    
    async testConnection(platform) {
        if (window.realSocialMediaAPI?.authenticatedAccounts?.[platform] && typeof window.realSocialMediaAPI.testConnection === 'function') {
            const result = await window.realSocialMediaAPI.testConnection(platform);
            const ok = result?.success;
            this.showNotification(`${this.getPlatformDisplayName(platform)} ${ok ? '連接正常' : (result?.message || '連接異常')}`, ok ? 'success' : 'error');
            return ok;
        }
        this.showNotification(`${this.getPlatformDisplayName(platform)} 未認證，請先登入`, 'warning');
        return false;
    }
    
    // 清除所有登入
    clearAllLogins() {
        if (Object.keys(this.loggedInAccounts).length === 0) {
            this.showNotification('沒有已登入的帳號', 'warning');
            return;
        }
        
        if (confirm('確定要清除所有登入的帳號嗎？')) {
            this.loggedInAccounts = {};
            this.loginStatus = {};
            
            // 清除本地存儲
            localStorage.removeItem('loggedInAccounts');
            localStorage.removeItem('loginStatus');
            
            // 重置所有輸入欄位
            ['twitter', 'linkedin', 'instagram', 'facebook'].forEach(platform => {
                const usernameInput = document.getElementById(`${platform}-username`);
                const passwordInput = document.getElementById(`${platform}-password`);
                if (usernameInput) usernameInput.value = '';
                if (passwordInput) passwordInput.value = '';
            });
            
            // 更新UI
            this.updateUI();
            
            this.showNotification('所有帳號已清除', 'info');
        }
    }
    
    // 顯示通知
    showNotification(message, type = 'info') {
        // 創建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        // 添加到頁面
        document.body.appendChild(notification);
        
        // 自動移除
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    // 獲取已登入的帳號
    getLoggedInAccounts() {
        return this.loggedInAccounts;
    }
    
    // 檢查是否已登入
    isLoggedIn(platform) {
        return !!this.loggedInAccounts[platform];
    }
    
    // 獲取帳號資訊
    getAccountInfo(platform) {
        return this.loggedInAccounts[platform] || null;
    }
}

// 全域函數，供HTML調用
function loginPlatform(platform) {
    if (window.accountManager) {
        window.accountManager.handleLogin(platform);
    }
}

function logoutPlatform(platform) {
    if (window.accountManager) {
        window.accountManager.handleLogout(platform);
    }
}

function testAllConnections() {
    if (window.accountManager) {
        window.accountManager.testAllConnections();
    }
}

function clearAllLogins() {
    if (window.accountManager) {
        window.accountManager.clearAllLogins();
    }
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    window.accountManager = new AccountLoginManager();
});
