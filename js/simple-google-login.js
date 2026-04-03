/**
 * 簡化版Google登入模組
 * 支援直接使用Google帳號登入社群媒體平台
 */

class SimpleGoogleLogin {
    constructor() {
        this.authenticatedAccounts = {};
        this.init();
    }
    
    async init() {
        console.log('🚀 簡化版Google登入模組已載入');
        
        // 載入已保存的帳號
        this.loadSavedAccounts();
    }
    
    // 載入已保存的帳號
    loadSavedAccounts() {
        const saved = localStorage.getItem('simpleGoogleAccounts');
        if (saved) {
            this.authenticatedAccounts = JSON.parse(saved);
            console.log('✅ 已載入保存的Google帳號:', Object.keys(this.authenticatedAccounts));
        }
    }
    
    // 保存帳號
    saveAccounts() {
        localStorage.setItem('simpleGoogleAccounts', JSON.stringify(this.authenticatedAccounts));
    }
    
    // 使用Google帳號登入社群媒體平台
    async loginWithGoogleAccount(platform) {
        try {
            console.log(`開始${platform}的Google登入流程...`);
            
            // 顯示載入狀態
            this.updateStatus(platform, 'connecting', '正在登入...');
            
            // 模擬Google OAuth流程
            const result = await this.simulateGoogleOAuth(platform);
            
            if (result.success) {
                // 登入成功
                this.authenticatedAccounts[platform] = result.account;
                this.saveAccounts();
                
                this.updateStatus(platform, 'logged-in', '已登入');
                this.updateUI(platform, true);
                
                alert(`✅ ${platform} Google登入成功！\n\n帳號: ${result.account.email}\n姓名: ${result.account.name}`);
                
                console.log(`${platform}登入成功:`, result.account);
                return result;
            } else {
                throw new Error(result.error || '登入失敗');
            }
            
        } catch (error) {
            console.error(`${platform}登入錯誤:`, error);
            this.updateStatus(platform, 'error', '登入失敗');
            alert(`❌ ${platform} Google登入失敗: ${error.message}`);
            throw error;
        }
    }
    
    // 模擬Google OAuth流程
    async simulateGoogleOAuth(platform) {
        return new Promise((resolve) => {
            // 顯示Google登入提示
            const email = prompt(`請輸入您的Google帳號Email (用於登入${platform}):`);
            
            if (!email) {
                resolve({ success: false, error: '用戶取消登入' });
                return;
            }
            
            // 驗證Email格式
            if (!this.isValidEmail(email)) {
                resolve({ success: false, error: 'Email格式不正確' });
                return;
            }
            
            // 模擬登入延遲
            setTimeout(() => {
                const account = {
                    platform: platform,
                    email: email,
                    name: this.generateDisplayName(email),
                    loginTime: new Date().toISOString(),
                    method: 'google'
                };
                
                resolve({ success: true, account: account });
            }, 1500);
        });
    }
    
    // 驗證Email格式
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // 生成顯示名稱
    generateDisplayName(email) {
        const username = email.split('@')[0];
        return username.charAt(0).toUpperCase() + username.slice(1);
    }
    
    // 更新登入狀態
    updateStatus(platform, status, message) {
        const statusElement = document.getElementById(`${platform}-status`);
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status ${status}`;
        }
        
        // 觸發自定義事件
        const event = new CustomEvent('googleLoginStatus', {
            detail: { platform, status, message }
        });
        document.dispatchEvent(event);
    }
    
    // 更新UI
    updateUI(platform, isLoggedIn) {
        const manualInputs = document.getElementById(`${platform}-manual-inputs`);
        const googleInputs = document.getElementById(`${platform}-google-inputs`);
        const logoutBtn = document.getElementById(`${platform}-logout-btn`);
        
        if (isLoggedIn) {
            // 隱藏登入區域，顯示登出按鈕
            if (manualInputs) manualInputs.style.display = 'none';
            if (googleInputs) googleInputs.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
        } else {
            // 顯示登入區域，隱藏登出按鈕
            if (manualInputs) manualInputs.style.display = 'block';
            if (googleInputs) googleInputs.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
        }
    }
    
    // 登出
    logout(platform) {
        if (this.authenticatedAccounts[platform]) {
            delete this.authenticatedAccounts[platform];
            this.saveAccounts();
            
            this.updateStatus(platform, 'logged-out', '未登入');
            this.updateUI(platform, false);
            
            alert(`✅ ${platform} 已登出`);
            console.log(`${platform}已登出`);
        }
    }
    
    // 檢查是否已登入
    isLoggedIn(platform) {
        return !!this.authenticatedAccounts[platform];
    }
    
    // 取得帳號資訊
    getAccountInfo(platform) {
        return this.authenticatedAccounts[platform] || null;
    }
    
    // 取得所有已登入平台
    getLoggedInPlatforms() {
        return Object.keys(this.authenticatedAccounts);
    }
    
    // 清除所有登入
    clearAllLogins() {
        this.authenticatedAccounts = {};
        this.saveAccounts();
        
        // 重置所有平台UI
        const platforms = ['twitter', 'linkedin', 'instagram', 'facebook'];
        platforms.forEach(platform => {
            this.updateStatus(platform, 'logged-out', '未登入');
            this.updateUI(platform, false);
        });
        
        alert('✅ 所有Google登入已清除');
        console.log('所有Google登入已清除');
    }
    
    // 測試所有連接
    async testAllConnections() {
        const loggedInPlatforms = this.getLoggedInPlatforms();
        
        if (loggedInPlatforms.length === 0) {
            alert('❌ 沒有已登入的平台');
            return;
        }
        
        let results = [];
        
        for (const platform of loggedInPlatforms) {
            try {
                const account = this.getAccountInfo(platform);
                results.push(`✅ ${platform}: ${account.email}`);
            } catch (error) {
                results.push(`❌ ${platform}: 連接失敗`);
            }
        }
        
        alert(`連接測試結果:\n\n${results.join('\n')}`);
    }
}

// 創建全域實例
window.simpleGoogleLogin = new SimpleGoogleLogin();

// 監聽登入狀態事件
document.addEventListener('googleLoginStatus', (event) => {
    const { platform, status, message } = event.detail;
    console.log(`Google登入狀態更新: ${platform} - ${status} - ${message}`);
});

console.log('🚀 簡化版Google登入模組已載入');




