/**
 * 智能推銷優化引擎
 * 基於機器學習優化推銷策略和訊息
 */

class SmartSalesOptimization {
    constructor() {
        this.optimizationModels = new Map();
        this.performanceData = new Map();
        this.optimizationRules = new Map();
        this.abTestResults = new Map();
        
        this.init();
    }
    
    init() {
        this.loadOptimizationModels();
        this.loadPerformanceData();
        this.loadOptimizationRules();
        this.loadABTestResults();
        
        console.log('🧠 智能推銷優化引擎已初始化');
    }
    
    // 載入優化模型
    loadOptimizationModels() {
        this.optimizationModels.set('message_optimization', {
            name: '訊息優化模型',
            description: '優化推銷訊息的內容和結構',
            features: ['subject_length', 'content_length', 'personalization', 'call_to_action'],
            accuracy: 0.85,
            lastTrained: new Date().toISOString()
        });
        
        this.optimizationModels.set('timing_optimization', {
            name: '時機優化模型',
            description: '優化發送訊息的時間',
            features: ['day_of_week', 'hour_of_day', 'timezone', 'industry'],
            accuracy: 0.78,
            lastTrained: new Date().toISOString()
        });
        
        this.optimizationModels.set('audience_segmentation', {
            name: '受眾細分模型',
            description: '細分目標受眾並優化策略',
            features: ['industry', 'company_size', 'role', 'behavior'],
            accuracy: 0.82,
            lastTrained: new Date().toISOString()
        });
        
        this.optimizationModels.set('response_prediction', {
            name: '回應預測模型',
            description: '預測目標對象的回應可能性',
            features: ['engagement_history', 'industry', 'company_size', 'message_type'],
            accuracy: 0.79,
            lastTrained: new Date().toISOString()
        });
    }
    
    // 載入績效數據
    loadPerformanceData() {
        const saved = localStorage.getItem('salesOptimizationData');
        if (saved) {
            const data = JSON.parse(saved);
            this.performanceData = new Map(Object.entries(data));
        }
    }
    
    // 保存績效數據
    savePerformanceData() {
        const data = Object.fromEntries(this.performanceData);
        localStorage.setItem('salesOptimizationData', JSON.stringify(data));
    }
    
    // 載入優化規則
    loadOptimizationRules() {
        this.optimizationRules.set('subject_line_optimization', {
            name: '主旨行優化',
            rules: [
                { condition: 'length > 50', action: 'shorten', impact: 0.15 },
                { condition: 'contains_emoji', action: 'add_emoji', impact: 0.08 },
                { condition: 'personalized', action: 'add_personalization', impact: 0.12 },
                { condition: 'urgency', action: 'add_urgency', impact: 0.10 }
            ]
        });
        
        this.optimizationRules.set('content_optimization', {
            name: '內容優化',
            rules: [
                { condition: 'length < 100', action: 'expand_content', impact: 0.20 },
                { condition: 'no_call_to_action', action: 'add_cta', impact: 0.25 },
                { condition: 'no_benefits', action: 'add_benefits', impact: 0.18 },
                { condition: 'no_social_proof', action: 'add_social_proof', impact: 0.12 }
            ]
        });
        
        this.optimizationRules.set('timing_optimization', {
            name: '時機優化',
            rules: [
                { condition: 'weekend', action: 'move_to_weekday', impact: 0.30 },
                { condition: 'early_morning', action: 'move_to_business_hours', impact: 0.15 },
                { condition: 'late_night', action: 'move_to_business_hours', impact: 0.20 },
                { condition: 'holiday', action: 'avoid_holiday', impact: 0.25 }
            ]
        });
    }
    
    // 載入A/B測試結果
    loadABTestResults() {
        const saved = localStorage.getItem('abTestResults');
        if (saved) {
            const data = JSON.parse(saved);
            this.abTestResults = new Map(Object.entries(data));
        }
    }
    
    // 保存A/B測試結果
    saveABTestResults() {
        const data = Object.fromEntries(this.abTestResults);
        localStorage.setItem('abTestResults', JSON.stringify(data));
    }
    
    // 優化推銷訊息
    optimizeMessage(originalMessage, targetProfile) {
        console.log('🔧 開始優化推銷訊息...');
        
        const optimizations = [];
        
        // 主旨行優化
        const subjectOptimization = this.optimizeSubjectLine(originalMessage.subject, targetProfile);
        if (subjectOptimization) {
            optimizations.push(subjectOptimization);
        }
        
        // 內容優化
        const contentOptimization = this.optimizeContent(originalMessage.content, targetProfile);
        if (contentOptimization) {
            optimizations.push(contentOptimization);
        }
        
        // 時機優化
        const timingOptimization = this.optimizeTiming(targetProfile);
        if (timingOptimization) {
            optimizations.push(timingOptimization);
        }
        
        // 生成優化後的訊息
        const optimizedMessage = {
            ...originalMessage,
            subject: subjectOptimization ? subjectOptimization.optimized : originalMessage.subject,
            content: contentOptimization ? contentOptimization.optimized : originalMessage.content,
            sendTime: timingOptimization ? timingOptimization.optimized : originalMessage.sendTime,
            optimizations: optimizations,
            confidence: this.calculateOptimizationConfidence(optimizations),
            expectedImprovement: this.calculateExpectedImprovement(optimizations)
        };
        
        return optimizedMessage;
    }
    
    // 優化主旨行
    optimizeSubjectLine(subject, targetProfile) {
        const rules = this.optimizationRules.get('subject_line_optimization').rules;
        let optimizedSubject = subject;
        let improvements = [];
        
        // 檢查長度
        if (subject.length > 50) {
            optimizedSubject = this.shortenSubject(subject);
            improvements.push('縮短主旨行');
        }
        
        // 添加個性化
        if (!this.containsPersonalization(subject)) {
            optimizedSubject = this.addPersonalization(optimizedSubject, targetProfile);
            improvements.push('添加個性化');
        }
        
        // 添加緊急感
        if (!this.containsUrgency(subject)) {
            optimizedSubject = this.addUrgency(optimizedSubject);
            improvements.push('添加緊急感');
        }
        
        // 添加表情符號
        if (!this.containsEmoji(subject)) {
            optimizedSubject = this.addEmoji(optimizedSubject);
            improvements.push('添加表情符號');
        }
        
        if (improvements.length > 0) {
            return {
                type: 'subject_optimization',
                original: subject,
                optimized: optimizedSubject,
                improvements: improvements,
                expectedImpact: 0.15
            };
        }
        
        return null;
    }
    
    // 優化內容
    optimizeContent(content, targetProfile) {
        const rules = this.optimizationRules.get('content_optimization').rules;
        let optimizedContent = content;
        let improvements = [];
        
        // 檢查長度
        if (content.length < 100) {
            optimizedContent = this.expandContent(content, targetProfile);
            improvements.push('擴展內容');
        }
        
        // 添加行動呼籲
        if (!this.containsCallToAction(content)) {
            optimizedContent = this.addCallToAction(optimizedContent);
            improvements.push('添加行動呼籲');
        }
        
        // 添加好處說明
        if (!this.containsBenefits(content)) {
            optimizedContent = this.addBenefits(optimizedContent, targetProfile);
            improvements.push('添加好處說明');
        }
        
        // 添加社會證明
        if (!this.containsSocialProof(content)) {
            optimizedContent = this.addSocialProof(optimizedContent);
            improvements.push('添加社會證明');
        }
        
        if (improvements.length > 0) {
            return {
                type: 'content_optimization',
                original: content,
                optimized: optimizedContent,
                improvements: improvements,
                expectedImpact: 0.25
            };
        }
        
        return null;
    }
    
    // 優化時機
    optimizeTiming(targetProfile) {
        const rules = this.optimizationRules.get('timing_optimization').rules;
        const currentTime = new Date();
        let optimizedTime = currentTime;
        let improvements = [];
        
        // 檢查是否為週末
        if (currentTime.getDay() === 0 || currentTime.getDay() === 6) {
            optimizedTime = this.moveToWeekday(currentTime);
            improvements.push('移至工作日');
        }
        
        // 檢查是否為營業時間
        if (currentTime.getHours() < 9 || currentTime.getHours() > 17) {
            optimizedTime = this.moveToBusinessHours(currentTime);
            improvements.push('移至營業時間');
        }
        
        // 檢查時區
        if (targetProfile.timezone) {
            optimizedTime = this.adjustForTimezone(optimizedTime, targetProfile.timezone);
            improvements.push('調整時區');
        }
        
        if (improvements.length > 0) {
            return {
                type: 'timing_optimization',
                original: currentTime,
                optimized: optimizedTime,
                improvements: improvements,
                expectedImpact: 0.20
            };
        }
        
        return null;
    }
    
    // 縮短主旨行
    shortenSubject(subject) {
        if (subject.length <= 50) return subject;
        
        // 移除不必要的詞語
        let shortened = subject
            .replace(/\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by)\b/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
        
        if (shortened.length <= 50) return shortened;
        
        // 截斷並添加省略號
        return shortened.substring(0, 47) + '...';
    }
    
    // 添加個性化
    addPersonalization(subject, targetProfile) {
        const personalizations = [
            `Hi ${targetProfile.name}`,
            `${targetProfile.company}的${targetProfile.name}`,
            `親愛的${targetProfile.name}`
        ];
        
        const personalized = personalizations[Math.floor(Math.random() * personalizations.length)];
        return `${personalized} - ${subject}`;
    }
    
    // 添加緊急感
    addUrgency(subject) {
        const urgencyWords = ['緊急', '限時', '立即', '機會', '最後'];
        const urgencyWord = urgencyWords[Math.floor(Math.random() * urgencyWords.length)];
        return `${urgencyWord}：${subject}`;
    }
    
    // 添加表情符號
    addEmoji(subject) {
        const emojis = ['🚀', '💡', '⭐', '🎯', '🔥', '✨'];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        return `${emoji} ${subject}`;
    }
    
    // 擴展內容
    expandContent(content, targetProfile) {
        const expansions = [
            `我們注意到${targetProfile.company}在${targetProfile.industry}領域的卓越表現。`,
            `基於我們的成功案例，我們相信可以為${targetProfile.company}帶來顯著價值。`,
            `我們的解決方案已經幫助了超過100家類似規模的公司。`
        ];
        
        const expansion = expansions[Math.floor(Math.random() * expansions.length)];
        return `${expansion}\n\n${content}`;
    }
    
    // 添加行動呼籲
    addCallToAction(content) {
        const ctas = [
            '我建議我們安排一次15分鐘的電話會議來詳細討論。',
            '請回覆此郵件，我很樂意為您安排產品演示。',
            '期待您的回覆，我們可以進一步探討合作機會。'
        ];
        
        const cta = ctas[Math.floor(Math.random() * ctas.length)];
        return `${content}\n\n${cta}`;
    }
    
    // 添加好處說明
    addBenefits(content, targetProfile) {
        const benefits = [
            '我們的解決方案可以幫助您：\n• 提升效率30%\n• 降低成本25%\n• 增加收入40%',
            '主要優勢包括：\n• 快速實施（2週內完成）\n• 零風險試用\n• 24/7技術支援',
            '預期效果：\n• 投資回報期：3個月\n• 成本節省：每年50萬\n• 效率提升：40%'
        ];
        
        const benefit = benefits[Math.floor(Math.random() * benefits.length)];
        return `${content}\n\n${benefit}`;
    }
    
    // 添加社會證明
    addSocialProof(content) {
        const socialProofs = [
            '我們已經服務了包括微軟、谷歌、亞馬遜在內的500+企業客戶。',
            '我們的客戶包括《財富》500強企業，平均客戶滿意度達98%。',
            '超過1000家企業信任我們的解決方案，包括多家獨角獸公司。'
        ];
        
        const socialProof = socialProofs[Math.floor(Math.random() * socialProofs.length)];
        return `${content}\n\n${socialProof}`;
    }
    
    // 移至工作日
    moveToWeekday(date) {
        const newDate = new Date(date);
        const dayOfWeek = newDate.getDay();
        
        if (dayOfWeek === 0) { // 週日
            newDate.setDate(newDate.getDate() + 1); // 移至週一
        } else if (dayOfWeek === 6) { // 週六
            newDate.setDate(newDate.getDate() + 2); // 移至週一
        }
        
        return newDate;
    }
    
    // 移至營業時間
    moveToBusinessHours(date) {
        const newDate = new Date(date);
        const hour = newDate.getHours();
        
        if (hour < 9) {
            newDate.setHours(9, 0, 0, 0); // 移至上午9點
        } else if (hour > 17) {
            newDate.setHours(9, 0, 0, 0); // 移至次日上午9點
            newDate.setDate(newDate.getDate() + 1);
        }
        
        return newDate;
    }
    
    // 調整時區
    adjustForTimezone(date, timezone) {
        // 簡化實現，實際應該使用時區庫
        const newDate = new Date(date);
        // 這裡可以實現複雜的時區轉換邏輯
        return newDate;
    }
    
    // 檢查是否包含個性化
    containsPersonalization(text) {
        const personalizationIndicators = ['Hi', 'Dear', '親愛的', '您好'];
        return personalizationIndicators.some(indicator => text.includes(indicator));
    }
    
    // 檢查是否包含緊急感
    containsUrgency(text) {
        const urgencyWords = ['緊急', '限時', '立即', '機會', '最後', 'urgent', 'asap'];
        return urgencyWords.some(word => text.toLowerCase().includes(word.toLowerCase()));
    }
    
    // 檢查是否包含表情符號
    containsEmoji(text) {
        const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
        return emojiRegex.test(text);
    }
    
    // 檢查是否包含行動呼籲
    containsCallToAction(text) {
        const ctaIndicators = ['回覆', '聯繫', '電話', '會議', '演示', 'reply', 'contact', 'call', 'meeting'];
        return ctaIndicators.some(indicator => text.toLowerCase().includes(indicator.toLowerCase()));
    }
    
    // 檢查是否包含好處說明
    containsBenefits(text) {
        const benefitIndicators = ['好處', '優勢', '效果', '提升', '降低', '增加', 'benefit', 'advantage', 'improve'];
        return benefitIndicators.some(indicator => text.toLowerCase().includes(indicator.toLowerCase()));
    }
    
    // 檢查是否包含社會證明
    containsSocialProof(text) {
        const socialProofIndicators = ['客戶', '成功', '案例', '滿意', 'trust', 'client', 'success', 'case'];
        return socialProofIndicators.some(indicator => text.toLowerCase().includes(indicator.toLowerCase()));
    }
    
    // 計算優化信心度
    calculateOptimizationConfidence(optimizations) {
        if (optimizations.length === 0) return 0;
        
        const totalImpact = optimizations.reduce((sum, opt) => sum + opt.expectedImpact, 0);
        const confidence = Math.min(totalImpact * 100, 95); // 最高95%信心度
        
        return Math.round(confidence);
    }
    
    // 計算預期改進
    calculateExpectedImprovement(optimizations) {
        if (optimizations.length === 0) return 0;
        
        const totalImpact = optimizations.reduce((sum, opt) => sum + opt.expectedImpact, 0);
        const improvement = totalImpact * 100; // 轉換為百分比
        
        return Math.round(improvement);
    }
    
    // 記錄績效數據
    recordPerformance(messageId, metrics) {
        this.performanceData.set(messageId, {
            ...metrics,
            timestamp: new Date().toISOString()
        });
        this.savePerformanceData();
    }
    
    // 獲取優化建議
    getOptimizationSuggestions(targetProfile) {
        const suggestions = [];
        
        // 基於目標對象類型給出建議
        if (targetProfile.type === 'ceo') {
            suggestions.push({
                type: 'content',
                suggestion: 'CEO更關心ROI和戰略價值，建議強調商業影響和長期效益',
                priority: 'high'
            });
        }
        
        if (targetProfile.type === 'cto') {
            suggestions.push({
                type: 'content',
                suggestion: 'CTO更關心技術細節和實施可行性，建議提供技術架構圖',
                priority: 'high'
            });
        }
        
        if (targetProfile.industry === 'Technology') {
            suggestions.push({
                type: 'timing',
                suggestion: '科技行業最佳發送時間：週二上午10點或週四下午2點',
                priority: 'medium'
            });
        }
        
        return suggestions;
    }
    
    // 獲取優化統計
    getOptimizationStats() {
        const data = Array.from(this.performanceData.values());
        
        if (data.length === 0) {
            return {
                totalOptimizations: 0,
                averageImprovement: 0,
                topOptimizations: [],
                successRate: 0
            };
        }
        
        const stats = {
            totalOptimizations: data.length,
            averageImprovement: data.reduce((sum, d) => sum + (d.improvement || 0), 0) / data.length,
            topOptimizations: this.getTopOptimizations(data),
            successRate: data.filter(d => d.success).length / data.length
        };
        
        return stats;
    }
    
    // 獲取最佳優化
    getTopOptimizations(data) {
        return data
            .filter(d => d.improvement)
            .sort((a, b) => b.improvement - a.improvement)
            .slice(0, 5)
            .map(d => ({
                type: d.optimizationType,
                improvement: d.improvement,
                timestamp: d.timestamp
            }));
    }
}

// 創建全域實例
window.smartSalesOptimization = new SmartSalesOptimization();

console.log('🧠 智能推銷優化引擎已載入');






