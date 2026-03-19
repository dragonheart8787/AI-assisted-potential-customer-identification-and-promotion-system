// 自動訊息發送系統主邏輯 - 整合對話式推銷策略
class MessagingSystem {
    constructor() {
        this.selectedLeaders = new Set();
        this.templateProcessor = new AdvancedTemplateProcessor(); // 使用增強版處理器
        this.sendingQueue = [];
        this.sentMessages = JSON.parse(localStorage.getItem('sentMessages') || '[]');
        this.pendingMessages = JSON.parse(localStorage.getItem('pendingMessages') || '[]');
        this.conversationMode = false; // 新增對話模式開關
        
        this.init();
    }
    
    init() {
        this.renderLeadersList();
        this.bindEvents();
        this.updateStats();
        this.updateLogTable();
        this.loadScheduledMessages();
        this.initializeStrategyFeatures(); // 初始化策略功能
    }

    // 初始化策略功能
    initializeStrategyFeatures() {
        // 添加策略模式切換按鈕
        this.addStrategyModeToggle();
        
        // 添加策略提示
        this.addStrategyHints();
    }

    // 添加策略模式切換
    addStrategyModeToggle() {
        const messageComposer = document.querySelector('.message-composer');
        const strategyToggle = document.createElement('div');
        strategyToggle.className = 'strategy-toggle';
        strategyToggle.innerHTML = `
            <div style="background: #f0f8ff; border: 2px solid #4a90e2; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
                <h4 style="color: #2c3e50; margin-bottom: 10px;">🎯 對話式推銷模式</h4>
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                    <input type="checkbox" id="conversation-mode" style="width: 18px; height: 18px;">
                    <span>啟用對話式推銷策略（運用心理觸發點和個人化技巧）</span>
                </label>
                <div id="strategy-info" style="margin-top: 10px; font-size: 0.9rem; color: #666; display: none;">
                    ✨ 將自動應用WIIFM原則、黃金一分鐘法則和心理觸發點
                </div>
            </div>
        `;
        
        messageComposer.insertBefore(strategyToggle, messageComposer.firstChild.nextSibling);
        
        // 綁定事件
        document.getElementById('conversation-mode').addEventListener('change', (e) => {
            this.conversationMode = e.target.checked;
            document.getElementById('strategy-info').style.display = 
                this.conversationMode ? 'block' : 'none';
        });
    }

    // 添加策略提示
    addStrategyHints() {
        const templateSelector = document.querySelector('.template-selector');
        const hintsDiv = document.createElement('div');
        hintsDiv.className = 'strategy-hints';
        hintsDiv.innerHTML = `
            <div id="template-strategy-hint" style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 12px; margin-top: 10px; font-size: 0.9rem; display: none;">
                <strong>💡 策略提示：</strong>
                <span id="hint-content"></span>
            </div>
        `;
        
        templateSelector.appendChild(hintsDiv);
    }

    // 渲染目標客戶列表（商家與隱藏客群）
    renderLeadersList() {
        const leadersList = document.getElementById('leaders-list');
        if (!leadersList) return;
        leadersList.innerHTML = '';
        
        const prospects = typeof getTargetProspects === 'function' ? getTargetProspects() : Object.values(techLeaders);
        prospects.forEach(prospect => {
            const leaderCard = this.createEnhancedLeaderCard(prospect);
            leadersList.appendChild(leaderCard);
        });
    }
    
    // 創建目標客戶卡片（商家/隱藏客群）
    createEnhancedLeaderCard(leader) {
        const card = document.createElement('div');
        card.className = 'leader-card';
        card.dataset.leaderId = leader.id;
        
        const platforms = (leader.platforms && Object.keys(leader.platforms).length > 0)
            ? Object.entries(leader.platforms).map(([platform, info]) => {
                const isActive = info && info.active ? 'active' : '';
                return `<span class="platform-badge ${isActive}">${platformInfo[platform]?.icon || '📱'} ${platformInfo[platform]?.name || platform}</span>`;
            }).join('')
            : `<span class="platform-badge">📧 可透過 CRM/社群聯絡</span>`;

        const rules = typeof personalizationRules !== 'undefined' ? personalizationRules[leader.id] : null;
        const strategyHint = rules ? `最佳切入點：${rules.bestApproach}` : (leader.focus?.length ? `關注：${leader.focus.slice(0, 2).join('、')}` : '');
        
        card.innerHTML = `
            <div class="leader-header">
                <div class="leader-avatar">${leader.avatar || '🏢'}</div>
                <div class="leader-info">
                    <h3>${leader.name}</h3>
                    <p>${leader.title || '負責人'} - ${leader.company}</p>
                </div>
            </div>
            <p style="font-size: 0.9rem; color: #666; margin-bottom: 10px;">${leader.bio || leader.company}</p>
            <div class="leader-platforms">${platforms}</div>
            <div style="margin-top: 10px; font-size: 0.8rem; color: #888;">
                <strong>最佳聯繫時間:</strong> ${leader.bestTime || '工作日'}
            </div>
            ${strategyHint ? `
                <div style="margin-top: 8px; padding: 8px; background: #e8f5e8; border-radius: 6px; font-size: 0.8rem; color: #2d5a2d;">
                    <strong>💡 策略提示:</strong> ${strategyHint}
                </div>
            ` : ''}
        `;
        
        card.addEventListener('click', () => this.toggleLeaderSelection(leader.id));
        
        return card;
    }
    
    // 切換領袖選擇
    toggleLeaderSelection(leaderId) {
        if (this.selectedLeaders.has(leaderId)) {
            this.selectedLeaders.delete(leaderId);
            document.querySelector(`[data-leader-id="${leaderId}"]`).classList.remove('selected');
        } else {
            this.selectedLeaders.add(leaderId);
            document.querySelector(`[data-leader-id="${leaderId}"]`).classList.add('selected');
        }
        
        this.updateStats();
    }

    // 載入訊息模板（增強版）
    loadTemplate(templateId) {
        if (!templateId) {
            document.getElementById('message-subject').value = '';
            document.getElementById('message-content').value = '';
            this.hideTemplateHint();
            return;
        }
        
        const template = this.templateProcessor.getTemplate(templateId);
        if (template) {
            document.getElementById('message-subject').value = template.subject;
            document.getElementById('message-content').value = template.content;
            
            // 顯示模板變數提示
            this.showTemplateVariables(template.variables);
            
            // 顯示策略提示
            this.showTemplateStrategyHint(template);
        }
    }

    // 顯示模板策略提示
    showTemplateStrategyHint(template) {
        const hintElement = document.getElementById('template-strategy-hint');
        const hintContent = document.getElementById('hint-content');
        
        if (template.strategies && template.strategies.length > 0) {
            const strategiesText = template.strategies.join('、');
            hintContent.textContent = `此模板運用了 ${strategiesText} 等策略，將自動優化以提高成功率。`;
            hintElement.style.display = 'block';
        } else {
            this.hideTemplateHint();
        }
    }

    // 隱藏模板提示
    hideTemplateHint() {
        const hintElement = document.getElementById('template-strategy-hint');
        if (hintElement) {
            hintElement.style.display = 'none';
        }
    }

    // 個人化當前訊息（增強版）
    personalizeCurrentMessage() {
        const content = document.getElementById('message-content').value;
        if (!content || this.selectedLeaders.size === 0) return;
        
        // 為每個選中的領袖個人化訊息
        const leadersArray = Array.from(this.selectedLeaders);
        const firstLeaderId = leadersArray[0];
        
        let personalizedContent = content;
        
        // 如果啟用對話模式，應用高級策略
        if (this.conversationMode) {
            personalizedContent = this.templateProcessor.personalizeMessage(personalizedContent, firstLeaderId);
            
            // 應用策略增強
            const template = this.getCurrentTemplate();
            if (template && template.strategies) {
                template.strategies.forEach(strategy => {
                    if (this.templateProcessor.conversationalStrategies[strategy]) {
                        personalizedContent = this.templateProcessor.conversationalStrategies[strategy](personalizedContent, firstLeaderId);
                    }
                });
            }
        } else {
            // 基本個人化
            personalizedContent = this.templateProcessor.personalizeMessage(personalizedContent, firstLeaderId);
        }
        
        document.getElementById('message-content').value = personalizedContent;
        
        // 顯示個人化提示
        this.showPersonalizationFeedback(leadersArray.length);
    }

    // 獲取當前模板
    getCurrentTemplate() {
        const templateId = document.getElementById('template-select').value;
        return templateId ? this.templateProcessor.getTemplate(templateId) : null;
    }

    // 顯示個人化反饋
    showPersonalizationFeedback(leaderCount) {
        const feedback = document.createElement('div');
        feedback.className = 'personalization-feedback';
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            max-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        const mode = this.conversationMode ? '高級對話式' : '基本';
        feedback.innerHTML = `
            <strong>✨ 個人化完成</strong><br>
            已為 ${leaderCount} 位領袖應用${mode}個人化策略
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 3000);
    }

    // 生成預覽內容（增強版）
    generatePreview(subject, content) {
        const previewTargets = document.getElementById('preview-targets');
        const previewMessage = document.getElementById('preview-message');
        
        // 目標客戶列表及其策略信息
        const selectedLeadersList = Array.from(this.selectedLeaders).map(id => {
            const leader = techLeaders[id] || getTargetProspects?.().find(p => p.id === id);
            if (!leader) return '';
            const rules = typeof personalizationRules !== 'undefined' ? personalizationRules[id] : null;
            const platforms = this.getSelectedPlatforms();
            const platformsList = platforms.map(p => platformInfo[p]?.name || p).join(', ');
            
            let leaderInfo = `• ${leader.name} (${leader.company}) - 平台: ${platformsList}`;
            
            if (rules && this.conversationMode) {
                leaderInfo += `\n  策略重點: ${rules.keyPhrases.slice(0, 2).join('、')}`;
                leaderInfo += `\n  溝通風格: ${rules.preferredTone}`;
            }
            
            return leaderInfo;
        }).join('\n');
        
        const strategyInfo = this.conversationMode ? 
            `\n\n🎯 **已應用策略**: WIIFM原則、心理觸發點、個人化溝通` : 
            `\n\n📝 **標準模式**: 基本個人化`;
        
        previewTargets.innerHTML = `
            <h4>發送目標 (${this.selectedLeaders.size} 位領袖):</h4>
            <pre>${selectedLeadersList}</pre>
            ${strategyInfo}
        `;
        
        // 訊息預覽
        const sendTime = document.querySelector('input[name="send-time"]:checked').value;
        const scheduleTime = document.getElementById('schedule-time').value;
        const timeInfo = sendTime === 'scheduled' ? `\n排程時間: ${scheduleTime}` : '\n發送時間: 立即';
        
        previewMessage.textContent = `主題: ${subject}\n\n內容:\n${content}${timeInfo}`;
    }

    // 執行發送（增強版）
    async executeSending() {
        const subject = document.getElementById('message-subject').value;
        const content = document.getElementById('message-content').value;
        const platforms = this.getSelectedPlatforms();
        const sendTime = document.querySelector('input[name="send-time"]:checked').value;
        const scheduleTime = document.getElementById('schedule-time').value;
        const autoPersonalize = document.getElementById('auto-personalize').checked;
        const addCompanyContext = document.getElementById('add-company-context').checked;
        
        const sendDateTime = sendTime === 'scheduled' ? new Date(scheduleTime) : new Date();
        
        for (const leaderId of this.selectedLeaders) {
            const leader = techLeaders[leaderId] || getTargetProspects?.().find(p => p.id === leaderId);
            if (!leader) continue;
            
            const leaderPlatforms = leader.platforms || {};
            for (const platform of platforms) {
                if (!leaderPlatforms[platform]) continue;
                
                let finalContent = content;
                
                // 個人化處理
                if (autoPersonalize) {
                    if (this.conversationMode) {
                        // 應用高級策略
                        finalContent = await this.applyAdvancedPersonalization(finalContent, leaderId);
                    } else {
                        // 基本個人化
                        finalContent = this.templateProcessor.personalizeMessage(finalContent, leaderId);
                    }
                }
                
                // 平台適配
                finalContent = this.templateProcessor.adaptToPlatform(finalContent, platform);
                
                // 添加公司背景
                if (addCompanyContext) {
                    const contextualInfo = this.generateContextualInfo(leader);
                    finalContent += `\n\n${contextualInfo}`;
                }
                
                const messageData = {
                    id: this.generateId(),
                    leaderId: leaderId,
                    leaderName: leader.name,
                    platform: platform,
                    platformHandle: leaderPlatforms[platform].handle,
                    subject: subject,
                    content: finalContent,
                    scheduledTime: sendDateTime,
                    status: sendTime === 'scheduled' ? 'pending' : 'sent',
                    sentTime: sendTime === 'now' ? new Date() : null,
                    createdTime: new Date(),
                    strategyMode: this.conversationMode, // 記錄策略模式
                    appliedStrategies: this.getAppliedStrategies() // 記錄應用的策略
                };
                
                if (sendTime === 'scheduled') {
                    this.pendingMessages.push(messageData);
                    this.saveToStorage('pendingMessages', this.pendingMessages);
                } else {
                    // 模擬發送過程
                    await this.simulateSending(messageData);
                }
            }
        }
        
        // 清空表單
        this.clearForm();
        
        // 更新統計和記錄
        this.updateStats();
        this.updateLogTable();
        
        // 顯示成功訊息
        this.showAdvancedSuccessMessage();
    }

    // 應用高級個人化
    async applyAdvancedPersonalization(content, leaderId) {
        let enhancedContent = this.templateProcessor.personalizeMessage(content, leaderId);
        
        // 應用對話式策略
        const template = this.getCurrentTemplate();
        if (template && template.strategies) {
            template.strategies.forEach(strategy => {
                if (this.templateProcessor.conversationalStrategies[strategy]) {
                    enhancedContent = this.templateProcessor.conversationalStrategies[strategy](enhancedContent, leaderId);
                }
            });
        }
        
        return enhancedContent;
    }

    // 生成背景資訊
    generateContextualInfo(leader) {
        const rules = personalizationRules[leader.id];
        if (!rules) return `(考量到${leader.company}在${leader.focus.join('、')}方面的專業)`;
        
        return `(基於${leader.company}在${rules.focusAreas.join('、')}領域的專長，我們相信這個方案特別適合您)`;
    }

    // 獲取應用的策略
    getAppliedStrategies() {
        if (!this.conversationMode) return ['基本個人化'];
        
        const template = this.getCurrentTemplate();
        const strategies = ['對話式推銷'];
        
        if (template && template.strategies) {
            strategies.push(...template.strategies);
        }
        
        return strategies;
    }

    // 顯示高級成功訊息
    showAdvancedSuccessMessage() {
        const strategiesUsed = this.conversationMode ? '高級對話式推銷策略' : '標準個人化';
        const message = `✅ 成功處理 ${this.selectedLeaders.size} 位領袖的訊息發送！\n已應用：${strategiesUsed}`;
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(76, 175, 80, 0.3);
            z-index: 10000;
            max-width: 320px;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 8px;">🎯 訊息發送完成</div>
            <div style="font-size: 0.9rem;">${message}</div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    // 更新記錄表格（增強版）
    updateLogTable() {
        const tbody = document.getElementById('log-table-body');
        tbody.innerHTML = '';
        
        // 合併所有訊息並按時間排序
        const allMessages = [...this.sentMessages, ...this.pendingMessages]
            .sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));
        
        allMessages.slice(0, 50).forEach(message => {
            const row = this.createEnhancedLogRow(message);
            tbody.appendChild(row);
        });
    }

    // 創建增強版記錄行
    createEnhancedLogRow(message) {
        const row = document.createElement('tr');
        
        const time = new Date(message.sentTime || message.scheduledTime || message.createdTime)
            .toLocaleString('zh-TW');
        
        const statusClass = `status-${message.status}`;
        const statusText = this.getStatusText(message.status);
        
        const platformIcon = platformInfo[message.platform]?.icon || '📱';
        
        // 策略標記
        const strategyBadge = message.strategyMode ? 
            '<span style="background: #667eea; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.7rem; margin-left: 5px;">策略</span>' : '';
        
        row.innerHTML = `
            <td>${time}</td>
            <td>
                <strong>${message.leaderName}</strong>${strategyBadge}<br>
                <small>${message.platformHandle}</small>
            </td>
            <td>${platformIcon} ${platformInfo[message.platform]?.name || message.platform}</td>
            <td title="${message.content.substring(0, 100)}...">${message.subject}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <button onclick="messagingSystem.viewEnhancedMessage('${message.id}')" style="padding: 4px 8px; border: none; background: #667eea; color: white; border-radius: 4px; cursor: pointer;">查看</button>
                ${message.status === 'pending' ? `<button onclick="messagingSystem.cancelMessage('${message.id}')" style="padding: 4px 8px; border: none; background: #f44336; color: white; border-radius: 4px; cursor: pointer; margin-left: 5px;">取消</button>` : ''}
            </td>
        `;
        
        return row;
    }

    // 查看增強版訊息詳情
    viewEnhancedMessage(messageId) {
        const message = [...this.sentMessages, ...this.pendingMessages]
            .find(m => m.id === messageId);
        
        if (message) {
            const strategies = message.appliedStrategies ? message.appliedStrategies.join('、') : '無';
            const strategyInfo = message.strategyMode ? `\n\n應用策略: ${strategies}` : '';
            
            alert(`訊息詳情:\n\n主題: ${message.subject}\n\n內容:\n${message.content}\n\n狀態: ${this.getStatusText(message.status)}${strategyInfo}`);
        }
    }

    // 綁定事件監聽器
    bindEvents() {
        // 模板選擇
        const templateSelect = document.getElementById('template-select');
        if (templateSelect) {
            templateSelect.addEventListener('change', (e) => {
                this.loadTemplate(e.target.value);
            });
        }
        
        // 發送時間切換
        document.querySelectorAll('input[name="send-time"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const scheduleTime = document.getElementById('schedule-time');
                if (scheduleTime) {
                    scheduleTime.style.display = e.target.value === 'scheduled' ? 'block' : 'none';
                }
            });
        });
        
        // 預覽按鈕
        const previewBtn = document.getElementById('preview-btn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                this.previewMessage();
            });
        }
        
        // 發送按鈕
        const sendBtn = document.getElementById('send-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
        }
        
        // 個人化按鈕
        const personalizeBtn = document.getElementById('personalize-btn');
        if (personalizeBtn) {
            personalizeBtn.addEventListener('click', () => {
                this.personalizeCurrentMessage();
            });
        }
        
        // 模態框事件
        this.bindModalEvents();
        
        // 個人化選項
        const autoPersonalize = document.getElementById('auto-personalize');
        if (autoPersonalize) {
            autoPersonalize.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.personalizeCurrentMessage();
                }
            });
        }
        
        // 模板按鈕
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const templateId = e.target.dataset.template;
                this.loadTemplate(templateId);
            });
        });
    }
    
    // 綁定模態框事件
    bindModalEvents() {
        const modal = document.getElementById('preview-modal');
        if (!modal) return;
        
        const closeBtn = modal.querySelector('.close');
        const cancelBtn = document.getElementById('cancel-send');
        const confirmBtn = document.getElementById('confirm-send');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                this.executeSending();
            });
        }
        
        // 點擊外部關閉模態框
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // 顯示模板變數提示
    showTemplateVariables(variables) {
        // 簡單提示用戶需要填入的變數
        const variablesList = variables.map(v => `{${v}}`).join(', ');
        console.log('需要替換的變數:', variablesList);
        
        // 可以在此處添加UI提示
        const content = document.getElementById('message-content');
        if (content.value.includes('{')) {
            content.style.borderColor = '#FF9800';
            content.title = '請替換模板中的變數: ' + variablesList;
        }
    }
    
    // 獲取選中的平台
    getSelectedPlatforms() {
        const checkboxes = document.querySelectorAll('.platform-options input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }
    
    // 預覽訊息
    previewMessage() {
        if (this.selectedLeaders.size === 0) {
            alert('請先選擇要發送的目標領袖');
            return;
        }
        
        const subject = document.getElementById('message-subject').value;
        const content = document.getElementById('message-content').value;
        
        if (!subject || !content) {
            alert('請填寫完整的訊息主題和內容');
            return;
        }
        
        // 生成預覽內容
        this.generatePreview(subject, content);
        
        // 顯示模態框
        const modal = document.getElementById('preview-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }
    
    // 發送訊息
    sendMessage() {
        if (this.selectedLeaders.size === 0) {
            alert('請先選擇要發送的目標領袖');
            return;
        }
        
        const subject = document.getElementById('message-subject').value;
        const content = document.getElementById('message-content').value;
        
        if (!subject || !content) {
            alert('請填寫完整的訊息主題和內容');
            return;
        }
        
        this.previewMessage();
    }
    
    // 模擬發送過程
    async simulateSending(messageData) {
        // 顯示發送中狀態
        messageData.status = 'sending';
        this.updateLogTable();
        
        // 模擬網路延遲
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // 模擬發送結果 (90%成功率)
        const success = Math.random() > 0.1;
        
        messageData.status = success ? 'sent' : 'failed';
        messageData.sentTime = new Date();
        
        if (success) {
            messageData.error = null;
        } else {
            messageData.error = this.getRandomError();
        }
        
        this.sentMessages.push(messageData);
        this.saveToStorage('sentMessages', this.sentMessages);
    }
    
    // 獲取隨機錯誤訊息
    getRandomError() {
        const errors = [
            '網路連接超時',
            '平台API限制',
            '帳號暫時無法接收訊息',
            '內容被系統過濾',
            '發送頻率過高'
        ];
        return errors[Math.floor(Math.random() * errors.length)];
    }
    
    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // 清空表單
    clearForm() {
        const subjectInput = document.getElementById('message-subject');
        const contentInput = document.getElementById('message-content');
        const templateSelect = document.getElementById('template-select');
        const autoPersonalize = document.getElementById('auto-personalize');
        const addCompanyContext = document.getElementById('add-company-context');
        
        if (subjectInput) subjectInput.value = '';
        if (contentInput) contentInput.value = '';
        if (templateSelect) templateSelect.value = '';
        if (autoPersonalize) autoPersonalize.checked = false;
        if (addCompanyContext) addCompanyContext.checked = false;
        
        // 重置策略模式
        const conversationMode = document.getElementById('conversation-mode');
        if (conversationMode) {
            conversationMode.checked = false;
            this.conversationMode = false;
        }
        
        // 清空選擇的領袖
        this.selectedLeaders.clear();
        document.querySelectorAll('.leader-card.selected').forEach(card => {
            card.classList.remove('selected');
        });
        
        this.hideTemplateHint();
    }
    
    // 顯示成功訊息
    showSuccessMessage() {
        const message = `✅ 成功處理 ${this.selectedLeaders.size} 位領袖的訊息發送！`;
        
        // 簡單的通知
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // 更新統計數據
    updateStats() {
        const totalSent = this.sentMessages.filter(m => m.status === 'sent').length;
        const totalPending = this.pendingMessages.length;
        const totalFailed = this.sentMessages.filter(m => m.status === 'failed').length;
        const totalLeaders = this.selectedLeaders.size;
        
        const totalSentElement = document.getElementById('total-sent');
        const totalPendingElement = document.getElementById('total-pending');
        const totalFailedElement = document.getElementById('total-failed');
        const totalLeadersElement = document.getElementById('total-leaders');
        
        if (totalSentElement) totalSentElement.textContent = totalSent;
        if (totalPendingElement) totalPendingElement.textContent = totalPending;
        if (totalFailedElement) totalFailedElement.textContent = totalFailed;
        if (totalLeadersElement) totalLeadersElement.textContent = totalLeaders;
    }
    
    // 更新記錄表格
    updateLogTable() {
        const tbody = document.getElementById('log-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        // 合併所有訊息並按時間排序
        const allMessages = [...this.sentMessages, ...this.pendingMessages]
            .sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));
        
        allMessages.slice(0, 50).forEach(message => {
            const row = this.createEnhancedLogRow(message);
            tbody.appendChild(row);
        });
    }
    
    // 創建記錄行
    createLogRow(message) {
        const row = document.createElement('tr');
        
        const time = new Date(message.sentTime || message.scheduledTime || message.createdTime)
            .toLocaleString('zh-TW');
        
        const statusClass = `status-${message.status}`;
        const statusText = this.getStatusText(message.status);
        
        const platformIcon = platformInfo[message.platform]?.icon || '📱';
        
        row.innerHTML = `
            <td>${time}</td>
            <td>
                <strong>${message.leaderName}</strong><br>
                <small>${message.platformHandle}</small>
            </td>
            <td>${platformIcon} ${platformInfo[message.platform]?.name || message.platform}</td>
            <td title="${message.content.substring(0, 100)}...">${message.subject}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <button onclick="messagingSystem.viewMessage('${message.id}')" style="padding: 4px 8px; border: none; background: #667eea; color: white; border-radius: 4px; cursor: pointer;">查看</button>
                ${message.status === 'pending' ? `<button onclick="messagingSystem.cancelMessage('${message.id}')" style="padding: 4px 8px; border: none; background: #f44336; color: white; border-radius: 4px; cursor: pointer; margin-left: 5px;">取消</button>` : ''}
            </td>
        `;
        
        return row;
    }
    
    // 獲取狀態文字
    getStatusText(status) {
        const statusMap = {
            'sent': '已發送',
            'pending': '待發送',
            'sending': '發送中',
            'failed': '發送失敗'
        };
        return statusMap[status] || status;
    }
    
    // 查看訊息詳情
    viewMessage(messageId) {
        const message = [...this.sentMessages, ...this.pendingMessages]
            .find(m => m.id === messageId);
        
        if (message) {
            alert(`訊息詳情:\n\n主題: ${message.subject}\n\n內容:\n${message.content}\n\n狀態: ${this.getStatusText(message.status)}`);
        }
    }
    
    // 取消待發送訊息
    cancelMessage(messageId) {
        const index = this.pendingMessages.findIndex(m => m.id === messageId);
        if (index !== -1) {
            this.pendingMessages.splice(index, 1);
            this.saveToStorage('pendingMessages', this.pendingMessages);
            this.updateStats();
            this.updateLogTable();
        }
    }
    
    // 載入排程訊息
    loadScheduledMessages() {
        // 檢查是否有到期的排程訊息
        const now = new Date();
        const toSend = this.pendingMessages.filter(message => 
            new Date(message.scheduledTime) <= now
        );
        
        if (toSend.length > 0) {
            toSend.forEach(async message => {
                message.status = 'sent';
                message.sentTime = new Date();
                
                // 從待發送列表移除
                const index = this.pendingMessages.findIndex(m => m.id === message.id);
                if (index !== -1) {
                    this.pendingMessages.splice(index, 1);
                }
                
                // 添加到已發送列表
                this.sentMessages.push(message);
            });
            
            this.saveToStorage('pendingMessages', this.pendingMessages);
            this.saveToStorage('sentMessages', this.sentMessages);
            this.updateStats();
            this.updateLogTable();
        }
        
        // 每分鐘檢查一次排程訊息
        setTimeout(() => this.loadScheduledMessages(), 60000);
    }
    
    // 儲存到本地存儲
    saveToStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }
}

// 頁面載入完成後初始化系統
document.addEventListener('DOMContentLoaded', () => {
    window.messagingSystem = new MessagingSystem();
    
    // 添加CSS動畫
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .strategy-toggle {
            animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
}); 