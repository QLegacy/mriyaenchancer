// ==UserScript==
// @name         Mriya Enhancer
// @namespace    http://tampermonkey.net/
// @version      9.0
// @description  A mod for social network Mriya.
// @author       QuadLegacy
// @match        *://mriya.cc/*
// @match        *://mriya.ct.ws/*
// @match        *://mriya.xo.je/*
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

// --- 1. КОНФІГУРАЦІЯ ---
let defaultConfig = {
    theme: 'aero',
    customThemeId: null,
    installedThemes: [],
    font: 'Segoe UI, Tahoma, sans-serif',
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
    // New options v9
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

function save() { GM_setValue('mriya_enchancer_v9', config); }

// --- 2. СТИЛІ ТЕМ ---
const getUIThemeCSS = () => {
    const isDark = config.siteDarkTheme;
    const themes = {
        aero: `
            #m3-root { background: ${isDark ? 'linear-gradient(to bottom, rgba(60,60,60,0.85), rgba(30,30,30,0.4))' : 'linear-gradient(to bottom, rgba(200,210,225,0.8), rgba(255,255,255,0.2))'}; backdrop-filter: blur(15px); padding: 0 8px 9px 8px; border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
            #m3-header { color: #fff; text-shadow: 0 0 10px rgba(0,0,0,0.5); }
            #m3-body { background: ${isDark ? '#121212' : '#fff'}; color: ${isDark ? '#eee' : '#000'}; border: 1px solid #888; }
            .win7-btn:hover { background: rgba(255,255,255,0.2); }
            .btn-close:hover { background: #e81123 !important; }
        `,
        material: `
            #m3-root { background: ${isDark?'#1C1B1F':'#F7F2FA'}; border-radius: 28px; padding: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); color: ${isDark?'#fff':'#000'}; }
            #m3-tabs { background: ${isDark?'#49454F':'#EADDFF'}; border-radius: 16px; padding: 4px; }
            .m3-tab.active { background: ${isDark?'#D0BCFF':'#6750A4'}; color: ${isDark?'#381E72':'#fff'}; border-radius: 12px; }
            #m3-body { background: ${isDark?'#2B2930':'#fff'}; border: none; border-radius: 12px; }
        `,
        liquid: `
            #m3-root { background: rgba(20,20,20,0.3); backdrop-filter: blur(30px); border-radius: 20px; border: 1px solid #00f2ff; color: #00f2ff; }
            #m3-header { color: #00f2ff; text-transform: uppercase; letter-spacing: 1px; }
            #m3-body { background: rgba(0,0,0,0.6); color: #fff; border: 1px solid #00f2ff; }
        `
    };
    return themes[config.theme] || themes.aero;
};

// --- 3. БАЗОВІ СТИЛІ ---
const baseStyles = `
    #m3-root { position: fixed; width: 560px; z-index: 1000000; display: flex; flex-direction: column; font-family: 'Segoe UI', sans-serif; }
    #m3-header { display: flex; align-items: center; position: relative; cursor: move; padding: 0 10px; font-size: 13px; font-weight: bold; min-height: 38px; }

    .window-controls { position: absolute; top: 0; right: 0; display: flex; height: 30px; z-index: 1000001; }
    .win7-btn { width: 45px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; transition: 0.2s; position: relative; }
    .btn-min::before { content: ""; width: 10px; height: 2px; background: currentColor; margin-top: 10px; }
    .btn-close::before, .btn-close::after { content: ""; position: absolute; width: 14px; height: 2px; background: currentColor; transform: rotate(45deg); }
    .btn-close::after { transform: rotate(-45deg); }

    #m3-tabs { display: flex; gap: 4px; padding: 0 10px; }
    .m3-tab { padding: 8px 12px; font-size: 11px; cursor: pointer; opacity: 0.7; border-top-left-radius: 4px; border-top-right-radius: 4px; }
    .m3-tab.active { opacity: 1; font-weight: bold; }
    #m3-body { padding: 15px; height: 380px; overflow-y: auto; margin: 10px; border-radius: 6px; box-sizing: border-box; }
    .m3-footer { padding: 10px; text-align: right; }
    #m3-apply { padding: 8px 20px; cursor: pointer; border-radius: 4px; border: 1px solid #666; font-weight: bold; }

    .m3-opt { display: flex; align-items: center; justify-content: space-between; margin: 8px 0; }
    .group-item { background: rgba(128,128,128,0.1); padding: 10px; margin-bottom: 8px; border-radius: 6px; border: 1px solid rgba(128,128,128,0.2); }
    textarea, input[type="text"] { width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.05); color: inherit; border: 1px solid #666; padding: 5px; }
    .m3-actions-row { display: flex; gap: 8px; align-items: center; margin-top: 8px; }

    /* Про мод */
    .about-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: rgba(128,128,128,0.1); border-radius: 8px; margin-bottom: 8px; text-decoration: none; color: inherit; transition: 0.2s; }
    .about-item:hover { background: rgba(128,128,128,0.2); transform: translateX(5px); }
    .about-item img { width: 24px; height: 24px; object-fit: contain; }
    .img-inv { filter: invert(1); }

    /* Додаткові стилі v9 */
    .m3-block-link { color: #ff4d4d !important; font-size: 10px; text-decoration: underline; cursor: pointer; margin-left: 5px; }
    .m3-spoiler-btn { background: #444; color: #fff; padding: 2px 6px; border-radius: 4px; cursor: pointer; font-size: 11px; display: inline-block; margin: 5px 0; }
    .m3-spoiler-content { display: none; border-left: 2px solid #666; padding-left: 10px; margin-top: 5px; }
    .m3-sticky-nav { position: sticky !important; top: 0; z-index: 9999; box-shadow: 0 2px 10px rgba(0,0,0,0.5); }
    .m3-friend-inline { display: inline-flex !important; margin-right: 15px !important; width: auto !important; }
    .m3-user-group-hidden { display: none !important; }
    .m3-show-more-users { display: block; width: 100%; padding: 10px; text-align: center; background: rgba(128,128,128,0.2); cursor: pointer; border-radius: 6px; margin: 10px 0; }

    /* Стиль чату */
    .chat-window .post { background: #fff !important; color: #000 !important; border-radius: 8px; padding: 10px; margin-bottom: 8px; border: 1px solid #ddd; }
    .chat-window .post b { font-weight: bold; }
    /* Никнейм qlegacy (або поточний) - синій, інші - червоний */
    .chat-window .post b { color: #ff4d4d; }
    .chat-window .post[data-self="true"] b { color: #0066ff !important; }
    .chat-window .post p { color: #000 !important; }
`;

// --- 4. ДОПОМІЖНІ ФУНКЦІЇ ---
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
    const links = Array.from(pag.querySelectorAll('.page-btn'));
    if (links.length <= 10) return;
    const moreBtn = document.createElement('button');
    moreBtn.innerText = '...'; moreBtn.className = 'page-btn';
    moreBtn.onclick = (e) => { e.preventDefault(); links.forEach(l => l.style.display = 'inline-block'); moreBtn.remove(); };
    links.forEach((l, idx) => { if(idx > 5 && idx < links.length - 2) l.style.display = 'none'; });
    pag.insertBefore(moreBtn, links[links.length-1]);
}

function applyPrettyDates() {
    if (!config.prettyDates) return;
    const months = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
    document.querySelectorAll('.post-date, .comment-date, .post-time, span').forEach(el => {
        if (el.children.length > 1) return; // Fixed: don't break if already has block link
        let txt = el.innerText;
        let match = txt.match(/(\d{4})-(\d{2})-(\d{2})/); // Updated match for ISO dates found in HTML
        if (match) {
            let mIdx = parseInt(match[2]) - 1;
            if (months[mIdx]) {
                el.firstChild.textContent = txt.replace(match[0], `${parseInt(match[3])} ${months[mIdx]} ${match[1]}`);
            }
        }
    });
}

function wrapButtons() {
    const form = document.getElementById('postForm');
    if (!form || form.querySelector('.m3-actions-row')) return;
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
    h.onmousedown = (e) => {
        if (e.target.closest('.window-controls')) return;
        let nx = e.clientX, ny = e.clientY;
        document.onmousemove = (ev) => {
            let ox = nx - ev.clientX, oy = ny - ev.clientY;
            nx = ev.clientX; ny = ev.clientY;
            el.style.top = (el.offsetTop - oy) + "px"; el.style.left = (el.offsetLeft - ox) + "px";
        };
        document.onmouseup = () => { document.onmousemove = null; config.pos = {x: el.offsetLeft, y: el.offsetTop}; save(); };
    };
}

// --- 5. МЕНЕДЖЕР UI ---
function showUI() {
    if (document.getElementById('m3-root')) return;
    GM_addStyle(baseStyles + getUIThemeCSS());

    const root = document.createElement('div');
    root.id = 'm3-root';
    root.style.left = config.pos.x + 'px';
    root.style.top = config.pos.y + 'px';

    root.innerHTML = `
        <div id="m3-header">
            <span>Mriya Enhancer Ultimate v9.0</span>
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

    root.querySelectorAll('.m3-tab').forEach(t => {
        t.onclick = () => {
            root.querySelectorAll('.m3-tab').forEach(r => r.classList.remove('active'));
            t.classList.add('active');
            switchTab(t.dataset.tab);
        };
    });
    switchTab('users');
}

async function switchTab(tab) {
    const body = document.getElementById('m3-body');
    body.innerHTML = '';

    if (tab === 'users') {
        body.innerHTML = `<b>Чорний список:</b><div id="block-list" style="height:310px; overflow:auto; border:1px solid rgba(128,128,128,0.3); padding:5px; margin-top:10px;"></div>`;
        const bl = body.querySelector('#block-list');
        config.blockedUsers.forEach(u => {
            const item = document.createElement('div');
            item.style = "display:flex; justify-content:space-between; margin-bottom:4px; font-size:12px; padding:4px; border-bottom: 1px solid rgba(128,128,128,0.1);";
            item.innerHTML = `<span>${u}</span><button style="cursor:pointer; color:red; border:none; background:none;">❌</button>`;
            item.querySelector('button').onclick = () => { config.blockedUsers = config.blockedUsers.filter(x => x!==u); save(); switchTab('users'); };
            bl.appendChild(item);
        });
    }

    else if (tab === 'css') {
        body.innerHTML = `<button id="add-css" style="width:100%; padding:8px; margin-bottom:10px; cursor:pointer;">+ Додати блок CSS</button><div id="css-list"></div>`;
        const render = () => {
            const list = body.querySelector('#css-list'); list.innerHTML = '';
            config.cssGroups.forEach((g, idx) => {
                const item = document.createElement('div'); item.className = 'group-item';
                item.innerHTML = `<div style="display:flex; justify-content:space-between;"><span><input type="checkbox" ${g.active?'checked':''}> <b>${g.name}</b></span><span class="del" style="cursor:pointer; color:red;">✕</span></div><textarea style="height:60px; margin-top:5px;">${g.code}</textarea>`;
                item.querySelector('input').onchange = (e) => { g.active = e.target.checked; save(); };
                item.querySelector('textarea').oninput = (e) => { g.code = e.target.value; save(); };
                item.querySelector('.del').onclick = () => { config.cssGroups.splice(idx,1); save(); render(); };
                list.appendChild(item);
            });
        };
        body.querySelector('#add-css').onclick = () => { config.cssGroups.push({id:Date.now(), name:'Новий стиль', code:'', active:true}); render(); };
        render();
    }

    else if (tab === 'market') {
        body.innerHTML = 'Завантаження репозиторію GitHub...';
        try {
            const json = await fetchRemote(REPO_URL);
            const themes = JSON.parse(json);
            body.innerHTML = '';
            themes.forEach(t => {
                const isInstalled = config.installedThemes.some(it => it.name === t.name);
                const item = document.createElement('div');
                item.className = 'group-item';
                item.style = "display:flex; justify-content:space-between; align-items:center;";
                item.innerHTML = `<div><b>${t.name}</b><br><small>Версія: ${t.version}</small></div><button style="cursor:pointer; padding:6px 12px;">${isInstalled?'Оновити':'Встановити'}</button>`;
                item.querySelector('button').onclick = async (e) => {
                    e.target.innerText = '...';
                    const css = await fetchRemote(t.css_url);
                    config.installedThemes = config.installedThemes.filter(x => x.name !== t.name);
                    config.installedThemes.push({ id: t.id || Date.now().toString(), name: t.name, css: css });
                    save(); alert(`Тему ${t.name} встановлено!`); switchTab('market');
                };
                body.appendChild(item);
            });
        } catch (e) { body.innerHTML = '<b style="color:red">Помилка завантаження.</b>'; }
    }

    else if (tab === 'opts') {
        body.innerHTML = `
            <div class="m3-opt"><label>Стиль UI:</label><select id="th-sel"><option value="aero" ${config.theme==='aero'?'selected':''}>Aero</option><option value="material" ${config.theme==='material'?'selected':''}>Material</option><option value="liquid" ${config.theme==='liquid'?'selected':''}>Liquid</option></select></div>
            <div class="m3-opt"><label>Тема магазину:</label><select id="cust-sel"><option value="">(Не вибрано)</option>${config.installedThemes.map(t => `<option value="${t.id}" ${config.customThemeId === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}</select></div>
            <hr style="opacity:0.2">
            <div class="m3-opt"><label>Шрифт:</label><input type="text" id="fnt-in" style="width:160px" value="${config.font}"></div>
            <div class="m3-opt"><label>Темний режим сайту</label><input type="checkbox" id="o-sd" ${config.siteDarkTheme?'checked':''}></div>
            <div class="m3-opt"><label>Кнопки в ряд</label><input type="checkbox" id="o-rb" ${config.rowButtons?'checked':''}></div>
            <div class="m3-opt"><label>Приховати аватарки</label><input type="checkbox" id="o-ha" ${config.hideAvatars?'checked':''}></div>
            <div class="m3-opt"><label>Зображення спойлером</label><input type="checkbox" id="o-hi" ${config.hideImages?'checked':''}></div>
            <div class="m3-opt"><label>Гарні дати</label><input type="checkbox" id="o-pd" ${config.prettyDates?'checked':''}></div>
            <div class="m3-opt"><label>Компактна пагінація</label><input type="checkbox" id="o-cp" ${config.compactPagination?'checked':''}></div>
            <div class="m3-opt"><label>Велике поле вводу</label><input type="checkbox" id="o-li" ${config.longInputs?'checked':''}></div>
            <hr style="opacity:0.2">
            <div class="m3-opt"><label>Автооновлення стрічки (10с)</label><input type="checkbox" id="o-uf" ${config.autoUpdateFeed?'checked':''}></div>
            <div class="m3-opt"><label>Липкий навбар</label><input type="checkbox" id="o-sn" ${config.stickyNav?'checked':''}></div>
            <div class="m3-opt"><label>Друзі в рядок</label><input type="checkbox" id="o-if" ${config.inlineFriends?'checked':''}></div>
            <div class="m3-opt"><label>Групування користувачів</label><input type="checkbox" id="o-ug" ${config.userGrouping?'checked':''}></div>
            <div class="m3-opt"><label>Показувати час біля онлайн</label><input type="checkbox" id="o-ct" ${config.currentTimeDisplay?'checked':''}></div>
            <div class="m3-opt"><label>Вставка фото (Ctrl+V)</label><input type="checkbox" id="o-cv" ${config.ctrlVImages?'checked':''}></div>
        `;
        const bind = (id, key) => { body.querySelector('#'+id).onchange = (e) => { config[key] = e.target.checked; save(); }; };
        bind('o-sd','siteDarkTheme'); bind('o-rb','rowButtons'); bind('o-ha','hideAvatars');
        bind('o-hi','hideImages'); bind('o-pd','prettyDates'); bind('o-cp','compactPagination'); bind('o-li','longInputs');
        bind('o-uf','autoUpdateFeed'); bind('o-sn','stickyNav'); bind('o-if','inlineFriends');
        bind('o-ug','userGrouping'); bind('o-ct','currentTimeDisplay'); bind('o-cv','ctrlVImages');

        body.querySelector('#th-sel').onchange = (e) => { config.theme = e.target.value; save(); };
        body.querySelector('#cust-sel').onchange = (e) => { config.customThemeId = e.target.value || null; save(); };
        body.querySelector('#fnt-in').oninput = (e) => { config.font = e.target.value; save(); };
    }

    else if (tab === 'about') {
        body.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:10px;">
                <center><h3>Mriya Enhancer Ultimate</h3><p>Версія 9.0</p></center>
                <a href="https://github.com/QLegacy/mriyaenchancer" target="_blank" class="about-item">
                    <img src="https://raw.githubusercontent.com/QLegacy/mriyaenchancer/refs/heads/main/files/github.png" class="img-inv">
                    <span>GitHub репозиторій мода</span>
                </a>
                <a href="https://t.me/quadlegacybio" target="_blank" class="about-item">
                    <img src="https://raw.githubusercontent.com/QLegacy/mriyaenchancer/refs/heads/main/files/tg.png">
                    <span>Telegram автора (QuadLegacy)</span>
                </a>
                <a href="https://t.me/tg_mriya" target="_blank" class="about-item">
                    <img src="https://raw.githubusercontent.com/QLegacy/mriyaenchancer/refs/heads/main/files/tg.png">
                    <span>Mriya Official Telegram</span>
                </a>
                <a href="http://mriya.xo.je" target="_blank" class="about-item">
                    <img src="https://raw.githubusercontent.com/QLegacy/mriyaenchancer/refs/heads/main/files/mriya.png" class="img-inv">
                    <span>Сайт Mriya.xo.je</span>
                </a>
                <p style="font-size:11px; opacity:0.6; text-align:center; margin-top:10px;">Дякуємо, що користуєтесь нашим енчайсером!</p>
            </div>
        `;
    }
}

// --- 6. ЗАСТОСУВАННЯ ТА ЗАПУСК ---

function applyV9Features() {
    // 6.1. Час біля онлайну
    if (config.currentTimeDisplay) {
        const ob = document.querySelector('.online-bar');
        if (ob) {
            const timeSpan = document.createElement('span');
            timeSpan.style.marginLeft = "10px";
            timeSpan.id = "m3-live-clock";
            ob.appendChild(timeSpan);
            setInterval(() => {
                const now = new Date();
                timeSpan.innerText = "| " + now.toLocaleTimeString();
            }, 1000);
        }
    }

    // 6.2. Липкий навбар
    if (config.stickyNav) {
        const nav = document.querySelector('.nav-bar');
        if (nav) nav.classList.add('m3-sticky-nav');
    }

    // 6.3. Гарячі клавіші та Ctrl+V
    document.addEventListener('keydown', (e) => {
        const active = document.activeElement;
        if (active && (active.tagName === 'TEXTAREA' || active.tagName === 'INPUT')) {
            // Ctrl + Enter: Відправка
            if (e.ctrlKey && e.key === 'Enter') {
                const form = active.closest('form');
                if (form) {
                    const btn = form.querySelector('#publishBtn') || form.querySelector('button[type="submit"]') || form.querySelector('button:not([type="button"])');
                    if (btn) btn.click();
                }
            }
            // Ctrl + . : Емодзі
            if (e.ctrlKey && e.key === '.') {
                e.preventDefault();
                const btn = document.getElementById('emoji-button') || document.getElementById('emojiButton');
                if (btn) btn.click();
            }
        }
    });

    if (config.ctrlVImages) {
        document.addEventListener('paste', (e) => {
            const items = (e.clipboardData || e.originalEvent.clipboardData).items;
            const input = document.getElementById('imageInput') || document.getElementById('mediaInput');
            if (!input) return;
            for (let index in items) {
                const item = items[index];
                if (item.kind === 'file' && item.type.includes('image')) {
                    const blob = item.getAsFile();
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(blob);
                    input.files = dataTransfer.files;
                    alert('Зображення додано до форми!');
                }
            }
        });
    }

    // 6.4. Блокування через гіперпосилання
    const addBlockLinks = () => {
        document.querySelectorAll('.post-time, .wall-post-time').forEach(el => {
            if (el.querySelector('.m3-block-link')) return;
            const post = el.closest('.post, .wall-post');
            const author = post?.querySelector('b a, .wall-post-header b')?.innerText.trim();
            if (author) {
                const link = document.createElement('a');
                link.className = 'm3-block-link';
                link.innerText = 'заблокувати';
                link.onclick = (e) => {
                    e.preventDefault();
                    if (confirm(`Заблокувати користувача ${author}?`)) {
                        config.blockedUsers.push(author);
                        save();
                        post.style.display = 'none';
                    }
                };
                el.appendChild(link);
            }
        });
    };

    // 6.5. Спойлер для довгого опису
    document.querySelectorAll('.profile-header p, .status-line + p').forEach(el => {
        if (el.innerText.length > 1000 && !el.querySelector('.m3-spoiler-btn')) {
            const fullText = el.innerText;
            el.innerHTML = '';
            const btn = document.createElement('div');
            btn.className = 'm3-spoiler-btn';
            btn.innerText = 'Показати довгий опис...';
            const content = document.createElement('div');
            content.className = 'm3-spoiler-content';
            content.innerText = fullText;
            btn.onclick = () => {
                content.style.display = content.style.display === 'block' ? 'none' : 'block';
                btn.innerText = content.style.display === 'block' ? 'Приховати опис' : 'Показати довгий опис...';
            };
            el.appendChild(btn);
            el.appendChild(content);
        }
    });

    // 6.6. Кнопки профілю в ряд
    if (config.rowButtons) {
        const editLink = document.querySelector('a[href="edit_profile.php"]');
        const shareBtn = document.getElementById('shareProfileBtn');
        if (editLink && shareBtn) {
            const container = editLink.parentNode;
            container.style.display = 'flex';
            container.style.gap = '10px';
            container.style.alignItems = 'center';
            container.style.flexWrap = 'wrap';
        }
    }

    // 6.7. Групування користувачів (users.php / friends.php)
    if (config.userGrouping) {
        const blocks = document.querySelectorAll('.user-block, .friend-item');
        if (blocks.length > 40) {
            let hiddenCount = 0;
            blocks.forEach((b, idx) => {
                if (idx >= 40) {
                    b.classList.add('m3-user-group-hidden');
                    hiddenCount++;
                }
            });
            if (hiddenCount > 0) {
                const btn = document.createElement('div');
                btn.className = 'm3-show-more-users';
                btn.innerText = `Ви приховали автовідображення величезної кількості користувачів. Щоб відобразити ще 40 (залишилось ${hiddenCount}), натисніть сюди`;
                btn.onclick = () => {
                    let revealed = 0;
                    document.querySelectorAll('.m3-user-group-hidden').forEach((b, idx) => {
                        if (revealed < 40) {
                            b.classList.remove('m3-user-group-hidden');
                            revealed++;
                            hiddenCount--;
                        }
                    });
                    if (hiddenCount <= 0) btn.remove();
                    else btn.innerText = `Щоб відобразити ще 40 (залишилось ${hiddenCount}), натисніть сюди`;
                };
                blocks[39].after(btn);
            }
        }
    }

    // 6.8. Друзі в довжину
    if (config.inlineFriends) {
        document.querySelectorAll('.user-block').forEach(ub => {
           if (location.href.includes('friends.php')) ub.classList.add('m3-friend-inline');
        });
    }

    // 6.9. Чат (стилі нікнеймів)
    if (location.href.includes('test.php') || document.querySelector('.chat-window')) {
        const currentUser = "qlegacy"; // Fixed: logic for self-ID
        document.querySelectorAll('.chat-window .post').forEach(p => {
            const nick = p.querySelector('b')?.innerText.trim();
            if (nick === currentUser) p.setAttribute('data-self', 'true');
        });
    }

    // 6.10. Автооновлення стрічки
    if (config.autoUpdateFeed && (location.pathname === '/' || location.pathname.includes('index.php'))) {
        setInterval(() => {
            fetch(location.href).then(r => r.text()).then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newPosts = doc.querySelectorAll('.post');
                const currentContainer = document.querySelector('.container');
                if (newPosts.length > 0 && currentContainer) {
                    // Оновлюємо тільки список постів, не чіпаючи форму
                    const oldPosts = currentContainer.querySelectorAll('.post');
                    oldPosts.forEach(p => p.remove());
                    newPosts.forEach(p => {
                        const pagination = currentContainer.querySelector('.pagination');
                        if (pagination) currentContainer.insertBefore(p, pagination);
                        else currentContainer.appendChild(p);
                    });
                    addBlockLinks();
                    applyPrettyDates();
                }
            });
        }, 10000);
    }

    addBlockLinks();
}

function applyEverything() {
    let css = config.font ? `* { font-family: "${config.font}" !important; }\n` : '';

    if (config.siteDarkTheme) {
        css += `
            body, .site-wrap, .container { background: #000 !important; color: #ccc !important; }
            .post, .comment, .card, .user-block { background: #0a0a0a !important; border: 1px solid #222 !important; color: #eee !important; }
            input, textarea, select { background: #111 !important; color: #fff !important; border: 1px solid #333 !important; }
            a { color: #5c97ff !important; }
            button, #publishBtn, #emoji-button, .page-btn, #shareProfileBtn { background: #222 !important; color: #fff !important; border: 1px solid #444 !important; padding: 5px 12px; border-radius: 4px; cursor: pointer; transition: 0.2s; }
            button:hover, #publishBtn:hover { background: #333 !important; border-color: #666 !important; }
            .chat-window { background: #111; padding: 10px; border-radius: 8px; }
        `;
    }

    if (config.hideAvatars) css += `.avatar, .user-avatar, .profile-avatar { display: none !important; }`;
    if (config.longInputs) css += `#contentField, #content, #messageField { min-height: 200px !important; }`;
    if (config.hideImages) css += `.post-content img, .post p img { max-height: 50px; filter: blur(10px); cursor: pointer; transition: 0.3s; } .post-content img:hover, .post p img:hover { max-height: none; filter: none; }`;

    if (config.customThemeId) {
        const t = config.installedThemes.find(x => x.id === config.customThemeId);
        if (t) css += `\n/* Store Theme: ${t.name} */\n ${t.css}`;
    }

    config.cssGroups.forEach(g => { if(g.active) css += `\n/* ${g.name} */\n ${g.code}`; });

    GM_addStyle(css + baseStyles);

    document.addEventListener('DOMContentLoaded', () => {
        if (config.rowButtons) wrapButtons();
        if (config.compactPagination) handlePagination();
        if (config.prettyDates) applyPrettyDates();

        document.querySelectorAll('.post, .wall-post, .user-block').forEach(post => {
            const author = post.querySelector('b a, b')?.innerText.trim();
            if (author && config.blockedUsers.includes(author)) post.style.display = 'none';
        });

        applyV9Features();
    });
}

GM_registerMenuCommand("⚙️ Налаштування Mriya", showUI);
applyEverything();

})();
