/**
 * 取得目標客戶列表 - 合併 CRM 客戶與社交媒體發現的商家/隱藏客群
 * 目標：所有商家 + 隱藏客群（取代原 CEO/領袖）
 */
function getTargetProspects() {
    const prospects = [];
    const seenIds = new Set();
    
    // 1. 從 CRM 取得客戶
    if (window.crmDatabase) {
        const customers = window.crmDatabase.getAllCustomers();
        customers.forEach(c => {
            if (seenIds.has(c.id)) return;
            seenIds.add(c.id);
            prospects.push({
                id: c.id,
                name: c.name,
                title: c.title || '負責人',
                company: c.company,
                email: c.email,
                industry: c.industry,
                website: c.website,
                websiteAnalysis: c.websiteAnalysis,
                leadScore: c.leadScore,
                needType: c.needType,
                urgency: c.urgency,
                avatar: '🏢',
                focus: [c.industry || '商業'].filter(Boolean),
                platforms: buildPlatformsFromCustomer(c),
                bio: `${c.company} - ${c.title || '商家/客戶'}`,
                bestTime: '工作日 9-18 時',
                messageStyle: '簡潔專業',
                source: 'crm'
            });
        });
    }
    
    // 2. 從社交媒體發現的商家與隱藏客群
    if (window.socialMediaProspectCrawler) {
        const discovered = window.socialMediaProspectCrawler.getDiscoveredProspects();
        discovered.forEach(p => {
            if (seenIds.has(p.id)) return;
            seenIds.add(p.id);
            prospects.push({
                id: p.id,
                name: p.name,
                title: p.title || '負責人',
                company: p.company,
                avatar: p.avatar || '🏪',
                focus: p.focus || [p.type || '商家'],
                platforms: p.platforms || {},
                bio: `${p.company} (${p.type || '商家'})${p.customerGroup ? ' - ' + p.customerGroup : ''}`,
                bestTime: '工作日',
                messageStyle: '依產業調整',
                source: 'social_media',
                platform: p.platform
            });
        });
    }
    
    return prospects.length > 0 ? prospects : getDefaultMerchantProspects();
}

function buildPlatformsFromCustomer(c) {
    const platforms = {};
    if (c.linkedin) platforms.linkedin = { handle: c.linkedin, url: c.linkedin, active: true };
    if (c.twitter) platforms.twitter = { handle: c.twitter, url: c.twitter, active: true };
    if (c.email) platforms.email = { handle: c.email, url: 'mailto:' + c.email, active: true };
    return Object.keys(platforms).length ? platforms : { general: { handle: c.email || c.company, active: true } };
}

// 無資料時回傳空陣列（不再使用假資料）
function getDefaultMerchantProspects() {
    return [];
}

// 向後相容：techLeaders 動態合併商家與隱藏客群
function getTechLeadersObject() {
    const prospects = getTargetProspects();
    const obj = {};
    prospects.forEach(p => { obj[p.id] = p; });
    return obj;
}
const techLeaders = new Proxy({}, {
    get(_, prop) {
        const obj = getTechLeadersObject();
        if (prop === 'constructor' || prop === 'toString') return Object.prototype[prop];
        return obj[prop];
    },
    ownKeys() { return Object.keys(getTechLeadersObject()); },
    getOwnPropertyDescriptor() { return { enumerable: true, configurable: true }; }
});

// 保留原始科技領袖資料供參考（可選用）
const _legacyTechLeaders = {
    sam_altman: {
        id: 'sam_altman',
        name: 'Sam Altman',
        title: 'OpenAI CEO',
        company: 'OpenAI',
        avatar: '🧠',
        focus: ['AGI發展', 'AI安全', '創業精神', '未來科技'],
        platforms: {
            twitter: {
                handle: '@sama',
                url: 'https://twitter.com/sama',
                verified: true,
                followers: '2.5M+',
                active: true
            }
        },
        bio: 'OpenAI執行長，致力於開發安全的通用人工智慧',
        bestTime: '美國西岸上午時段',
        messageStyle: '簡潔直接，著重長期影響和AI安全'
    },
    
    sundar_pichai: {
        id: 'sundar_pichai',
        name: 'Sundar Pichai',
        title: 'Google CEO',
        company: 'Google',
        avatar: '🔍',
        focus: ['AI普及化', '數位包容', '全球合作', '教育科技'],
        platforms: {
            twitter: {
                handle: '@sundarpichai',
                url: 'https://twitter.com/sundarpichai',
                verified: true,
                followers: '5.5M+',
                active: true
            },
            instagram: {
                handle: '@sundarpichai',
                url: 'https://instagram.com/sundarpichai',
                verified: true,
                followers: '4M+',
                active: true
            },
            linkedin: {
                handle: 'Sundar Pichai',
                url: 'https://linkedin.com/in/sundarpichai',
                verified: true,
                followers: '20M+',
                active: true
            }
        },
        bio: 'Google執行長，推動AI技術民主化和全球數位轉型',
        bestTime: '印度時間上午或美國西岸下午',
        messageStyle: '溫和謙遜，強調全球影響和包容性'
    },

    demis_hassabis: {
        id: 'demis_hassabis',
        name: 'Demis Hassabis',
        title: 'Google DeepMind CEO',
        company: 'Google DeepMind',
        avatar: '🧬',
        focus: ['科學研究', '深度學習', '蛋白質摺疊', '遊戲AI'],
        platforms: {
            twitter: {
                handle: '@demishassabis',
                url: 'https://twitter.com/demishassabis',
                verified: true,
                followers: '800K+',
                active: true
            }
        },
        bio: 'DeepMind創辦人，致力於解決人類最大的挑戰',
        bestTime: '英國時間工作日',
        messageStyle: '學術嚴謹，重視科學突破和研究價值'
    },

    mark_zuckerberg: {
        id: 'mark_zuckerberg',
        name: 'Mark Zuckerberg',
        title: 'Meta CEO',
        company: 'Meta',
        avatar: '🌐',
        focus: ['元宇宙', 'VR/AR', '社群網路', '開放平台'],
        platforms: {
            facebook: {
                handle: 'Mark Zuckerberg',
                url: 'https://facebook.com/zuck',
                verified: true,
                followers: '100M+',
                active: true
            },
            instagram: {
                handle: '@zuck',
                url: 'https://instagram.com/zuck',
                verified: true,
                followers: '16M+',
                active: true
            },
            twitter: {
                handle: '@finkd',
                url: 'https://twitter.com/finkd',
                verified: true,
                followers: '100K+',
                active: false,
                note: '很少使用，主要在特殊情況下發文'
            }
        },
        bio: 'Meta創辦人，致力於建立元宇宙和連接世界',
        bestTime: '美國西岸時間',
        messageStyle: '直接務實，著重規模化影響和連接'
    },

    yann_lecun: {
        id: 'yann_lecun',
        name: 'Yann LeCun',
        title: 'Meta首席AI科學家',
        company: 'Meta',
        avatar: '🔬',
        focus: ['深度學習', '自監督學習', '機器學習理論', 'AI倫理'],
        platforms: {
            twitter: {
                handle: '@ylecun',
                url: 'https://twitter.com/ylecun',
                verified: true,
                followers: '920K+',
                active: true
            }
        },
        bio: '圖靈獎得主，深度學習先驅，Meta首席AI科學家',
        bestTime: '美國時間工作日',
        messageStyle: '學術權威，直言不諱，注重技術細節'
    },

    andy_jassy: {
        id: 'andy_jassy',
        name: 'Andy Jassy',
        title: 'Amazon CEO',
        company: 'Amazon',
        avatar: '📦',
        focus: ['雲端服務', '企業解決方案', '客戶至上', '創新服務'],
        platforms: {
            twitter: {
                handle: '@ajassy',
                url: 'https://twitter.com/ajassy',
                verified: true,
                followers: '500K+',
                active: true
            }
        },
        bio: 'Amazon執行長，雲端運算和企業服務專家',
        bestTime: '美國東岸時間',
        messageStyle: '商業導向，注重客戶價值和實用性'
    },

    jeff_bezos: {
        id: 'jeff_bezos',
        name: 'Jeff Bezos',
        title: 'Amazon創辦人',
        company: 'Amazon',
        avatar: '🚀',
        focus: ['太空探索', '長期投資', '客戶導向', 'Day 1心態'],
        platforms: {
            instagram: {
                handle: '@jeffbezos',
                url: 'https://instagram.com/jeffbezos',
                verified: true,
                followers: '4M+',
                active: true
            },
            twitter: {
                handle: '@JeffBezos',
                url: 'https://twitter.com/JeffBezos',
                verified: true,
                followers: '5M+',
                active: true
            }
        },
        bio: 'Amazon創辦人，現專注於太空探索和慈善事業',
        bestTime: '美國時間',
        messageStyle: '富有遠見，強調長期價值和創新'
    },

    elon_musk: {
        id: 'elon_musk',
        name: 'Elon Musk',
        title: 'Tesla/X CEO',
        company: 'Tesla/X',
        avatar: '⚡',
        focus: ['永續能源', '太空探索', '神經科學', 'AI安全'],
        platforms: {
            twitter: {
                handle: '@elonmusk',
                url: 'https://twitter.com/elonmusk',
                verified: true,
                followers: '200M+',
                active: true,
                note: 'X平台擁有者，極度活躍'
            }
        },
        bio: 'Tesla和X執行長，致力於永續能源和火星移民',
        bestTime: '任何時間（極度活躍）',
        messageStyle: '直白幽默，挑戰傳統，追求根本創新'
    },

    satya_nadella: {
        id: 'satya_nadella',
        name: 'Satya Nadella',
        title: 'Microsoft CEO',
        company: 'Microsoft',
        avatar: '💻',
        focus: ['雲端運算', '生產力工具', 'AI協作', '包容性設計'],
        platforms: {
            twitter: {
                handle: '@satyanadella',
                url: 'https://twitter.com/satyanadella',
                verified: true,
                followers: '3.4M+',
                active: true
            },
            linkedin: {
                handle: 'Satya Nadella',
                url: 'https://linkedin.com/in/satyanadella',
                verified: true,
                followers: '20M+',
                active: true
            }
        },
        bio: 'Microsoft執行長，推動雲端優先和AI驅動的數位轉型',
        bestTime: '美國西岸時間',
        messageStyle: '同理協作，強調賦能和包容性'
    },

    jensen_huang: {
        id: 'jensen_huang',
        name: 'Jensen Huang (黃仁勳)',
        title: 'NVIDIA CEO',
        company: 'NVIDIA',
        avatar: '🔥',
        focus: ['平行運算', 'AI晶片', '圖形技術', '加速運算'],
        platforms: {
            linkedin: {
                handle: 'Jensen Huang',
                url: 'https://linkedin.com/in/jenhsunhuang',
                verified: true,
                followers: '380K+',
                active: true
            }
        },
        bio: 'NVIDIA創辦人兼執行長，GPU和AI晶片技術領導者',
        bestTime: '美國西岸時間',
        messageStyle: '充滿熱情，技術導向，強調運算革新'
    },

    tim_cook: {
        id: 'tim_cook',
        name: 'Tim Cook',
        title: 'Apple CEO',
        company: 'Apple',
        avatar: '🍎',
        focus: ['用戶隱私', '產品設計', '供應鏈', '社會責任'],
        platforms: {
            twitter: {
                handle: '@tim_cook',
                url: 'https://twitter.com/tim_cook',
                verified: true,
                followers: '13M+',
                active: true
            },
            weibo: {
                handle: '庫克@微博',
                url: 'https://weibo.com/timcook',
                verified: true,
                followers: '2M+',
                active: true,
                note: '專門為中國市場經營'
            }
        },
        bio: 'Apple執行長，注重隱私保護和用戶體驗',
        bestTime: '美國西岸時間',
        messageStyle: '溫和堅定，注重價值觀和用戶體驗'
    }
};

// 導出 getTargetProspects 供其他模組使用
if (typeof window !== 'undefined') {
    window.getTargetProspects = getTargetProspects;
}

// 平台資訊
const platformInfo = {
    twitter: {
        name: 'X (Twitter)',
        icon: '🐦',
        characterLimit: 280,
        apiEndpoint: 'https://api.twitter.com/2/',
        features: ['直接訊息', '公開回覆', '提及'],
        guidelines: '簡潔有力，使用相關標籤'
    },
    linkedin: {
        name: 'LinkedIn',
        icon: '💼',
        characterLimit: 3000,
        apiEndpoint: 'https://api.linkedin.com/v2/',
        features: ['私人訊息', '專業網路', '商業焦點'],
        guidelines: '專業正式，商業導向'
    },
    instagram: {
        name: 'Instagram',
        icon: '📸',
        characterLimit: 2200,
        apiEndpoint: 'https://graph.instagram.com/',
        features: ['直接訊息', '限時動態', '視覺內容'],
        guidelines: '視覺吸引，生活化內容'
    },
    facebook: {
        name: 'Facebook',
        icon: '📘',
        characterLimit: 63206,
        apiEndpoint: 'https://graph.facebook.com/',
        features: ['私人訊息', '頁面訊息', '群組'],
        guidelines: '詳細內容，社群互動'
    },
    weibo: {
        name: '新浪微博',
        icon: '🇨🇳',
        characterLimit: 140,
        apiEndpoint: 'https://api.weibo.com/2/',
        features: ['私信', '評論', '@提及'],
        guidelines: '中文內容，文化適應'
    }
};

// 導出資料
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { techLeaders, platformInfo };
} 