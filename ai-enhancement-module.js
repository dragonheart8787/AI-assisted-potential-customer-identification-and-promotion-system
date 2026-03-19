// AI強化模組 - 提供更高級的AI對話功能
class AIEnhancementModule {
    constructor() {
        this.advancedFeatures = {
            sentimentAnalysis: this.enhancedSentimentAnalysis.bind(this),
            contentOptimization: this.enhancedContentOptimization.bind(this),
            conversationFlow: this.enhancedConversationFlow.bind(this),
            personalityMatching: this.enhancedPersonalityMatching.bind(this),
            contextAwareness: this.enhancedContextAwareness.bind(this)
        };
        
        this.mlModels = {
            intentClassifier: this.createIntentClassifier(),
            emotionDetector: this.createEmotionDetector(),
            responseGenerator: this.createResponseGenerator()
        };
        
        this.init();
    }
    
    init() {
        this.setupAdvancedFeatures();
        this.initializeMLModels();
    }
    
    // 設置高級功能
    setupAdvancedFeatures() {
        this.addAdvancedAIUI();
        this.bindAdvancedEvents();
    }
    
    // 添加高級AI UI
    addAdvancedAIUI() {
        const aiControlPanel = document.querySelector('.ai-control-panel');
        if (!aiControlPanel) return;
        
        const advancedFeatures = document.createElement('div');
        advancedFeatures.className = 'advanced-ai-features';
        advancedFeatures.innerHTML = `
            <h5>🚀 高級AI功能</h5>
            <div class="advanced-ai-buttons">
                <button class="advanced-ai-btn" id="ai-sentiment">🎭 情感分析</button>
                <button class="advanced-ai-btn" id="ai-optimize">⚡ 智能優化</button>
                <button class="advanced-ai-btn" id="ai-flow">🔄 對話流程</button>
                <button class="advanced-ai-btn" id="ai-personality">👤 個性匹配</button>
                <button class="advanced-ai-btn" id="ai-context">🧠 情境感知</button>
            </div>
        `;
        
        aiControlPanel.appendChild(advancedFeatures);
    }
    
    // 綁定高級事件
    bindAdvancedEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'ai-sentiment') {
                this.performAdvancedSentimentAnalysis();
            } else if (e.target.id === 'ai-optimize') {
                this.performAdvancedOptimization();
            } else if (e.target.id === 'ai-flow') {
                this.generateConversationFlow();
            } else if (e.target.id === 'ai-personality') {
                this.matchPersonality();
            } else if (e.target.id === 'ai-context') {
                this.analyzeContext();
            }
        });
    }
    
    // 初始化ML模型
    initializeMLModels() {
        // 意圖分類器
        this.mlModels.intentClassifier = {
            patterns: {
                introduction: ['介紹', '認識', '了解', '初次'],
                proposal: ['提案', '建議', '合作', '機會'],
                inquiry: ['詢問', '請教', '了解', '問題'],
                invitation: ['邀請', '參加', '會議', '討論'],
                followup: ['跟進', '回覆', '更新', '進展']
            },
            classify: (text) => {
                let maxScore = 0;
                let detectedIntent = 'general';
                
                Object.entries(this.mlModels.intentClassifier.patterns).forEach(([intent, patterns]) => {
                    let score = 0;
                    patterns.forEach(pattern => {
                        if (text.includes(pattern)) score++;
                    });
                    if (score > maxScore) {
                        maxScore = score;
                        detectedIntent = intent;
                    }
                });
                
                return { intent: detectedIntent, confidence: maxScore / 3 };
            }
        };
        
        // 情感檢測器
        this.mlModels.emotionDetector = {
            emotions: {
                positive: ['優秀', '卓越', '創新', '成功', '合作', '機會', '價值', '優勢', '興奮', '期待'],
                negative: ['問題', '困難', '挑戰', '風險', '失敗', '損失', '競爭', '擔憂', '失望'],
                neutral: ['一般', '普通', '正常', '標準', '基本', '簡單']
            },
            detect: (text) => {
                let scores = { positive: 0, negative: 0, neutral: 0 };
                
                Object.entries(this.mlModels.emotionDetector.emotions).forEach(([emotion, words]) => {
                    words.forEach(word => {
                        if (text.includes(word)) scores[emotion]++;
                    });
                });
                
                const maxEmotion = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
                return { emotion: maxEmotion, scores };
            }
        };
        
        // 回應生成器
        this.mlModels.responseGenerator = {
            templates: {
                greeting: ['您好', '嗨', 'Hello', 'Hi'],
                professional: ['尊敬的', '敬愛的', '親愛的'],
                casual: ['嗨', '你好', 'Hello'],
                formal: ['此致', '敬禮', '謝謝', '感謝']
            },
            generate: (intent, emotion, context) => {
                // 根據意圖、情感和上下文生成回應
                let response = '';
                
                switch (intent) {
                    case 'introduction':
                        response = this.generateIntroductionResponse(emotion, context);
                        break;
                    case 'proposal':
                        response = this.generateProposalResponse(emotion, context);
                        break;
                    case 'inquiry':
                        response = this.generateInquiryResponse(emotion, context);
                        break;
                    default:
                        response = this.generateGeneralResponse(emotion, context);
                }
                
                return response;
            }
        };
    }
    
    // 創建意圖分類器
    createIntentClassifier() {
        return {
            classify: (text) => {
                const intents = {
                    introduction: ['介紹', '認識', '了解'],
                    proposal: ['提案', '建議', '合作'],
                    inquiry: ['詢問', '請教', '了解'],
                    invitation: ['邀請', '參加', '會議']
                };
                
                let maxScore = 0;
                let detectedIntent = 'general';
                
                Object.entries(intents).forEach(([intent, keywords]) => {
                    let score = 0;
                    keywords.forEach(keyword => {
                        if (text.includes(keyword)) score++;
                    });
                    if (score > maxScore) {
                        maxScore = score;
                        detectedIntent = intent;
                    }
                });
                
                return { intent: detectedIntent, confidence: maxScore / 3 };
            }
        };
    }
    
    // 創建情感檢測器
    createEmotionDetector() {
        return {
            detect: (text) => {
                const emotions = {
                    positive: ['優秀', '卓越', '創新', '成功'],
                    negative: ['問題', '困難', '挑戰', '風險'],
                    neutral: ['一般', '普通', '正常']
                };
                
                let scores = { positive: 0, negative: 0, neutral: 0 };
                
                Object.entries(emotions).forEach(([emotion, words]) => {
                    words.forEach(word => {
                        if (text.includes(word)) scores[emotion]++;
                    });
                });
                
                const maxEmotion = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
                return { emotion: maxEmotion, scores };
            }
        };
    }
    
    // 創建回應生成器
    createResponseGenerator() {
        return {
            generate: (intent, emotion, context) => {
                // 根據意圖和情感生成回應
                const responses = {
                    introduction: {
                        positive: '很高興認識您！我對您的專業領域很感興趣。',
                        negative: '我理解您的關注，讓我們一起探討解決方案。',
                        neutral: '很高興有機會與您交流。'
                    },
                    proposal: {
                        positive: '這個想法很有潛力，我很期待與您深入討論。',
                        negative: '我理解您的疑慮，讓我們一起完善這個提案。',
                        neutral: '謝謝您的提案，我會認真考慮。'
                    }
                };
                
                return responses[intent]?.[emotion] || '謝謝您的訊息，我會盡快回覆。';
            }
        };
    }
    
    // 高級情感分析
    async performAdvancedSentimentAnalysis() {
        const content = document.getElementById('message-content')?.value || '';
        if (!content) {
            this.showNotification('請先輸入內容進行分析', 'warning');
            return;
        }
        
        this.showProgress('正在進行高級情感分析...');
        
        try {
            const analysis = await this.advancedFeatures.sentimentAnalysis(content);
            this.displayAdvancedSentimentAnalysis(analysis);
        } catch (error) {
            this.showNotification('情感分析失敗', 'error');
        } finally {
            this.hideProgress();
        }
    }
    
    // 增強情感分析
    async enhancedSentimentAnalysis(content) {
        const basicAnalysis = await this.mlModels.emotionDetector.detect(content);
        const intentAnalysis = await this.mlModels.intentClassifier.classify(content);
        
        // 深度分析
        const detailedAnalysis = {
            emotion: basicAnalysis.emotion,
            emotionScores: basicAnalysis.scores,
            intent: intentAnalysis.intent,
            intentConfidence: intentAnalysis.confidence,
            tone: this.analyzeTone(content),
            urgency: this.analyzeUrgency(content),
            formality: this.analyzeFormality(content),
            suggestions: this.generateEmotionSuggestions(basicAnalysis, intentAnalysis)
        };
        
        return detailedAnalysis;
    }
    
    // 分析語氣
    analyzeTone(content) {
        const formalWords = ['尊敬的', '敬愛的', '此致', '敬禮'];
        const casualWords = ['嗨', '你好', 'Hello', 'Hi'];
        const professionalWords = ['專業', '技術', '方案', '策略'];
        
        let formalCount = 0, casualCount = 0, professionalCount = 0;
        
        formalWords.forEach(word => { if (content.includes(word)) formalCount++; });
        casualWords.forEach(word => { if (content.includes(word)) casualCount++; });
        professionalWords.forEach(word => { if (content.includes(word)) professionalCount++; });
        
        if (professionalCount > formalCount && professionalCount > casualCount) return 'professional';
        if (formalCount > casualCount) return 'formal';
        return 'casual';
    }
    
    // 分析緊急程度
    analyzeUrgency(content) {
        const urgentWords = ['緊急', '立即', '馬上', '盡快', '重要'];
        let urgencyScore = 0;
        
        urgentWords.forEach(word => {
            if (content.includes(word)) urgencyScore++;
        });
        
        if (urgencyScore >= 3) return 'high';
        if (urgencyScore >= 1) return 'medium';
        return 'low';
    }
    
    // 分析正式程度
    analyzeFormality(content) {
        const formalIndicators = ['尊敬的', '敬愛的', '此致', '敬禮', '謝謝'];
        const casualIndicators = ['嗨', '你好', 'Hello', 'Hi', '拜拜'];
        
        let formalScore = 0, casualScore = 0;
        
        formalIndicators.forEach(word => { if (content.includes(word)) formalScore++; });
        casualIndicators.forEach(word => { if (content.includes(word)) casualScore++; });
        
        if (formalScore > casualScore) return 'formal';
        if (casualScore > formalScore) return 'casual';
        return 'neutral';
    }
    
    // 生成情感建議
    generateEmotionSuggestions(emotionAnalysis, intentAnalysis) {
        const suggestions = [];
        
        if (emotionAnalysis.emotion === 'negative') {
            suggestions.push('建議調整用詞，增加正面表達');
            suggestions.push('可以添加一些積極的詞彙');
        }
        
        if (intentAnalysis.confidence < 0.5) {
            suggestions.push('意圖不夠明確，建議更清楚地表達目的');
        }
        
        return suggestions;
    }
    
    // 顯示高級情感分析結果
    displayAdvancedSentimentAnalysis(analysis) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🎭 高級情感分析</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="analysis-grid">
                        <div class="analysis-item">
                            <h4>情感分析</h4>
                            <div class="emotion-display">
                                <span class="emotion-label ${analysis.emotion}">${analysis.emotion}</span>
                                <div class="emotion-scores">
                                    ${Object.entries(analysis.emotionScores).map(([emotion, score]) => 
                                        `<div class="score-item">
                                            <span class="score-label">${emotion}</span>
                                            <div class="score-bar">
                                                <div class="score-fill" style="width: ${(score / 3) * 100}%"></div>
                                            </div>
                                            <span class="score-value">${score}</span>
                                        </div>`
                                    ).join('')}
                                </div>
                            </div>
                        </div>
                        
                        <div class="analysis-item">
                            <h4>意圖分析</h4>
                            <div class="intent-display">
                                <span class="intent-label">${analysis.intent}</span>
                                <div class="confidence-bar">
                                    <div class="confidence-fill" style="width: ${analysis.intentConfidence * 100}%"></div>
                                </div>
                                <span class="confidence-value">${Math.round(analysis.intentConfidence * 100)}%</span>
                            </div>
                        </div>
                        
                        <div class="analysis-item">
                            <h4>語氣分析</h4>
                            <div class="tone-display">
                                <span class="tone-label ${analysis.tone}">${analysis.tone}</span>
                                <span class="urgency-label ${analysis.urgency}">緊急程度: ${analysis.urgency}</span>
                                <span class="formality-label ${analysis.formality}">正式程度: ${analysis.formality}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="suggestions-section">
                        <h4>優化建議</h4>
                        <ul>
                            ${analysis.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                        </ul>
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
    
    // 高級優化功能
    async performAdvancedOptimization() {
        const content = document.getElementById('message-content')?.value || '';
        if (!content) {
            this.showNotification('請先輸入內容進行優化', 'warning');
            return;
        }
        
        this.showProgress('正在進行高級優化...');
        
        try {
            const optimization = await this.advancedFeatures.contentOptimization(content);
            this.displayAdvancedOptimization(optimization);
        } catch (error) {
            this.showNotification('優化失敗', 'error');
        } finally {
            this.hideProgress();
        }
    }
    
    // 增強內容優化
    async enhancedContentOptimization(content) {
        const analysis = await this.mlModels.emotionDetector.detect(content);
        const intent = await this.mlModels.intentClassifier.classify(content);
        
        const optimization = {
            original: content,
            optimized: this.optimizeContent(content, analysis, intent),
            improvements: this.generateImprovements(content, analysis, intent),
            readability: this.analyzeReadability(content),
            impact: this.analyzeImpact(content)
        };
        
        return optimization;
    }
    
    // 優化內容
    optimizeContent(content, emotionAnalysis, intentAnalysis) {
        let optimized = content;
        
        // 根據情感分析優化
        if (emotionAnalysis.emotion === 'negative') {
            optimized = this.convertNegativeToPositive(optimized);
        }
        
        // 根據意圖優化
        if (intentAnalysis.intent === 'proposal') {
            optimized = this.enhanceProposal(optimized);
        }
        
        // 改善可讀性
        optimized = this.improveReadability(optimized);
        
        return optimized;
    }
    
    // 轉換負面為正面
    convertNegativeToPositive(content) {
        const negativeToPositive = {
            '問題': '挑戰',
            '困難': '機會',
            '風險': '潛力',
            '失敗': '學習',
            '損失': '投資'
        };
        
        let optimized = content;
        Object.entries(negativeToPositive).forEach(([negative, positive]) => {
            optimized = optimized.replace(new RegExp(negative, 'g'), positive);
        });
        
        return optimized;
    }
    
    // 增強提案
    enhanceProposal(content) {
        if (!content.includes('價值') && !content.includes('利益')) {
            content += '\n\n這個方案可以為您帶來：\n• 提升效率\n• 降低成本\n• 增強競爭優勢';
        }
        
        if (!content.includes('期待') && !content.includes('回覆')) {
            content += '\n\n期待您的回覆！';
        }
        
        return content;
    }
    
    // 改善可讀性
    improveReadability(content) {
        // 添加段落分隔
        content = content.replace(/\n\n/g, '\n\n');
        
        // 確保適當的標點符號
        if (!content.endsWith('。') && !content.endsWith('！') && !content.endsWith('？')) {
            content += '。';
        }
        
        return content;
    }
    
    // 生成改進建議
    generateImprovements(content, emotionAnalysis, intentAnalysis) {
        const improvements = [];
        
        if (content.length < 50) {
            improvements.push('內容較短，建議增加更多細節');
        }
        
        if (content.length > 500) {
            improvements.push('內容較長，建議精簡重點');
        }
        
        if (emotionAnalysis.emotion === 'negative') {
            improvements.push('建議使用更積極的表達方式');
        }
        
        if (intentAnalysis.confidence < 0.5) {
            improvements.push('建議更清楚地表達主要意圖');
        }
        
        return improvements;
    }
    
    // 分析可讀性
    analyzeReadability(content) {
        const sentences = content.split(/[。！？]/).length;
        const words = content.length;
        const avgSentenceLength = words / sentences;
        
        if (avgSentenceLength < 20) return 'excellent';
        if (avgSentenceLength < 30) return 'good';
        if (avgSentenceLength < 40) return 'fair';
        return 'poor';
    }
    
    // 分析影響力
    analyzeImpact(content) {
        const impactWords = ['創新', '突破', '革命', '顛覆', '領先', '卓越'];
        let impactScore = 0;
        
        impactWords.forEach(word => {
            if (content.includes(word)) impactScore++;
        });
        
        if (impactScore >= 3) return 'high';
        if (impactScore >= 1) return 'medium';
        return 'low';
    }
    
    // 顯示高級優化結果
    displayAdvancedOptimization(optimization) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>⚡ 高級內容優化</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="optimization-comparison">
                        <div class="original-section">
                            <h4>原始內容</h4>
                            <div class="content-display">${optimization.original}</div>
                            <div class="metrics">
                                <span class="metric">可讀性: ${optimization.readability}</span>
                                <span class="metric">影響力: ${optimization.impact}</span>
                            </div>
                        </div>
                        
                        <div class="optimized-section">
                            <h4>優化內容</h4>
                            <div class="content-display">${optimization.optimized}</div>
                            <button class="apply-optimization-btn" onclick="applyOptimizedContent('${optimization.optimized.replace(/'/g, "\\'")}')">應用優化</button>
                        </div>
                    </div>
                    
                    <div class="improvements-section">
                        <h4>改進建議</h4>
                        <ul>
                            ${optimization.improvements.map(improvement => `<li>${improvement}</li>`).join('')}
                        </ul>
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
    
    // 生成對話流程
    async generateConversationFlow() {
        const selectedLeaders = this.getSelectedLeaders();
        if (selectedLeaders.length === 0) {
            this.showNotification('請先選擇目標領袖', 'warning');
            return;
        }
        
        this.showProgress('正在生成對話流程...');
        
        try {
            const flow = await this.advancedFeatures.conversationFlow(selectedLeaders);
            this.displayConversationFlow(flow);
        } catch (error) {
            this.showNotification('對話流程生成失敗', 'error');
        } finally {
            this.hideProgress();
        }
    }
    
    // 增強對話流程
    async enhancedConversationFlow(leaders) {
        const flow = {
            stages: [],
            timeline: [],
            strategies: []
        };
        
        for (const leader of leaders) {
            const leaderFlow = await this.generateLeaderFlow(leader);
            flow.stages.push(leaderFlow);
        }
        
        flow.timeline = this.generateTimeline(flow.stages);
        flow.strategies = this.generateStrategies(flow.stages);
        
        return flow;
    }
    
    // 生成領袖對話流程
    async generateLeaderFlow(leader) {
        return {
            leader: leader.name,
            stages: [
                {
                    stage: 'initial_contact',
                    timing: 'immediate',
                    content: await this.generateInitialContact(leader),
                    strategy: '建立第一印象'
                },
                {
                    stage: 'value_proposition',
                    timing: 'within_24h',
                    content: await this.generateValueProposition(leader),
                    strategy: '展示價值'
                },
                {
                    stage: 'engagement',
                    timing: 'within_48h',
                    content: await this.generateEngagement(leader),
                    strategy: '深度互動'
                },
                {
                    stage: 'follow_up',
                    timing: 'within_week',
                    content: await this.generateFollowUp(leader),
                    strategy: '關係維護'
                }
            ]
        };
    }
    
    // 生成初始接觸
    async generateInitialContact(leader) {
        return `尊敬的 ${leader.name}，\n\n我是 [您的姓名]，來自 [您的公司]。\n\n我一直關注您在${leader.focus[0]}領域的卓越成就，希望有機會與您交流。`;
    }
    
    // 生成價值主張
    async generateValueProposition(leader) {
        return `基於您在${leader.focus[0]}方面的專業，我相信我們的想法對${leader.company}有重要價值。\n\n這可以為您帶來：\n• 提升效率\n• 降低成本\n• 增強競爭優勢`;
    }
    
    // 生成互動內容
    async generateEngagement(leader) {
        return `我很想聽聽您對這個想法的看法，特別是從${leader.focus[0]}的角度。\n\n您覺得我們可以找個時間深入討論嗎？`;
    }
    
    // 生成跟進內容
    async generateFollowUp(leader) {
        return `感謝您之前的回覆。\n\n我想跟進一下我們討論的內容，看看是否有新的進展或想法可以分享。`;
    }
    
    // 生成時間線
    generateTimeline(stages) {
        return [
            { day: 0, action: '發送初始訊息', leaders: stages.map(s => s.leader) },
            { day: 1, action: '發送價值主張', leaders: stages.map(s => s.leader) },
            { day: 3, action: '發送互動內容', leaders: stages.map(s => s.leader) },
            { day: 7, action: '發送跟進內容', leaders: stages.map(s => s.leader) }
        ];
    }
    
    // 生成策略
    generateStrategies(stages) {
        return [
            '建立第一印象 - 簡潔專業的初始接觸',
            '展示價值 - 明確的利益和解決方案',
            '深度互動 - 引發思考和討論',
            '關係維護 - 持續的價值提供'
        ];
    }
    
    // 顯示對話流程
    displayConversationFlow(flow) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🔄 對話流程規劃</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="flow-tabs">
                        <button class="tab-btn active" data-tab="stages">階段流程</button>
                        <button class="tab-btn" data-tab="timeline">時間線</button>
                        <button class="tab-btn" data-tab="strategies">策略</button>
                    </div>
                    
                    <div class="flow-content">
                        <div class="tab-content active" id="stages-tab">
                            ${this.renderStages(flow.stages)}
                        </div>
                        <div class="tab-content" id="timeline-tab">
                            ${this.renderTimeline(flow.timeline)}
                        </div>
                        <div class="tab-content" id="strategies-tab">
                            ${this.renderStrategies(flow.strategies)}
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
    
    // 渲染階段
    renderStages(stages) {
        return stages.map(stage => `
            <div class="stage-item">
                <h4>${stage.leader}</h4>
                ${stage.stages.map(s => `
                    <div class="stage-step">
                        <div class="step-header">
                            <span class="step-name">${s.stage}</span>
                            <span class="step-timing">${s.timing}</span>
                        </div>
                        <div class="step-content">${s.content}</div>
                        <div class="step-strategy">策略: ${s.strategy}</div>
                    </div>
                `).join('')}
            </div>
        `).join('');
    }
    
    // 渲染時間線
    renderTimeline(timeline) {
        return timeline.map(item => `
            <div class="timeline-item">
                <div class="timeline-day">第 ${item.day} 天</div>
                <div class="timeline-action">${item.action}</div>
                <div class="timeline-leaders">${item.leaders.join(', ')}</div>
            </div>
        `).join('');
    }
    
    // 渲染策略
    renderStrategies(strategies) {
        return strategies.map(strategy => `
            <div class="strategy-item">
                <div class="strategy-content">${strategy}</div>
            </div>
        `).join('');
    }
    
    // 個性匹配
    async matchPersonality() {
        const selectedLeaders = this.getSelectedLeaders();
        if (selectedLeaders.length === 0) {
            this.showNotification('請先選擇目標領袖', 'warning');
            return;
        }
        
        this.showProgress('正在進行個性匹配...');
        
        try {
            const matches = await this.advancedFeatures.personalityMatching(selectedLeaders);
            this.displayPersonalityMatches(matches);
        } catch (error) {
            this.showNotification('個性匹配失敗', 'error');
        } finally {
            this.hideProgress();
        }
    }
    
    // 增強個性匹配
    async enhancedPersonalityMatching(leaders) {
        const matches = [];
        
        for (const leader of leaders) {
            const personality = this.analyzeLeaderPersonality(leader);
            const communicationStyle = this.determineCommunicationStyle(personality);
            const approach = this.generatePersonalizedApproach(leader, personality);
            
            matches.push({
                leader: leader.name,
                personality: personality,
                communicationStyle: communicationStyle,
                approach: approach
            });
        }
        
        return matches;
    }
    
    // 分析領袖個性
    analyzeLeaderPersonality(leader) {
        const personality = {
            type: 'analytical',
            traits: [],
            preferences: []
        };
        
        // 基於公司分析
        if (leader.company === 'OpenAI') {
            personality.type = 'innovative';
            personality.traits = ['創新', '前瞻', '技術導向'];
            personality.preferences = ['技術細節', '創新概念', '社會影響'];
        } else if (leader.company === 'Google') {
            personality.type = 'data_driven';
            personality.traits = ['數據導向', '系統性', '實用主義'];
            personality.preferences = ['數據支持', '實用價值', '可擴展性'];
        } else if (leader.company === 'Tesla') {
            personality.type = 'visionary';
            personality.traits = ['願景導向', '大膽', '變革'];
            personality.preferences = ['願景', '影響力', '變革潛力'];
        }
        
        return personality;
    }
    
    // 確定溝通風格
    determineCommunicationStyle(personality) {
        const styles = {
            analytical: {
                tone: '專業',
                structure: '邏輯性',
                detail: '高',
                pace: '穩健'
            },
            innovative: {
                tone: '激勵',
                structure: '創意性',
                detail: '中等',
                pace: '快速'
            },
            data_driven: {
                tone: '客觀',
                structure: '系統性',
                detail: '高',
                pace: '謹慎'
            },
            visionary: {
                tone: '激勵',
                structure: '願景性',
                detail: '中等',
                pace: '快速'
            }
        };
        
        return styles[personality.type] || styles.analytical;
    }
    
    // 生成個人化方法
    generatePersonalizedApproach(leader, personality) {
        const approaches = {
            analytical: {
                opening: '基於數據分析',
                value: '邏輯清晰的價值主張',
                engagement: '深度技術討論',
                closing: '具體的下一步行動'
            },
            innovative: {
                opening: '分享創新概念',
                value: '突破性的解決方案',
                engagement: '創意激發討論',
                closing: '合作機會探索'
            },
            data_driven: {
                opening: '提供數據支持',
                value: '可量化的效益',
                engagement: '系統性分析',
                closing: '實用性評估'
            },
            visionary: {
                opening: '分享願景',
                value: '變革性影響',
                engagement: '願景討論',
                closing: '合作願景'
            }
        };
        
        return approaches[personality.type] || approaches.analytical;
    }
    
    // 顯示個性匹配結果
    displayPersonalityMatches(matches) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>👤 個性匹配分析</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    ${matches.map(match => `
                        <div class="personality-match">
                            <h4>${match.leader}</h4>
                            <div class="personality-grid">
                                <div class="personality-item">
                                    <h5>個性類型</h5>
                                    <span class="personality-type">${match.personality.type}</span>
                                    <div class="personality-traits">
                                        ${match.personality.traits.map(trait => `<span class="trait-tag">${trait}</span>`).join('')}
                                    </div>
                                </div>
                                
                                <div class="personality-item">
                                    <h5>溝通風格</h5>
                                    <div class="communication-style">
                                        <div>語氣: ${match.communicationStyle.tone}</div>
                                        <div>結構: ${match.communicationStyle.structure}</div>
                                        <div>細節: ${match.communicationStyle.detail}</div>
                                        <div>節奏: ${match.communicationStyle.pace}</div>
                                    </div>
                                </div>
                                
                                <div class="personality-item">
                                    <h5>建議方法</h5>
                                    <div class="approach-suggestions">
                                        <div>開場: ${match.approach.opening}</div>
                                        <div>價值: ${match.approach.value}</div>
                                        <div>互動: ${match.approach.engagement}</div>
                                        <div>結尾: ${match.approach.closing}</div>
                                    </div>
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
    
    // 情境感知分析
    async analyzeContext() {
        const selectedLeaders = this.getSelectedLeaders();
        if (selectedLeaders.length === 0) {
            this.showNotification('請先選擇目標領袖', 'warning');
            return;
        }
        
        this.showProgress('正在進行情境感知分析...');
        
        try {
            const context = await this.advancedFeatures.contextAwareness(selectedLeaders);
            this.displayContextAnalysis(context);
        } catch (error) {
            this.showNotification('情境分析失敗', 'error');
        } finally {
            this.hideProgress();
        }
    }
    
    // 增強情境感知
    async enhancedContextAwareness(leaders) {
        const context = {
            timing: this.analyzeOptimalTiming(),
            platform: this.analyzePlatformContext(),
            industry: this.analyzeIndustryContext(),
            personal: this.analyzePersonalContext(leaders),
            external: this.analyzeExternalContext()
        };
        
        return context;
    }
    
    // 分析最佳時機
    analyzeOptimalTiming() {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();
        
        let timing = {
            current: 'suboptimal',
            recommendation: '',
            reasoning: ''
        };
        
        if (hour >= 9 && hour <= 11) {
            timing.current = 'optimal';
            timing.recommendation = '立即發送';
            timing.reasoning = '上午時段，適合正式商業溝通';
        } else if (hour >= 14 && hour <= 16) {
            timing.current = 'good';
            timing.recommendation = '下午發送';
            timing.reasoning = '下午時段，適合跟進和深度討論';
        } else {
            timing.current = 'suboptimal';
            timing.recommendation = '明天上午發送';
            timing.reasoning = '當前時段不適合發送商業訊息';
        }
        
        return timing;
    }
    
    // 分析平台情境
    analyzePlatformContext() {
        return {
            twitter: {
                characterLimit: 280,
                bestPractices: ['簡潔', '使用標籤', '互動性'],
                recommendations: ['保持簡潔', '使用相關標籤', '鼓勵互動']
            },
            linkedin: {
                characterLimit: 3000,
                bestPractices: ['專業', '詳細', '價值導向'],
                recommendations: ['保持專業', '提供詳細資訊', '強調價值']
            },
            instagram: {
                characterLimit: 2200,
                bestPractices: ['視覺', '故事性', '個人化'],
                recommendations: ['使用視覺元素', '講述故事', '個人化內容']
            }
        };
    }
    
    // 分析產業情境
    analyzeIndustryContext() {
        return {
            ai: {
                trends: ['AI安全', '可解釋性', '社會責任'],
                keywords: ['創新', '技術', '未來'],
                concerns: ['倫理', '隱私', '就業影響']
            },
            tech: {
                trends: ['數位化', '雲端', '物聯網'],
                keywords: ['效率', '創新', '轉型'],
                concerns: ['競爭', '成本', '技術債務']
            }
        };
    }
    
    // 分析個人情境
    analyzePersonalContext(leaders) {
        const personal = {};
        
        leaders.forEach(leader => {
            personal[leader.name] = {
                focus: leader.focus,
                company: leader.company,
                bestTime: leader.bestTime,
                messageStyle: leader.messageStyle,
                recentActivity: this.getRecentActivity(leader)
            };
        });
        
        return personal;
    }
    
    // 獲取最近活動
    getRecentActivity(leader) {
        // 模擬獲取最近活動
        const activities = [
            '最近發布了關於AI的演講',
            '參與了技術會議',
            '發表了行業觀點',
            '公司發布了新產品'
        ];
        
        return activities[Math.floor(Math.random() * activities.length)];
    }
    
    // 分析外部情境
    analyzeExternalContext() {
        return {
            market: 'AI市場快速發展',
            competition: '競爭激烈',
            opportunities: '新技術帶來機會',
            challenges: '人才短缺'
        };
    }
    
    // 顯示情境分析
    displayContextAnalysis(context) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🧠 情境感知分析</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="context-grid">
                        <div class="context-item">
                            <h4>⏰ 時機分析</h4>
                            <div class="timing-analysis">
                                <span class="timing-status ${context.timing.current}">${context.timing.current}</span>
                                <div class="timing-recommendation">${context.timing.recommendation}</div>
                                <div class="timing-reasoning">${context.timing.reasoning}</div>
                            </div>
                        </div>
                        
                        <div class="context-item">
                            <h4>📱 平台情境</h4>
                            <div class="platform-context">
                                ${Object.entries(context.platform).map(([platform, info]) => `
                                    <div class="platform-info">
                                        <h5>${platform}</h5>
                                        <div>字數限制: ${info.characterLimit}</div>
                                        <div>建議: ${info.recommendations.join(', ')}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="context-item">
                            <h4>🏭 產業情境</h4>
                            <div class="industry-context">
                                ${Object.entries(context.industry).map(([industry, info]) => `
                                    <div class="industry-info">
                                        <h5>${industry}</h5>
                                        <div>趨勢: ${info.trends.join(', ')}</div>
                                        <div>關鍵詞: ${info.keywords.join(', ')}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="context-item">
                            <h4>👤 個人情境</h4>
                            <div class="personal-context">
                                ${Object.entries(context.personal).map(([name, info]) => `
                                    <div class="personal-info">
                                        <h5>${name}</h5>
                                        <div>關注: ${info.focus.join(', ')}</div>
                                        <div>最近: ${info.recentActivity}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="context-item">
                            <h4>🌍 外部情境</h4>
                            <div class="external-context">
                                <div>市場: ${context.external.market}</div>
                                <div>競爭: ${context.external.competition}</div>
                                <div>機會: ${context.external.opportunities}</div>
                                <div>挑戰: ${context.external.challenges}</div>
                            </div>
                        </div>
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
    
    // 獲取選中的領袖
    getSelectedLeaders() {
        const selectedCards = document.querySelectorAll('.leader-card.selected');
        return Array.from(selectedCards).map(card => {
            const leaderId = card.dataset.leaderId;
            return techLeaders[leaderId];
        }).filter(Boolean);
    }
    
    // 顯示進度
    showProgress(message) {
        const progress = document.getElementById('ai-progress');
        const status = document.getElementById('ai-status');
        
        if (progress && status) {
            progress.style.display = 'block';
            status.textContent = message;
        }
    }
    
    // 隱藏進度
    hideProgress() {
        const progress = document.getElementById('ai-progress');
        const status = document.getElementById('ai-status');
        
        if (progress && status) {
            progress.style.display = 'none';
            status.textContent = 'AI就緒';
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
}

// 全局函數
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
    window.aiEnhancementModule = new AIEnhancementModule();
}); 