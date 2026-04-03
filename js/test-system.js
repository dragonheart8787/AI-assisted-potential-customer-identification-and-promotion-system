// 全面系統測試腳本 - 僅在瀏覽器環境中運行
class SystemTester {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
        this.currentTest = '';
    }
    
    async runAllTests() {
        console.log('🚀 開始全面系統測試...');
        
        // 測試基本功能
        await this.testBasicFunctions();
        
        // 測試AI功能
        await this.testAIFunctions();
        
        // 測試真實傳送功能
        await this.testRealSendingFunctions();
        
        // 測試智能機器人功能
        await this.testIntelligentBotFunctions();
        
        // 測試對話增強功能
        await this.testConversationEnhancerFunctions();
        
        // 測試AI強化模組
        await this.testAIEnhancementFunctions();
        
        // 測試 CRM 與 AI 整合
        await this.testCRMAIIntegration();
        
        // 顯示測試結果
        this.displayTestResults();
    }
    
    // 測試基本功能
    async testBasicFunctions() {
        this.startTestSection('基本功能測試');
        
        // 測試頁面載入
        await this.test('頁面載入', () => {
            return typeof document !== 'undefined' && document.body !== null;
        });
        
        // 測試主要組件存在
        await this.test('主要組件載入', () => {
            if (typeof document === 'undefined') return false;
            
            const requiredElements = [
                'leaders-list',
                'message-subject',
                'message-content',
                'send-btn'
            ];
            
            return requiredElements.every(id => document.getElementById(id) !== null);
        });
        
        // 測試領袖數據載入
        await this.test('領袖數據載入', () => {
            return typeof techLeaders !== 'undefined' && Object.keys(techLeaders).length > 0;
        });
        
        // 測試模板系統
        await this.test('模板系統', () => {
            return typeof messageTemplates !== 'undefined' && Object.keys(messageTemplates).length > 0;
        });
        
        // 測試本地存儲
        await this.test('本地存儲', () => {
            try {
                if (typeof localStorage === 'undefined') return false;
                localStorage.setItem('test', 'test');
                const result = localStorage.getItem('test') === 'test';
                localStorage.removeItem('test');
                return result;
            } catch (e) {
                return false;
            }
        });
    }
    
    // 測試AI功能
    async testAIFunctions() {
        this.startTestSection('AI功能測試');
        
        // 測試AI對話模型
        await this.test('AI對話模型初始化', () => {
            return typeof window !== 'undefined' && typeof window.aiConversationModel !== 'undefined';
        });
        
        // 測試AI建議功能
        await this.test('AI建議功能', () => {
            if (typeof document === 'undefined') return false;
            const aiSuggestBtn = document.getElementById('ai-suggest');
            return aiSuggestBtn !== null;
        });
        
        // 測試AI生成功能
        await this.test('AI生成功能', () => {
            if (typeof document === 'undefined') return false;
            const aiGenerateBtn = document.getElementById('ai-generate');
            return aiGenerateBtn !== null;
        });
        
        // 測試AI分析功能
        await this.test('AI分析功能', () => {
            if (typeof document === 'undefined') return false;
            const aiAnalyzeBtn = document.getElementById('ai-analyze');
            return aiAnalyzeBtn !== null;
        });
        
        // 測試AI優化功能
        await this.test('AI優化功能', () => {
            if (typeof document === 'undefined') return false;
            const aiOptimizeBtn = document.getElementById('ai-optimize');
            return aiOptimizeBtn !== null;
        });
        
        // 測試 AI 推廣助手
        await this.test('AI推廣助手模組', () => {
            return typeof window !== 'undefined' && typeof window.aiAssistant !== 'undefined';
        });
        
        // 測試 AI 工作流程
        await this.test('AI推廣工作流程', () => {
            return typeof window !== 'undefined' && typeof window.aiPromotionWorkflow !== 'undefined';
        });
        
        // 測試 AI 訊息生成
        await this.test('AI訊息生成功能', () => {
            if (window.aiAssistant) {
                return typeof window.aiAssistant.generatePromotionMessage === 'function';
            }
            return false;
        });
        
        // 測試 AI 客戶分類
        await this.test('AI客戶分類功能', () => {
            if (window.aiAssistant) {
                return typeof window.aiAssistant.classifyCustomer === 'function';
            }
            return false;
        });
    }
    
    // 測試真實傳送功能
    async testRealSendingFunctions() {
        this.startTestSection('真實傳送功能測試');
        
        // 測試真實帳號整合
        await this.test('真實帳號整合模組', () => {
            return typeof window !== 'undefined' && typeof window.realAccountIntegration !== 'undefined';
        });
        
        // 測試API端點配置
        await this.test('API端點配置', () => {
            if (window.realAccountIntegration) {
                const endpoints = window.realAccountIntegration.apiEndpoints;
                return endpoints && Object.keys(endpoints).length > 0;
            }
            return false;
        });
        
        // 測試平台支援
        await this.test('平台支援檢查', () => {
            if (window.realAccountIntegration) {
                const platforms = window.realAccountIntegration.getSupportedPlatforms();
                return platforms && platforms.length > 0;
            }
            return false;
        });
        
        // 測試帳號管理
        await this.test('帳號管理功能', () => {
            if (window.realAccountIntegration) {
                return typeof window.realAccountIntegration.hasAuthenticatedAccounts === 'function';
            }
            return false;
        });
    }
    
    // 測試 CRM 與 AI 整合
    async testCRMAIIntegration() {
        this.startTestSection('CRM 與 AI 整合測試');
        
        await this.test('CRM 資料庫', () => {
            return typeof window !== 'undefined' && typeof window.crmDatabase !== 'undefined';
        });
        
        await this.test('CRM 智能搜尋', () => {
            if (window.crmDatabase) {
                return typeof window.crmDatabase.smartSearchCustomers === 'function';
            }
            return false;
        });
        
        await this.test('CRM AI 分類', () => {
            if (window.crmDatabase) {
                return typeof window.crmDatabase.getAIClassification === 'function';
            }
            return false;
        });
    }
    
    // 測試智能機器人功能
    async testIntelligentBotFunctions() {
        this.startTestSection('智能機器人功能測試');
        
        // 測試智能機器人初始化
        await this.test('智能機器人初始化', () => {
            return typeof window !== 'undefined' && typeof window.intelligentAutoBot !== 'undefined';
        });
        
        // 測試智能引擎
        await this.test('智能引擎', () => {
            if (window.intelligentAutoBot) {
                return window.intelligentAutoBot.intelligenceEngine !== undefined;
            }
            return false;
        });
        
        // 測試實時追蹤
        await this.test('實時追蹤', () => {
            if (window.intelligentAutoBot) {
                return window.intelligentAutoBot.realTimeTracker !== undefined;
            }
            return false;
        });
        
        // 測試自動回應
        await this.test('自動回應', () => {
            if (window.intelligentAutoBot) {
                return window.intelligentAutoBot.autoResponder !== undefined;
            }
            return false;
        });
        
        // 測試真實傳送測試功能
        await this.test('真實傳送測試功能', () => {
            if (window.intelligentAutoBot) {
                return typeof window.intelligentAutoBot.testRealSending === 'function';
            }
            return false;
        });
    }
    
    // 測試對話增強功能
    async testConversationEnhancerFunctions() {
        this.startTestSection('對話增強功能測試');
        
        // 測試對話增強器初始化
        await this.test('對話增強器初始化', () => {
            return typeof window !== 'undefined' && typeof window.conversationEnhancer !== 'undefined';
        });
        
        // 測試對話模式
        await this.test('對話模式功能', () => {
            if (window.conversationEnhancer) {
                return typeof window.conversationEnhancer.switchConversationMode === 'function';
            }
            return false;
        });
        
        // 測試智能建議
        await this.test('智能建議功能', () => {
            if (window.conversationEnhancer) {
                return typeof window.conversationEnhancer.generateSmartSuggestions === 'function';
            }
            return false;
        });
        
        // 測試情境分析
        await this.test('情境分析功能', () => {
            if (window.conversationEnhancer) {
                return typeof window.conversationEnhancer.analyzeContext === 'function';
            }
            return false;
        });
    }
    
    // 測試AI強化模組
    async testAIEnhancementFunctions() {
        this.startTestSection('AI強化模組測試');
        
        // 測試AI強化模組初始化
        await this.test('AI強化模組初始化', () => {
            return typeof window !== 'undefined' && typeof window.aiEnhancementModule !== 'undefined';
        });
        
        // 測試深度情感分析
        await this.test('深度情感分析', () => {
            if (window.aiEnhancementModule) {
                return typeof window.aiEnhancementModule.performAdvancedSentimentAnalysis === 'function';
            }
            return false;
        });
        
        // 測試智能優化
        await this.test('智能優化', () => {
            if (window.aiEnhancementModule) {
                return typeof window.aiEnhancementModule.performAdvancedOptimization === 'function';
            }
            return false;
        });
        
        // 測試對話流程
        await this.test('對話流程', () => {
            if (window.aiEnhancementModule) {
                return typeof window.aiEnhancementModule.generateConversationFlow === 'function';
            }
            return false;
        });
        
        // 測試個性匹配
        await this.test('個性匹配', () => {
            if (window.aiEnhancementModule) {
                return typeof window.aiEnhancementModule.matchPersonality === 'function';
            }
            return false;
        });
        
        // 測試情境感知
        await this.test('情境感知', () => {
            if (window.aiEnhancementModule) {
                return typeof window.aiEnhancementModule.analyzeContext === 'function';
            }
            return false;
        });
    }
    
    // 執行單個測試
    async test(testName, testFunction) {
        this.currentTest = testName;
        this.testResults.total++;
        
        try {
            const result = await testFunction();
            
            if (result) {
                this.testResults.passed++;
                this.logTestResult(testName, '✅ 通過');
            } else {
                this.testResults.failed++;
                this.logTestResult(testName, '❌ 失敗');
            }
            
            this.testResults.details.push({
                name: testName,
                status: result ? 'passed' : 'failed',
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            this.testResults.failed++;
            this.logTestResult(testName, `❌ 錯誤: ${error.message}`);
            
            this.testResults.details.push({
                name: testName,
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    // 開始測試區段
    startTestSection(sectionName) {
        console.log(`\n📋 ${sectionName}`);
        console.log('='.repeat(50));
    }
    
    // 記錄測試結果
    logTestResult(testName, result) {
        console.log(`${result} ${testName}`);
    }
    
    // 顯示測試結果
    displayTestResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 測試結果摘要');
        console.log('='.repeat(60));
        
        const { passed, failed, total } = this.testResults;
        const successRate = ((passed / total) * 100).toFixed(1);
        
        console.log(`總測試數: ${total}`);
        console.log(`通過: ${passed} ✅`);
        console.log(`失敗: ${failed} ❌`);
        console.log(`成功率: ${successRate}%`);
        
        if (failed > 0) {
            console.log('\n❌ 失敗的測試:');
            this.testResults.details
                .filter(detail => detail.status !== 'passed')
                .forEach(detail => {
                    console.log(`  - ${detail.name}: ${detail.error || '測試失敗'}`);
                });
        }
        
        // 顯示詳細結果
        this.displayDetailedResults();
        
        // 顯示建議
        this.displayRecommendations();
    }
    
    // 顯示詳細結果
    displayDetailedResults() {
        console.log('\n📋 詳細測試結果:');
        console.log('-'.repeat(40));
        
        const sections = {};
        this.testResults.details.forEach(detail => {
            const section = detail.name.split(' ')[0];
            if (!sections[section]) sections[section] = [];
            sections[section].push(detail);
        });
        
        Object.entries(sections).forEach(([section, tests]) => {
            const passed = tests.filter(t => t.status === 'passed').length;
            const total = tests.length;
            const rate = ((passed / total) * 100).toFixed(1);
            
            console.log(`${section}: ${passed}/${total} (${rate}%)`);
        });
    }
    
    // 顯示建議
    displayRecommendations() {
        console.log('\n💡 建議:');
        
        if (this.testResults.failed === 0) {
            console.log('🎉 所有測試通過！系統運行正常。');
        } else {
            console.log('⚠️ 發現一些問題，建議檢查：');
            
            const failedTests = this.testResults.details.filter(d => d.status !== 'passed');
            
            if (failedTests.some(t => t.name.includes('AI'))) {
                console.log('  - AI功能可能需要重新初始化');
            }
            
            if (failedTests.some(t => t.name.includes('真實傳送'))) {
                console.log('  - 真實傳送功能可能需要配置API金鑰');
            }
            
            if (failedTests.some(t => t.name.includes('智能機器人'))) {
                console.log('  - 智能機器人可能需要重新載入');
            }
        }
        
        console.log('\n🔧 下一步：');
        console.log('  1. 在瀏覽器中開啟 http://localhost:8000');
        console.log('  2. 測試各個功能按鈕');
        console.log('  3. 添加真實帳號進行實際測試');
    }
}

// 只在瀏覽器環境中初始化測試
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // 頁面載入完成後執行測試
    document.addEventListener('DOMContentLoaded', async () => {
        // 等待所有模組載入
        setTimeout(async () => {
            const tester = new SystemTester();
            await tester.runAllTests();
        }, 2000);
    });
    
    // 導出測試器供手動使用
    window.SystemTester = SystemTester;
} 