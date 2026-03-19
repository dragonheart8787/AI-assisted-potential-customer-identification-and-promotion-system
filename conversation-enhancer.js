// 對話增強模組 - 提供智能對話功能和真實帳號整合
class ConversationEnhancer {
    constructor() {
        this.conversationHistory = [];
        this.currentContext = {};
        this.userProfile = null;
        this.authenticatedAccounts = {};
        this.conversationMode = 'professional'; // professional, casual, strategic
        
        this.init();
    }
    
    init() {
        this.loadUserProfile();
        this.loadAuthenticatedAccounts();
        this.setupConversationFeatures();
    }
    
    // 載入用戶資料
    loadUserProfile() {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            this.userProfile = JSON.parse(savedProfile);
        } else {
            this.userProfile = {
                name: '',
                company: '',
                title: '',
                industry: '',
                expertise: [],
                goals: [],
                contactInfo: {
                    email: '',
                    phone: '',
                    linkedin: '',
                    twitter: ''
                }
            };
        }
    }
    
    // 載入已認證的帳號
    loadAuthenticatedAccounts() {
        const savedAccounts = localStorage.getItem('authenticatedAccounts');
        if (savedAccounts) {
            this.authenticatedAccounts = JSON.parse(savedAccounts);
        }
    }
    
    // 設置對話功能
    setupConversationFeatures() {
        this.addConversationUI();
        this.bindConversationEvents();
    }
    
    // 添加對話UI
    addConversationUI() {
        const messageSection = document.querySelector('.message-section');
        if (!messageSection) return;
        
        // 添加對話模式選擇器
        const conversationModeSelector = document.createElement('div');
        conversationModeSelector.className = 'conversation-mode-selector';
        conversationModeSelector.innerHTML = `
            <h4>💬 對話模式</h4>
            <div class="mode-buttons">
                <button class="mode-btn active" data-mode="professional">專業模式</button>
                <button class="mode-btn" data-mode="casual">輕鬆模式</button>
                <button class="mode-btn" data-mode="strategic">策略模式</button>
            </div>
            <div class="conversation-tools">
                <button class="tool-btn" id="smart-suggestions">🤖 智能建議</button>
                <button class="tool-btn" id="context-analyzer">🔍 情境分析</button>
                <button class="tool-btn" id="response-generator">✨ 回應生成</button>
            </div>
        `;
        
        messageSection.insertBefore(conversationModeSelector, messageSection.firstChild);
        
        // 添加真實帳號管理
        const accountManager = document.createElement('div');
        accountManager.className = 'account-manager';
        accountManager.innerHTML = `
            <h4>🔐 帳號管理</h4>
            <div class="account-list" id="account-list">
                <!-- 動態生成帳號列表 -->
            </div>
            <button class="btn btn-secondary" id="add-account-btn">+ 添加帳號</button>
        `;
        
        messageSection.appendChild(accountManager);
        
        // 添加對話歷史
        const conversationHistory = document.createElement('div');
        conversationHistory.className = 'conversation-history';
        conversationHistory.innerHTML = `
            <h4>📝 對話歷史</h4>
            <div class="history-container" id="history-container">
                <!-- 動態生成對話歷史 -->
            </div>
        `;
        
        messageSection.appendChild(conversationHistory);
    }
    
    // 綁定對話事件
    bindConversationEvents() {
        // 對話模式切換
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('mode-btn')) {
                this.switchConversationMode(e.target.dataset.mode);
            }
        });
        
        // 智能建議
        document.addEventListener('click', (e) => {
            if (e.target.id === 'smart-suggestions') {
                this.generateSmartSuggestions();
            }
        });
        
        // 情境分析
        document.addEventListener('click', (e) => {
            if (e.target.id === 'context-analyzer') {
                this.analyzeContext();
            }
        });
        
        // 回應生成
        document.addEventListener('click', (e) => {
            if (e.target.id === 'response-generator') {
                this.generateResponse();
            }
        });
        
        // 添加帳號
        document.addEventListener('click', (e) => {
            if (e.target.id === 'add-account-btn') {
                this.showAccountModal();
            }
        });
    }
    
    // 切換對話模式
    switchConversationMode(mode) {
        this.conversationMode = mode;
        
        // 更新按鈕狀態
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        // 更新對話策略
        this.updateConversationStrategy(mode);
        
        // 顯示模式提示
        this.showModeNotification(mode);
    }
    
    // 更新對話策略
    updateConversationStrategy(mode) {
        const strategies = {
            professional: {
                tone: '正式專業',
                approach: '直接明確',
                focus: '商業價值',
                style: '結構化'
            },
            casual: {
                tone: '輕鬆友善',
                approach: '自然對話',
                focus: '個人連結',
                style: '自由流暢'
            },
            strategic: {
                tone: '策略導向',
                approach: '深度分析',
                focus: '長期關係',
                style: '系統化'
            }
        };
        
        this.currentContext.strategy = strategies[mode];
    }
    
    // 顯示模式通知
    showModeNotification(mode) {
        const notifications = {
            professional: '已切換到專業模式 - 適合正式商業溝通',
            casual: '已切換到輕鬆模式 - 適合建立個人關係',
            strategic: '已切換到策略模式 - 適合長期關係建立'
        };
        
        this.showNotification(notifications[mode], 'info');
    }
    
    // 生成智能建議
    generateSmartSuggestions() {
        const selectedLeaders = this.getSelectedLeaders();
        if (selectedLeaders.length === 0) {
            this.showNotification('請先選擇目標領袖', 'warning');
            return;
        }
        
        const suggestions = [];
        
        selectedLeaders.forEach(leader => {
            const leaderSuggestions = this.generateLeaderSuggestions(leader);
            suggestions.push(...leaderSuggestions);
        });
        
        this.displaySuggestions(suggestions);
    }
    
    // 為特定領袖生成建議
    generateLeaderSuggestions(leader) {
        const suggestions = [];
        
        // 基於領袖特色生成建議
        if (leader.focus.includes('AI')) {
            suggestions.push({
                type: '話題建議',
                content: `與${leader.name}討論AI技術的最新發展趨勢`,
                priority: 'high'
            });
        }
        
        if (leader.company === 'OpenAI') {
            suggestions.push({
                type: '切入點',
                content: `提及AI安全性和社會責任，這對${leader.name}很重要`,
                priority: 'high'
            });
        }
        
        // 基於對話模式生成建議
        if (this.conversationMode === 'professional') {
            suggestions.push({
                type: '專業建議',
                content: '使用具體數據和案例來支持您的觀點',
                priority: 'medium'
            });
        } else if (this.conversationMode === 'casual') {
            suggestions.push({
                type: '輕鬆建議',
                content: '分享個人經歷或有趣的故事來建立連結',
                priority: 'medium'
            });
        }
        
        return suggestions;
    }
    
    // 顯示建議
    displaySuggestions(suggestions) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🤖 智能建議</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="suggestions-list">
                        ${suggestions.map(suggestion => `
                            <div class="suggestion-item ${suggestion.priority}">
                                <div class="suggestion-type">${suggestion.type}</div>
                                <div class="suggestion-content">${suggestion.content}</div>
                            </div>
                        `).join('')}
                    </div>
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
    
    // 情境分析
    analyzeContext() {
        const selectedLeaders = this.getSelectedLeaders();
        const currentMessage = document.getElementById('message-content')?.value || '';
        
        if (selectedLeaders.length === 0) {
            this.showNotification('請先選擇目標領袖', 'warning');
            return;
        }
        
        const analysis = this.performContextAnalysis(selectedLeaders, currentMessage);
        this.displayContextAnalysis(analysis);
    }
    
    // 執行情境分析
    performContextAnalysis(leaders, message) {
        const analysis = {
            timing: this.analyzeTiming(),
            tone: this.analyzeTone(message),
            relevance: this.analyzeRelevance(leaders, message),
            risk: this.analyzeRisk(message),
            opportunities: this.identifyOpportunities(leaders, message)
        };
        
        return analysis;
    }
    
    // 分析時機
    analyzeTiming() {
        const now = new Date();
        const hour = now.getHours();
        
        let timing = {
            score: 0,
            recommendation: '',
            factors: []
        };
        
        // 分析最佳發送時間
        if (hour >= 9 && hour <= 11) {
            timing.score = 8;
            timing.recommendation = '上午時段，適合發送正式商業訊息';
            timing.factors.push('工作時間開始，注意力集中');
        } else if (hour >= 14 && hour <= 16) {
            timing.score = 7;
            timing.recommendation = '下午時段，適合跟進和討論';
            timing.factors.push('工作節奏穩定，適合深度溝通');
        } else if (hour >= 20 && hour <= 22) {
            timing.score = 6;
            timing.recommendation = '晚間時段，適合輕鬆對話';
            timing.factors.push('個人時間，適合建立關係');
        } else {
            timing.score = 4;
            timing.recommendation = '非最佳時段，建議延遲發送';
            timing.factors.push('可能不在線或注意力分散');
        }
        
        return timing;
    }
    
    // 分析語氣
    analyzeTone(message) {
        const tone = {
            score: 0,
            type: '',
            suggestions: []
        };
        
        // 簡單的語氣分析
        const formalWords = ['敬請', '感謝', '期待', '合作', '機會'];
        const casualWords = ['哈哈', '謝謝', '很棒', '有趣', '分享'];
        const urgentWords = ['緊急', '立即', '馬上', '迫切', '重要'];
        
        let formalCount = 0;
        let casualCount = 0;
        let urgentCount = 0;
        
        formalWords.forEach(word => {
            if (message.includes(word)) formalCount++;
        });
        
        casualWords.forEach(word => {
            if (message.includes(word)) casualCount++;
        });
        
        urgentWords.forEach(word => {
            if (message.includes(word)) urgentCount++;
        });
        
        if (formalCount > casualCount && formalCount > urgentCount) {
            tone.type = 'formal';
            tone.score = 8;
            tone.suggestions.push('語氣正式，適合專業溝通');
        } else if (casualCount > formalCount) {
            tone.type = 'casual';
            tone.score = 7;
            tone.suggestions.push('語氣輕鬆，適合建立關係');
        } else if (urgentCount > 0) {
            tone.type = 'urgent';
            tone.score = 5;
            tone.suggestions.push('語氣緊急，建議調整為更溫和的方式');
        } else {
            tone.type = 'neutral';
            tone.score = 6;
            tone.suggestions.push('語氣中性，可以根據目標調整');
        }
        
        return tone;
    }
    
    // 分析相關性
    analyzeRelevance(leaders, message) {
        const relevance = {
            score: 0,
            matches: [],
            suggestions: []
        };
        
        leaders.forEach(leader => {
            let matchScore = 0;
            const matches = [];
            
            leader.focus.forEach(focus => {
                if (message.toLowerCase().includes(focus.toLowerCase())) {
                    matchScore += 2;
                    matches.push(focus);
                }
            });
            
            if (matchScore > 0) {
                relevance.matches.push({
                    leader: leader.name,
                    score: matchScore,
                    topics: matches
                });
            }
        });
        
        relevance.score = relevance.matches.length > 0 ? 
            relevance.matches.reduce((sum, match) => sum + match.score, 0) / relevance.matches.length : 0;
        
        if (relevance.score >= 6) {
            relevance.suggestions.push('內容與目標領袖高度相關');
        } else if (relevance.score >= 3) {
            relevance.suggestions.push('內容相關性中等，建議加強個人化');
        } else {
            relevance.suggestions.push('內容相關性較低，建議重新調整');
        }
        
        return relevance;
    }
    
    // 分析風險
    analyzeRisk(message) {
        const risk = {
            score: 0,
            factors: [],
            suggestions: []
        };
        
        const riskWords = ['垃圾', '推銷', '廣告', '緊急', '立即購買', '限時'];
        const riskFactors = [];
        
        riskWords.forEach(word => {
            if (message.includes(word)) {
                riskFactors.push(`包含風險詞彙: ${word}`);
                risk.score += 2;
            }
        });
        
        if (message.length > 500) {
            riskFactors.push('訊息過長，可能被忽略');
            risk.score += 1;
        }
        
        if (message.includes('http') || message.includes('www')) {
            riskFactors.push('包含連結，可能被標記為垃圾訊息');
            risk.score += 1;
        }
        
        risk.factors = riskFactors;
        
        if (risk.score >= 5) {
            risk.suggestions.push('風險較高，建議重新編輯');
        } else if (risk.score >= 3) {
            risk.suggestions.push('中等風險，建議調整部分內容');
        } else {
            risk.suggestions.push('風險較低，可以發送');
        }
        
        return risk;
    }
    
    // 識別機會
    identifyOpportunities(leaders, message) {
        const opportunities = [];
        
        leaders.forEach(leader => {
            // 基於領袖特色識別機會
            if (leader.company === 'OpenAI' && message.includes('AI')) {
                opportunities.push({
                    type: '技術討論',
                    description: '可以深入討論AI技術發展',
                    leader: leader.name
                });
            }
            
            if (leader.focus.includes('創新') && message.includes('創新')) {
                opportunities.push({
                    type: '創新合作',
                    description: '可以討論創新合作機會',
                    leader: leader.name
                });
            }
        });
        
        return opportunities;
    }
    
    // 顯示情境分析
    displayContextAnalysis(analysis) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🔍 情境分析結果</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="analysis-section">
                        <h4>⏰ 時機分析 (${analysis.timing.score}/10)</h4>
                        <p>${analysis.timing.recommendation}</p>
                        <ul>${analysis.timing.factors.map(factor => `<li>${factor}</li>`).join('')}</ul>
                    </div>
                    
                    <div class="analysis-section">
                        <h4>🎭 語氣分析 (${analysis.tone.score}/10)</h4>
                        <p>${analysis.tone.suggestions.join(', ')}</p>
                    </div>
                    
                    <div class="analysis-section">
                        <h4>🎯 相關性分析 (${analysis.relevance.score.toFixed(1)}/10)</h4>
                        <p>${analysis.relevance.suggestions.join(', ')}</p>
                        ${analysis.relevance.matches.length > 0 ? `
                            <ul>${analysis.relevance.matches.map(match => 
                                `<li>${match.leader}: ${match.topics.join(', ')}</li>`
                            ).join('')}</ul>
                        ` : ''}
                    </div>
                    
                    <div class="analysis-section">
                        <h4>⚠️ 風險分析 (${analysis.risk.score}/10)</h4>
                        <p>${analysis.risk.suggestions.join(', ')}</p>
                        ${analysis.risk.factors.length > 0 ? `
                            <ul>${analysis.risk.factors.map(factor => `<li>${factor}</li>`).join('')}</ul>
                        ` : ''}
                    </div>
                    
                    ${analysis.opportunities.length > 0 ? `
                        <div class="analysis-section">
                            <h4>💡 機會識別</h4>
                            <ul>${analysis.opportunities.map(opp => 
                                `<li><strong>${opp.type}</strong> - ${opp.description} (${opp.leader})</li>`
                            ).join('')}</ul>
                        </div>
                    ` : ''}
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
    
    // 生成回應
    generateResponse() {
        const selectedLeaders = this.getSelectedLeaders();
        const currentMessage = document.getElementById('message-content')?.value || '';
        
        if (selectedLeaders.length === 0) {
            this.showNotification('請先選擇目標領袖', 'warning');
            return;
        }
        
        const responses = this.generateResponses(selectedLeaders, currentMessage);
        this.displayGeneratedResponses(responses);
    }
    
    // 生成回應內容
    generateResponses(leaders, originalMessage) {
        const responses = [];
        
        leaders.forEach(leader => {
            const response = this.generateLeaderResponse(leader, originalMessage);
            responses.push({
                leader: leader,
                response: response
            });
        });
        
        return responses;
    }
    
    // 為特定領袖生成回應
    generateLeaderResponse(leader, originalMessage) {
        let response = '';
        
        // 基於對話模式生成回應
        if (this.conversationMode === 'professional') {
            response = this.generateProfessionalResponse(leader, originalMessage);
        } else if (this.conversationMode === 'casual') {
            response = this.generateCasualResponse(leader, originalMessage);
        } else {
            response = this.generateStrategicResponse(leader, originalMessage);
        }
        
        return response;
    }
    
    // 生成專業回應
    generateProfessionalResponse(leader, originalMessage) {
        return `親愛的 ${leader.name}，

感謝您分享關於${this.extractMainTopic(originalMessage)}的見解。您的觀點非常有價值，特別是關於${leader.focus[0]}的部分。

基於您在${leader.company}的卓越成就，我想請教您對${this.extractMainTopic(originalMessage)}未來發展的看法。我們在${this.userProfile?.company || '我們公司'}也正在探索相關領域，希望能有機會向您學習。

期待您的回覆。

此致
${this.userProfile?.name || '您的姓名'}`;
    }
    
    // 生成輕鬆回應
    generateCasualResponse(leader, originalMessage) {
        return `嗨 ${leader.name}！

很棒的分享！我特別喜歡您提到的${this.extractMainTopic(originalMessage)}。在${leader.company}的工作一定很有趣吧？

我也對${leader.focus[0]}很感興趣，如果有機會的話，很想聽聽您的經驗分享。

保持聯繫！

${this.userProfile?.name || '您的姓名'}`;
    }
    
    // 生成策略回應
    generateStrategicResponse(leader, originalMessage) {
        return `${leader.name} 您好，

您關於${this.extractMainTopic(originalMessage)}的觀點很有啟發性。這讓我想到${leader.company}在${leader.focus[0]}領域的領先地位。

我們正在${this.userProfile?.company || '我們公司'}探索類似的機會，特別是在${this.extractMainTopic(originalMessage)}方面。考慮到${leader.company}的專業知識，我認為我們可能有很好的合作潛力。

您覺得我們可以找個時間深入討論這個話題嗎？

此致
${this.userProfile?.name || '您的姓名'}`;
    }
    
    // 提取主要話題
    extractMainTopic(message) {
        const topics = ['AI', '創新', '技術', '合作', '投資', '產品', '市場'];
        for (let topic of topics) {
            if (message.includes(topic)) {
                return topic;
            }
        }
        return '這個話題';
    }
    
    // 顯示生成的回應
    displayGeneratedResponses(responses) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>✨ 生成的回應</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    ${responses.map((item, index) => `
                        <div class="response-item">
                            <h4>${item.leader.name} 的回應</h4>
                            <textarea class="response-text" rows="8">${item.response}</textarea>
                            <button class="btn btn-primary" onclick="copyToClipboard('${index}')">複製</button>
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
        
        // 添加複製功能
        window.copyToClipboard = (index) => {
            const textarea = modal.querySelectorAll('.response-text')[index];
            textarea.select();
            document.execCommand('copy');
            this.showNotification('已複製到剪貼簿', 'success');
        };
    }
    
    // 顯示帳號管理模態框
    showAccountModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🔐 添加真實帳號</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="account-form">
                        <div class="form-group">
                            <label>平台</label>
                            <select name="platform" required>
                                <option value="">選擇平台</option>
                                <option value="twitter">X (Twitter)</option>
                                <option value="linkedin">LinkedIn</option>
                                <option value="instagram">Instagram</option>
                                <option value="facebook">Facebook</option>
                                <option value="weibo">微博</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>帳號名稱</label>
                            <input type="text" name="username" required>
                        </div>
                        <div class="form-group">
                            <label>API金鑰 (可選)</label>
                            <input type="password" name="apiKey">
                        </div>
                        <div class="form-group">
                            <label>API密鑰 (可選)</label>
                            <input type="password" name="apiSecret">
                        </div>
                        <div class="form-group">
                            <label>存取權杖 (可選)</label>
                            <input type="password" name="accessToken">
                        </div>
                        <button type="submit" class="btn btn-primary">添加帳號</button>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // 綁定表單提交
        modal.querySelector('#account-form').onsubmit = (e) => {
            e.preventDefault();
            this.addAccount(new FormData(e.target));
            document.body.removeChild(modal);
        };
        
        // 綁定關閉事件
        modal.querySelector('.close').onclick = () => {
            document.body.removeChild(modal);
        };
    }
    
    // 添加帳號
    addAccount(formData) {
        const account = {
            platform: formData.get('platform'),
            username: formData.get('username'),
            apiKey: formData.get('apiKey'),
            apiSecret: formData.get('apiSecret'),
            accessToken: formData.get('accessToken'),
            addedAt: new Date().toISOString()
        };
        
        this.authenticatedAccounts[account.platform] = account;
        this.saveAuthenticatedAccounts();
        this.updateAccountList();
        
        this.showNotification(`已添加 ${account.platform} 帳號`, 'success');
    }
    
    // 更新帳號列表
    updateAccountList() {
        const accountList = document.getElementById('account-list');
        if (!accountList) return;
        
        accountList.innerHTML = Object.entries(this.authenticatedAccounts).map(([platform, account]) => `
            <div class="account-item">
                <div class="account-info">
                    <span class="platform-icon">${this.getPlatformIcon(platform)}</span>
                    <span class="account-name">${account.username}</span>
                </div>
                <div class="account-actions">
                    <button class="btn btn-sm btn-secondary" onclick="testAccount('${platform}')">測試</button>
                    <button class="btn btn-sm btn-danger" onclick="removeAccount('${platform}')">移除</button>
                </div>
            </div>
        `).join('');
    }
    
    // 獲取平台圖示
    getPlatformIcon(platform) {
        const icons = {
            twitter: '🐦',
            linkedin: '💼',
            instagram: '📸',
            facebook: '📘',
            weibo: '🇨🇳'
        };
        return icons[platform] || '📱';
    }
    
    // 保存已認證帳號
    saveAuthenticatedAccounts() {
        localStorage.setItem('authenticatedAccounts', JSON.stringify(this.authenticatedAccounts));
    }
    
    // 獲取選中的領袖
    getSelectedLeaders() {
        const selectedCards = document.querySelectorAll('.leader-card.selected');
        return Array.from(selectedCards).map(card => {
            const leaderId = card.dataset.leaderId;
            return techLeaders[leaderId];
        }).filter(Boolean);
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
}

// 全局函數
window.testAccount = function(platform) {
    // 測試帳號連接
    console.log(`測試 ${platform} 帳號連接`);
    // 這裡可以添加實際的API測試邏輯
};

window.removeAccount = function(platform) {
    if (confirm(`確定要移除 ${platform} 帳號嗎？`)) {
        delete window.conversationEnhancer.authenticatedAccounts[platform];
        window.conversationEnhancer.saveAuthenticatedAccounts();
        window.conversationEnhancer.updateAccountList();
        window.conversationEnhancer.showNotification(`已移除 ${platform} 帳號`, 'success');
    }
};

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    window.conversationEnhancer = new ConversationEnhancer();
}); 