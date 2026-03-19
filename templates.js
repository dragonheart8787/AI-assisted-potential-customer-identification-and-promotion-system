// 訊息模板系統 - 整合對話式推銷策略
const messageTemplates = {
    product_intro: {
        name: '產品介紹模板',
        description: '用於介紹新產品或服務（整合WIIFM策略）',
        subject: '關於{product_name}如何為{company}帶來{key_benefit}',
        content: `親愛的 {leader_name}，

我是 {your_name}，來自 {company_name}。我注意到{company}在{relevant_challenge}方面的卓越表現，想與您分享一個可能對貴公司有價值的解決方案。

🎯 **直指核心問題**
目前許多{industry}企業在{problem_description}上面臨挑戰。我們開發的{product_name}專門解決這個問題。

🚀 **立即價值（WIIFM）**
• {feature_1} - 這意味著您可以{benefit_1}
• {feature_2} - 為您節省{cost_saving}的成本  
• {feature_3} - 提升{performance_metric}達{improvement_percentage}

📊 **已驗證成果**
我們與{reference_company}的合作中，{specific_result}。這讓我想到貴公司在{specific_area}的需求可能也會從中受益。

💡 **為什麼現在很重要**
根據{industry_authority}最新報告，{market_trend}。這個趨勢正是{product_name}設計要解決的核心問題。

🤝 **簡單下一步**
我很樂意花15分鐘時間，根據{company}的具體情況，展示這個方案如何為您帶來實際價值。

期待您的回覆。如果您認為這個時機不合適，也請告訴我什麼時候方便，我會配合您的時間。

最佳問候,
{your_name}
{contact_info}`,
        variables: [
            'leader_name', 'your_name', 'company_name', 'product_name', 
            'company', 'relevant_challenge', 'industry', 'problem_description',
            'key_benefit', 'feature_1', 'benefit_1', 'feature_2', 'cost_saving',
            'feature_3', 'performance_metric', 'improvement_percentage',
            'reference_company', 'specific_result', 'specific_area',
            'industry_authority', 'market_trend', 'contact_info'
        ],
        personalizable: true,
        strategies: ['WIIFM', '黃金一分鐘', '社會認同', '稀缺感']
    },

    partnership: {
        name: '合作提案模板',
        description: '提出業務合作或戰略聯盟（運用互惠原則）',
        subject: '互惠合作機會：{partnership_type}',
        content: `{leader_name} 您好，

我是 {your_name}，{company_name} 的 {your_title}。我一直關注並敬佩{company}在{industry_area}領域的創新成就，特別是您最近在{recent_achievement}方面的突破。

🎁 **先為您提供價值**
在開始談合作之前，我想先分享一份我們團隊剛完成的{industry_area}趨勢分析報告。這份報告可能對{company}未來六個月的策略規劃有所幫助。[附件]

🤝 **合作提案背景**
我們觀察到{market_observation}，這為像{company}這樣的領先企業創造了{opportunity_type}的機會。

💡 **具體合作方向**
我們希望探討在{cooperation_area}方面的合作可能：

• **對{company}的價值：** {benefit_for_them}
• **協同效應：** {synergy_description}  
• **市場優勢：** {market_advantage}

📈 **為什麼現在是最佳時機**
{timing_rationale}。基於這個趨勢，我們相信現在開始合作能夠搶佔先機。

🚀 **低風險試水**
我建議我們先從{small_pilot_project}開始，這樣可以在低風險的情況下測試合作模式的效果。

如果您對此感興趣，我很樂意安排一次30分鐘的電話會議，深入討論細節。當然，我理解您時間寶貴，如果現在不是合適的時機，請告訴我何時更方便。

此致
{your_name}
{contact_info}`,
        variables: [
            'leader_name', 'your_name', 'company_name', 'your_title',
            'company', 'industry_area', 'recent_achievement', 'partnership_type',
            'market_observation', 'opportunity_type', 'cooperation_area',
            'benefit_for_them', 'synergy_description', 'market_advantage',
            'timing_rationale', 'small_pilot_project', 'contact_info'
        ],
        personalizable: true,
        strategies: ['互惠原則', '社會認同', '稀缺感', '承諾一致']
    },

    investment: {
        name: '投資邀請模板',
        description: '尋求投資或資金支持（運用權威和社會認同）',
        subject: '投資機會：{market_size}市場的{disruptive_solution}',
        content: `{leader_name} 您好，

我是 {your_name}，{company_name} 的創辦人。基於您在{investment_area}領域的卓越投資眼光，我想與您分享一個正在改變{industry}的創新機會。

🎯 **巨大市場機會**
我們正在解決一個價值{market_size}的市場痛點：{market_problem}

根據{authoritative_source}的研究，這個問題每年造成{industry}企業損失{loss_amount}。更重要的是，{market_trend_data}表明，解決方案的需求正在急速增長。

💰 **投資概要**
• **融資目標：** {funding_goal}
• **估值：** {valuation}  
• **資金用途：** {fund_usage}
• **預期回報：** {expected_return}

🌟 **已驗證的吸引力**
• {validation_point_1}
• {validation_point_2}  
• {validation_point_3}

👥 **頂級支持者**
我們很榮幸得到{advisor_1}和{advisor_2}的策略指導，以及{existing_investor}的投資支持。{industry_expert}也公開表示看好我們的方向。

📈 **為什麼是現在**
{timing_catalyst}正在推動市場變化，我們的解決方案恰好處於這個變革的核心。首輪融資只開放給{limited_number}位戰略投資者。

🚀 **邀請您加入**
我相信以您在{relevant_experience}的豐富經驗，不僅能為我們帶來資金支持，更能提供寶貴的戰略指導。

我準備了完整的投資簡報，如果您有興趣了解更多，我很樂意安排一次45分鐘的私人會議詳細介紹。

感謝您的時間和考慮。

{your_name}
{contact_info}`,
        variables: [
            'leader_name', 'your_name', 'company_name', 'investment_area',
            'industry', 'market_size', 'market_problem', 'authoritative_source',
            'loss_amount', 'market_trend_data', 'funding_goal', 'valuation',
            'fund_usage', 'expected_return', 'validation_point_1', 
            'validation_point_2', 'validation_point_3', 'advisor_1', 'advisor_2',
            'existing_investor', 'industry_expert', 'timing_catalyst',
            'limited_number', 'relevant_experience', 'disruptive_solution',
            'contact_info'
        ],
        personalizable: true,
        strategies: ['權威效應', '社會認同', '稀缺感', 'WIIFM']
    },

    feedback: {
        name: '意見諮詢模板',
        description: '尋求專業建議和回饋（運用喜好和權威策略）',
        subject: '請教您對{expertise_topic}的專業見解',
        content: `親愛的 {leader_name}，

我是 {your_name}，一名{your_background}。我一直深深敬佩您在{expertise_area}領域的卓越成就和前瞻洞察，特別是您{specific_achievement}的創舉。

🤔 **為什麼向您求教**
我們目前在{current_project}項目上遇到了一些具有挑戰性的問題，這些問題恰好是您專精的領域。我相信您的經驗能為我們提供寶貴指導。

📋 **具體情況**
我們正在{project_description}，已經取得了{progress_made}的進展。然而，在{specific_challenge}方面，我們面臨以下問題：

1. {question_1}
2. {question_2}
3. {question_3}

💡 **我們的嘗試**
目前我們已經嘗試了{attempted_solutions}，但效果不如預期。我們懷疑可能是在{suspected_issue}方面需要調整。

🎯 **您的建議對我們的價值**
基於您在{similar_experience}的成功經驗，我們相信您的建議能幫我們：
• 避免常見的陷阱
• 找到最優解決路徑  
• 節省寶貴的時間和資源

⏰ **非常簡短的時間**
我知道您時間寶貴，如果您願意，我只需要{time_request}分鐘的電話諮詢，甚至幾行文字的建議對我們都會非常有價值。

🙏 **感謝與回饋**
作為感謝，我們會：
• 將您列為我們項目的advisors（如果您同意）
• 定期分享我們的進展和成果
• 在合適的時候為您的企業提供我們專業領域的建議

無論您是否有時間給予建議，我都要感謝您一直以來對行業發展的貢獻。您的工作激勵了包括我在內的許多從業者。

最誠摯的問候,
{your_name}
{contact_info}`,
        variables: [
            'leader_name', 'your_name', 'your_background', 'expertise_area',
            'specific_achievement', 'current_project', 'project_description',
            'progress_made', 'specific_challenge', 'question_1', 'question_2',
            'question_3', 'attempted_solutions', 'suspected_issue',
            'similar_experience', 'time_request', 'expertise_topic', 'contact_info'
        ],
        personalizable: true,
        strategies: ['權威認可', '互惠原則', '喜好建立', '謙遜求教']
    },

    // 新增：對話式開場模板
    conversation_opener: {
        name: '對話式開場模板',
        description: '以問題引導開始對話，而非直接推銷',
        subject: '關於{topic}的一個問題',
        content: `{leader_name} 您好，

我是 {your_name}，來自 {company_name}。我一直在關注{company}在{business_area}方面的發展，特別印象深刻的是{recent_news_or_achievement}。

我想請教您一個問題：**{engaging_question}**

這個問題的背景是{question_context}。我之所以想到這個問題，是因為{reason_for_asking}。

基於我們在{your_expertise_area}的經驗，我們發現{observation}，但我很好奇從您的角度來看，{curiosity_about_their_perspective}？

如果這個話題引起您的興趣，我很樂意分享我們在這方面的一些研究發現。當然，我更期待聽到您的見解。

期待您的回覆。

最佳問候,
{your_name}
{contact_info}`,
        variables: [
            'leader_name', 'your_name', 'company_name', 'company',
            'business_area', 'recent_news_or_achievement', 'engaging_question',
            'question_context', 'reason_for_asking', 'your_expertise_area',
            'observation', 'curiosity_about_their_perspective', 'topic', 'contact_info'
        ],
        personalizable: true,
        strategies: ['對話引導', '好奇心驅動', '相互學習']
    }
};

// 個人化規則 - 整合心理觸發點策略
const personalizationRules = {
    sam_altman: {
        greetingStyle: '直接稱呼名字',
        focusAreas: ['AI安全', '長期影響', '社會效益', 'AGI發展'],
        avoidTopics: ['短期利益', '炒作性內容', '不負責任的AI應用'],
        preferredTone: '誠懇直接',
        keyPhrases: ['確保AI安全', '造福全人類', '長遠考量', '負責任發展'],
        psychTriggers: ['權威認可', '社會認同', '長期價值'],
        communicationStyle: '喜歡深度技術討論，重視AI倫理和安全性',
        bestApproach: '從AI安全角度切入，強調技術的社會責任'
    },
    
    sundar_pichai: {
        greetingStyle: '謙遜禮貌',
        focusAreas: ['全球影響', '技術普及', '教育價值', '數碼包容'],
        avoidTopics: ['排他性內容', '地域限制', '技術壟斷'],
        preferredTone: '溫和包容',
        keyPhrases: ['幫助更多人', '全球合作', '技術民主化', '普惠科技'],
        psychTriggers: ['社會認同', '互惠原則', '權威認可'],
        communicationStyle: '注重全球視野，喜歡討論技術如何讓更多人受益',
        bestApproach: '強調技術的包容性和全球影響力'
    },
    
    elon_musk: {
        greetingStyle: '簡潔直接',
        focusAreas: ['根本創新', '10倍改進', '第一性原理', '可持續發展'],
        avoidTopics: ['漸進式改進', '傳統做法', '短視思維'],
        preferredTone: '直白挑戰',
        keyPhrases: ['第一性原理', '根本解決', '顛覆性創新', '火星殖民'],
        psychTriggers: ['稀缺感', '顛覆權威', '未來願景'],
        communicationStyle: '喜歡挑戰傳統，討論突破性創新和未來科技',
        bestApproach: '展示根本性創新，用第一性原理分析問題'
    },
    
    mark_zuckerberg: {
        greetingStyle: '友好直接',
        focusAreas: ['連接人群', '平台效應', '元宇宙', '社群建設'],
        avoidTopics: ['隱私爭議', '監管問題', '反壟斷'],
        preferredTone: '務實進取',
        keyPhrases: ['連接世界', '社群價值', '規模化影響', '元宇宙未來'],
        psychTriggers: ['社會認同', '網路效應', '未來願景'],
        communicationStyle: '重視規模效應和社群連接，對元宇宙技術充滿熱情',
        bestApproach: '從連接和社群角度出發，討論平台價值'
    },
    
    tim_cook: {
        greetingStyle: '正式尊重',
        focusAreas: ['用戶隱私', '產品體驗', '社會責任', '環境保護'],
        avoidTopics: ['隱私侵犯', '低品質產品', '環境破壞'],
        preferredTone: '價值導向',
        keyPhrases: ['用戶至上', '隱私保護', '品質第一', '社會責任'],
        psychTriggers: ['價值認同', '品質保證', '社會責任'],
        communicationStyle: '強調價值觀和用戶體驗，重視企業社會責任',
        bestApproach: '從用戶價值和社會責任角度切入'
    },

    // 新增其他領袖的詳細個人化規則
    jensen_huang: {
        greetingStyle: '熱情專業',
        focusAreas: ['平行運算', 'AI加速', '運算革新', '技術突破'],
        avoidTopics: ['傳統CPU思維', '低效運算'],
        preferredTone: '充滿熱情',
        keyPhrases: ['加速運算', 'AI無處不在', '運算革命', '平行處理'],
        psychTriggers: ['技術權威', '未來趨勢', '效能提升'],
        communicationStyle: '對GPU和AI運算充滿熱情，喜歡討論技術革新',
        bestApproach: '從運算效能和AI加速角度展示技術價值'
    },

    satya_nadella: {
        greetingStyle: '同理包容',
        focusAreas: ['雲端運算', '生產力', 'AI協作', '數位轉型'],
        avoidTopics: ['競爭對立', '技術孤島'],
        preferredTone: '協作賦能',
        keyPhrases: ['賦能每個人', '數位轉型', '雲端優先', '協作創新'],
        psychTriggers: ['協作共贏', '賦能他人', '包容成長'],
        communicationStyle: '重視賦能和協作，強調技術如何幫助每個人成就更多',
        bestApproach: '從賦能和協作角度，展示如何幫助用戶成就更多'
    }
};

// 平台適配規則
const platformAdaptation = {
    twitter: {
        maxLength: 280,
        style: '簡潔有力',
        useHashtags: true,
        useMentions: true,
        emojiUsage: '適度使用'
    },
    
    linkedin: {
        maxLength: 3000,
        style: '專業正式',
        useHashtags: false,
        useMentions: true,
        emojiUsage: '謹慎使用'
    },
    
    instagram: {
        maxLength: 2200,
        style: '視覺友好',
        useHashtags: true,
        useMentions: true,
        emojiUsage: '積極使用'
    }
};

// 模板處理函數
class TemplateProcessor {
    constructor() {
        this.templates = messageTemplates;
        this.personalization = personalizationRules;
        this.platformRules = platformAdaptation;
    }
    
    // 獲取模板
    getTemplate(templateId) {
        return this.templates[templateId] || null;
    }
    
    // 處理變數替換
    processTemplate(templateId, variables) {
        const template = this.getTemplate(templateId);
        if (!template) return null;
        
        let subject = template.subject;
        let content = template.content;
        
        // 替換變數
        Object.keys(variables).forEach(key => {
            const placeholder = `{${key}}`;
            subject = subject.replace(new RegExp(placeholder, 'g'), variables[key] || '');
            content = content.replace(new RegExp(placeholder, 'g'), variables[key] || '');
        });
        
        return {
            subject: subject,
            content: content,
            originalTemplate: template
        };
    }
    
    // 個人化訊息
    personalizeMessage(message, leaderId) {
        const rules = this.personalization[leaderId];
        if (!rules) return message;
        
        let personalizedMessage = message;
        
        // 添加關鍵詞組
        if (rules.keyPhrases && rules.keyPhrases.length > 0) {
            const randomPhrase = rules.keyPhrases[Math.floor(Math.random() * rules.keyPhrases.length)];
            personalizedMessage += `\n\nP.S. 我們特別重視${randomPhrase}的理念。`;
        }
        
        return personalizedMessage;
    }
    
    // 平台適配
    adaptToPlatform(message, platform) {
        const rules = this.platformRules[platform];
        if (!rules) return message;
        
        let adaptedMessage = message;
        
        // 長度限制
        if (message.length > rules.maxLength) {
            adaptedMessage = message.substring(0, rules.maxLength - 3) + '...';
        }
        
        // 根據平台調整格式
        switch (platform) {
            case 'twitter':
                // 添加適當的標籤
                adaptedMessage += '\n\n#Innovation #TechLeadership';
                break;
            case 'linkedin':
                // 更正式的結尾
                adaptedMessage += '\n\n期待您的回覆。';
                break;
            case 'instagram':
                // 添加相關emoji
                adaptedMessage = '✨ ' + adaptedMessage + ' 🚀';
                break;
        }
        
        return adaptedMessage;
    }
    
    // 獲取所有模板列表
    getAllTemplates() {
        return Object.keys(this.templates).map(key => ({
            id: key,
            name: this.templates[key].name,
            description: this.templates[key].description
        }));
    }
}

// 策略整合函數
class AdvancedTemplateProcessor extends TemplateProcessor {
    constructor() {
        super();
        this.conversationalStrategies = {
            'WIIFM': this.applyWIIFMStrategy.bind(this),
            '黃金一分鐘': this.applyGoldenMinuteStrategy.bind(this),
            '對話引導': this.applyConversationalStrategy.bind(this),
            '心理觸發': this.applyPsychTriggers.bind(this)
        };
    }

    // 應用WIIFM策略（What's In It For Me）
    applyWIIFMStrategy(message, leaderId) {
        const leader = personalizationRules[leaderId]; // Assuming techLeaders is not defined, using personalizationRules directly
        if (!leader) return message;

        // 在訊息開頭加入針對對方利益的陳述
        const wiifmIntro = `這個方案將為${leader.company}在${leader.focus[0]}方面帶來直接價值：`;
        
        return message.replace(
            /^(.*?)([🎯🚀💡].*?)/m, 
            `$1\n\n💎 **為您帶來的價值**\n${wiifmIntro}\n\n$2`
        );
    }

    // 應用黃金一分鐘策略
    applyGoldenMinuteStrategy(message, leaderId) {
        const leader = personalizationRules[leaderId]; // Assuming techLeaders is not defined, using personalizationRules directly
        if (!leader) return message;

        // 確保在前段就有吸引注意力的內容
        const hookLine = `我注意到${leader.company}在${leader.focus[0]}領域的領先地位，想分享一個可能讓您感興趣的突破性想法。`;
        
        return message.replace(
            /(親愛的.*?，\n\n)/,
            `$1${hookLine}\n\n`
        );
    }

    // 應用對話引導策略
    applyConversationalStrategy(message, leaderId) {
        const leader = personalizationRules[leaderId]; // Assuming techLeaders is not defined, using personalizationRules directly
        if (!leader) return message;

        // 在訊息中加入問題引導
        const engagingQuestion = `在您看來，${leader.focus[0]}領域最大的挑戰是什麼？`;
        
        return message + `\n\n❓ **我很好奇您的觀點**\n${engagingQuestion}\n\n期待與您交流想法。`;
    }

    // 應用心理觸發點
    applyPsychTriggers(message, leaderId) {
        const rules = this.personalization[leaderId];
        if (!rules || !rules.psychTriggers) return message;

        let enhancedMessage = message;

        // 根據該領袖偏好的心理觸發點調整內容
        rules.psychTriggers.forEach(trigger => {
            switch(trigger) {
                case '社會認同':
                    enhancedMessage = this.addSocialProof(enhancedMessage, leaderId);
                    break;
                case '稀缺感':
                    enhancedMessage = this.addScarcity(enhancedMessage, leaderId);
                    break;
                case '權威認可':
                    enhancedMessage = this.addAuthority(enhancedMessage, leaderId);
                    break;
            }
        });

        return enhancedMessage;
    }

    // 添加社會認同元素
    addSocialProof(message, leaderId) {
        const leader = personalizationRules[leaderId]; // Assuming techLeaders is not defined, using personalizationRules directly
        const socialProofLine = `目前已有多家${leader.company}同級企業採用了類似方案。`;
        
        return message.replace(
            /(📊.*?已驗證.*?)/,
            `$1\n${socialProofLine}`
        );
    }

    // 添加稀缺感元素
    addScarcity(message, leaderId) {
        const scarcityLine = `我們目前只與5家戰略夥伴進行深度合作。`;
        
        return message.replace(
            /(🚀.*?下一步.*?)/,
            `$1\n\n⏰ **限量合作機會**\n${scarcityLine}`
        );
    }

    // 添加權威認可元素
    addAuthority(message, leaderId) {
        const authorityLine = `這個方案獲得了MIT AI Lab和Stanford HAI的技術認可。`;
        
        return message.replace(
            /(💡.*?重要.*?)/,
            `$1\n\n🎓 **學術權威支持**\n${authorityLine}`
        );
    }

    // 增強的個人化訊息處理
    personalizeMessage(message, leaderId) {
        const rules = this.personalization[leaderId];
        if (!rules) return message;

        let personalizedMessage = super.personalizeMessage(message, leaderId);

        // 應用溝通風格調整
        if (rules.communicationStyle) {
            personalizedMessage = this.adjustCommunicationStyle(personalizedMessage, rules);
        }

        // 應用最佳方法建議
        if (rules.bestApproach) {
            personalizedMessage = this.applyBestApproach(personalizedMessage, rules);
        }

        return personalizedMessage;
    }

    // 調整溝通風格
    adjustCommunicationStyle(message, rules) {
        // 根據領袖的溝通風格偏好調整語調和重點
        const styleNote = `\n\n💭 **溝通建議**：${rules.communicationStyle}`;
        return message + styleNote;
    }

    // 應用最佳方法
    applyBestApproach(message, rules) {
        const approachHint = `\n\n🎯 **建議重點**：${rules.bestApproach}`;
        return message + approachHint;
    }
}

// 導出增強版模板處理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        messageTemplates, 
        personalizationRules, 
        platformAdaptation, 
        TemplateProcessor, 
        AdvancedTemplateProcessor 
    };
} 