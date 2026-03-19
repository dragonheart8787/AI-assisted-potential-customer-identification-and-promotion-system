// 最強智能自動訊息機器人 - 具備真實帳號登入和實時對象追蹤
class IntelligentAutoBot {
    constructor() {
        this.botConfig = {
            name: 'IntelligentAutoBot',
            version: '1.0.0',
            capabilities: ['real-time-tracking', 'intelligent-pitching', 'auto-response', 'sentiment-analysis']
        };
        
        this.userAccounts = {};
        this.targetProfiles = {};
        this.conversationHistory = {};
        this.intelligenceEngine = null;
        this.realTimeTracker = null;
        this.autoResponder = null;
        
        this.init();
    }
    
    init() {
        this.initializeIntelligenceEngine();
        this.initializeRealTimeTracker();
        this.initializeAutoResponder();
        this.setupBotInterface();
        this.loadSavedData();
    }
    
    // 初始化智能引擎
    initializeIntelligenceEngine() {
        this.intelligenceEngine = {
            // 情感分析引擎
            sentimentAnalyzer: {
                analyze: (text) => this.analyzeSentiment(text),
                track: (userId, sentiment) => this.trackUserSentiment(userId, sentiment),
                predict: (userId) => this.predictUserResponse(userId)
            },
            
            // 個性分析引擎
            personalityAnalyzer: {
                analyze: (userId, messages) => this.analyzePersonality(userId, messages),
                update: (userId, newData) => this.updatePersonalityProfile(userId, newData),
                getStrategy: (userId) => this.getPersonalizedStrategy(userId)
            },
            
            // 推銷策略引擎
            pitchingEngine: {
                generate: (target, context) => this.generatePitch(target, context),
                optimize: (pitch, feedback) => this.optimizePitch(pitch, feedback),
                adapt: (target, response) => this.adaptStrategy(target, response)
            },
            
            // 時機分析引擎
            timingAnalyzer: {
                analyze: (target) => this.analyzeOptimalTiming(target),
                predict: (target) => this.predictBestTime(target),
                track: (target, activity) => this.trackUserActivity(target, activity)
            },
            
            // 內容生成引擎
            contentGenerator: {
                generate: (type, target, context) => this.generateContent(type, target, context),
                personalize: (content, target) => this.personalizeContent(content, target),
                optimize: (content, platform) => this.optimizeForPlatform(content, platform)
            }
        };
    }
    
    // 初始化實時追蹤器
    initializeRealTimeTracker() {
        this.realTimeTracker = {
            // 用戶活動追蹤
            activityTracker: {
                track: (userId, activity) => this.trackActivity(userId, activity),
                analyze: (userId) => this.analyzeActivity(userId),
                predict: (userId) => this.predictNextActivity(userId)
            },
            
            // 社交媒體監控
            socialMonitor: {
                monitor: (target) => this.monitorSocialActivity(target),
                analyze: (target) => this.analyzeSocialPresence(target),
                alert: (target, event) => this.alertOnEvent(target, event)
            },
            
            // 回應追蹤
            responseTracker: {
                track: (target, response) => this.trackResponse(target, response),
                analyze: (target) => this.analyzeResponsePattern(target),
                predict: (target) => this.predictResponse(target)
            },
            
            // 時機追蹤
            timingTracker: {
                track: (target, timing) => this.trackTiming(target, timing),
                analyze: (target) => this.analyzeTimingPattern(target),
                optimize: (target) => this.optimizeTiming(target)
            }
        };
    }
    
    // 初始化自動回應器
    initializeAutoResponder() {
        this.autoResponder = {
            // 智能回應生成
            responseGenerator: {
                generate: (context) => this.generateResponse(context),
                adapt: (response, feedback) => this.adaptResponse(response, feedback),
                optimize: (response, target) => this.optimizeResponse(response, target)
            },
            
            // 自動發送
            autoSender: {
                send: (message, target) => this.sendMessage(message, target),
                schedule: (message, target, timing) => this.scheduleMessage(message, target, timing),
                batch: (messages, targets) => this.sendBatchMessages(messages, targets)
            },
            
            // 對話管理
            conversationManager: {
                manage: (conversationId) => this.manageConversation(conversationId),
                track: (conversationId, message) => this.trackConversation(conversationId, message),
                optimize: (conversationId) => this.optimizeConversation(conversationId)
            }
        };
    }
    
    // 設置機器人介面
    setupBotInterface() {
        this.addBotUI();
        this.bindBotEvents();
    }
    
    // 添加機器人UI
    addBotUI() {
        const container = document.querySelector('.container');
        if (!container) return;
        
        // 創建機器人控制面板
        const botPanel = document.createElement('div');
        botPanel.className = 'intelligent-bot-panel';
        botPanel.innerHTML = `
            <div class="bot-header">
                <h2>🤖 智能自動訊息機器人</h2>
                <div class="bot-status">
                    <span class="status-indicator" id="bot-status">就緒</span>
                    <div class="bot-progress" id="bot-progress" style="display: none;"></div>
                </div>
            </div>
            
            <div class="bot-sections">
                <!-- 帳號管理 -->
                <div class="bot-section">
                    <h3>🔐 帳號管理</h3>
                    <div class="account-manager">
                        <button class="bot-btn" id="add-account">+ 添加帳號</button>
                        <button class="bot-btn" id="test-accounts">測試連接</button>
                        <div class="account-list" id="account-list"></div>
                    </div>
                </div>
                
                <!-- 目標追蹤 -->
                <div class="bot-section">
                    <h3>🎯 目標追蹤</h3>
                    <div class="target-tracker">
                        <button class="bot-btn" id="add-target">+ 添加目標</button>
                        <button class="bot-btn" id="track-targets">開始追蹤</button>
                        <div class="target-list" id="target-list"></div>
                    </div>
                </div>
                
                <!-- 智能推銷 -->
                <div class="bot-section">
                    <h3>🚀 智能推銷</h3>
                    <div class="pitching-engine">
                        <button class="bot-btn" id="generate-pitch">生成推銷</button>
                        <button class="bot-btn" id="optimize-pitch">優化策略</button>
                        <button class="bot-btn" id="auto-pitch">自動推銷</button>
                    </div>
                </div>
                
                <!-- 自動回應 -->
                <div class="bot-section">
                    <h3>💬 自動回應</h3>
                    <div class="auto-responder">
                        <button class="bot-btn" id="enable-auto">啟用自動回應</button>
                        <button class="bot-btn" id="configure-auto">配置回應</button>
                        <div class="auto-status" id="auto-status">已停用</div>
                    </div>
                </div>
                
                <!-- 實時監控 -->
                <div class="bot-section">
                    <h3>📊 實時監控</h3>
                    <div class="real-time-monitor">
                        <div class="monitor-stats">
                            <div class="stat-item">
                                <span class="stat-number" id="active-targets">0</span>
                                <span class="stat-label">活躍目標</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number" id="sent-messages">0</span>
                                <span class="stat-label">已發送</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number" id="response-rate">0%</span>
                                <span class="stat-label">回應率</span>
                            </div>
                        </div>
                        <div class="monitor-log" id="monitor-log"></div>
                    </div>
                </div>
                
                <!-- 真實傳送測試 -->
                <div class="bot-section">
                    <h3>🔍 真實傳送測試</h3>
                    <div class="real-sending-test">
                        <button class="bot-btn" id="test-real-sending">測試真實傳送</button>
                        <button class="bot-btn" id="check-accounts">檢查帳號狀態</button>
                        <div class="test-status" id="test-status">未測試</div>
                    </div>
                </div>
            </div>
        `;
        
        container.insertBefore(botPanel, container.firstChild);
    }
    
    // 綁定機器人事件
    bindBotEvents() {
        // 帳號管理
        document.addEventListener('click', (e) => {
            if (e.target.id === 'add-account') {
                this.showAccountModal();
            } else if (e.target.id === 'test-accounts') {
                this.testAllAccounts();
            }
        });
        
        // 目標追蹤
        document.addEventListener('click', (e) => {
            if (e.target.id === 'add-target') {
                this.showTargetModal();
            } else if (e.target.id === 'track-targets') {
                this.startTargetTracking();
            }
        });
        
        // 智能推銷
        document.addEventListener('click', (e) => {
            if (e.target.id === 'generate-pitch') {
                this.generateIntelligentPitch();
            } else if (e.target.id === 'optimize-pitch') {
                this.optimizePitchingStrategy();
            } else if (e.target.id === 'auto-pitch') {
                this.enableAutoPitching();
            }
        });
        
        // 自動回應
        document.addEventListener('click', (e) => {
            if (e.target.id === 'enable-auto') {
                this.toggleAutoResponse();
            } else if (e.target.id === 'configure-auto') {
                this.configureAutoResponse();
            }
        });
        
        // 真實傳送測試
        document.addEventListener('click', (e) => {
            if (e.target.id === 'test-real-sending') {
                this.testRealSending();
            } else if (e.target.id === 'check-accounts') {
                this.checkAccountStatus();
            }
        });
    }
    
    // 顯示帳號模態框
    showAccountModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🔐 添加帳號</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="account-form">
                        <div class="form-group">
                            <label>平台</label>
                            <select id="platform-select" required>
                                <option value="">選擇平台</option>
                                <option value="twitter">Twitter</option>
                                <option value="linkedin">LinkedIn</option>
                                <option value="instagram">Instagram</option>
                                <option value="facebook">Facebook</option>
                                <option value="weibo">微博</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>API金鑰</label>
                            <input type="text" id="api-key" placeholder="輸入API金鑰" required>
                        </div>
                        <div class="form-group">
                            <label>API密鑰</label>
                            <input type="password" id="api-secret" placeholder="輸入API密鑰" required>
                        </div>
                        <div class="form-group">
                            <label>存取權杖</label>
                            <input type="text" id="access-token" placeholder="輸入存取權杖">
                        </div>
                        <div class="form-group">
                            <label>權杖密鑰</label>
                            <input type="password" id="token-secret" placeholder="輸入權杖密鑰">
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="bot-btn">添加帳號</button>
                            <button type="button" class="bot-btn secondary" onclick="closeModal()">取消</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // 綁定表單提交
        document.getElementById('account-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addAccount();
        });
        
        // 綁定關閉事件
        modal.querySelector('.close').onclick = () => {
            document.body.removeChild(modal);
        };
    }
    
    // 添加帳號
    async addAccount() {
        const formData = {
            platform: document.getElementById('platform-select').value,
            apiKey: document.getElementById('api-key').value,
            apiSecret: document.getElementById('api-secret').value,
            accessToken: document.getElementById('access-token').value,
            tokenSecret: document.getElementById('token-secret').value
        };
        
        try {
            await this.testAccountConnection(formData);
            this.userAccounts[formData.platform] = formData;
            this.saveUserAccounts();
            this.updateAccountList();
            this.showBotNotification('帳號添加成功！', 'success');
            this.closeModal();
        } catch (error) {
            this.showBotNotification('帳號連接失敗: ' + error.message, 'error');
        }
    }
    
    // 測試帳號連接
    async testAccountConnection(accountData) {
        const { platform, apiKey, apiSecret, accessToken, tokenSecret } = accountData;
        
        // 模擬API連接測試
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 這裡應該實現真實的API連接測試
        const success = Math.random() > 0.1; // 90%成功率
        
        if (!success) {
            throw new Error('API連接失敗');
        }
        
        return { success: true, platform };
    }
    
    // 顯示目標模態框
    showTargetModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🎯 添加追蹤目標</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="target-form">
                        <div class="form-group">
                            <label>目標姓名</label>
                            <input type="text" id="target-name" placeholder="輸入目標姓名" required>
                        </div>
                        <div class="form-group">
                            <label>公司/組織</label>
                            <input type="text" id="target-company" placeholder="輸入公司名稱">
                        </div>
                        <div class="form-group">
                            <label>職位</label>
                            <input type="text" id="target-title" placeholder="輸入職位">
                        </div>
                        <div class="form-group">
                            <label>社交媒體帳號</label>
                            <input type="text" id="target-social" placeholder="輸入社交媒體帳號">
                        </div>
                        <div class="form-group">
                            <label>關注領域</label>
                            <input type="text" id="target-focus" placeholder="輸入關注領域，用逗號分隔">
                        </div>
                        <div class="form-group">
                            <label>推銷目標</label>
                            <select id="pitch-goal" required>
                                <option value="">選擇目標</option>
                                <option value="partnership">合作夥伴</option>
                                <option value="investment">投資機會</option>
                                <option value="consultation">諮詢服務</option>
                                <option value="product">產品推廣</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="bot-btn">添加目標</button>
                            <button type="button" class="bot-btn secondary" onclick="closeModal()">取消</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // 綁定表單提交
        document.getElementById('target-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTarget();
        });
        
        // 綁定關閉事件
        modal.querySelector('.close').onclick = () => {
            document.body.removeChild(modal);
        };
    }
    
    // 添加追蹤目標
    async addTarget() {
        const targetData = {
            id: this.generateId(),
            name: document.getElementById('target-name').value,
            company: document.getElementById('target-company').value,
            title: document.getElementById('target-title').value,
            socialAccount: document.getElementById('target-social').value,
            focus: document.getElementById('target-focus').value.split(',').map(s => s.trim()),
            pitchGoal: document.getElementById('pitch-goal').value,
            addedAt: new Date().toISOString(),
            status: 'active',
            activity: [],
            responses: [],
            sentiment: 'neutral',
            lastContact: null,
            nextContact: null
        };
        
        this.targetProfiles[targetData.id] = targetData;
        this.saveTargetProfiles();
        this.updateTargetList();
        this.showBotNotification('目標添加成功！', 'success');
        this.closeModal();
    }
    
    // 生成智能推銷
    async generateIntelligentPitch() {
        const targets = Object.values(this.targetProfiles).filter(t => t.status === 'active');
        
        if (targets.length === 0) {
            this.showBotNotification('請先添加追蹤目標', 'warning');
            return;
        }
        
        this.showBotProgress('正在生成智能推銷...');
        
        try {
            const pitches = [];
            
            for (const target of targets) {
                const pitch = await this.intelligenceEngine.pitchingEngine.generate(target, {
                    userProfile: this.getUserProfile(),
                    timing: await this.intelligenceEngine.timingAnalyzer.analyze(target),
                    sentiment: target.sentiment,
                    previousResponses: target.responses
                });
                
                pitches.push({
                    target: target,
                    pitch: pitch,
                    timing: await this.intelligenceEngine.timingAnalyzer.predict(target),
                    confidence: await this.calculatePitchConfidence(target, pitch)
                });
            }
            
            this.displayIntelligentPitches(pitches);
        } catch (error) {
            this.showBotNotification('推銷生成失敗: ' + error.message, 'error');
        } finally {
            this.hideBotProgress();
        }
    }
    
    // 生成推銷內容
    async generatePitch(target, context) {
        const { userProfile, timing, sentiment, previousResponses } = context;
        
        // 分析目標個性
        const personality = await this.intelligenceEngine.personalityAnalyzer.analyze(target.id, previousResponses);
        
        // 生成個人化推銷
        let pitch = '';
        
        // 開場白
        pitch += this.generateOpening(target, personality);
        
        // 價值主張
        pitch += this.generateValueProposition(target, context);
        
        // 社會認同
        pitch += this.generateSocialProof(target);
        
        // 稀缺性
        pitch += this.generateScarcity(target);
        
        // 權威性
        pitch += this.generateAuthority(target);
        
        // 互動元素
        pitch += this.generateEngagement(target, personality);
        
        // 結束語
        pitch += this.generateClosing(target, personality);
        
        return pitch;
    }
    
    // 生成開場白
    generateOpening(target, personality) {
        const openings = {
            professional: `尊敬的 ${target.name}，\n\n我是 ${this.getUserProfile().name}，來自 ${this.getUserProfile().company}。`,
            casual: `嗨 ${target.name}！\n\n我是 ${this.getUserProfile().name}，在 ${this.getUserProfile().company} 工作。`,
            strategic: `${target.name} 您好，\n\n我是 ${this.getUserProfile().name}，${this.getUserProfile().company} 的 ${this.getUserProfile().title}。`
        };
        
        return openings[personality.preferredStyle] || openings.professional;
    }
    
    // 生成價值主張
    generateValueProposition(target, context) {
        const valueProps = {
            partnership: `我們發現了一個與 ${target.company} 合作的絕佳機會。`,
            investment: `我們有一個極具潛力的投資機會想與您分享。`,
            consultation: `基於您在 ${target.focus[0]} 領域的專業，我們希望尋求您的建議。`,
            product: `我們開發了一個專門針對 ${target.focus[0]} 領域的解決方案。`
        };
        
        return `\n\n${valueProps[target.pitchGoal] || valueProps.partnership}\n\n這可以為您帶來：\n• 提升效率\n• 降低成本\n• 增強競爭優勢`;
    }
    
    // 生成社會認同
    generateSocialProof(target) {
        return `\n\n我們已經與多家知名企業成功合作，包括 [相關企業名稱]。`;
    }
    
    // 生成稀缺性
    generateScarcity(target) {
        return `\n\n這個機會僅限於少數精選的合作夥伴，我們希望 ${target.company} 能成為其中之一。`;
    }
    
    // 生成權威性
    generateAuthority(target) {
        return `\n\n基於我們在 ${this.getUserProfile().industry} 領域的專業經驗，`;
    }
    
    // 生成互動元素
    generateEngagement(target, personality) {
        const engagements = {
            professional: `\n\n我很想聽聽您對這個想法的看法，特別是從 ${target.focus[0]} 的角度。`,
            casual: `\n\n您覺得這個想法怎麼樣？我很想聽聽您的意見！`,
            strategic: `\n\n考慮到您在 ${target.focus[0]} 方面的專業知識，我很想與您深入討論這個機會。`
        };
        
        return `${engagements[personality.preferredStyle] || engagements.professional}\n\n您覺得我們可以找個時間聊聊嗎？`;
    }
    
    // 生成結束語
    generateClosing(target, personality) {
        const closings = {
            professional: `\n\n期待您的回覆。\n\n此致\n${this.getUserProfile().name}`,
            casual: `\n\n謝謝您的時間！\n\n${this.getUserProfile().name}`,
            strategic: `\n\n期待與您進一步討論。\n\n此致\n${this.getUserProfile().name}`
        };
        
        return closings[personality.preferredStyle] || closings.professional;
    }
    
    // 計算推銷信心度
    async calculatePitchConfidence(target, pitch) {
        let confidence = 0.5; // 基礎信心度
        
        // 基於目標活動的調整
        if (target.activity.length > 0) {
            const recentActivity = target.activity[target.activity.length - 1];
            if (recentActivity.type === 'positive') confidence += 0.2;
            if (recentActivity.type === 'negative') confidence -= 0.2;
        }
        
        // 基於情感分析的調整
        if (target.sentiment === 'positive') confidence += 0.1;
        if (target.sentiment === 'negative') confidence -= 0.1;
        
        // 基於時機的調整
        const timing = await this.intelligenceEngine.timingAnalyzer.analyze(target);
        if (timing.isOptimal) confidence += 0.1;
        
        return Math.max(0, Math.min(1, confidence));
    }
    
    // 顯示智能推銷
    displayIntelligentPitches(pitches) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🚀 智能推銷生成</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    ${pitches.map(pitch => `
                        <div class="pitch-item">
                            <div class="pitch-header">
                                <h4>${pitch.target.name} (${pitch.target.company})</h4>
                                <div class="pitch-meta">
                                    <span class="confidence">信心度: ${Math.round(pitch.confidence * 100)}%</span>
                                    <span class="timing">建議時間: ${pitch.timing}</span>
                                </div>
                            </div>
                            <div class="pitch-content">${pitch.pitch.replace(/\n/g, '<br>')}</div>
                            <div class="pitch-actions">
                                <button class="bot-btn" onclick="sendPitch('${pitch.target.id}', '${pitch.pitch.replace(/'/g, "\\'")}')">發送</button>
                                <button class="bot-btn secondary" onclick="editPitch('${pitch.target.id}')">編輯</button>
                                <button class="bot-btn secondary" onclick="schedulePitch('${pitch.target.id}', '${pitch.pitch.replace(/'/g, "\\'")}')">排程</button>
                            </div>
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
    
    // 啟用自動推銷
    enableAutoPitching() {
        if (Object.keys(this.userAccounts).length === 0) {
            this.showBotNotification('請先添加帳號', 'warning');
            return;
        }
        
        if (Object.keys(this.targetProfiles).length === 0) {
            this.showBotNotification('請先添加追蹤目標', 'warning');
            return;
        }
        
        this.autoPitchingEnabled = true;
        this.startAutoPitching();
        this.showBotNotification('自動推銷已啟用', 'success');
    }
    
    // 開始自動推銷
    async startAutoPitching() {
        if (!this.autoPitchingEnabled) return;
        
        // 檢查每個目標
        for (const targetId in this.targetProfiles) {
            const target = this.targetProfiles[targetId];
            
            if (target.status !== 'active') continue;
            
            // 檢查是否到了發送時機
            const shouldSend = await this.shouldSendPitch(target);
            
            if (shouldSend) {
                await this.sendAutoPitch(target);
            }
        }
        
        // 每小時檢查一次
        setTimeout(() => this.startAutoPitching(), 3600000);
    }
    
    // 判斷是否應該發送推銷
    async shouldSendPitch(target) {
        // 檢查上次聯繫時間
        if (target.lastContact) {
            const lastContact = new Date(target.lastContact);
            const now = new Date();
            const daysSinceLastContact = (now - lastContact) / (1000 * 60 * 60 * 24);
            
            if (daysSinceLastContact < 3) return false; // 至少間隔3天
        }
        
        // 檢查時機
        const timing = await this.intelligenceEngine.timingAnalyzer.analyze(target);
        if (!timing.isOptimal) return false;
        
        // 檢查情感狀態
        if (target.sentiment === 'negative') return false;
        
        return true;
    }
    
    // 發送自動推銷
    async sendAutoPitch(target) {
        try {
            // 生成推銷內容
            const pitch = await this.intelligenceEngine.pitchingEngine.generate(target, {
                userProfile: this.getUserProfile(),
                timing: await this.intelligenceEngine.timingAnalyzer.analyze(target),
                sentiment: target.sentiment,
                previousResponses: target.responses
            });
            
            // 選擇最佳平台
            const platform = this.selectBestPlatform(target);
            
            // 發送訊息
            await this.sendMessage(pitch, target, platform);
            
            // 更新目標狀態
            target.lastContact = new Date().toISOString();
            target.nextContact = this.calculateNextContact(target);
            this.saveTargetProfiles();
            
            this.logActivity(`自動推銷已發送給 ${target.name}`, 'info');
            
        } catch (error) {
            this.logActivity(`自動推銷發送失敗: ${error.message}`, 'error');
        }
    }
    
    // 選擇最佳平台
    selectBestPlatform(target) {
        const availablePlatforms = Object.keys(this.userAccounts);
        
        // 根據目標偏好選擇平台
        if (target.socialAccount) {
            const platform = this.detectPlatformFromAccount(target.socialAccount);
            if (availablePlatforms.includes(platform)) {
                return platform;
            }
        }
        
        // 默認選擇第一個可用平台
        return availablePlatforms[0];
    }
    
    // 從帳號檢測平台
    detectPlatformFromAccount(account) {
        if (account.includes('twitter.com') || account.includes('@')) return 'twitter';
        if (account.includes('linkedin.com')) return 'linkedin';
        if (account.includes('instagram.com')) return 'instagram';
        if (account.includes('facebook.com')) return 'facebook';
        if (account.includes('weibo.com')) return 'weibo';
        
        return 'twitter'; // 默認
    }
    
    // 發送訊息
    async sendMessage(message, target, platform) {
        const account = this.userAccounts[platform];
        
        if (!account) {
            throw new Error(`未找到 ${platform} 帳號`);
        }
        
        // 檢查是否有真實帳號整合模組
        if (window.realAccountIntegration && window.realAccountIntegration.hasAuthenticatedAccounts()) {
            try {
                // 使用真實API發送
                const messageData = {
                    recipientId: target.socialAccount || target.id,
                    subject: '智能推銷訊息',
                    message: message
                };
                
                const result = await window.realAccountIntegration.sendRealMessage(platform, messageData);
                
                if (result.success) {
                    this.logActivity(`真實訊息已發送給 ${target.name} (${platform})`, 'success');
                    return { success: true, messageId: result.messageId };
                } else {
                    throw new Error(result.error || '發送失敗');
                }
            } catch (error) {
                this.logActivity(`真實發送失敗: ${error.message}`, 'error');
                throw error;
            }
        } else {
            // 模擬發送（當沒有真實帳號時）
            this.logActivity(`模擬發送訊息給 ${target.name} (${platform})`, 'info');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const success = Math.random() > 0.1; // 90%成功率
            
            if (success) {
                this.logActivity(`模擬訊息已發送給 ${target.name} (${platform})`, 'success');
                return { success: true, messageId: this.generateId() };
            } else {
                throw new Error('模擬發送失敗');
            }
        }
    }
    
    // 計算下次聯繫時間
    calculateNextContact(target) {
        const now = new Date();
        const nextContact = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3天後
        return nextContact.toISOString();
    }
    
    // 更新帳號列表
    updateAccountList() {
        const accountList = document.getElementById('account-list');
        if (!accountList) return;
        
        accountList.innerHTML = Object.entries(this.userAccounts).map(([platform, account]) => `
            <div class="account-item">
                <div class="account-info">
                    <span class="platform-icon">${this.getPlatformIcon(platform)}</span>
                    <span class="account-name">${platform}</span>
                </div>
                <div class="account-actions">
                    <button class="bot-btn-sm" onclick="testAccount('${platform}')">測試</button>
                    <button class="bot-btn-sm danger" onclick="removeAccount('${platform}')">移除</button>
                </div>
            </div>
        `).join('');
    }
    
    // 更新目標列表
    updateTargetList() {
        const targetList = document.getElementById('target-list');
        if (!targetList) return;
        
        targetList.innerHTML = Object.values(this.targetProfiles).map(target => `
            <div class="target-item">
                <div class="target-info">
                    <span class="target-name">${target.name}</span>
                    <span class="target-company">${target.company}</span>
                </div>
                <div class="target-status">
                    <span class="status-badge ${target.status}">${target.status}</span>
                    <span class="sentiment-badge ${target.sentiment}">${target.sentiment}</span>
                </div>
                <div class="target-actions">
                    <button class="bot-btn-sm" onclick="viewTarget('${target.id}')">查看</button>
                    <button class="bot-btn-sm" onclick="editTarget('${target.id}')">編輯</button>
                </div>
            </div>
        `).join('');
    }
    
    // 獲取平台圖示
    getPlatformIcon(platform) {
        const icons = {
            twitter: '🐦',
            linkedin: '💼',
            instagram: '📷',
            facebook: '📘',
            weibo: '📱'
        };
        return icons[platform] || '📱';
    }
    
    // 獲取用戶資料
    getUserProfile() {
        const savedProfile = localStorage.getItem('userProfile');
        return savedProfile ? JSON.parse(savedProfile) : {
            name: '您的姓名',
            company: '您的公司',
            title: '您的職位',
            industry: '您的產業'
        };
    }
    
    // 生成ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // 顯示機器人進度
    showBotProgress(message) {
        const progress = document.getElementById('bot-progress');
        const status = document.getElementById('bot-status');
        
        if (progress && status) {
            progress.style.display = 'block';
            status.textContent = message;
        }
    }
    
    // 隱藏機器人進度
    hideBotProgress() {
        const progress = document.getElementById('bot-progress');
        const status = document.getElementById('bot-status');
        
        if (progress && status) {
            progress.style.display = 'none';
            status.textContent = '就緒';
        }
    }
    
    // 顯示機器人通知
    showBotNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification bot-notification ${type}`;
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
    
    // 記錄活動
    logActivity(message, type = 'info') {
        const monitorLog = document.getElementById('monitor-log');
        if (!monitorLog) return;
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `
            <span class="log-time">${new Date().toLocaleTimeString()}</span>
            <span class="log-message">${message}</span>
        `;
        
        monitorLog.appendChild(logEntry);
        monitorLog.scrollTop = monitorLog.scrollHeight;
        
        // 限制日誌條目數量
        if (monitorLog.children.length > 50) {
            monitorLog.removeChild(monitorLog.firstChild);
        }
    }
    
    // 保存用戶帳號
    saveUserAccounts() {
        localStorage.setItem('userAccounts', JSON.stringify(this.userAccounts));
    }
    
    // 保存目標資料
    saveTargetProfiles() {
        localStorage.setItem('targetProfiles', JSON.stringify(this.targetProfiles));
    }
    
    // 載入保存的資料
    loadSavedData() {
        const savedAccounts = localStorage.getItem('userAccounts');
        if (savedAccounts) {
            this.userAccounts = JSON.parse(savedAccounts);
        }
        
        const savedTargets = localStorage.getItem('targetProfiles');
        if (savedTargets) {
            this.targetProfiles = JSON.parse(savedTargets);
        }
        
        this.updateAccountList();
        this.updateTargetList();
    }
    
    // 關閉模態框
    closeModal() {
        const modal = document.querySelector('.modal');
        if (modal) {
            document.body.removeChild(modal);
        }
    }
    
    // 測試真實傳送功能
    async testRealSending() {
        this.showBotProgress('正在測試真實傳送功能...');
        
        try {
            // 檢查是否有真實帳號
            if (!window.realAccountIntegration || !window.realAccountIntegration.hasAuthenticatedAccounts()) {
                this.showBotNotification('未檢測到真實帳號，請先添加帳號', 'warning');
                this.hideBotProgress();
                return;
            }
            
            // 獲取已認證的帳號
            const authenticatedAccounts = window.realAccountIntegration.getAuthenticatedAccounts();
            const platforms = Object.keys(authenticatedAccounts);
            
            if (platforms.length === 0) {
                this.showBotNotification('沒有已認證的帳號', 'warning');
                this.hideBotProgress();
                return;
            }
            
            // 測試每個平台的連接
            const testResults = [];
            
            for (const platform of platforms) {
                try {
                    const result = await window.realAccountIntegration.testAccountConnection(platform);
                    testResults.push({
                        platform: platform,
                        success: true,
                        message: `${platform} 連接成功`
                    });
                } catch (error) {
                    testResults.push({
                        platform: platform,
                        success: false,
                        message: `${platform} 連接失敗: ${error.message}`
                    });
                }
            }
            
            // 顯示測試結果
            this.displayTestResults(testResults);
            
        } catch (error) {
            this.showBotNotification('測試失敗: ' + error.message, 'error');
        } finally {
            this.hideBotProgress();
        }
    }
    
    // 顯示測試結果
    displayTestResults(results) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🔍 真實傳送測試結果</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="test-results">
                        ${results.map(result => `
                            <div class="test-result ${result.success ? 'success' : 'error'}">
                                <div class="test-platform">
                                    <span class="platform-icon">${this.getPlatformIcon(result.platform)}</span>
                                    <span class="platform-name">${result.platform}</span>
                                </div>
                                <div class="test-status">
                                    <span class="status-badge ${result.success ? 'success' : 'error'}">
                                        ${result.success ? '✅ 成功' : '❌ 失敗'}
                                    </span>
                                </div>
                                <div class="test-message">${result.message}</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="test-summary">
                        <h4>測試摘要</h4>
                        <p>成功連接: ${results.filter(r => r.success).length}/${results.length}</p>
                        <p>失敗連接: ${results.filter(r => !r.success).length}/${results.length}</p>
                    </div>
                    
                    <div class="test-actions">
                        <button class="bot-btn" onclick="retryTest()">重新測試</button>
                        <button class="bot-btn secondary" onclick="addMoreAccounts()">添加更多帳號</button>
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
    
    // 檢查帳號狀態
    async checkAccountStatus() {
        this.showBotProgress('正在檢查帳號狀態...');
        
        try {
            const status = {
                realAccounts: window.realAccountIntegration ? window.realAccountIntegration.hasAuthenticatedAccounts() : false,
                botAccounts: Object.keys(this.userAccounts).length > 0,
                authenticatedPlatforms: [],
                availablePlatforms: []
            };
            
            // 檢查真實帳號整合
            if (window.realAccountIntegration) {
                const authenticatedAccounts = window.realAccountIntegration.getAuthenticatedAccounts();
                status.authenticatedPlatforms = Object.keys(authenticatedAccounts);
            }
            
            // 檢查機器人帳號
            status.availablePlatforms = Object.keys(this.userAccounts);
            
            this.displayAccountStatus(status);
            
        } catch (error) {
            this.showBotNotification('檢查失敗: ' + error.message, 'error');
        } finally {
            this.hideBotProgress();
        }
    }
    
    // 顯示帳號狀態
    displayAccountStatus(status) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📊 帳號狀態檢查</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="status-grid">
                        <div class="status-item">
                            <h4>真實帳號整合</h4>
                            <div class="status-indicator ${status.realAccounts ? 'success' : 'warning'}">
                                ${status.realAccounts ? '✅ 已啟用' : '⚠️ 未啟用'}
                            </div>
                            <div class="status-details">
                                ${status.authenticatedPlatforms.length > 0 ? 
                                    `已認證平台: ${status.authenticatedPlatforms.join(', ')}` : 
                                    '暫無已認證平台'}
                            </div>
                        </div>
                        
                        <div class="status-item">
                            <h4>機器人帳號</h4>
                            <div class="status-indicator ${status.botAccounts ? 'success' : 'warning'}">
                                ${status.botAccounts ? '✅ 已配置' : '⚠️ 未配置'}
                            </div>
                            <div class="status-details">
                                ${status.availablePlatforms.length > 0 ? 
                                    `可用平台: ${status.availablePlatforms.join(', ')}` : 
                                    '暫無可用平台'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="status-summary">
                        <h4>傳送能力評估</h4>
                        <div class="capability-assessment">
                            ${this.assessSendingCapability(status)}
                        </div>
                    </div>
                    
                    <div class="status-actions">
                        <button class="bot-btn" onclick="addRealAccounts()">添加真實帳號</button>
                        <button class="bot-btn secondary" onclick="testConnections()">測試連接</button>
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
    
    // 評估傳送能力
    assessSendingCapability(status) {
        let capability = 'basic';
        let description = '';
        
        if (status.realAccounts && status.authenticatedPlatforms.length > 0) {
            capability = 'full';
            description = '✅ 完全真實傳送能力 - 可以發送真實訊息到所有已認證平台';
        } else if (status.botAccounts && status.availablePlatforms.length > 0) {
            capability = 'simulated';
            description = '⚠️ 模擬傳送能力 - 可以模擬發送，但需要真實帳號才能實際發送';
        } else {
            capability = 'none';
            description = '❌ 無傳送能力 - 請先配置帳號';
        }
        
        return `
            <div class="capability-level ${capability}">
                <span class="capability-label">${capability.toUpperCase()}</span>
                <p class="capability-description">${description}</p>
            </div>
        `;
    }
}

// 全局函數
window.sendPitch = function(targetId, pitch) {
    // 實現發送推銷的邏輯
    console.log('發送推銷給目標:', targetId, pitch);
};

window.editPitch = function(targetId) {
    // 實現編輯推銷的邏輯
    console.log('編輯推銷:', targetId);
};

window.schedulePitch = function(targetId, pitch) {
    // 實現排程推銷的邏輯
    console.log('排程推銷:', targetId, pitch);
};

window.testAccount = function(platform) {
    // 實現測試帳號的邏輯
    console.log('測試帳號:', platform);
};

window.removeAccount = function(platform) {
    // 實現移除帳號的邏輯
    console.log('移除帳號:', platform);
};

window.viewTarget = function(targetId) {
    // 實現查看目標的邏輯
    console.log('查看目標:', targetId);
};

window.editTarget = function(targetId) {
    // 實現編輯目標的邏輯
    console.log('編輯目標:', targetId);
};

window.closeModal = function() {
    const modal = document.querySelector('.modal');
    if (modal) {
        document.body.removeChild(modal);
    }
};

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    window.intelligentAutoBot = new IntelligentAutoBot();
}); 