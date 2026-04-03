// 直接帳號控制模組 - 使用帳號密碼直接操控社交媒體
class DirectAccountControl {
    constructor() {
        this.authenticatedAccounts = {};
        this.browserAutomation = null;
        this.isRunning = false;
        this.currentSession = null;
        
        this.platformConfigs = {
            twitter: {
                loginUrl: 'https://twitter.com/login',
                dmUrl: 'https://twitter.com/messages',
                composeUrl: 'https://twitter.com/compose/tweet',
                selectors: {
                    username: 'input[autocomplete="username"]',
                    password: 'input[name="password"]',
                    loginButton: 'div[data-testid="LoginForm_Login_Button"]',
                    dmButton: 'a[href="/messages"]',
                    newMessage: 'a[href="/messages/compose"]',
                    recipientInput: 'input[data-testid="searchPeople"]',
                    messageInput: 'div[data-testid="tweetTextarea_0"]',
                    sendButton: 'div[data-testid="tweetButton"]',
                    composeButton: 'a[data-testid="SideNav_NewTweet_Button"]'
                }
            },
            linkedin: {
                loginUrl: 'https://www.linkedin.com/login',
                dmUrl: 'https://www.linkedin.com/messaging/',
                composeUrl: 'https://www.linkedin.com/messaging/compose/',
                selectors: {
                    username: '#username',
                    password: '#password',
                    loginButton: 'button[type="submit"]',
                    dmButton: 'a[href="/messaging/"]',
                    newMessage: 'button[aria-label="Start a new message"]',
                    recipientInput: 'input[placeholder="Search by name"]',
                    messageInput: 'div[role="textbox"]',
                    sendButton: 'button[aria-label="Send message"]',
                    composeButton: 'button[aria-label="Start a new message"]'
                }
            }
        };
        
        this.init();
    }
    
    init() {
        this.loadSavedAccounts();
        this.setupDirectControlUI();
        this.bindDirectControlEvents();
        this.initializeBrowserAutomation();
    }
    
    // 載入已保存的帳號
    loadSavedAccounts() {
        const savedAccounts = localStorage.getItem('directAccounts');
        if (savedAccounts) {
            this.authenticatedAccounts = JSON.parse(savedAccounts);
        }
    }
    
    // 設置直接控制UI
    setupDirectControlUI() {
        const messageSection = document.querySelector('.message-section');
        if (!messageSection) return;
        
        // 添加直接帳號控制面板
        const directControlPanel = document.createElement('div');
        directControlPanel.className = 'direct-control-panel';
        directControlPanel.innerHTML = `
            <div class="direct-control-header">
                <h4>🔐 直接帳號控制</h4>
                <div class="control-status">
                    <span class="status-indicator" id="direct-status">未連接</span>
                </div>
            </div>
            
            <div class="account-management">
                <div class="account-section">
                    <h5>📱 X (Twitter) 帳號</h5>
                    <div class="account-inputs">
                        <input type="text" id="twitter-username" placeholder="X 用戶名或郵箱">
                        <input type="password" id="twitter-password" placeholder="X 密碼">
                        <button class="btn btn-primary" id="connect-twitter">連接 X 帳號</button>
                    </div>
                    <div class="account-status" id="twitter-status">未連接</div>
                </div>
                
                <div class="account-section">
                    <h5>💼 LinkedIn 帳號</h5>
                    <div class="account-inputs">
                        <input type="text" id="linkedin-username" placeholder="LinkedIn 郵箱">
                        <input type="password" id="linkedin-password" placeholder="LinkedIn 密碼">
                        <button class="btn btn-primary" id="connect-linkedin">連接 LinkedIn</button>
                    </div>
                    <div class="account-status" id="linkedin-status">未連接</div>
                </div>
            </div>
            
            <div class="direct-actions">
                <button class="btn btn-success" id="test-direct-sending">🧪 測試直接發送</button>
                <button class="btn btn-warning" id="disconnect-all">❌ 斷開所有連接</button>
            </div>
            
            <div class="direct-sending-options">
                <h5>📤 直接發送選項</h5>
                <div class="sending-options">
                    <label>
                        <input type="checkbox" id="enable-direct-sending" checked>
                        啟用直接帳號發送
                    </label>
                    <label>
                        <input type="checkbox" id="auto-login" checked>
                        自動登入
                    </label>
                    <label>
                        <input type="checkbox" id="save-session" checked>
                        保存登入狀態
                    </label>
                </div>
            </div>
        `;
        
        messageSection.insertBefore(directControlPanel, messageSection.firstChild);
    }
    
    // 綁定直接控制事件
    bindDirectControlEvents() {
        // 連接X帳號
        document.addEventListener('click', (e) => {
            if (e.target.id === 'connect-twitter') {
                this.connectAccount('twitter');
            }
        });
        
        // 連接LinkedIn帳號
        document.addEventListener('click', (e) => {
            if (e.target.id === 'connect-linkedin') {
                this.connectAccount('linkedin');
            }
        });
        
        // 測試直接發送
        document.addEventListener('click', (e) => {
            if (e.target.id === 'test-direct-sending') {
                this.testDirectSending();
            }
        });
        
        // 斷開所有連接
        document.addEventListener('click', (e) => {
            if (e.target.id === 'disconnect-all') {
                this.disconnectAllAccounts();
            }
        });
    }
    
    // 初始化瀏覽器自動化
    initializeBrowserAutomation() {
        // 檢查是否支援瀏覽器自動化
        if (typeof window.chrome !== 'undefined' && chrome.runtime) {
            this.setupChromeAutomation();
        } else {
            this.setupPuppeteerAutomation();
        }
    }
    
    // 設置Chrome自動化
    setupChromeAutomation() {
        this.browserAutomation = {
            type: 'chrome',
            async executeScript(tabId, script) {
                return new Promise((resolve, reject) => {
                    chrome.tabs.executeScript(tabId, { code: script }, (result) => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve(result[0]);
                        }
                    });
                });
            },
            
            async navigateTo(url) {
                return new Promise((resolve, reject) => {
                    chrome.tabs.create({ url }, (tab) => {
                        this.currentTab = tab;
                        resolve(tab);
                    });
                });
            }
        };
    }
    
    // 設置Puppeteer自動化（模擬）
    setupPuppeteerAutomation() {
        this.browserAutomation = {
            type: 'puppeteer',
            async executeScript(script) {
                // 模擬腳本執行
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({ success: true, result: '腳本執行成功' });
                    }, 1000);
                });
            },
            
            async navigateTo(url) {
                // 模擬頁面導航
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({ success: true, url });
                    }, 500);
                });
            }
        };
    }
    
    // 連接帳號
    async connectAccount(platform) {
        const username = document.getElementById(`${platform}-username`).value;
        const password = document.getElementById(`${platform}-password`).value;
        
        if (!username || !password) {
            this.showNotification('請輸入用戶名和密碼', 'error');
            return;
        }
        
        this.showProgress(`正在連接 ${platform} 帳號...`);
        
        try {
            const success = await this.performLogin(platform, username, password);
            
            if (success) {
                this.authenticatedAccounts[platform] = {
                    username,
                    password: this.encryptPassword(password),
                    connected: true,
                    lastLogin: new Date().toISOString()
                };
                
                this.saveAccounts();
                this.updateAccountStatus(platform, '已連接');
                this.showNotification(`${platform} 帳號連接成功！`, 'success');
            } else {
                this.showNotification(`${platform} 帳號連接失敗，請檢查用戶名和密碼`, 'error');
            }
        } catch (error) {
            this.showNotification(`連接失敗: ${error.message}`, 'error');
        } finally {
            this.hideProgress();
        }
    }
    
    // 執行登入
    async performLogin(platform, username, password) {
        const config = this.platformConfigs[platform];
        
        try {
            // 導航到登入頁面
            await this.browserAutomation.navigateTo(config.loginUrl);
            
            // 等待頁面載入
            await this.waitForElement(config.selectors.username);
            
            // 填寫用戶名
            await this.fillInput(config.selectors.username, username);
            
            // 填寫密碼
            await this.fillInput(config.selectors.password, password);
            
            // 點擊登入按鈕
            await this.clickElement(config.selectors.loginButton);
            
            // 等待登入完成
            await this.waitForLoginSuccess(platform);
            
            return true;
        } catch (error) {
            console.error(`登入失敗: ${error.message}`);
            return false;
        }
    }
    
    // 等待元素出現
    async waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkElement = () => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error(`等待元素超時: ${selector}`));
                } else {
                    setTimeout(checkElement, 100);
                }
            };
            
            checkElement();
        });
    }
    
    // 填寫輸入框
    async fillInput(selector, value) {
        const script = `
            const element = document.querySelector('${selector}');
            if (element) {
                element.value = '${value}';
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
                return true;
            }
            return false;
        `;
        
        return await this.browserAutomation.executeScript(script);
    }
    
    // 點擊元素
    async clickElement(selector) {
        const script = `
            const element = document.querySelector('${selector}');
            if (element) {
                element.click();
                return true;
            }
            return false;
        `;
        
        return await this.browserAutomation.executeScript(script);
    }
    
    // 等待登入成功
    async waitForLoginSuccess(platform) {
        const successIndicators = {
            twitter: 'div[data-testid="SideNav_NewTweet_Button"]',
            linkedin: 'button[aria-label="Start a new message"]'
        };
        
        return await this.waitForElement(successIndicators[platform]);
    }
    
    // 直接發送訊息
    async sendDirectMessage(platform, recipient, message) {
        if (!this.authenticatedAccounts[platform]?.connected) {
            throw new Error(`${platform} 帳號未連接`);
        }
        
        this.showProgress(`正在通過 ${platform} 發送訊息...`);
        
        try {
            const config = this.platformConfigs[platform];
            
            // 導航到訊息頁面
            await this.browserAutomation.navigateTo(config.dmUrl);
            
            // 等待頁面載入
            await this.waitForElement(config.selectors.newMessage);
            
            // 點擊新訊息按鈕
            await this.clickElement(config.selectors.newMessage);
            
            // 等待收件人輸入框
            await this.waitForElement(config.selectors.recipientInput);
            
            // 輸入收件人
            await this.fillInput(config.selectors.recipientInput, recipient);
            
            // 等待收件人選擇
            await this.waitForRecipientSelection(platform);
            
            // 輸入訊息
            await this.fillInput(config.selectors.messageInput, message);
            
            // 發送訊息
            await this.clickElement(config.selectors.sendButton);
            
            // 等待發送完成
            await this.waitForMessageSent(platform);
            
            this.showNotification(`訊息已通過 ${platform} 發送成功！`, 'success');
            return { success: true, platform, recipient, message };
            
        } catch (error) {
            this.showNotification(`發送失敗: ${error.message}`, 'error');
            return { success: false, error: error.message };
        } finally {
            this.hideProgress();
        }
    }
    
    // 等待收件人選擇
    async waitForRecipientSelection(platform) {
        const selectors = {
            twitter: 'div[data-testid="typeaheadResult"]',
            linkedin: 'li[role="option"]'
        };
        
        return await this.waitForElement(selectors[platform]);
    }
    
    // 等待訊息發送完成
    async waitForMessageSent(platform) {
        const selectors = {
            twitter: 'div[data-testid="messageSent"]',
            linkedin: 'div[data-testid="message-sent"]'
        };
        
        return await this.waitForElement(selectors[platform], 5000);
    }
    
    // 測試直接發送
    async testDirectSending() {
        const connectedPlatforms = Object.keys(this.authenticatedAccounts).filter(
            platform => this.authenticatedAccounts[platform].connected
        );
        
        if (connectedPlatforms.length === 0) {
            this.showNotification('請先連接至少一個帳號', 'warning');
            return;
        }
        
        this.showProgress('正在測試直接發送功能...');
        
        try {
            const testResults = [];
            
            for (const platform of connectedPlatforms) {
                const testMessage = `🧪 這是來自AI推銷助手的測試訊息\n\n時間: ${new Date().toLocaleString()}\n平台: ${platform}\n\n這是一條自動發送的測試訊息，用於驗證系統功能。`;
                
                const result = await this.sendDirectMessage(
                    platform,
                    'test_recipient',
                    testMessage
                );
                
                testResults.push({
                    platform,
                    success: result.success,
                    error: result.error
                });
            }
            
            this.displayTestResults(testResults);
            
        } catch (error) {
            this.showNotification(`測試失敗: ${error.message}`, 'error');
        } finally {
            this.hideProgress();
        }
    }
    
    // 顯示測試結果
    displayTestResults(results) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🧪 直接發送測試結果</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    ${results.map(result => `
                        <div class="test-result ${result.success ? 'success' : 'error'}">
                            <div class="platform-name">${result.platform}</div>
                            <div class="test-status">${result.success ? '✅ 成功' : '❌ 失敗'}</div>
                            ${result.error ? `<div class="error-message">${result.error}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // 綁定關閉事件
        modal.querySelector('.close').onclick = () => {
            document.body.removeChild(modal);
        };
    }
    
    // 斷開所有帳號
    disconnectAllAccounts() {
        this.authenticatedAccounts = {};
        this.saveAccounts();
        
        Object.keys(this.platformConfigs).forEach(platform => {
            this.updateAccountStatus(platform, '未連接');
        });
        
        this.showNotification('所有帳號已斷開連接', 'info');
    }
    
    // 更新帳號狀態
    updateAccountStatus(platform, status) {
        const statusElement = document.getElementById(`${platform}-status`);
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `account-status ${status === '已連接' ? 'connected' : 'disconnected'}`;
        }
    }
    
    // 加密密碼
    encryptPassword(password) {
        // 簡單的密碼加密（實際應用中應使用更安全的加密方法）
        return btoa(password);
    }
    
    // 解密密碼
    decryptPassword(encryptedPassword) {
        return atob(encryptedPassword);
    }
    
    // 保存帳號
    saveAccounts() {
        localStorage.setItem('directAccounts', JSON.stringify(this.authenticatedAccounts));
    }
    
    // 顯示進度
    showProgress(message) {
        const statusElement = document.getElementById('direct-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = 'status-indicator running';
        }
    }
    
    // 隱藏進度
    hideProgress() {
        const statusElement = document.getElementById('direct-status');
        if (statusElement) {
            statusElement.textContent = '就緒';
            statusElement.className = 'status-indicator ready';
        }
    }
    
    // 顯示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // 檢查是否有已連接的帳號
    hasConnectedAccounts() {
        return Object.values(this.authenticatedAccounts).some(account => account.connected);
    }
    
    // 獲取已連接的帳號
    getConnectedAccounts() {
        return Object.keys(this.authenticatedAccounts).filter(
            platform => this.authenticatedAccounts[platform].connected
        );
    }
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    window.directAccountControl = new DirectAccountControl();
}); 