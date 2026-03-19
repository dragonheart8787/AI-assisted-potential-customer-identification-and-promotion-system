/**
 * AI 知識庫模組
 * 產品服務、價格、案例、話術、行業模板、品牌語氣
 */
class AIKnowledgeBase {
    constructor() {
        this.products = [];
        this.cases = [];
        this.templates = [];
        this.faq = [];
        this.tone = 'professional';
        this.init();
    }

    init() {
        this.loadData();
        if (this.products.length === 0) this.loadDefaults();
    }

    loadData() {
        const p = localStorage.getItem('ai_kb_products');
        if (p) this.products = JSON.parse(p);
        const c = localStorage.getItem('ai_kb_cases');
        if (c) this.cases = JSON.parse(c);
        const t = localStorage.getItem('ai_kb_templates');
        if (t) this.templates = JSON.parse(t);
        const f = localStorage.getItem('ai_kb_faq');
        if (f) this.faq = JSON.parse(f);
        this.tone = localStorage.getItem('ai_kb_tone') || 'professional';
    }

    saveData() {
        localStorage.setItem('ai_kb_products', JSON.stringify(this.products));
        localStorage.setItem('ai_kb_cases', JSON.stringify(this.cases));
        localStorage.setItem('ai_kb_templates', JSON.stringify(this.templates));
        localStorage.setItem('ai_kb_faq', JSON.stringify(this.faq));
        localStorage.setItem('ai_kb_tone', this.tone);
    }

    loadDefaults() {
        this.products = [
            { name: '網站建置與重做', description: '響應式網站、Landing Page、電商網站', benefits: ['提升轉換率', '行動友善', 'SEO 優化'], priceRange: '依需求報價' },
            { name: 'SEO 與文案服務', description: '關鍵字優化、內容策略、Landing Page 文案', benefits: ['自然流量成長', '品牌能見度', '轉換優化'], priceRange: '月費制或專案' },
            { name: '資安健檢與顧問', description: '弱點掃描、安全設定建議、合規諮詢', benefits: ['降低風險', '符合規範', '客戶信任'], priceRange: '單次或年度合約' }
        ];
        this.cases = [
            { industry: '餐飲業', result: '官網流量提升 40%，線上訂位增加', summary: '響應式官網 + 線上訂位整合' },
            { industry: '零售業', result: '電商轉換率提升 25%', summary: 'Landing Page 優化 + 結帳流程改善' },
            { industry: 'B2B', result: '潛在客戶詢問量增加 60%', summary: 'SEO 策略 + 案例頁面優化' }
        ];
        this.templates = [
            { name: '正式商務', tone: 'professional', opening: '尊敬的 {name}，' },
            { name: '簡潔直接', tone: 'direct', opening: '{name} 您好，' },
            { name: '顧問式建議', tone: 'consultative', opening: '在檢視貴公司網站後，我們發現幾個可優化的方向。' },
            { name: '資安警示', tone: 'urgent', opening: '我們注意到貴公司網站可能存在資安風險，' }
        ];
        this.faq = [
            { q: '服務流程為何？', a: '需求確認 → 報價 → 簽約 → 執行 → 驗收' },
            { q: '報價方式？', a: '依專案規模與需求客製化報價' },
            { q: '是否有維護服務？', a: '提供年度維護與技術支援方案' }
        ];
        this.saveData();
    }

    /** 依產業回傳不同話術模板（缺口三：產業切換） */
    getIndustryTemplates(industry) {
        const industryMap = {
            '餐飲業': { tone: 'direct', focus: '線上訂位、外帶、官網曝光', caseAngle: '餐飲業官網流量提升案例' },
            '零售業': { tone: 'direct', focus: '電商轉換、Landing Page', caseAngle: '零售轉換率提升' },
            'B2B': { tone: 'professional', focus: 'SEO、案例頁、詢價表單', caseAngle: 'B2B 潛在客戶詢問量' },
            '電商賣家': { tone: 'direct', focus: '結帳流程、商品頁優化', caseAngle: '電商轉換率' },
            '美容美髮': { tone: 'friendly', focus: '預約系統、作品集', caseAngle: '預約轉換' },
            '資安': { tone: 'urgent', focus: 'HTTPS、安全標頭、合規', caseAngle: '資安強化' }
        };
        const def = { tone: 'professional', focus: '官網優化、轉換率', caseAngle: '整體網站體驗' };
        return industryMap[industry] || def;
    }

    getContextForAI(options = {}) {
        const { industry, needType, tone } = options;
        const indTpl = industry ? this.getIndustryTemplates(industry) : null;
        const toneKey = tone || indTpl?.tone || this.tone;
        const template = this.templates.find(t => t.tone === toneKey) || this.templates[0];
        const relevantCases = industry ? this.cases.filter(c => c.industry === industry) : this.cases;
        const productList = this.products.map(p => `- ${p.name}: ${p.description} (${p.priceRange})`).join('\n');
        const caseList = relevantCases.map(c => `- ${c.industry}: ${c.result}`).join('\n');

        const indFocus = indTpl ? `【產業重點】${indTpl.focus}\n【案例切入】${indTpl.caseAngle}\n` : '';
        return `
【產品與服務】
${productList}

【成功案例】
${caseList}
${indFocus}
【建議語氣】${template.name}
【開頭範例】${template.opening}

【常見問題】
${this.faq.map(f => `Q: ${f.q}\nA: ${f.a}`).join('\n\n')}
`.trim();
    }

    addProduct(p) { this.products.push(p); this.saveData(); }
    addCase(c) { this.cases.push(c); this.saveData(); }
    addTemplate(t) { this.templates.push(t); this.saveData(); }
    addFaq(f) { this.faq.push(f); this.saveData(); }
    setTone(t) { this.tone = t; this.saveData(); }
}
window.aiKnowledgeBase = new AIKnowledgeBase();
