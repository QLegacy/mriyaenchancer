// ==UserScript==
// @name         Mriya Enhancer Ultimate Platinum Full
// @namespace    http://tampermonkey.net/
// @version      9.5.5
// @description  Очередний плагiн на мрiю.
// @author       github.com/qlegacy/mriyaenchancer/
// @match        *://mriya.cc/*
// @match        *://mriya.ct.ws/*
// @match        *://mriya.xo.je/*
// @match        *://mriya.ink/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const REPO_URL = "https://raw.githubusercontent.com/QLegacy/mriyaenchancer/main/files/repo/themes/index.json";

    // --- 1. CONFIGURATION ---
    let defaultConfig = {
        theme: 'aero',
        customThemeId: null,
        installedThemes: [],
        font: 'Tahoma, Arial, sans-serif',
        cssGroups: [],
        blockedUsers: [],
        pos: { x: 100, y: 100 },
        siteDarkTheme: true,
        compactPagination: true,
        hideImages: false,
        prettyDates: true,
        hideAvatars: false,
        longInputs: true,
        rowButtons: true,
        autoUpdateFeed: true,
        stickyNav: true,
        inlineFriends: true,
        userGrouping: true,
        currentTimeDisplay: true,
        ctrlVImages: true
    };

    let savedConfig = GM_getValue('mriya_enchancer_v9', {});
    let config = { ...defaultConfig, ...savedConfig };

    if (!Array.isArray(config.installedThemes)) config.installedThemes = [];
    if (!Array.isArray(config.cssGroups)) config.cssGroups = [];
    if (!Array.isArray(config.blockedUsers)) config.blockedUsers = [];

    function save() {
        GM_setValue('mriya_enchancer_v9', config);
    }

    // --- 2. THEMES CSS ---
    const getUIThemeCSS = () => {
        const isDark = config.siteDarkTheme;
        const themes = {
            aero: `
                #m3-root {
                    background: ${isDark ? 'linear-gradient(to bottom, rgba(30,30,30,0.95), rgba(15,15,15,0.85))' : 'linear-gradient(to bottom, rgba(200,210,225,0.8), rgba(255,255,255,0.2))'};
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    padding: 0 8px 9px 8px;
                    border: 1px solid rgba(255,255,255,0.25);
                    border-radius: 10px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.9);
                }
                #m3-header { color: #fff; text-shadow: 0 0 10px rgba(0,0,0,1); border-bottom: 1px solid rgba(255,255,255,0.15); }
                #m3-body { background: ${isDark ? '#080808' : '#fff'}; color: ${isDark ? '#eee' : '#000'}; border: 1px solid #333; }
                .win7-btn { color: #fff !important; text-shadow: 0 0 3px #000, 0 0 5px #000 !important; opacity: 0.9; }
                .win7-btn:hover { background: rgba(255,255,255,0.15); opacity: 1; }
                .btn-close:hover { background: #e81123 !important; }
            `,
            liquid: `
                #m3-root {
                    background: rgba(5,5,5,0.45);
                    backdrop-filter: blur(35px);
                    -webkit-backdrop-filter: blur(35px);
                    border: 2px solid #00f2ff;
                    color: #00f2ff;
                    box-shadow: 0 0 40px rgba(0,242,255,0.6);
                    border-radius: 15px;
                }
                #m3-header { color: #00f2ff; text-transform: uppercase; font-weight: 900; letter-spacing: 4px; text-shadow: 0 0 15px rgba(0,242,255,0.9); }
                #m3-tabs { border-bottom: 2px solid rgba(0,242,255,0.4); }
                .m3-tab.active { background: #00f2ff; color: #000; font-weight: bold; box-shadow: 0 0 10px #00f2ff; }
                #m3-body { background: rgba(0,0,0,0.9); color: #fff; border: 1px solid #00f2ff; box-shadow: inset 0 0 20px rgba(0,242,255,0.3); }
                #m3-apply { background: #00f2ff; color: #000; border: none; text-transform: uppercase; }
                .win7-btn { color: #00f2ff !important; }
            `,
            material: `
                #m3-root {
                    background: ${isDark?'#1C1B1F':'#F7F2FA'};
                    border-radius: 28px;
                    padding: 16px;
                    box-shadow: 0 12px 45px rgba(0,0,0,0.5);
                    color: ${isDark?'#fff':'#000'};
                    border: none;
                }
                #m3-tabs { background: ${isDark?'#49454F':'#EADDFF'}; border-radius: 16px; padding: 4px; display: flex; }
                .m3-tab { flex: 1; text-align: center; border-radius: 12px; }
                .m3-tab.active { background: ${isDark?'#D0BCFF':'#6750A4'}; color: ${isDark?'#381E72':'#fff'}; }
                #m3-body { background: ${isDark?'#232126' : '#fff'}; border: none; border-radius: 12px; margin-top: 15px; }
            `
        };
        return themes[config.theme] || themes.aero;
    };

    // --- 3. BASE STYLES ---
    const baseStyles = `
        #m3-root { position: fixed; width: 560px; z-index: 1000000; display: flex; flex-direction: column; font-family: 'Segoe UI', Tahoma, sans-serif; }
        #m3-header { display: flex; align-items: center; position: relative; cursor: move; padding: 0 12px; font-size: 13px; font-weight: bold; min-height: 44px; }
        .window-controls { position: absolute; top: 0; right: 0; display: flex; height: 32px; z-index: 1000001; }
        .win7-btn { width: 48px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; position: relative; }
        .btn-min::before { content: ""; width: 12px; height: 2px; background: currentColor; margin-top: 12px; }
        .btn-close::before, .btn-close::after { content: ""; position: absolute; width: 16px; height: 2px; background: currentColor; transform: rotate(45deg); }
        .btn-close::after { transform: rotate(-45deg); }
        #m3-tabs { display: flex; gap: 5px; padding: 0 12px; }
        .m3-tab { padding: 12px 16px; font-size: 11px; cursor: pointer; opacity: 0.7; border-top-left-radius: 6px; border-top-right-radius: 6px; color: inherit; transition: 0.3s; }
        .m3-tab.active { opacity: 1; font-weight: bold; }
        #m3-body { padding: 18px; height: 380px; overflow-y: auto; margin: 10px; border-radius: 8px; box-sizing: border-box; }
        .m3-footer { padding: 14px; text-align: right; border-top: 1px solid rgba(255,255,255,0.08); }
        #m3-apply { padding: 12px 28px; cursor: pointer; border-radius: 5px; border: 1px solid #555; font-weight: bold; background: #16a83d; color: white; transition: 0.2s; }
        #m3-apply:hover { filter: contrast(1.2) brightness(1.1); box-shadow: 0 0 10px rgba(22,168,61,0.4); }
        .m3-opt { display: flex; align-items: center; justify-content: space-between; margin: 14px 0; border-bottom: 1px solid rgba(128,128,128,0.15); padding-bottom: 10px; }
        .group-item { background: rgba(128,128,128,0.12); padding: 14px; margin-bottom: 12px; border-radius: 8px; border: 1px solid rgba(128,128,128,0.2); }
        textarea, input[type="text"] { width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.08); color: inherit; border: 1px solid #555; padding: 12px; border-radius: 5px; font-size: 13px; outline: none; }
        textarea:focus, input[type="text"]:focus { border-color: #16a83d; }
        .about-item { display: flex; align-items: center; gap: 15px; padding: 15px; background: rgba(128,128,128,0.1); border-radius: 10px; margin-bottom: 12px; text-decoration: none; color: inherit; transition: 0.3s; border: 1px solid rgba(255,255,255,0.05); }
        .about-item:hover { background: rgba(128,128,128,0.25); transform: translateX(10px); border-color: #16a83d; }
        .about-item img { width: 32px; height: 32px; object-fit: contain; }
        .img-inv { filter: invert(1); }
        .m3-block-link { color: #ff5c5c !important; font-size: 10px; text-decoration: underline !important; cursor: pointer; margin-left: 12px; font-weight: normal; opacity: 0.8; }
        .m3-block-link:hover { opacity: 1; text-shadow: 0 0 5px rgba(255,92,92,0.3); }
        .m3-spoiler-btn { background: #2a2a2a; color: #fff; padding: 8px 14px; border-radius: 5px; cursor: pointer; font-size: 11px; display: inline-block; margin: 10px 0; border: 1px solid #444; font-weight: bold; }
        .m3-spoiler-content { display: none; border-left: 5px solid #16a83d; padding-left: 15px; margin-top: 12px; line-height: 1.6; color: #bbb; }
        .m3-sticky-nav { position: sticky !important; top: 0; z-index: 9999; box-shadow: 0 10px 30px rgba(0,0,0,0.7) !important; }
        .m3-show-more-users { display: block; width: 100%; padding: 16px; text-align: center; background: rgba(128,128,128,0.18); cursor: pointer; border-radius: 10px; margin: 25px 0; font-size: 14px; border: 2px dashed #444; transition: 0.2s; }
        .m3-show-more-users:hover { background: rgba(128,128,128,0.28); border-color: #16a83d; color: #fff; }
        .chat-window .post { background: #181818 !important; color: #eee !important; border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid #333; }
        .chat-window .post b { font-weight: bold; color: #ff6b6b; font-size: 14px; }
        .chat-window .post[data-self="true"] { border-right: 5px solid #5c97ff; background: #12151c !important; }
        .chat-window .post[data-self="true"] b { color: #5c97ff !important; }
    `;

    // --- 4. HELPER FUNCTIONS ---
    function fetchRemote(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET", url: url + "?t=" + Date.now(),
                onload: (res) => resolve(res.responseText),
                onerror: (err) => reject(err)
            });
        });
    }

    function handlePagination() {
        const pag = document.querySelector('.pagination');
        if (!pag) return;
        const links = Array.from(pag.querySelectorAll('a, .page-btn, .btn-sm'));
        if (links.length <= 12) return;
        const moreBtn = document.createElement('button');
        moreBtn.innerText = '...'; moreBtn.className = 'btn-sm page-btn';
        moreBtn.style.margin = "0 4px";
        moreBtn.onclick = (e) => {
            e.preventDefault();
            links.forEach(l => l.style.display = 'inline-block');
            moreBtn.remove();
        };
        links.forEach((l, idx) => {
            if(idx > 5 && idx < links.length - 2) l.style.display = 'none';
        });
        pag.insertBefore(moreBtn, links[links.length-1]);
    }

    function applyPrettyDates() {
        if (!config.prettyDates) return;
        const months = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
        const selectors = '.post-time, .comment-date, .post-date, .wall-post-time, .status-time';
        document.querySelectorAll(selectors).forEach(el => {
            let node = el.firstChild;
            while (node) {
                if (node.nodeType === 3) {
                    let txt = node.textContent;
                    let match = txt.match(/(\d{4})-(\d{2})-(\d{2})/);
                    if (match) {
                        let mIdx = parseInt(match[2]) - 1;
                        if (months[mIdx]) node.textContent = txt.replace(match[0], `${parseInt(match[3])} ${months[mIdx]} ${match[1]}`);
                    }
                }
                node = node.nextSibling;
            }
        });
    }

    function wrapButtons() {
        const bar = document.querySelector('.create-post-bar') || document.querySelector('.post-form-wrap');
        if (!bar || bar.querySelector('.m3-actions-row')) return;
        const row = document.createElement('div');
        row.className = 'm3-actions-row';
        const bE = document.getElementById('emoji-button'), iI = document.getElementById('imageInput'), bP = document.getElementById('publishBtn');
        if (bE && iI && bP) {
            bE.parentNode.insertBefore(row, bE);
            row.appendChild(bE); row.appendChild(iI); row.appendChild(bP);
        }
    }

    function makeDraggable(el) {
        const h = document.getElementById('m3-header');
        if (!h) return;
        h.onmousedown = (e) => {
            if (e.target.closest('.window-controls')) return;
            let nx = e.clientX, ny = e.clientY;
            document.onmousemove = (ev) => {
                let ox = nx - ev.clientX, oy = ny - ev.clientY;
                nx = ev.clientX; ny = ev.clientY;
                el.style.top = (el.offsetTop - oy) + "px";
                el.style.left = (el.offsetLeft - ox) + "px";
            };
            document.onmouseup = () => {
                document.onmousemove = null;
                config.pos = {x: el.offsetLeft, y: el.offsetTop};
                save();
            };
        };
    }

    // --- 5. UI MANAGER ---
    function showUI() {
        if (document.getElementById('m3-root')) return;
        GM_addStyle(baseStyles + getUIThemeCSS());

        const root = document.createElement('div');
        root.id = 'm3-root';
        root.style.left = config.pos.x + 'px';
        root.style.top = config.pos.y + 'px';

        root.innerHTML = `
            <div id="m3-header">
                <span>Mriya Enhancer Platinum v9.5.5 Full</span>
                <div class="window-controls">
                    <div class="win7-btn btn-min" title="Згорнути"></div>
                    <div class="win7-btn btn-close" title="Закрити"></div>
                </div>
            </div>
            <div id="m3-tabs">
                <div class="m3-tab active" data-tab="users">ЧС</div>
                <div class="m3-tab" data-tab="css">CSS</div>
                <div class="m3-tab" data-tab="market">Магазин</div>
                <div class="m3-tab" data-tab="opts">Опції</div>
                <div class="m3-tab" data-tab="about">Про мод</div>
            </div>
            <div id="m3-body"></div>
            <div class="m3-footer"><button id="m3-apply">Зберегти та оновити</button></div>
        `;

        document.body.appendChild(root);
        makeDraggable(root);

        root.querySelector('.btn-close').onclick = () => root.remove();
        root.querySelector('.btn-min').onclick = () => root.remove();
        document.getElementById('m3-apply').onclick = () => { save(); location.reload(); };

        const tabs = root.querySelectorAll('.m3-tab');
        tabs.forEach(t => {
            t.onclick = () => {
                tabs.forEach(r => r.classList.remove('active'));
                t.classList.add('active');
                switchTab(t.dataset.tab);
            };
        });
        switchTab('users');
    }

    async function switchTab(tab) {
        const body = document.getElementById('m3-body');
        if (!body) return;
        body.innerHTML = '';

        if (tab === 'users') {
            body.innerHTML = `<b>Чорний список (Mute List):</b><div id="block-list" style="height:310px; overflow:auto; border:1px solid rgba(128,128,128,0.3); padding:10px; margin-top:10px; background:rgba(0,0,0,0.4); border-radius:8px;"></div>`;
            const bl = body.querySelector('#block-list');
            config.blockedUsers.forEach(u => {
                const item = document.createElement('div');
                item.style = "display:flex; justify-content:space-between; margin-bottom:10px; font-size:12px; padding:10px; border-bottom: 1px solid rgba(128,128,128,0.2);";
                item.innerHTML = `<span>${u}</span><button style="cursor:pointer; color:#ff4d4d; border:none; background:none; font-weight:bold; font-size:18px;">✕</button>`;
                item.querySelector('button').onclick = () => {
                    config.blockedUsers = config.blockedUsers.filter(x => x!==u);
                    save(); switchTab('users');
                };
                bl.appendChild(item);
            });
            if (!config.blockedUsers.length) bl.innerHTML = '<p style="opacity:0.4; text-align:center; margin-top:120px; font-style:italic;">Тут порожньо. Додайте когось у ЧС через ленту.</p>';
        }
        else if (tab === 'css') {
            body.innerHTML = `<button id="add-css" style="width:100%; padding:14px; margin-bottom:18px; cursor:pointer; font-weight:bold; border-radius:8px; background:#333; color:#fff; border:1px solid #555;">+ Створити CSS блок</button><div id="css-list"></div>`;
            const renderCSS = () => {
                const list = body.querySelector('#css-list'); list.innerHTML = '';
                config.cssGroups.forEach((g, idx) => {
                    const item = document.createElement('div'); item.className = 'group-item';
                    item.innerHTML = `
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span><input type="checkbox" ${g.active?'checked':''}> <input type="text" value="${g.name}" style="width:160px; border:none; background:transparent; font-weight:bold; color:inherit; outline:none;"></span>
                            <span class="del" style="cursor:pointer; color:#ff4d4d; font-weight:bold; font-size:18px;">✕</span>
                        </div>
                        <textarea style="height:130px; margin-top:15px; font-family:Consolas, 'Courier New', monospace; font-size:12px; line-height:1.5; color:#00ff00;">${g.code}</textarea>
                    `;
                    item.querySelector('input[type="checkbox"]').onchange = (e) => { g.active = e.target.checked; save(); };
                    item.querySelector('input[type="text"]').oninput = (e) => { g.name = e.target.value; save(); };
                    item.querySelector('textarea').oninput = (e) => { g.code = e.target.value; save(); };
                    item.querySelector('.del').onclick = () => { if(confirm('Видалити цей кастомний стиль?')) { config.cssGroups.splice(idx,1); save(); renderCSS(); } };
                    list.appendChild(item);
                });
            };
            body.querySelector('#add-css').onclick = () => { config.cssGroups.push({id:Date.now(), name:'Мій пресет', code:'', active:true}); renderCSS(); };
            renderCSS();
        }
        else if (tab === 'market') {
            body.innerHTML = '<p style="text-align:center; padding-top:130px;">Синхронізація з GitHub Themes Store...</p>';
            try {
                const json = await fetchRemote(REPO_URL);
                const themes = JSON.parse(json);
                body.innerHTML = '';
                themes.forEach(t => {
                    const isInstalled = config.installedThemes.some(it => it.name === t.name);
                    const item = document.createElement('div');
                    item.className = 'group-item';
                    item.style = "display:flex; justify-content:space-between; align-items:center; padding:18px;";
                    item.innerHTML = `<div><b style="font-size:16px; color:#16a83d;">${t.name}</b><br><small style="opacity:0.7">Версія: ${t.version}</small></div><button style="cursor:pointer; padding:12px 24px; border-radius:6px; border:none; background:#16a83d; color:white; font-weight:bold;">${isInstalled?'Оновити':'Встановити'}</button>`;
                    item.querySelector('button').onclick = async (e) => {
                        e.target.innerText = 'Завантаження...';
                        try {
                            const css = await fetchRemote(t.css_url);
                            config.installedThemes = config.installedThemes.filter(x => x.name !== t.name);
                            config.installedThemes.push({ id: t.id || Date.now().toString(), name: t.name, css: css });
                            save(); alert(`Успіх! Тема "${t.name}" активна.`); switchTab('market');
                        } catch(e) { alert('Помилка: Файл не знайдено.'); e.target.innerText = 'Помилка'; }
                    };
                    body.appendChild(item);
                });
            } catch (e) { body.innerHTML = '<div style="color:#ff4d4d; text-align:center; padding-top:100px;"><b>Помилка: Репозиторій недоступний.</b><br><small>Можливо, GitHub заблокований або URL застарів.</small></div>'; }
        }
        else if (tab === 'opts') {
            body.innerHTML = `
                <div class="m3-opt"><label>Візуальний стиль:</label><select id="th-sel"><option value="aero" ${config.theme==='aero'?'selected':''}>Aero Glass (Windows 7)</option><option value="liquid" ${config.theme==='liquid'?'selected':''}>Liquid Neon Glow</option><option value="material" ${config.theme==='material'?'selected':''}>Material Design</option></select></div>
                <div class="m3-opt"><label>Тема з магазину:</label><select id="cust-sel"><option value="">(Без кастомної теми)</option>${config.installedThemes.map(t => `<option value="${t.id}" ${config.customThemeId === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}</select></div>
                <hr style="opacity:0.15; margin:22px 0;">
                <div class="m3-opt"><label>Глобальний шрифт:</label><input type="text" id="fnt-in" style="width:230px" value="${config.font}"></div>
                <div class="m3-opt"><label title="Повне усунення білих зон (Platinum Fix)">Глибокий темний режим v9.5.5</label><input type="checkbox" id="o-sd" ${config.siteDarkTheme?'checked':''}></div>
                <div class="m3-opt"><label>Липкий навбар (Fixed Header)</label><input type="checkbox" id="o-sn" ${config.stickyNav?'checked':''}></div>
                <div class="m3-opt"><label>Час в статус-барі (Live Clock)</label><input type="checkbox" id="o-ct" ${config.currentTimeDisplay?'checked':''}></div>
                <div class="m3-opt"><label>Автоматичне оновлення стрічки</label><input type="checkbox" id="o-uf" ${config.autoUpdateFeed?'checked':''}></div>
                <div class="m3-opt"><label>Вставка фото через Ctrl+V</label><input type="checkbox" id="o-cv" ${config.ctrlVImages?'checked':''}></div>
                <div class="m3-opt"><label>Збільшене поле редактора</label><input type="checkbox" id="o-li" ${config.longInputs?'checked':''}></div>
                <div class="m3-opt"><label>Компактна пагінація сторінок</label><input type="checkbox" id="o-cp" ${config.compactPagination?'checked':''}></div>
                <div class="m3-opt"><label>Приховати всі аватарки</label><input type="checkbox" id="o-ha" ${config.hideAvatars?'checked':''}></div>
                <div class="m3-opt"><label>Блюр зображень (Спойлер)</label><input type="checkbox" id="o-hi" ${config.hideImages?'checked':''}></div>
            `;
            const optBind = (id, key) => {
                const el = body.querySelector('#'+id);
                if (el) el.onchange = (e) => { config[key] = e.target.checked; save(); };
            };
            optBind('o-sd','siteDarkTheme'); optBind('o-sn','stickyNav'); optBind('o-ct','currentTimeDisplay');
            optBind('o-uf','autoUpdateFeed'); optBind('o-cv','ctrlVImages'); optBind('o-li','longInputs');
            optBind('o-cp','compactPagination'); optBind('o-ha','hideAvatars'); optBind('o-hi','hideImages');
            body.querySelector('#th-sel').onchange = (e) => { config.theme = e.target.value; save(); };
            body.querySelector('#cust-sel').onchange = (e) => { config.customThemeId = e.target.value || null; save(); };
            body.querySelector('#fnt-in').oninput = (e) => { config.font = e.target.value; save(); };
        }
        else if (tab === 'about') {
            body.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:12px; padding:10px;">
                    <center><h3 style="margin:5px 0;">Mriya Enhancer Platinum</h3><p style="opacity:0.7; font-size:13px;">Версія 9.5.5 Full Platinum</p></center>
                    <div style="font-size:13px; line-height:1.6; opacity:0.9; background:rgba(255,255,255,0.06); padding:18px; border-radius:12px; border:1px solid rgba(255,255,255,0.12); margin-bottom:12px;">
                        v9.5.5: Виправлено структуру дужок, Deep Black Injection, JS-override інлайн стилів сайту.
                    </div>
                    <a href="https://github.com/QLegacy/mriyaenchancer" target="_blank" class="about-item">
                        <img src="https://raw.githubusercontent.com/QLegacy/mriyaenchancer/refs/heads/main/files/github.png" class="img-inv">
                        <span>Офіційний репозиторій на GitHub</span>
                    </a>
                    <a href="https://t.me/quadlegacybio" target="_blank" class="about-item">
                        <img src="https://raw.githubusercontent.com/QLegacy/mriyaenchancer/refs/heads/main/files/tg.png">
                        <span>Написати розробнику (QuadLegacy)</span>
                    </a>
                    <a href="https://t.me/mriya_ink" target="_blank" class="about-item">
                        <img src="https://raw.githubusercontent.com/QLegacy/mriyaenchancer/refs/heads/main/files/tg.png">
                        <span>Mriya News Telegram Channel</span>
                    </a>
                    <a href="http://mriya.ink" target="_blank" class="about-item">
                        <img src="https://raw.githubusercontent.com/QLegacy/mriyaenchancer/refs/heads/main/files/mriya.png" class="img-inv">
                        <span>Main Portal: Mriya.ink</span>
                    </a>
                </div>
            `;
        }
    }

    // --- 6. CORE LOGIC ---

    // v9.5.5: JS override для інлайн-стилів сайту (єдиний спосіб перебити !important в <style> тегах сайту)
    function forceColors() {
        if (!config.siteDarkTheme) return;
        const targets = [
            ['.sidebar-block', 'background', '#121212'],
            ['.container',     'background', '#080808'],
            ['.sidebar-block', 'border-color', '#282828'],
        ];
        targets.forEach(([sel, prop, val]) => {
            document.querySelectorAll(sel).forEach(el => {
                el.style.setProperty(prop, val, 'important');
            });
        });
        // Футер: фікс інлайн color:#000
        document.querySelectorAll('footer, footer *').forEach(el => {
            if (el.style.color === '#000' || el.style.color === 'rgb(0, 0, 0)') {
                el.style.setProperty('color', '#888', 'important');
            }
        });
    }

    function applyV9Features() {
        // Запускаємо одразу і по інтервалу (бо autoUpdate може перезаписати DOM)
        forceColors();
        setInterval(forceColors, 3000);

        // 6.1. Час біля онлайну
        if (config.currentTimeDisplay) {
            const ob = document.querySelector('.online-bar');
            if (ob && !document.getElementById('m3-live-clock')) {
                const clock = document.createElement('span');
                clock.style.cssText = "margin-left:18px; opacity:0.9; font-weight:normal; border-left:1px solid #666; padding-left:18px; color:inherit; font-family:monospace;";
                clock.id = "m3-live-clock";
                ob.appendChild(clock);
                setInterval(() => {
                    clock.innerText = "| " + new Date().toLocaleTimeString();
                }, 1000);
            }
        }

        // 6.2. Гарячі клавіші Ctrl+Enter
        document.addEventListener('keydown', (e) => {
            const active = document.activeElement;
            if (active && (active.tagName === 'TEXTAREA' || active.tagName === 'INPUT')) {
                if (e.ctrlKey && e.key === 'Enter') {
                    const form = active.closest('form') || document.getElementById('postForm');
                    const sendBtn = form?.querySelector('#publishBtn') || form?.querySelector('button[type="submit"]');
                    if (sendBtn) sendBtn.click();
                }
            }
        });

        // 6.3. Paste support (Ctrl+V для картинок)
        if (config.ctrlVImages) {
            document.addEventListener('paste', (e) => {
                const clipboardData = (e.clipboardData || e.originalEvent.clipboardData);
                const items = clipboardData.items;
                const fileInput = document.getElementById('imageInput');
                if (!fileInput) return;
                for (let i = 0; i < items.length; i++) {
                    if (items[i].kind === 'file' && items[i].type.includes('image')) {
                        const blob = items[i].getAsFile();
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(blob);
                        fileInput.files = dataTransfer.files;
                        const label = document.querySelector('label[for="imageInput"]') || fileInput;
                        label.style.outline = "3px solid #16a83d";
                        setTimeout(() => label.style.outline = "none", 2000);
                    }
                }
            });
        }

        // 6.4. Блокування користувачів
        const addBlockLinks = () => {
            document.querySelectorAll('.post-head, .post-time').forEach(el => {
                if (el.querySelector('.m3-block-link')) return;
                const card = el.closest('.post-card') || el.closest('.post') || el.closest('.wall-post');
                const author = card?.querySelector('.post-author strong, b a, .wall-post-header b')?.innerText.trim();
                if (author) {
                    const blockBtn = document.createElement('a');
                    blockBtn.className = 'm3-block-link';
                    blockBtn.innerText = '[Блок]';
                    blockBtn.onclick = (e) => {
                        e.preventDefault();
                        if (confirm(`Блокувати користувача ${author}?`)) {
                            config.blockedUsers.push(author);
                            save();
                            card.style.display = 'none';
                        }
                    };
                    const timeContainer = el.querySelector('.post-time') || el;
                    timeContainer.appendChild(blockBtn);
                }
            });
        };

        // 6.5. Автооновлення стрічки
        if (config.autoUpdateFeed && (location.pathname === '/' || location.pathname.includes('index.php'))) {
            setInterval(() => {
                if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT') return;
                fetch(location.href).then(r => r.text()).then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const newContent = doc.querySelectorAll('.post-card');
                    const mainContainer = document.querySelector('.container');
                    if (newContent.length > 0 && mainContainer) {
                        mainContainer.querySelectorAll('.post-card').forEach(c => c.remove());
                        const pagination = mainContainer.querySelector('.pagination');
                        newContent.forEach(card => {
                            const author = card.querySelector('.post-author strong')?.innerText.trim();
                            if (author && config.blockedUsers.includes(author)) {
                                card.style.display = 'none';
                            }
                            if (pagination) mainContainer.insertBefore(card, pagination);
                            else mainContainer.appendChild(card);
                        });
                        addBlockLinks();
                        applyPrettyDates();
                        forceColors();
                    }
                }).catch(err => console.error("Mriya Enhancer Platinum Sync Error", err));
            }, 18000);
        }

        addBlockLinks();
    }

    function applyEverything() {
        let globalCSS = config.font ? `* { font-family: "${config.font}", "Segoe UI", Tahoma, sans-serif !important; }\n` : '';

        if (config.siteDarkTheme) {
            globalCSS += `
                html {
                    background-color: #000 !important;
                }
                body {
                    background: #000 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 100% !important;
                    min-height: 100vh !important;
                }
                body::before { display: none !important; }

                /* Центрируем основной контент, который "уехал" */
                .page-body {
                    background: transparent !important;
                    display: flex !important;
                    justify-content: center !important;
                    margin: 0 auto !important;
                    float: none !important;
                    width: 100% !important;
                    max-width: 1050px !important; /* Ширина стандартного контейнера */
                }


                .header-wrap {
                    background: #0f0f0f !important;
                    border-bottom: 1px solid #333 !important;
                    width: 100% !important;
                    display: flex !important;
                    justify-content: center !important;
                }
                .header {
                    width: 1000px !important; /* Фиксированная ширина как в оригинале */
                    margin: 0 auto !important;
                    background: transparent !important;
                    border: none !important;
                }
                .top-nav a { color: #5c97ff !important; font-weight: bold; }

                .container {
                    background: #080808 !important;
                    color: #eee !important;
                    border: 1px solid #222 !important;
                    flex-grow: 1 !important;
                    box-sizing: border-box !important;
                }
                .sidebar-block { background: #121212 !important; border: 1px solid #282828 !important; color: #ddd !important; }
                .sb-title { background: #181818 !important; color: #16a83d !important; border-bottom: 2px solid #16a83d !important; }
                .post-card, .auth-bar, .feed-filters { background: #141414 !important; border: 1px solid #282828 !important; }
                .online-bar { background: #080808 !important; border-top: 1px solid #16a83d !important; width: 100% !important; left: 0 !important; }

                ::-webkit-scrollbar-track { background: #1a1a1a !important; }
                ::-webkit-scrollbar-thumb { background: #444 !important; }


                .post-head { border-bottom: 1px solid #222 !important; background: rgba(255,255,255,0.01) !important; padding: 14px !important; }
                .post-foot { border-top: 1px solid #222 !important; background: transparent !important; }

                .page-title { color: #fff !important; border-bottom: 1px solid #333 !important; background: #0b0b0b !important; padding: 15px !important; margin: -20px -20px 20px -20px !important; }
                input, textarea, select { background: #1a1a1a !important; color: #fff !important; border: 1px solid #444 !important; }

                a { color: #5c97ff !important; text-decoration: none; }
                a:hover { text-decoration: underline; }
                .sidebar-block a { color: #16a83d !important; font-size: 11px; }

                .btn-sm, button, .page-btn, .btn-post { background: #252525 !important; color: #eee !important; border: 1px solid #444 !important; cursor: pointer; border-radius: 4px; }
                .btn-sm:hover, button:hover { background: #303030 !important; border-color: #16a83d !important; }
                .pagination a { background: #181818 !important; color: #fff !important; border: 1px solid #444 !important; }

                .post-author strong { color: #fff !important; font-size: 15px; }
                .post-body p { color: #eee !important; line-height: 1.7; font-size: 14px; }

                .feed-type-switcher { background: #101010 !important; border-bottom: 1px solid #333 !important; padding: 14px !important; margin: 0 -20px 25px -20px !important; }
                .feed-type-switcher a { color: #777 !important; }
                .feed-type-switcher a[style*="font-weight: bold"] { color: #fff !important; border-bottom: 2px solid #16a83d; padding-bottom: 10px; }

                .bbcode-bar button { background: #222 !important; color: #ccc !important; border: 1px solid #444 !important; }
                footer { background: #050505 !important; color: #888 !important; border-top: 1px solid #222 !important; }
                footer a { color: #16a83d !important; }
                #m-plr { background: rgba(5,5,5,0.96) !important; border: 1px solid #333 !important; }
            `;
        }

        if (config.hideAvatars) globalCSS += `.avatar-container, .online-ava-mini, .post-ava, .online-ava-mini-ph, .avatar-frame { display: none !important; }`;
        if (config.longInputs) globalCSS += `#contentField, #content, #messageField { min-height: 320px !important; line-height: 1.6; }`;
        if (config.hideImages) globalCSS += `.post-img-wrap img, .post-body img { filter: blur(30px) grayscale(1); transition: 0.6s; cursor: zoom-in; } .post-img-wrap img:hover { filter: none; }`;

        if (config.customThemeId) {
            const currentTheme = config.installedThemes.find(x => x.id === config.customThemeId);
            if (currentTheme) globalCSS += `\n/* Store Theme: ${currentTheme.name} */\n ${currentTheme.css}`;
        }

        config.cssGroups.forEach(group => { if(group.active) globalCSS += `\n/* Custom Style: ${group.name} */\n ${group.code}`; });

        GM_addStyle(globalCSS + baseStyles);

        document.addEventListener('DOMContentLoaded', () => {
            if (config.rowButtons) wrapButtons();
            if (config.compactPagination) handlePagination();
            if (config.prettyDates) applyPrettyDates();

            document.querySelectorAll('.post-card, .post, .user-block').forEach(p => {
                const nick = p.querySelector('.post-author strong, b a, .sb-title')?.innerText.trim();
                if (nick && config.blockedUsers.includes(nick)) p.style.display = 'none';
            });

            applyV9Features();
        });
    }

    GM_registerMenuCommand("⚙️ Налаштування Mriya Enhancer", showUI);
    applyEverything();

})();

// I'm sorry, some things in this code was written by AI, because сдох гандон разраб сайт =)

// Bugs: Contact to issues (KNOWN BUGS: white bazels on black theme)

// If you will spam to mriya.ink, developer will ban you. sorry.
