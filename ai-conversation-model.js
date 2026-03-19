// AI對話模型 - 完整的智能對話系統
class AIConversationModel {
    constructor() {
        this.conversationContext = {
            currentLeader: null,
            conversationHistory: [],
            userProfile: null,
            conversationMode: 'professional',
            currentTopic: null,
            emotionalState: 'neutral',
            engagementLevel: 0
        };
        
        this.aiPersonalities = {
            professional: {
                tone: 'formal',
                style: 'structured',
                vocabulary: 'business',
                responseLength: 'medium',
                emojiUsage: 'minimal'
            },
            casual: {
                tone: 'friendly',
                style: 'conversational',
                vocabulary: 'everyday',
                responseLength: 'short',
                emojiUsage: 'moderate'
            },
            strategic: {
                tone: 'analytical',
                style: 'systematic',
                vocabulary: 'technical',
                responseLength: 'long',
                emojiUsage: 'none'
            }
        };
        
        this.init();
    }
    
    init() {
        this.loadUserProfile();
        this.setupAIFeatures();
        this.initializeConversationEngine();
    }
    
    // 載入用戶資料
    loadUserProfile() {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            this.conversationContext.userProfile = JSON.parse(savedProfile);
        }
    }
    
    // 設置AI功能
    setupAIFeatures() {
        this.addAIConversationUI();
        this.bindAIEvents();
    }
    
    // 添加AI對話UI
    addAIConversationUI() {
        const messageSection = document.querySelector('.message-section');
        if (!messageSection) return;
        
        // 添加AI對話控制面板
        const aiControlPanel = document.createElement('div');
        aiControlPanel.className = 'ai-control-panel';
        aiControlPanel.innerHTML = `
            <h4>🤖 AI對話助手</h4>
            <div class="ai-features">
                <button class="ai-btn" id="ai-suggest">💡 AI建議</button>
                <button class="ai-btn" id="ai-generate">✨ AI生成</button>
                <button class="ai-btn" id="ai-analyze">🔍 AI分析</button>
                <button class="ai-btn" id="ai-optimize">⚡ AI優化</button>
            </div>
            <div class="ai-status">
                <span class="ai-indicator" id="ai-status">AI就緒</span>
                <div class="ai-progress" id="ai-progress" style="display: none;"></div>
            </div>
        `;
        
        messageSection.insertBefore(aiControlPanel, messageSection.firstChild);
        
        // 添加AI對話歷史
        const aiConversationHistory = document.createElement('div');
        aiConversationHistory.className = 'ai-conversation-history';
        aiConversationHistory.innerHTML = `
            <h4>🗣️ AI對話歷史</h4>
            <div class="ai-chat-container" id="ai-chat-container">
                <!-- AI對話內容 -->
            </div>
            <div class="ai-chat-input">
                <input type="text" id="ai-chat-input" placeholder="與AI對話...">
                <button id="ai-chat-send">發送</button>
            </div>
        `;
        
        messageSection.appendChild(aiConversationHistory);
    }
    
    // 綁定AI事件
    bindAIEvents() {
        // AI建議
        document.addEventListener('click', (e) => {
            if (e.target.id === 'ai-suggest') {
                this.generateAISuggestions();
            }
        });
        
        // AI生成
        document.addEventListener('click', (e) => {
            if (e.target.id === 'ai-generate') {
                this.generateAIContent();
            }
        });
        
        // AI分析
        document.addEventListener('click', (e) => {
            if (e.target.id === 'ai-analyze') {
                this.analyzeWithAI();
            }
        });
        
        // AI優化
        document.addEventListener('click', (e) => {
            if (e.target.id === 'ai-optimize') {
                this.optimizeWithAI();
            }
        });
        
        // AI聊天
        document.addEventListener('click', (e) => {
            if (e.target.id === 'ai-chat-send') {
                this.sendAIChat();
            }
        });
        
        // AI聊天輸入
        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'ai-chat-input' && e.key === 'Enter') {
                this.sendAIChat();
            }
        });
    }
    
    // 初始化對話引擎
    initializeConversationEngine() {
        this.conversationEngine = {
            nlp: {
                analyzeSentiment: this.analyzeSentiment.bind(this),
                extractKeywords: this.extractKeywords.bind(this),
                detectIntent: this.detectIntent.bind(this),
                generateResponse: this.generateResponse.bind(this)
            },
            contentGenerator: {
                generateGreeting: this.generateGreeting.bind(this),
                generateValueProposition: this.generateValueProposition.bind(this),
                generateEngagement: this.generateEngagement.bind(this),
                generateClosing: this.generateClosing.bind(this)
            },
            strategyEngine: {
                applyWIIFM: this.applyWIIFM.bind(this),
                applyGoldenMinute: this.applyGoldenMinute.bind(this),
                applyEmotionalTriggers: this.applyEmotionalTriggers.bind(this),
                optimizeForPlatform: this.optimizeForPlatform.bind(this)
            }
        };
    }
    
    // 生成AI建議
    async generateAISuggestions() {
        this.showAIProgress('正在生成AI建議...');
        
        const selectedLeaders = this.getSelectedLeaders();
        const currentContent = document.getElementById('message-content')?.value || '';
        
        if (selectedLeaders.length === 0) {
            this.showAINotification('請先選擇目標領袖', 'warning');
            this.hideAIProgress();
            return;
        }
        
        try {
            const suggestions = await this.generateComprehensiveSuggestions(selectedLeaders, currentContent);
            this.displayAISuggestions(suggestions);
        } catch (error) {
            this.showAINotification('AI建議生成失敗', 'error');
        } finally {
            this.hideAIProgress();
        }
    }
    
    // 生成綜合建議
    async generateComprehensiveSuggestions(leaders, currentContent) {
        const suggestions = {
            content: [],
            timing: [],
            approach: [],
            keywords: [],
            emotional: []
        };
        
        for (const leader of leaders) {
            // 內容建議
            const contentSuggestions = await this.generateContentSuggestions(leader, currentContent);
            suggestions.content.push(...contentSuggestions);
            
            // 時機建議
            const timingSuggestions = await this.generateTimingSuggestions(leader);
            suggestions.timing.push(...timingSuggestions);
            
            // 方法建議
            const approachSuggestions = await this.generateApproachSuggestions(leader);
            suggestions.approach.push(...approachSuggestions);
            
            // 關鍵詞建議
            const keywordSuggestions = await this.generateKeywordSuggestions(leader);
            suggestions.keywords.push(...keywordSuggestions);
            
            // 情感觸發建議
            const emotionalSuggestions = await this.generateEmotionalSuggestions(leader);
            suggestions.emotional.push(...emotionalSuggestions);
        }
        
        return suggestions;
    }
    
    // 生成內容建議
    async generateContentSuggestions(leader, currentContent) {
        const suggestions = [];
        
        // 基於領袖特色的建議
        if (leader.focus.includes('AI')) {
            suggestions.push({
                type: '內容建議',
                content: `提及${leader.name}在AI領域的成就，並分享相關的技術見解`,
                priority: 'high',
                leader: leader.name
            });
        }
        
        if (leader.company === 'OpenAI') {
            suggestions.push({
                type: '內容建議',
                content: '強調AI安全性和社會責任，這對OpenAI領導層很重要',
                priority: 'high',
                leader: leader.name
            });
        }
        
        return suggestions;
    }
    
    // 生成時機建議
    async generateTimingSuggestions(leader) {
        const suggestions = [];
        const now = new Date();
        const hour = now.getHours();
        
        // 基於時間的建議
        if (hour >= 9 && hour <= 11) {
            suggestions.push({
                type: '時機建議',
                content: '上午時段，適合發送正式商業訊息',
                priority: 'high',
                leader: leader.name
            });
        }
        
        return suggestions;
    }
    
    // 生成方法建議
    async generateApproachSuggestions(leader) {
        const suggestions = [];
        
        // 基於領袖風格的建議
        if (leader.messageStyle.includes('簡潔')) {
            suggestions.push({
                type: '方法建議',
                content: '使用簡潔直接的語言，避免冗長描述',
                priority: 'high',
                leader: leader.name
            });
        }
        
        return suggestions;
    }
    
    // 生成關鍵詞建議
    async generateKeywordSuggestions(leader) {
        const suggestions = [];
        
        // 基於領袖關注領域的關鍵詞
        leader.focus.forEach(focus => {
            suggestions.push({
                type: '關鍵詞建議',
                content: `使用與"${focus}"相關的專業術語`,
                priority: 'medium',
                leader: leader.name
            });
        });
        
        return suggestions;
    }
    
    // 生成情感觸發建議
    async generateEmotionalSuggestions(leader) {
        const suggestions = [];
        
        // 基於領袖特色的情感觸發
        if (leader.focus.includes('創新')) {
            suggestions.push({
                type: '情感觸發',
                content: '運用好奇心觸發，分享獨特的創新觀點',
                priority: 'high',
                leader: leader.name
            });
        }
        
        return suggestions;
    }
    
    // 顯示AI建議
    displayAISuggestions(suggestions) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🤖 AI智能建議</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="suggestions-tabs">
                        <button class="tab-btn active" data-tab="content">內容建議</button>
                        <button class="tab-btn" data-tab="timing">時機建議</button>
                        <button class="tab-btn" data-tab="approach">方法建議</button>
                        <button class="tab-btn" data-tab="keywords">關鍵詞建議</button>
                        <button class="tab-btn" data-tab="emotional">情感觸發</button>
                    </div>
                    
                    <div class="suggestions-content">
                        <div class="tab-content active" id="content-tab">
                            ${this.renderSuggestions(suggestions.content)}
                        </div>
                        <div class="tab-content" id="timing-tab">
                            ${this.renderSuggestions(suggestions.timing)}
                        </div>
                        <div class="tab-content" id="approach-tab">
                            ${this.renderSuggestions(suggestions.approach)}
                        </div>
                        <div class="tab-content" id="keywords-tab">
                            ${this.renderSuggestions(suggestions.keywords)}
                        </div>
                        <div class="tab-content" id="emotional-tab">
                            ${this.renderSuggestions(suggestions.emotional)}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // 綁定標籤切換
        modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                modal.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                e.target.classList.add('active');
                const tabId = e.target.dataset.tab + '-tab';
                modal.querySelector(`#${tabId}`).classList.add('active');
            });
        });
        
        // 綁定關閉事件
        modal.querySelector('.close').onclick = () => {
            document.body.removeChild(modal);
        };
    }
    
    // 渲染建議
    renderSuggestions(suggestions) {
        if (suggestions.length === 0) {
            return '<p class="no-suggestions">暫無建議</p>';
        }
        
        return suggestions.map(suggestion => `
            <div class="suggestion-item ${suggestion.priority}">
                <div class="suggestion-header">
                    <span class="suggestion-type">${suggestion.type}</span>
                    <span class="suggestion-priority">${suggestion.priority}</span>
                </div>
                <div class="suggestion-content">${suggestion.content}</div>
                ${suggestion.leader ? `<div class="suggestion-leader">適用於: ${suggestion.leader}</div>` : ''}
            </div>
        `).join('');
    }
    
    // 生成AI內容
    async generateAIContent() {
        this.showAIProgress('正在生成AI內容...');
        
        const selectedLeaders = this.getSelectedLeaders();
        const currentContent = document.getElementById('message-content')?.value || '';
        
        if (selectedLeaders.length === 0) {
            this.showAINotification('請先選擇目標領袖', 'warning');
            this.hideAIProgress();
            return;
        }
        
        try {
            const generatedContent = await this.generateComprehensiveContent(selectedLeaders, currentContent);
            this.displayGeneratedContent(generatedContent);
        } catch (error) {
            this.showAINotification('AI內容生成失敗', 'error');
        } finally {
            this.hideAIProgress();
        }
    }
    
    // 生成綜合內容
    async generateComprehensiveContent(leaders, currentContent) {
        const generatedContent = {
            greeting: [],
            valueProposition: [],
            engagement: [],
            closing: [],
            fullMessage: []
        };
        
        for (const leader of leaders) {
            // 生成問候語
            const greeting = await this.generateGreeting(leader);
            generatedContent.greeting.push({
                leader: leader.name,
                content: greeting
            });
            
            // 生成價值主張
            const valueProp = await this.generateValueProposition(leader);
            generatedContent.valueProposition.push({
                leader: leader.name,
                content: valueProp
            });
            
            // 生成互動內容
            const engagement = await this.generateEngagement(leader);
            generatedContent.engagement.push({
                leader: leader.name,
                content: engagement
            });
            
            // 生成結束語
            const closing = await this.generateClosing(leader);
            generatedContent.closing.push({
                leader: leader.name,
                content: closing
            });
            
            // 生成完整訊息
            const fullMessage = await this.generateFullMessage(leader);
            generatedContent.fullMessage.push({
                leader: leader.name,
                content: fullMessage
            });
        }
        
        return generatedContent;
    }
    
    // 生成問候語
    async generateGreeting(leader) {
        const mode = this.conversationContext.conversationMode;
        
        let greeting = '';
        
        if (mode === 'professional') {
            greeting = `尊敬的 ${leader.name}，\n\n我是 ${this.conversationContext.userProfile?.name || '您的姓名'}，來自 ${this.conversationContext.userProfile?.company || '我們公司'}。`;
        } else if (mode === 'casual') {
            greeting = `嗨 ${leader.name}！\n\n我是 ${this.conversationContext.userProfile?.name || '您的姓名'}，在 ${this.conversationContext.userProfile?.company || '我們公司'} 工作。`;
        } else {
            greeting = `${leader.name} 您好，\n\n我是 ${this.conversationContext.userProfile?.name || '您的姓名'}，${this.conversationContext.userProfile?.company || '我們公司'} 的 ${this.conversationContext.userProfile?.title || '職位'}。`;
        }
        
        // 添加個人化元素
        if (leader.focus.length > 0) {
            greeting += `\n\n我一直關注您在${leader.focus[0]}領域的卓越成就，`;
        }
        
        return greeting;
    }
    
    // 生成價值主張
    async generateValueProposition(leader) {
        const mode = this.conversationContext.conversationMode;
        
        let valueProp = '';
        
        if (mode === 'professional') {
            valueProp = `我們開發了一個創新的解決方案，專門針對${leader.focus[0]}領域的挑戰。`;
        } else if (mode === 'casual') {
            valueProp = `我們有個很酷的想法，可能對${leader.company}有幫助。`;
        } else {
            valueProp = `基於我們在${this.conversationContext.userProfile?.industry || '相關領域'}的研究，我們發現了一個重要的機會。`;
        }
        
        // 添加WIIFM元素
        valueProp += `\n\n這可以為${leader.company}帶來：\n• 提升效率\n• 降低成本\n• 增強競爭優勢`;
        
        return valueProp;
    }
    
    // 生成互動內容
    async generateEngagement(leader) {
        const mode = this.conversationContext.conversationMode;
        
        let engagement = '';
        
        if (mode === 'professional') {
            engagement = `我很想聽聽您對這個想法的看法，特別是從${leader.focus[0]}的角度。`;
        } else if (mode === 'casual') {
            engagement = `您覺得這個想法怎麼樣？我很想聽聽您的意見！`;
        } else {
            engagement = `考慮到您在${leader.focus[0]}方面的專業知識，我很想與您深入討論這個機會。`;
        }
        
        engagement += `\n\n您覺得我們可以找個時間聊聊嗎？`;
        
        return engagement;
    }
    
    // 生成結束語
    async generateClosing(leader) {
        const mode = this.conversationContext.conversationMode;
        
        let closing = '';
        
        if (mode === 'professional') {
            closing = `期待您的回覆。\n\n此致\n${this.conversationContext.userProfile?.name || '您的姓名'}`;
        } else if (mode === 'casual') {
            closing = `謝謝您的時間！\n\n${this.conversationContext.userProfile?.name || '您的姓名'}`;
        } else {
            closing = `期待與您進一步討論。\n\n此致\n${this.conversationContext.userProfile?.name || '您的姓名'}`;
        }
        
        return closing;
    }
    
    // 生成完整訊息
    async generateFullMessage(leader) {
        const greeting = await this.generateGreeting(leader);
        const valueProp = await this.generateValueProposition(leader);
        const engagement = await this.generateEngagement(leader);
        const closing = await this.generateClosing(leader);
        
        return `${greeting}\n\n${valueProp}\n\n${engagement}\n\n${closing}`;
    }
    
    // 顯示生成的內容
    displayGeneratedContent(content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>✨ AI生成內容</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="content-tabs">
                        <button class="tab-btn active" data-tab="greeting">問候語</button>
                        <button class="tab-btn" data-tab="value">價值主張</button>
                        <button class="tab-btn" data-tab="engagement">互動內容</button>
                        <button class="tab-btn" data-tab="closing">結束語</button>
                        <button class="tab-btn" data-tab="full">完整訊息</button>
                    </div>
                    
                    <div class="content-tabs-content">
                        <div class="tab-content active" id="greeting-tab">
                            ${this.renderGeneratedContent(content.greeting)}
                        </div>
                        <div class="tab-content" id="value-tab">
                            ${this.renderGeneratedContent(content.valueProposition)}
                        </div>
                        <div class="tab-content" id="engagement-tab">
                            ${this.renderGeneratedContent(content.engagement)}
                        </div>
                        <div class="tab-content" id="closing-tab">
                            ${this.renderGeneratedContent(content.closing)}
                        </div>
                        <div class="tab-content" id="full-tab">
                            ${this.renderGeneratedContent(content.fullMessage)}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // 綁定標籤切換
        modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                modal.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                e.target.classList.add('active');
                const tabId = e.target.dataset.tab + '-tab';
                modal.querySelector(`#${tabId}`).classList.add('active');
            });
        });
        
        // 綁定關閉事件
        modal.querySelector('.close').onclick = () => {
            document.body.removeChild(modal);
        };
    }
    
    // 渲染生成的內容
    renderGeneratedContent(contentArray) {
        if (contentArray.length === 0) {
            return '<p class="no-content">暫無內容</p>';
        }
        
        return contentArray.map(item => `
            <div class="generated-content-item">
                <div class="content-header">
                    <span class="content-leader">${item.leader}</span>
                    <button class="copy-btn" onclick="copyToClipboard('${item.content.replace(/'/g, "\\'")}')">複製</button>
                </div>
                <div class="content-text">${item.content.replace(/\n/g, '<br>')}</div>
            </div>
        `).join('');
    }
    
    // AI分析功能
    async analyzeWithAI() {
        this.showAIProgress('正在進行AI分析...');
        
        const selectedLeaders = this.getSelectedLeaders();
        const currentContent = document.getElementById('message-content')?.value || '';
        
        if (selectedLeaders.length === 0) {
            this.showAINotification('請先選擇目標領袖', 'warning');
            this.hideAIProgress();
            return;
        }
        
        try {
            const analysis = await this.performComprehensiveAnalysis(selectedLeaders, currentContent);
            this.displayAIAnalysis(analysis);
        } catch (error) {
            this.showAINotification('AI分析失敗', 'error');
        } finally {
            this.hideAIProgress();
        }
    }
    
    // 執行綜合分析
    async performComprehensiveAnalysis(leaders, content) {
        const analysis = {
            sentiment: await this.analyzeSentiment(content),
            keywords: await this.extractKeywords(content),
            intent: await this.detectIntent(content),
            relevance: await this.analyzeRelevance(leaders, content),
            optimization: await this.generateOptimizationSuggestions(leaders, content)
        };
        
        return analysis;
    }
    
    // 情感分析
    async analyzeSentiment(content) {
        if (!content) return { score: 0, type: 'neutral', suggestions: [] };
        
        const positiveWords = ['優秀', '卓越', '創新', '成功', '合作', '機會', '價值', '優勢'];
        const negativeWords = ['問題', '困難', '挑戰', '風險', '失敗', '損失', '競爭'];
        
        let positiveCount = 0;
        let negativeCount = 0;
        
        positiveWords.forEach(word => {
            if (content.includes(word)) positiveCount++;
        });
        
        negativeWords.forEach(word => {
            if (content.includes(word)) negativeCount++;
        });
        
        const score = positiveCount - negativeCount;
        let type = 'neutral';
        let suggestions = [];
        
        if (score > 2) {
            type = 'positive';
            suggestions.push('情感基調積極，適合建立正面關係');
        } else if (score < -2) {
            type = 'negative';
            suggestions.push('情感基調較為消極，建議調整用詞');
        } else {
            type = 'neutral';
            suggestions.push('情感基調中性，可以加強正面表達');
        }
        
        return { score, type, suggestions };
    }
    
    // 關鍵詞提取
    async extractKeywords(content) {
        if (!content) return [];
        
        const keywords = [];
        const commonKeywords = ['AI', '創新', '技術', '合作', '機會', '價值', '解決方案', '發展'];
        
        commonKeywords.forEach(keyword => {
            if (content.includes(keyword)) {
                keywords.push(keyword);
            }
        });
        
        return keywords;
    }
    
    // 意圖檢測
    async detectIntent(content) {
        if (!content) return { primary: 'unknown', confidence: 0 };
        
        const intents = {
            introduction: ['介紹', '認識', '了解'],
            proposal: ['提案', '建議', '合作'],
            inquiry: ['詢問', '請教', '了解'],
            invitation: ['邀請', '參加', '會議']
        };
        
        let maxScore = 0;
        let detectedIntent = 'unknown';
        
        Object.entries(intents).forEach(([intent, keywords]) => {
            let score = 0;
            keywords.forEach(keyword => {
                if (content.includes(keyword)) score++;
            });
            
            if (score > maxScore) {
                maxScore = score;
                detectedIntent = intent;
            }
        });
        
        return {
            primary: detectedIntent,
            confidence: maxScore / 3
        };
    }
    
    // 相關性分析
    async analyzeRelevance(leaders, content) {
        const relevance = [];
        
        leaders.forEach(leader => {
            let score = 0;
            const relevantTopics = leader.focus;
            
            relevantTopics.forEach(topic => {
                if (content.includes(topic)) score += 2;
            });
            
            if (leader.company && content.includes(leader.company)) {
                score += 1;
            }
            
            relevance.push({
                leader: leader.name,
                score: score,
                relevantTopics: relevantTopics.filter(topic => content.includes(topic)),
                suggestions: score > 3 ? ['內容與領袖高度相關'] : ['建議加強個人化內容']
            });
        });
        
        return relevance;
    }
    
    // 生成優化建議
    async generateOptimizationSuggestions(leaders, content) {
        const suggestions = [];
        
        // 長度優化
        if (content.length > 500) {
            suggestions.push('內容過長，建議精簡到300字以內');
        } else if (content.length < 100) {
            suggestions.push('內容較短，建議增加更多細節');
        }
        
        // 結構優化
        if (!content.includes('您好') && !content.includes('嗨')) {
            suggestions.push('建議添加適當的問候語');
        }
        
        if (!content.includes('期待') && !content.includes('謝謝')) {
            suggestions.push('建議添加適當的結束語');
        }
        
        // 個人化優化
        leaders.forEach(leader => {
            if (!content.includes(leader.name)) {
                suggestions.push(`建議提及${leader.name}的姓名`);
            }
            
            if (!content.includes(leader.company)) {
                suggestions.push(`建議提及${leader.company}的相關內容`);
            }
        });
        
        return suggestions;
    }
    
    // 顯示AI分析
    displayAIAnalysis(analysis) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🔍 AI分析結果</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="analysis-section">
                        <h4>情感分析</h4>
                        <div class="sentiment-result">
                            <span class="sentiment-score">${analysis.sentiment.score}</span>
                            <span class="sentiment-type ${analysis.sentiment.type}">${analysis.sentiment.type}</span>
                        </div>
                        <ul>${analysis.sentiment.suggestions.map(s => `<li>${s}</li>`).join('')}</ul>
                    </div>
                    
                    <div class="analysis-section">
                        <h4>關鍵詞</h4>
                        <div class="keywords-list">
                            ${analysis.keywords.map(kw => `<span class="keyword-tag">${kw}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="analysis-section">
                        <h4>意圖檢測</h4>
                        <div class="intent-result">
                            <span class="intent-type">${analysis.intent.primary}</span>
                            <span class="intent-confidence">${Math.round(analysis.intent.confidence * 100)}%</span>
                        </div>
                    </div>
                    
                    <div class="analysis-section">
                        <h4>相關性分析</h4>
                        ${analysis.relevance.map(r => `
                            <div class="relevance-item">
                                <div class="relevance-header">
                                    <span class="relevance-leader">${r.leader}</span>
                                    <span class="relevance-score">${r.score}/10</span>
                                </div>
                                <ul>${r.suggestions.map(s => `<li>${s}</li>`).join('')}</ul>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="analysis-section">
                        <h4>優化建議</h4>
                        <ul>${analysis.optimization.map(o => `<li>${o}</li>`).join('')}</ul>
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
    
    // AI優化功能
    async optimizeWithAI() {
        this.showAIProgress('正在進行AI優化...');
        
        const selectedLeaders = this.getSelectedLeaders();
        const currentContent = document.getElementById('message-content')?.value || '';
        
        if (selectedLeaders.length === 0) {
            this.showAINotification('請先選擇目標領袖', 'warning');
            this.hideAIProgress();
            return;
        }
        
        try {
            const optimizedContent = await this.performAIOptimization(selectedLeaders, currentContent);
            this.displayOptimizedContent(optimizedContent);
        } catch (error) {
            this.showAINotification('AI優化失敗', 'error');
        } finally {
            this.hideAIProgress();
        }
    }
    
    // 執行AI優化
    async performAIOptimization(leaders, content) {
        const optimizedContent = [];
        
        for (const leader of leaders) {
            const optimized = await this.optimizeContentForLeader(leader, content);
            optimizedContent.push({
                leader: leader.name,
                original: content,
                optimized: optimized
            });
        }
        
        return optimizedContent;
    }
    
    // 為特定領袖優化內容
    async optimizeContentForLeader(leader, content) {
        let optimized = content;
        
        // 添加個人化問候
        if (!optimized.includes(leader.name)) {
            optimized = `親愛的 ${leader.name}，\n\n${optimized}`;
        }
        
        // 添加相關性內容
        if (leader.focus.length > 0 && !optimized.includes(leader.focus[0])) {
            optimized += `\n\n我注意到您在${leader.focus[0]}領域的卓越成就，`;
        }
        
        // 添加WIIFM元素
        if (!optimized.includes('為您')) {
            optimized += `\n\n這可以為您和${leader.company}帶來：\n• 提升效率\n• 降低成本\n• 增強競爭優勢`;
        }
        
        // 添加互動元素
        if (!optimized.includes('您覺得')) {
            optimized += `\n\n您覺得這個想法怎麼樣？我很想聽聽您的意見。`;
        }
        
        // 添加結束語
        if (!optimized.includes('期待')) {
            optimized += `\n\n期待您的回覆！`;
        }
        
        return optimized;
    }
    
    // 顯示優化內容
    displayOptimizedContent(optimizedContent) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>⚡ AI優化內容</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    ${optimizedContent.map(item => `
                        <div class="optimized-content-item">
                            <h4>${item.leader}</h4>
                            <div class="content-comparison">
                                <div class="original-content">
                                    <h5>原始內容</h5>
                                    <div class="content-text">${item.original || '無內容'}</div>
                                </div>
                                <div class="optimized-content">
                                    <h5>優化內容</h5>
                                    <div class="content-text">${item.optimized}</div>
                                    <button class="apply-btn" onclick="applyOptimizedContent('${item.optimized.replace(/'/g, "\\'")}')">應用此內容</button>
                                </div>
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
    
    // 發送AI聊天
    async sendAIChat() {
        const input = document.getElementById('ai-chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // 添加用戶訊息到聊天歷史
        this.addChatMessage('user', message);
        input.value = '';
        
        // 生成AI回應
        this.showAIProgress('AI正在思考...');
        
        try {
            const response = await this.generateAIResponse(message);
            this.addChatMessage('ai', response);
        } catch (error) {
            this.addChatMessage('ai', '抱歉，我遇到了一些問題。請稍後再試。');
        } finally {
            this.hideAIProgress();
        }
    }
    
    // 生成AI回應
    async generateAIResponse(message) {
        // 檢測意圖
        const intent = await this.detectIntent(message);
        
        // 根據意圖生成回應
        switch (intent.primary) {
            case 'greeting':
                return this.generateGreetingResponse();
            case 'help':
                return this.generateHelpResponse();
            case 'suggestion':
                return this.generateSuggestionResponse();
            case 'optimization':
                return this.generateOptimizationResponse();
            default:
                return this.generateGeneralResponse(message);
        }
    }
    
    // 生成問候回應
    generateGreetingResponse() {
        return `您好！我是您的AI對話助手。我可以幫助您：\n\n• 生成智能建議\n• 分析訊息內容\n• 優化對話策略\n• 提供寫作建議\n\n有什麼我可以幫助您的嗎？`;
    }
    
    // 生成幫助回應
    generateHelpResponse() {
        return `我可以為您提供以下幫助：\n\n🤖 **AI建議**：基於目標領袖特色提供內容建議\n✨ **AI生成**：自動生成個人化訊息內容\n🔍 **AI分析**：分析訊息的情感、相關性和優化建議\n⚡ **AI優化**：自動優化訊息內容\n\n您想要使用哪個功能？`;
    }
    
    // 生成建議回應
    generateSuggestionResponse() {
        const selectedLeaders = this.getSelectedLeaders();
        
        if (selectedLeaders.length === 0) {
            return '請先選擇目標領袖，然後我可以為您提供針對性的建議。';
        }
        
        const leader = selectedLeaders[0];
        return `針對 ${leader.name}，我建議：\n\n• 提及 ${leader.focus[0]} 相關內容\n• 使用 ${leader.messageStyle} 的溝通風格\n• 在 ${leader.bestTime} 發送訊息\n• 強調與 ${leader.company} 的相關性`;
    }
    
    // 生成優化回應
    generateOptimizationResponse() {
        return `我可以幫您優化訊息內容：\n\n• 調整語氣和風格\n• 增加個人化元素\n• 優化結構和長度\n• 添加情感觸發點\n\n請先輸入您想要優化的內容。`;
    }
    
    // 生成一般回應
    generateGeneralResponse(message) {
        const responses = [
            '我理解您的需求，讓我為您提供一些建議。',
            '這是個很好的問題，讓我幫您分析一下。',
            '我建議您可以嘗試以下方法。',
            '讓我為您提供一些相關的建議。'
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // 添加聊天訊息
    addChatMessage(sender, message) {
        const chatContainer = document.getElementById('ai-chat-container');
        if (!chatContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-chat-message ${sender}`;
        messageDiv.innerHTML = `
            <div class="message-avatar">${sender === 'user' ? '👤' : '🤖'}</div>
            <div class="message-content">${message.replace(/\n/g, '<br>')}</div>
        `;
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // 保存到對話歷史
        this.conversationContext.conversationHistory.push({
            sender,
            message,
            timestamp: new Date().toISOString()
        });
    }
    
    // 獲取選中的領袖
    getSelectedLeaders() {
        const selectedCards = document.querySelectorAll('.leader-card.selected');
        return Array.from(selectedCards).map(card => {
            const leaderId = card.dataset.leaderId;
            return techLeaders[leaderId];
        }).filter(Boolean);
    }
    
    // 顯示AI進度
    showAIProgress(message) {
        const progress = document.getElementById('ai-progress');
        const status = document.getElementById('ai-status');
        
        if (progress && status) {
            progress.style.display = 'block';
            status.textContent = message;
        }
    }
    
    // 隱藏AI進度
    hideAIProgress() {
        const progress = document.getElementById('ai-progress');
        const status = document.getElementById('ai-status');
        
        if (progress && status) {
            progress.style.display = 'none';
            status.textContent = 'AI就緒';
        }
    }
    
    // 顯示AI通知
    showAINotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ai-notification ${type}`;
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
window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        // 顯示複製成功通知
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = '已複製到剪貼簿';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    });
};

window.applyOptimizedContent = function(content) {
    const messageContent = document.getElementById('message-content');
    if (messageContent) {
        messageContent.value = content;
    }
    
    // 關閉模態框
    const modal = document.querySelector('.modal');
    if (modal) {
        document.body.removeChild(modal);
    }
};

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    window.aiConversationModel = new AIConversationModel();
}); 