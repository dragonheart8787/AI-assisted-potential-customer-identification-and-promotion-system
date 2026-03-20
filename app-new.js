/**
 * 推廣中心 - 新介面邏輯（完整版）
 */

(function() {
    const pages = ['dashboard', 'prospects', 'compose', 'workflow', 'analytics', 'accounts', 'settings'];
    const pageTitles = { dashboard: '儀表板', prospects: '目標客戶', compose: '撰寫訊息', workflow: '工作流程', analytics: '成效分析', accounts: '帳號登入', settings: '設定' };
    let selectedProspectIds = new Set();

    const SHOWCASE_KEY = 'promo_showcase_auto_demo_v1';

    function refreshDemoBadge() {
        const t = document.getElementById('page-title');
        if (!t) return;
        t.querySelectorAll('.demo-tag').forEach(n => n.remove());
        if (localStorage.getItem('demo_mode') === '1') {
            const s = document.createElement('span');
            s.className = 'demo-tag';
            s.style.cssText = 'margin-left:10px;font-size:0.65em;background:#7c3aed;color:#fff;padding:4px 10px;border-radius:999px;vertical-align:middle';
            s.textContent = 'Demo';
            t.appendChild(s);
        }
    }

    async function ensureShowcaseDemo() {
        if (localStorage.getItem(SHOWCASE_KEY)) return;
        if (localStorage.getItem('demo_mode') === '1') {
            localStorage.setItem(SHOWCASE_KEY, '1');
            return;
        }
        let count = 0;
        try {
            const raw = localStorage.getItem('crm_customers');
            if (raw) count = (JSON.parse(raw) || []).length;
        } catch (_) {}
        if (count > 0) {
            localStorage.setItem(SHOWCASE_KEY, '1');
            return;
        }
        if (!window.demoMode) {
            localStorage.setItem(SHOWCASE_KEY, '1');
            return;
        }
        try {
            const n = await window.demoMode.apply();
            localStorage.setItem(SHOWCASE_KEY, '1');
            if (window.crmDatabase && typeof window.crmDatabase.loadData === 'function') {
                window.crmDatabase.loadData();
            }
            toast(`展示模式：已載入 ${n} 筆範例名單（無需 API 金鑰／OAuth）`);
        } catch (e) {
            localStorage.setItem(SHOWCASE_KEY, '1');
            toast('若未見範例資料，請先執行 run-demo.bat 啟動本機伺服器後重整', 'error');
        }
    }

    function init() {
        bindNav();
        bindButtons();
        loadProfile();
        (async () => {
            await ensureShowcaseDemo();
            loadDashboard();
            loadProspects();
            loadComposeTargets();
            refreshDemoBadge();
        })();
        refreshDemoBadge();
    }

    function bindNav() {
        document.querySelectorAll('.nav-item').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const page = el.dataset.page;
                if (page) switchPage(page);
            });
        });
    }

    function switchPage(pageId) {
        pages.forEach(p => {
            const pageEl = document.getElementById('page-' + p);
            const navEl = document.querySelector(`.nav-item[data-page="${p}"]`);
            if (pageEl) pageEl.classList.toggle('active', p === pageId);
            if (navEl) navEl.classList.toggle('active', p === pageId);
        });
        const titleEl = document.getElementById('page-title');
        if (titleEl) {
            titleEl.textContent = pageTitles[pageId] || pageId;
            refreshDemoBadge();
        }
        if (pageId === 'prospects') loadProspects();
        if (pageId === 'compose') loadComposeTargets();
        if (pageId === 'analytics') loadAnalytics();
    }

    function bindButtons() {
        document.getElementById('btn-discover')?.addEventListener('click', () => openDiscover());
        document.getElementById('discover-close')?.addEventListener('click', () => closeDiscover());
        document.getElementById('btn-import-csv')?.addEventListener('click', importCsv);
        document.getElementById('btn-search-prospects')?.addEventListener('click', () => loadProspects());
        document.getElementById('btn-compose')?.addEventListener('click', () => switchPage('compose'));
        document.getElementById('btn-workflow')?.addEventListener('click', () => switchPage('workflow'));
        document.getElementById('btn-run-workflow')?.addEventListener('click', runWorkflow);
        document.getElementById('btn-save-profile')?.addEventListener('click', saveProfile);
        document.getElementById('btn-preview')?.addEventListener('click', previewMessage);
        document.getElementById('btn-send')?.addEventListener('click', sendMessage);
        document.getElementById('btn-ai-generate')?.addEventListener('click', aiGenerateMessage);
        document.getElementById('btn-refresh')?.addEventListener('click', () => { loadDashboard(); loadProspects(); loadComposeTargets(); toast('已重新整理'); });
        document.getElementById('btn-test')?.addEventListener('click', () => window.open('debug/quick-test.html'));
        document.getElementById('btn-test-full')?.addEventListener('click', () => window.open('pages/test-app-new.html'));
        document.getElementById('btn-open-crm')?.addEventListener('click', () => window.open('pages/crm-interface.html'));
        document.getElementById('btn-open-ai')?.addEventListener('click', () => window.open('pages/ai-settings.html'));
        document.getElementById('link-crm')?.addEventListener('click', (e) => { e.preventDefault(); window.open('pages/crm-interface.html'); });
        document.getElementById('link-ai')?.addEventListener('click', (e) => { e.preventDefault(); window.open('pages/ai-settings.html'); });
        document.getElementById('link-workflow')?.addEventListener('click', (e) => { e.preventDefault(); window.open('pages/ai-promotion-workflow.html'); });
        document.getElementById('link-ai-kb')?.addEventListener('click', (e) => { e.preventDefault(); openKnowledgeBase(); });
        document.getElementById('btn-api-settings')?.addEventListener('click', () => window.open('pages/ai-settings.html'));
        document.getElementById('btn-open-crm-from-accounts')?.addEventListener('click', () => window.open('pages/crm-interface.html'));
        // 發現彈窗 tab 切換
        document.querySelectorAll('.discover-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                document.querySelectorAll('.discover-tabs .tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('tab-' + tab)?.classList.add('active');
            });
        });
        document.getElementById('btn-add-manual')?.addEventListener('click', addManualProspect);
        document.getElementById('btn-google-search')?.addEventListener('click', searchGooglePlaces);
        document.getElementById('btn-social-search')?.addEventListener('click', searchSocialPlaces);
        document.getElementById('btn-jobs-search')?.addEventListener('click', searchJobBoard);
        document.getElementById('btn-audit-report')?.addEventListener('click', () => generateReport('audit'));
        document.getElementById('btn-seo-report')?.addEventListener('click', () => generateReport('seo'));
        document.getElementById('btn-security-report')?.addEventListener('click', () => generateReport('security'));
        document.getElementById('btn-export-customers')?.addEventListener('click', () => {
            if (window.exportUtils) window.exportUtils.exportCustomersCSV();
            else toast('匯出模組未載入', 'error');
        });
        document.getElementById('btn-export-logs')?.addEventListener('click', () => {
            if (window.exportUtils) window.exportUtils.exportLogsCSV();
            else toast('匯出模組未載入', 'error');
        });
        document.getElementById('btn-demo-on')?.addEventListener('click', async () => {
            if (!window.demoMode) { toast('Demo 模組未載入', 'error'); return; }
            try {
                const n = await window.demoMode.apply();
                if (window.crmDatabase && typeof window.crmDatabase.loadData === 'function') {
                    window.crmDatabase.loadData();
                }
                toast(`已載入 ${n} 筆範例客戶，即將重新整理`);
                setTimeout(() => location.reload(), 800);
            } catch (e) {
                toast('啟用失敗：' + e.message + '（請確認後端已啟動）', 'error');
            }
        });
        document.getElementById('btn-demo-off')?.addEventListener('click', () => {
            if (!window.demoMode) return;
            window.demoMode.restore();
            toast('已還原並離開 Demo 模式');
            setTimeout(() => location.reload(), 500);
        });
    }

    async function fetchBackendConfig() {
        try {
            const origin = window.location?.origin || 'http://localhost:3856';
            const res = await fetch(`${origin}/api/config`);
            return await res.json();
        } catch {
            return {};
        }
    }

    function toast(msg, type = 'info') {
        const t = document.createElement('div');
        t.className = 'toast toast-' + type;
        t.textContent = msg;
        t.style.cssText = 'position:fixed;bottom:24px;right:24px;padding:12px 20px;background:#1a1f2e;border:1px solid #2a3142;border-radius:8px;color:#e4e8ef;font-size:0.9rem;z-index:9999;animation:fadeIn 0.2s';
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    }

    function loadDashboard() {
        const sent = JSON.parse(localStorage.getItem('sentMessages') || '[]');
        const pending = JSON.parse(localStorage.getItem('pendingMessages') || '[]');
        const prospects = typeof getTargetProspects === 'function' ? getTargetProspects() : [];

        const statSent = document.getElementById('stat-sent');
        const statPending = document.getElementById('stat-pending');
        const statCustomers = document.getElementById('stat-customers');
        if (statSent) statSent.textContent = sent.length;
        if (statPending) statPending.textContent = pending.length;
        if (statCustomers) statCustomers.textContent = prospects.length;

        const activityList = document.getElementById('activity-list');
        if (activityList) {
            const logs = sent.slice(-8).reverse();
            if (logs.length) {
                activityList.innerHTML = logs.map(l => `
                    <div class="activity-item">${escapeHtml(l.leaderName || '客戶')} · ${l.platform || '-'} · ${l.status || '已發送'}</div>
                `).join('');
            } else {
                activityList.innerHTML = '<div class="activity-empty">尚無活動記錄，請先撰寫並發送訊息</div>';
            }
        }

        const dueList = document.getElementById('due-followups');
        if (dueList && window.crmDatabase) {
            const due = window.crmDatabase.getDueFollowUps?.() || [];
            if (due.length) {
                dueList.innerHTML = due.slice(0, 5).map(c => `
                    <div class="activity-item">${escapeHtml(c.name || c.company)} · 應於 ${new Date(c.nextFollowUp).toLocaleDateString('zh-TW')} 跟進</div>
                `).join('');
            } else {
                dueList.innerHTML = '<div class="activity-empty">無待跟進客戶</div>';
            }
        }
    }

    function escapeHtml(s) {
        if (!s) return '';
        const d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    function deriveLeadReasonsLight(p) {
        const r = [];
        if (p.email) r.push('聯絡資訊完整（Email）');
        if (p.phone) r.push('具備電話聯絡管道');
        if (p.needType && p.needType !== '待分析') r.push(`需求類型：${p.needType}`);
        if (p.tags && p.tags.length) r.push('標籤：' + p.tags.slice(0, 3).join('、'));
        if (p.industry) r.push(`產業／客群：${p.industry}`);
        const t = (p.title || '').toLowerCase();
        if (/ceo|founder|chief|老闆|負責人|總經理|技術長|cto/i.test(t)) r.push('職稱顯示決策或影響力角色');
        return r.length ? r : ['綜合 CRM 欄位與互動紀錄評估'];
    }

    function buildProspectScoreSection(p) {
        let ws = p.website_need_score;
        let ss = p.security_need_score;
        const ls = p.leadScore;
        let wr = Array.isArray(p.website_need_reasons) ? p.website_need_reasons : [];
        let sr = Array.isArray(p.security_need_reasons) ? p.security_need_reasons : [];
        let lr = Array.isArray(p.lead_score_reasons) ? p.lead_score_reasons : [];
        if (p.websiteAnalysis && window.websiteAnalyzer) {
            try {
                const ew = window.websiteAnalyzer.explainWebsiteNeedScore(p.websiteAnalysis);
                const es = window.websiteAnalyzer.explainSecurityNeedScore(p.websiteAnalysis);
                if (ws == null) ws = ew.score;
                if (ss == null) ss = es.score;
                if (!wr.length) wr = ew.reasons;
                if (!sr.length) sr = es.reasons;
            } catch (_) {}
        }
        if (!lr.length && ls != null) lr = deriveLeadReasonsLight(p);
        const block = (label, score, reasons) => {
            if (score == null && !(reasons && reasons.length)) return '';
            const sc = score != null ? String(score) : '—';
            const ul = (reasons && reasons.length)
                ? `<ul class="score-reasons">${reasons.slice(0, 6).map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul>`
                : '';
            return `<div class="score-breakdown-block"><div class="score-row-mini"><span class="score-label">${escapeHtml(label)}</span><span class="score-num">${escapeHtml(sc)}</span></div>${ul}</div>`;
        };
        const parts = [
            block('website_need_score', ws, wr),
            block('security_need_score', ss, sr),
            block('lead_score', ls, lr)
        ].filter(Boolean);
        return parts.length ? `<div class="prospect-scores-explained">${parts.join('')}</div>` : '';
    }

    function loadProspects() {
        const grid = document.getElementById('prospect-grid');
        if (!grid) return;

        const prospects = typeof getTargetProspects === 'function' ? getTargetProspects() : [];
        const platform = document.getElementById('filter-platform')?.value;
        const category = document.getElementById('filter-category')?.value;
        const search = document.getElementById('search-prospects')?.value?.toLowerCase() || '';

        let filtered = prospects;
        if (platform) filtered = filtered.filter(p => (p.platform || p.source) === platform);
        if (category) filtered = filtered.filter(p => (p.type || p.category || '').includes(category));
        if (search) filtered = filtered.filter(p =>
            (p.name + p.company + (p.title || '')).toLowerCase().includes(search)
        );

        grid.innerHTML = filtered.map(p => `
            <div class="prospect-tile ${selectedProspectIds.has(p.id) ? 'selected' : ''}" data-id="${escapeHtml(p.id)}">
                <div class="prospect-tile-header">
                    <div class="prospect-avatar">${p.avatar || '◇'}</div>
                    <div class="prospect-tile-title-block">
                        <div class="prospect-name">${escapeHtml(p.name)}</div>
                        <div class="prospect-meta">${escapeHtml(p.company)} · ${escapeHtml(p.title || '負責人')}</div>
                    </div>
                </div>
                ${buildProspectScoreSection(p)}
                <div class="prospect-actions">
                    ${p.website ? `<button type="button" class="prospect-add-btn small" data-id="${escapeHtml(p.id)}" data-action="analyze">分析網站</button>` : ''}
                    <button type="button" class="prospect-add-btn" data-id="${escapeHtml(p.id)}">加入撰寫</button>
                </div>
            </div>
        `).join('') || '<div class="activity-empty" style="grid-column:1/-1">無符合的客戶，請點擊「開始搜尋」發現潛在客戶</div>';

        grid.querySelectorAll('.prospect-tile').forEach(tile => {
            tile.addEventListener('click', (e) => {
                if (e.target.classList.contains('prospect-add-btn')) return;
                tile.classList.toggle('selected');
                const id = tile.dataset.id;
                if (tile.classList.contains('selected')) selectedProspectIds.add(id);
                else selectedProspectIds.delete(id);
            });
        });
        grid.querySelectorAll('.prospect-add-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (btn.dataset.action === 'analyze') {
                    const prospect = prospects.find(x => x.id === btn.dataset.id);
                    if (prospect?.website && window.websiteAnalyzer && window.crmDatabase) {
                        toast('分析中...');
                        try {
                            const analysis = await window.websiteAnalyzer.analyze(prospect.website);
                            const customer = window.crmDatabase.findCustomerById(prospect.id);
                            if (customer) {
                                customer.websiteAnalysis = analysis;
                                customer.updatedAt = new Date().toISOString();
                                if (window.websiteAnalyzer.applyScoresToCustomer) {
                                    window.websiteAnalyzer.applyScoresToCustomer(customer, analysis);
                                }
                                window.crmDatabase.updateCustomer(customer);
                                const classification = window.aiAssistant ? await window.aiAssistant.classifyCustomer(customer) : null;
                                if (classification) {
                                    customer.leadScore = classification.lead_score ?? classification.score;
                                    customer.needType = classification.need_type;
                                    customer.urgency = classification.urgency;
                                    customer.lead_score_reasons = Array.isArray(classification.reasoning) && classification.reasoning.length
                                        ? classification.reasoning
                                        : deriveLeadReasonsLight({ ...customer, ...prospect });
                                    window.crmDatabase.updateCustomer(customer);
                                } else if (customer.leadScore == null) {
                                    customer.lead_score_reasons = deriveLeadReasonsLight({ ...customer, ...prospect });
                                    window.crmDatabase.updateCustomer(customer);
                                }
                                loadProspects();
                                toast(`分析完成，Lead 分數：${customer.leadScore ?? '-'}`);
                            }
                        } catch (err) {
                            toast('分析失敗: ' + err.message, 'error');
                        }
                    }
                    return;
                }
                selectedProspectIds.add(btn.dataset.id);
                switchPage('compose');
                loadComposeTargets();
                toast('已加入撰寫清單');
            });
        });
    }

    function loadComposeTargets() {
        const list = document.getElementById('compose-targets');
        if (!list) return;

        const prospects = typeof getTargetProspects === 'function' ? getTargetProspects() : [];
        const ids = selectedProspectIds.size ? selectedProspectIds : new Set(prospects.slice(0, 15).map(p => p.id));

        list.innerHTML = prospects.filter(p => ids.has(p.id)).map(p => `
            <label class="prospect-check-item ${ids.has(p.id) ? 'checked' : ''}">
                <input type="checkbox" value="${escapeHtml(p.id)}" data-name="${escapeHtml(p.name)}" ${ids.has(p.id) ? 'checked' : ''}>
                <span>${escapeHtml(p.name)} · ${escapeHtml(p.company)}</span>
            </label>
        `).join('') || '<div class="activity-empty">請先在目標客戶頁選擇客戶，或點擊「開始搜尋」發現潛在客戶</div>';
    }

    function loadProfile() {
        const saved = localStorage.getItem('userProfile');
        if (saved) {
            try {
                const p = JSON.parse(saved);
                const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
                set('set-name', p.name);
                set('set-company', p.company);
                set('set-title', p.title);
                set('set-industry', p.industry);
                set('set-email', p.email);
            } catch (e) {}
        }
    }

    function openDiscover() {
        document.getElementById('discover-overlay')?.classList.add('visible');
    }

    function closeDiscover() {
        document.getElementById('discover-overlay')?.classList.remove('visible');
    }

    async function searchGooglePlaces() {
        const query = document.getElementById('google-query')?.value?.trim();
        const location = document.getElementById('google-location')?.value?.trim();
        const type = document.getElementById('google-type')?.value || '';
        const resultsEl = document.getElementById('google-results');
        if (!query) {
            toast('請輸入搜尋關鍵字', 'error');
            return;
        }
        if (!window.googlePlacesCrawler) {
            toast('Google Places 模組未載入', 'error');
            return;
        }
        const cfg = await fetchBackendConfig();
        if (!cfg.hasGooglePlacesApiKey) {
            resultsEl.innerHTML = '<p class="muted-text" style="color:#f59e0b">尚未設定 Google Places API 金鑰。請編輯 <strong>backend-config.json</strong> 的 <code>googlePlacesApiKey</code>，並在 Google Cloud 啟用 Places API。</p><p class="muted-text">簡報時可改用「設定 → 啟用 Demo 模式」載入範例名單。</p>';
            toast('未設定 Google API 金鑰', 'error');
            return;
        }
        resultsEl.innerHTML = '<p class="muted-text">搜尋中...</p>';
        try {
            const prospects = await window.googlePlacesCrawler.search({ query, location, type });
            if (prospects.length === 0) {
                resultsEl.innerHTML = '<p class="muted-text">未找到結果，請確認 API 金鑰或調整關鍵字</p>';
                return;
            }
            let added = 0;
            const html = prospects.map(p => `
                <div class="discover-result-item" data-id="${escapeHtml(p.id)}">
                    <div class="info">
                        <strong>${escapeHtml(p.name)}</strong>
                        <small>${escapeHtml(p.address || '')} · ${escapeHtml(p.phone || '')}</small>
                    </div>
                    <button type="button" class="secondary-btn btn-add-one" data-id="${escapeHtml(p.id)}">加入</button>
                </div>
            `).join('');
            resultsEl.innerHTML = html;
            resultsEl.querySelectorAll('.btn-add-one').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const prospect = prospects.find(x => x.id === btn.dataset.id);
                    if (!prospect || !window.crmDatabase) return;
                    try {
                        window.crmDatabase.addCustomer({
                            name: prospect.name,
                            company: prospect.company,
                            email: prospect.email || `${prospect.id}@placeholder.local`,
                            title: prospect.title || '負責人',
                            phone: prospect.phone || '',
                            website: prospect.website || '',
                            industry: prospect.type || ''
                        });
                        added++;
                        btn.textContent = '已加入';
                        btn.disabled = true;
                        loadProspects();
                        loadDashboard();
                        toast('已加入目標客戶');
                    } catch (e) {
                        toast(e.message, 'error');
                    }
                });
            });
        } catch (e) {
            const msg = friendlyError(e.message);
            resultsEl.innerHTML = '<p class="muted-text" style="color:#e74c3c">' + escapeHtml(msg) + '</p>';
            toast(msg, 'error');
        }
    }

    function friendlyError(msg) {
        const m = String(msg || '');
        if (/certificate|issuer|SSL|TLS/i.test(m)) return 'SSL 憑證驗證失敗（請重啟後端；開發環境已放寬代理）。若仍失敗請檢查網路。';
        if (/CORS|Failed to fetch|NetworkError/i.test(m)) return '無法連線後端：請確認已執行 node backend-server.js，且網址為 http://localhost:3856';
        return m || '發生未知錯誤';
    }

    async function searchSocialPlaces() {
        const query = document.getElementById('social-query')?.value?.trim();
        const resultsEl = document.getElementById('social-results');
        if (!query) {
            toast('請輸入搜尋關鍵字', 'error');
            return;
        }
        if (!window.socialPlacesCrawler) {
            toast('社群搜尋模組未載入', 'error');
            return;
        }
        resultsEl.innerHTML = '<p class="muted-text">搜尋中...</p>';
        try {
            const prospects = await window.socialPlacesCrawler.search({ source: 'facebook', q: query });
            if (prospects.length === 0) {
                resultsEl.innerHTML = '<p class="muted-text">未找到結果，請確認已登入 Facebook</p>';
                return;
            }
            const html = prospects.map(p => `
                <div class="discover-result-item" data-id="${escapeHtml(p.id)}">
                    <div class="info">
                        <strong>${escapeHtml(p.name)}</strong>
                        <small>${escapeHtml(p.address || '')} · ${escapeHtml(p.phone || '')}</small>
                    </div>
                    <button type="button" class="secondary-btn btn-add-one" data-id="${escapeHtml(p.id)}">加入</button>
                </div>
            `).join('');
            resultsEl.innerHTML = html;
            resultsEl.querySelectorAll('.btn-add-one').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const prospect = prospects.find(x => x.id === btn.dataset.id);
                    if (!prospect || !window.crmDatabase) return;
                    try {
                        window.crmDatabase.addCustomer({
                            name: prospect.name,
                            company: prospect.company,
                            email: prospect.email || `${prospect.id}@placeholder.local`,
                            title: prospect.title || '負責人',
                            phone: prospect.phone || '',
                            website: prospect.website || '',
                            industry: prospect.type || ''
                        });
                        btn.textContent = '已加入';
                        btn.disabled = true;
                        loadProspects();
                        loadDashboard();
                        toast('已加入目標客戶');
                    } catch (e) {
                        toast(e.message, 'error');
                    }
                });
            });
        } catch (e) {
            const msg = friendlyError(e.message);
            resultsEl.innerHTML = '<p class="muted-text" style="color:#e74c3c">' + escapeHtml(msg) + '</p><p class="muted-text">Facebook 搜尋需先完成 OAuth 登入。簡報可改用 Demo 模式。</p>';
            toast(msg, 'error');
        }
    }

    async function searchJobBoard() {
        const query = document.getElementById('jobs-query')?.value?.trim();
        const resultsEl = document.getElementById('jobs-results');
        if (!query) {
            toast('請輸入搜尋關鍵字', 'error');
            return;
        }
        if (!window.jobBoardCrawler) {
            toast('招募頁模組未載入', 'error');
            return;
        }
        resultsEl.innerHTML = '<p class="muted-text">搜尋中...</p>';
        try {
            const result = await window.jobBoardCrawler.search(query, { maxResults: 20 });
            const jobs = result.jobs || [];
            if (jobs.length === 0) {
                resultsEl.innerHTML = '<p class="muted-text">未找到結果' + (result.error ? '：' + escapeHtml(result.error) : '') + '</p><p class="muted-text">104/1111 頁面結構可能變更，或代理無法取得內容。可改用「手動新增」或「設定 → Demo 模式」。</p>';
                return;
            }
            const prospects = window.jobBoardCrawler.toProspects(jobs, query);
            const html = prospects.map((p, i) => `
                <div class="discover-result-item" data-idx="${i}">
                    <div class="info">
                        <strong>${escapeHtml(p.company || p.name)}</strong>
                        <small>${escapeHtml(p.title || '')} · ${escapeHtml(result.source || '')}</small>
                    </div>
                    <button type="button" class="secondary-btn btn-add-job" data-idx="${i}">加入</button>
                </div>
            `).join('');
            resultsEl.innerHTML = html;
            resultsEl.querySelectorAll('.btn-add-job').forEach(btn => {
                btn.addEventListener('click', () => {
                    const p = prospects[parseInt(btn.dataset.idx, 10)];
                    if (!p || !window.crmDatabase) return;
                    try {
                        window.crmDatabase.addCustomer({
                            name: p.name,
                            company: p.company,
                            email: p.email || `job_${Date.now()}_${btn.dataset.idx}@placeholder.local`,
                            title: p.title || '待確認',
                            tags: p.tags || ['招聘需求'],
                            sourceUrl: p.sourceUrl,
                            industry: 'B2B'
                        });
                        btn.textContent = '已加入';
                        btn.disabled = true;
                        loadProspects();
                        loadDashboard();
                        toast('已加入目標客戶');
                    } catch (e) {
                        toast(e.message, 'error');
                    }
                });
            });
        } catch (e) {
            const msg = friendlyError(e.message);
            resultsEl.innerHTML = '<p class="muted-text" style="color:#e74c3c">' + escapeHtml(msg) + '</p>';
            toast(msg, 'error');
        }
    }

    function importCsv() {
        const raw = document.getElementById('csv-import-data')?.value?.trim();
        if (!raw || !window.crmDatabase) {
            toast('請貼上 CSV 或確認 CRM 已載入', 'error');
            return;
        }
        const result = window.crmDatabase.importFromCSV(raw);
        const ok = result.importedCustomers?.length || 0;
        const err = result.errors?.length || 0;
        closeDiscover();
        switchPage('prospects');
        loadProspects();
        loadDashboard();
        toast(`已匯入 ${ok} 筆${err ? '，失敗 ' + err + ' 筆' : ''}`);
    }

    async function runWorkflow() {
        const output = document.getElementById('workflow-output');
        const batch = parseInt(document.getElementById('workflow-batch')?.value) || 5;
        const dryRun = document.getElementById('workflow-dryrun')?.checked !== false;

        if (!window.aiPromotionWorkflow) {
            output.textContent = '工作流程模組未載入';
            return;
        }

        output.textContent = '執行中...';
        try {
            const result = await window.aiPromotionWorkflow.runFullWorkflow({ batchSize: batch, dryRun });
            const s = result.results?.summary || result;
            output.textContent = typeof s === 'object' ? JSON.stringify(s, null, 2) : String(s);
            loadDashboard();
            toast('工作流程完成');
        } catch (e) {
            output.textContent = '錯誤: ' + e.message;
            toast('執行失敗', 'error');
        }
    }

    function saveProfile() {
        const profile = {
            name: document.getElementById('set-name')?.value || '',
            company: document.getElementById('set-company')?.value || '',
            title: document.getElementById('set-title')?.value || '',
            industry: document.getElementById('set-industry')?.value || '',
            email: document.getElementById('set-email')?.value || ''
        };
        localStorage.setItem('userProfile', JSON.stringify(profile));
        toast('用戶資料已儲存');
    }

    function previewMessage() {
        const subject = document.getElementById('compose-subject')?.value || '';
        const body = document.getElementById('compose-body')?.value || '';
        const checked = document.querySelectorAll('#compose-targets input:checked');
        const names = Array.from(checked).map(c => c.dataset.name).join(', ');
        const preview = document.createElement('div');
        preview.className = 'preview-dialog';
        preview.innerHTML = `
            <div class="preview-content">
                <h3>預覽</h3>
                <p><strong>目標：</strong>${names || '(未選擇)'}</p>
                <p><strong>主旨：</strong>${escapeHtml(subject)}</p>
                <pre>${escapeHtml(body)}</pre>
                <button type="button" class="primary-btn" id="preview-close">關閉</button>
            </div>
        `;
        preview.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center';
        preview.querySelector('#preview-close').onclick = () => preview.remove();
        document.body.appendChild(preview);
    }

    async function aiGenerateMessage() {
        const bodyEl = document.getElementById('compose-body');
        const checked = document.querySelectorAll('#compose-targets input:checked');
        const first = checked[0];
        const prospects = typeof getTargetProspects === 'function' ? getTargetProspects() : [];
        const targetId = first?.value;
        const target = targetId ? prospects.find(p => p.id === targetId) : null;
        const targetName = target?.name || first?.dataset?.name || '商家';
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const kb = window.aiKnowledgeBase;
        let websiteIssues = [];

        if (target?.website && window.websiteAnalyzer) {
            try {
                const analysis = await window.websiteAnalyzer.analyze(target.website);
                websiteIssues = analysis.issues || [];
                if (analysis.error && !websiteIssues.length) {
                    toast('網站分析未完成：' + friendlyError(analysis.error), 'info');
                }
            } catch (err) {
                toast('網站分析失敗，將略過網站問題引用：' + friendlyError(err.message), 'info');
            }
        } else if (target?.websiteAnalysis?.issues) {
            websiteIssues = target.websiteAnalysis.issues;
        }

        if (!window.aiAssistant) {
            toast('AI 模組未載入');
            return;
        }

        const product = kb?.products?.[0] || { name: '我們的解決方案', benefits: ['提升效率', '降低成本'] };
        try {
            const result = await window.aiAssistant.generatePromotionMessage({
                target: { name: targetName, company: target?.company || '目標公司', industry: target?.industry },
                product,
                userProfile: profile,
                websiteIssues: websiteIssues.length ? websiteIssues : undefined
            });
            if (result.success && bodyEl) {
                bodyEl.value = result.content;
                toast('AI 已生成訊息內容');
            }
        } catch (e) {
            toast('AI 生成失敗: ' + e.message, 'error');
        }
    }

    async function sendMessage() {
        const subject = document.getElementById('compose-subject')?.value || '';
        const body = document.getElementById('compose-body')?.value || '';
        const checked = document.querySelectorAll('#compose-targets input:checked');

        if (!subject || !body) {
            toast('請填寫主旨和內容', 'error');
            return;
        }
        if (checked.length === 0) {
            toast('請選擇至少一位目標客戶', 'error');
            return;
        }

        const prospects = typeof getTargetProspects === 'function' ? getTargetProspects() : [];
        const sentMessages = JSON.parse(localStorage.getItem('sentMessages') || '[]');
        const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
        const canSendEmail = window.realEmailSender && await window.realEmailSender.checkBackend();
        const hasSocialAuth = window.realSocialMediaAPI?.authenticatedAccounts && Object.keys(window.realSocialMediaAPI.authenticatedAccounts).length > 0;

        for (const cb of Array.from(checked)) {
            const prospectId = cb.value;
            const prospect = prospects.find(p => p.id === prospectId);
            const email = prospect?.platforms?.email?.handle || prospect?.email || prospect?.platforms?.general?.handle;
            const platforms = prospect?.platforms ? Object.keys(prospect.platforms).filter(p => p !== 'general') : [];
            let status = 'recorded';

            if (email && canSendEmail) {
                try {
                    const html = body.includes('<') ? body : body.replace(/\n/g, '<br>');
                    await window.realEmailSender.send({
                        to: email,
                        subject,
                        text: body,
                        html,
                        trackOpen: true,
                        customerId: prospectId,
                        source: prospect?.source || 'app'
                    });
                    status = 'sent';
                } catch (e) {
                    toast('Email 發送失敗: ' + e.message, 'error');
                    status = 'failed';
                }
            } else if (hasSocialAuth && platforms.length > 0) {
                for (const platform of platforms) {
                    if (window.realSocialMediaAPI.authenticatedAccounts[platform]) {
                        const handle = prospect?.platforms?.[platform]?.handle || email;
                        if (handle) {
                            try {
                                await window.realSocialMediaAPI.sendRealMessage(platform, handle, body);
                                status = 'sent';
                                break;
                            } catch (e) {
                                toast(`${platform} 發送失敗: ` + e.message, 'error');
                            }
                        }
                    }
                }
            }
            if (status === 'recorded' && !canSendEmail && !hasSocialAuth) {
                toast('請設定 SMTP（backend-config.json）或登入社群帳號以實際發送', 'info');
            }

            if (window.complianceManager) {
                window.complianceManager.recordSend('email', prospectId, email);
            }
            sentMessages.push({
                id: id(),
                leaderId: prospectId,
                leaderName: prospect?.name || cb.dataset.name,
                platform: 'email',
                platformHandle: email || '',
                subject,
                content: body,
                status,
                sentTime: new Date().toISOString(),
                createdTime: new Date().toISOString()
            });
        }

        localStorage.setItem('sentMessages', JSON.stringify(sentMessages));
        document.getElementById('compose-subject').value = '';
        document.getElementById('compose-body').value = '';
        selectedProspectIds.clear();
        loadComposeTargets();
        loadDashboard();
        toast(`已記錄 ${checked.length} 則訊息發送`);
        Array.from(checked).forEach(cb => {
            document.dispatchEvent(new CustomEvent('messageSent', {
                detail: { customerId: cb.value, platform: 'email', prospectId: cb.value }
            }));
        });
    }

    function loadAnalytics() {
        const crm = window.crmDatabase;
        const prospects = typeof getTargetProspects === 'function' ? getTargetProspects() : [];
        const metrics = crm ? crm.getPerformanceMetrics() : { totalCustomers: 0, contactRate: 0, responseRate: 0, conversionRate: 0 };
        const highScore = crm ? crm.customers.filter(c => (c.leadScore || 0) >= 70).length : 0;

        const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        set('kpi-leads', prospects.length);
        set('kpi-high-score', highScore);
        set('kpi-contact-rate', metrics.contactRate + '%');
        set('kpi-response-rate', metrics.responseRate + '%');
        set('kpi-conversion', metrics.conversionRate + '%');

        const bySource = document.getElementById('analytics-by-source');
        if (bySource) {
            const crmCount = crm ? crm.customers.length : 0;
            const socialCount = prospects.filter(p => p.source === 'social_media').length;
            bySource.innerHTML = `
                <div class="source-row"><span>CRM</span><span>${crmCount}</span></div>
                <div class="source-row"><span>社交媒體發現</span><span>${socialCount}</span></div>
            `;
        }
    }

    async function generateReport(type) {
        const company = document.getElementById('report-company')?.value?.trim();
        const website = document.getElementById('report-website')?.value?.trim();
        const output = document.getElementById('report-output');
        if (!company || !website) {
            toast('請填寫公司名稱與官網網址', 'error');
            return;
        }
        if (!window.reportGenerator) {
            toast('報告模組未載入', 'error');
            return;
        }
        output.textContent = '產生中...';
        try {
            let report;
            if (type === 'audit') report = await window.reportGenerator.generateWebsiteAudit(company, website);
            else if (type === 'seo') report = await window.reportGenerator.generateSeoReport(company, website);
            else report = await window.reportGenerator.generateSecuritySummary(company, website);
            if (report.error) throw new Error(report.error);
            const html = window.reportGenerator.toHtml(report);
            const safeHtml = html.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
            output.innerHTML = `<div class="report-preview">
                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
                    <a href="#" id="report-open-new">在新視窗開啟</a>
                    <a href="#" id="report-export-html">匯出 HTML</a>
                    <a href="#" id="report-print">列印 / 另存 PDF</a>
                </div>
                <iframe id="report-iframe" srcdoc="${safeHtml}" style="width:100%;height:400px;border:1px solid var(--border);border-radius:8px;margin-top:12px"></iframe>
            </div>`;
            output.querySelector('#report-open-new')?.addEventListener('click', (e) => {
                e.preventDefault();
                const w = window.open('', '_blank');
                w.document.write(html);
                w.document.close();
            });
            output.querySelector('#report-export-html')?.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.exportUtils) window.exportUtils.exportReportHTML(report);
            });
            output.querySelector('#report-print')?.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.exportUtils) window.exportUtils.printReport(report);
            });
            toast('報告已產生');
        } catch (e) {
            const msg = friendlyError(e.message);
            output.innerHTML = '<p style="color:#e74c3c">' + escapeHtml(msg) + '</p><p class="muted-text" style="margin-top:12px">若目標網站封鎖代理，可改用「設定」中的固定範本：<a href="demo/sample_reports/website-audit-summary.html" target="_blank">網站健檢</a>、<a href="demo/sample_reports/security-summary.html" target="_blank">資安摘要</a>。</p>';
            toast('報告產生失敗', 'error');
        }
    }

    function openKnowledgeBase() {
        window.open('pages/ai-knowledge-base.html');
    }

    function addManualProspect() {
        const name = document.getElementById('add-name')?.value?.trim();
        const email = document.getElementById('add-email')?.value?.trim();
        if (!name || !email) {
            toast('請填寫店家名稱和 Email', 'error');
            return;
        }
        if (!window.crmDatabase) {
            toast('CRM 模組未載入', 'error');
            return;
        }
        const website = document.getElementById('add-website')?.value?.trim() || '';
        try {
            window.crmDatabase.addCustomer({
                name: name,
                company: name,
                email: email,
                title: document.getElementById('add-owner')?.value?.trim() || '負責人',
                phone: document.getElementById('add-phone')?.value?.trim() || '',
                website: website || undefined,
                linkedin: document.getElementById('add-linkedin')?.value?.trim() || '',
                industry: document.getElementById('add-industry')?.value || ''
            });
            document.getElementById('add-name').value = '';
            document.getElementById('add-owner').value = '';
            document.getElementById('add-email').value = '';
            document.getElementById('add-phone').value = '';
            document.getElementById('add-website').value = '';
            document.getElementById('add-linkedin').value = '';
            closeDiscover();
            switchPage('prospects');
            loadProspects();
            loadDashboard();
            if (window.operationLogger) window.operationLogger.log('prospect_added', { source: 'manual', name });
            toast('已新增到目標客戶');
        } catch (e) {
            if (window.operationLogger) window.operationLogger.log('error', { action: 'add_prospect', message: e.message });
            toast(e.message || '新增失敗', 'error');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
