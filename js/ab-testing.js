/**
 * A/B測試系統
 * 支援多版本訊息測試、績效追蹤、自動選擇最佳版本
 */

class ABTestingSystem {
    constructor() {
        this.tests = [];
        this.testResults = [];
        this.currentTestId = null;
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
    }

    // 載入資料
    loadData() {
        const savedTests = localStorage.getItem('ab_tests');
        if (savedTests) {
            this.tests = JSON.parse(savedTests);
        }

        const savedResults = localStorage.getItem('ab_test_results');
        if (savedResults) {
            this.testResults = JSON.parse(savedResults);
        }
    }

    // 保存資料
    saveData() {
        localStorage.setItem('ab_tests', JSON.stringify(this.tests));
        localStorage.setItem('ab_test_results', JSON.stringify(this.testResults));
    }

    // 設置事件監聽器
    setupEventListeners() {
        // 監聽訊息發送事件
        document.addEventListener('messageSent', (event) => {
            this.recordMessageSent(event.detail);
        });

        // 監聽回覆事件
        document.addEventListener('messageReplied', (event) => {
            this.recordMessageReplied(event.detail);
        });
    }

    // 創建A/B測試
    createTest(testData) {
        const test = {
            id: this.generateId(),
            name: testData.name,
            description: testData.description,
            variants: testData.variants, // [{ id, name, content, subject }]
            targetAudience: testData.targetAudience,
            startDate: new Date().toISOString(),
            endDate: testData.endDate,
            status: 'active', // 'active', 'paused', 'completed'
            trafficSplit: testData.trafficSplit || 50, // 50/50 split by default
            metrics: {
                totalSent: 0,
                totalOpened: 0,
                totalReplied: 0,
                totalPositive: 0,
                totalNegative: 0
            },
            createdAt: new Date().toISOString()
        };

        this.tests.push(test);
        this.saveData();
        this.triggerEvent('testCreated', test);
        return test;
    }

    // 選擇測試變體
    selectVariant(testId, customerId) {
        const test = this.tests.find(t => t.id === testId);
        if (!test || test.status !== 'active') {
            return null;
        }

        // 使用客戶ID的雜湊值來確保一致性
        const hash = this.hashString(customerId + testId);
        const variantIndex = hash % test.variants.length;
        
        return test.variants[variantIndex];
    }

    // 記錄訊息發送
    recordMessageSent(data) {
        const { testId, variantId, customerId, platform, timestamp } = data;
        
        const result = {
            id: this.generateId(),
            testId,
            variantId,
            customerId,
            platform,
            action: 'sent',
            timestamp: timestamp || new Date().toISOString(),
            metadata: data.metadata || {}
        };

        this.testResults.push(result);

        // 更新測試統計
        const test = this.tests.find(t => t.id === testId);
        if (test) {
            test.metrics.totalSent++;
        }

        this.saveData();
        this.triggerEvent('messageSentRecorded', result);
    }

    // 記錄訊息開啟
    recordMessageOpened(data) {
        const { testId, variantId, customerId, platform, timestamp } = data;
        
        const result = {
            id: this.generateId(),
            testId,
            variantId,
            customerId,
            platform,
            action: 'opened',
            timestamp: timestamp || new Date().toISOString(),
            metadata: data.metadata || {}
        };

        this.testResults.push(result);

        // 更新測試統計
        const test = this.tests.find(t => t.id === testId);
        if (test) {
            test.metrics.totalOpened++;
        }

        this.saveData();
        this.triggerEvent('messageOpenedRecorded', result);
    }

    // 記錄訊息回覆
    recordMessageReplied(data) {
        const { testId, variantId, customerId, platform, sentiment, timestamp } = data;
        
        const result = {
            id: this.generateId(),
            testId,
            variantId,
            customerId,
            platform,
            action: 'replied',
            sentiment: sentiment || 'neutral',
            timestamp: timestamp || new Date().toISOString(),
            metadata: data.metadata || {}
        };

        this.testResults.push(result);

        // 更新測試統計
        const test = this.tests.find(t => t.id === testId);
        if (test) {
            test.metrics.totalReplied++;
            if (sentiment === 'positive') {
                test.metrics.totalPositive++;
            } else if (sentiment === 'negative') {
                test.metrics.totalNegative++;
            }
        }

        this.saveData();
        this.triggerEvent('messageRepliedRecorded', result);
    }

    // 獲取測試結果
    getTestResults(testId) {
        const test = this.tests.find(t => t.id === testId);
        if (!test) return null;

        const results = this.testResults.filter(r => r.testId === testId);
        const variantResults = {};

        // 按變體分組結果
        test.variants.forEach(variant => {
            const variantData = results.filter(r => r.variantId === variant.id);
            
            const sent = variantData.filter(r => r.action === 'sent').length;
            const opened = variantData.filter(r => r.action === 'opened').length;
            const replied = variantData.filter(r => r.action === 'replied').length;
            const positive = variantData.filter(r => r.sentiment === 'positive').length;
            const negative = variantData.filter(r => r.sentiment === 'negative').length;

            variantResults[variant.id] = {
                variant,
                metrics: {
                    sent,
                    opened,
                    replied,
                    positive,
                    negative,
                    openRate: sent > 0 ? (opened / sent * 100).toFixed(2) : 0,
                    replyRate: sent > 0 ? (replied / sent * 100).toFixed(2) : 0,
                    positiveRate: replied > 0 ? (positive / replied * 100).toFixed(2) : 0,
                    negativeRate: replied > 0 ? (negative / replied * 100).toFixed(2) : 0
                }
            };
        });

        return {
            test,
            variantResults,
            overallMetrics: test.metrics
        };
    }

    // 獲取最佳變體
    getBestVariant(testId, metric = 'replyRate') {
        const results = this.getTestResults(testId);
        if (!results) return null;

        let bestVariant = null;
        let bestScore = 0;

        Object.values(results.variantResults).forEach(variantData => {
            const score = parseFloat(variantData.metrics[metric]);
            if (score > bestScore) {
                bestScore = score;
                bestVariant = variantData.variant;
            }
        });

        return bestVariant;
    }

    // 獲取測試統計摘要
    getTestSummary(testId) {
        const results = this.getTestResults(testId);
        if (!results) return null;

        const variants = Object.values(results.variantResults);
        const totalSent = variants.reduce((sum, v) => sum + v.metrics.sent, 0);
        const totalOpened = variants.reduce((sum, v) => sum + v.metrics.opened, 0);
        const totalReplied = variants.reduce((sum, v) => sum + v.metrics.replied, 0);

        return {
            testName: results.test.name,
            totalSent,
            totalOpened,
            totalReplied,
            overallOpenRate: totalSent > 0 ? (totalOpened / totalSent * 100).toFixed(2) : 0,
            overallReplyRate: totalSent > 0 ? (totalReplied / totalSent * 100).toFixed(2) : 0,
            variants: variants.map(v => ({
                name: v.variant.name,
                openRate: v.metrics.openRate,
                replyRate: v.metrics.replyRate,
                positiveRate: v.metrics.positiveRate
            }))
        };
    }

    // 完成測試
    completeTest(testId) {
        const test = this.tests.find(t => t.id === testId);
        if (test) {
            test.status = 'completed';
            test.endDate = new Date().toISOString();
            this.saveData();
            this.triggerEvent('testCompleted', test);
        }
    }

    // 暫停測試
    pauseTest(testId) {
        const test = this.tests.find(t => t.id === testId);
        if (test) {
            test.status = 'paused';
            this.saveData();
            this.triggerEvent('testPaused', test);
        }
    }

    // 重新啟動測試
    resumeTest(testId) {
        const test = this.tests.find(t => t.id === testId);
        if (test) {
            test.status = 'active';
            this.saveData();
            this.triggerEvent('testResumed', test);
        }
    }

    // 刪除測試
    deleteTest(testId) {
        const index = this.tests.findIndex(t => t.id === testId);
        if (index !== -1) {
            const test = this.tests[index];
            this.tests.splice(index, 1);
            
            // 刪除相關結果
            this.testResults = this.testResults.filter(r => r.testId !== testId);
            
            this.saveData();
            this.triggerEvent('testDeleted', test);
        }
    }

    // 獲取所有測試
    getAllTests() {
        return this.tests;
    }

    // 獲取活躍測試
    getActiveTests() {
        return this.tests.filter(t => t.status === 'active');
    }

    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 字串雜湊函數
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    // 觸發自定義事件
    triggerEvent(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }

    // 匯出測試資料
    exportTestData(testId) {
        const results = this.getTestResults(testId);
        if (!results) return null;

        const csvData = [];
        csvData.push(['Test ID', 'Variant ID', 'Customer ID', 'Platform', 'Action', 'Sentiment', 'Timestamp']);

        const testResults = this.testResults.filter(r => r.testId === testId);
        testResults.forEach(result => {
            csvData.push([
                result.testId,
                result.variantId,
                result.customerId,
                result.platform,
                result.action,
                result.sentiment || '',
                result.timestamp
            ]);
        });

        return csvData.map(row => row.join(',')).join('\n');
    }

    // 獲取績效報表
    getPerformanceReport(testId) {
        const results = this.getTestResults(testId);
        if (!results) return null;

        const variants = Object.values(results.variantResults);
        const report = {
            testName: results.test.name,
            testDuration: this.calculateTestDuration(results.test),
            totalParticipants: results.overallMetrics.totalSent,
            summary: {
                bestPerformingVariant: this.getBestVariant(testId),
                worstPerformingVariant: this.getWorstVariant(testId),
                statisticalSignificance: this.calculateStatisticalSignificance(results)
            },
            recommendations: this.generateRecommendations(results),
            detailedResults: variants
        };

        return report;
    }

    // 計算測試持續時間
    calculateTestDuration(test) {
        const start = new Date(test.startDate);
        const end = test.endDate ? new Date(test.endDate) : new Date();
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // 天數
    }

    // 獲取表現最差的變體
    getWorstVariant(testId) {
        const results = this.getTestResults(testId);
        if (!results) return null;

        let worstVariant = null;
        let worstScore = Infinity;

        Object.values(results.variantResults).forEach(variantData => {
            const score = parseFloat(variantData.metrics.replyRate);
            if (score < worstScore) {
                worstScore = score;
                worstVariant = variantData.variant;
            }
        });

        return worstVariant;
    }

    // 計算統計顯著性
    calculateStatisticalSignificance(results) {
        // 簡化的統計顯著性計算
        const variants = Object.values(results.variantResults);
        if (variants.length < 2) return 0;

        const scores = variants.map(v => parseFloat(v.metrics.replyRate));
        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);
        const difference = maxScore - minScore;

        // 簡單的顯著性指標（實際應用中應使用更複雜的統計測試）
        return Math.min(difference / 10, 1) * 100;
    }

    // 生成建議
    generateRecommendations(results) {
        const recommendations = [];
        const bestVariant = this.getBestVariant(results.test.id);
        const worstVariant = this.getWorstVariant(results.test.id);

        if (bestVariant && worstVariant) {
            const bestScore = parseFloat(Object.values(results.variantResults)
                .find(v => v.variant.id === bestVariant.id).metrics.replyRate);
            const worstScore = parseFloat(Object.values(results.variantResults)
                .find(v => v.variant.id === worstVariant.id).metrics.replyRate);

            if (bestScore > worstScore * 1.2) {
                recommendations.push(`建議使用「${bestVariant.name}」版本，其回覆率比「${worstVariant.name}」高${((bestScore - worstScore) / worstScore * 100).toFixed(1)}%`);
            }
        }

        return recommendations;
    }
}

// 創建全域實例
window.abTestingSystem = new ABTestingSystem();

