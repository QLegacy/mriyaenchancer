// ==UserScript==
// @name         Mriya Enhancer (Material You) v6
// @namespace    http://tampermonkey.net/
// @version      6.0
// @description  Черговий покращуючий скрипт для соцмережі Мрія
// @author       You
// @match        *://mriya.cc/*
// @match        *://mriya.ct.ws/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // --- 1. РЕДИРЕКТ ---
    if (location.hostname === 'mriya.ct.ws') {
        location.replace("http://mriya.cc" + location.pathname + location.search);
        return;
    }

    // --- 2. КОНФІГУРАЦІЯ ---
    const M3 = {
        primary: '#D0BCFF',
        surface: '#1C1B1F',
        surfaceLight: '#F3EDF7',
        onSurface: '#E6E1E5',
        onSurfaceLight: '#1C1B1F',
        error: '#F2B8B5'
    };

    let config = GM_getValue('mriya_enchancer_v6', {
        font: '',
        cssGroups: [],
        jsGroups: [],
        blockedUsers: [],
        pos: { x: 50, y: 50 },
        extDarkTheme: true,
        siteDarkTheme: false,
        ctrlVPaste: true,
        compactPagination: true, // Стиснути сторінки
        hideImages: false,       // Приховувати фото під спойлер
        prettyDates: true,       // Нормальна дата
        hideAvatars: false,      // Приховати аватарки
        longInputs: true,        // Подовжити поля вводу
        rowButtons: true         // Кнопки в один ряд
    });

    function save() { GM_setValue('mriya_enchancer_v6', config); }

    // --- 3. ФУНКЦІЇ ОБРОБКИ ---

    function applyEverything() {
        let styleTag = document.getElementById('mriya-styles') || document.createElement('style');
        styleTag.id = 'mriya-styles';

        let css = config.font ? `* { font-family: "${config.font}", sans-serif !important; }\n` : '';

        if (config.siteDarkTheme) {
            css += `
                body, .site-wrap, .container { background: #1a1a1a !important; color: #e0e0e0 !important; }
                .post { background: #242424 !important; border-radius: 12px; padding: 15px; margin-bottom: 12px; border: 1px solid #333; color: #fff !important; }
                .post p, .post b, .post span { color: #fff !important; }
                .header, .nav-bar { background: #121212 !important; border-bottom: 1px solid #333 !important; }
                a { color: #bb86fc !important; }
            `;
        }

        if (config.hideAvatars) {
            css += `.avatar { display: none !important; }`;
        }

        if (config.longInputs) {
            css += `
                #contentField { min-height: 150px !important; width: 100% !important; box-sizing: border-box; }
                input[type="text"] { width: 100% !important; padding: 8px; box-sizing: border-box; }
            `;
        }

        if (config.rowButtons) {
            css += `
                #postForm { display: flex; flex-direction: column; gap: 8px; }
                #postForm .actions-row { display: flex; gap: 4px; align-items: center; width: 100%; }
                #emoji-button { white-space: nowrap; }
                #imageInput { flex-grow: 1; overflow: hidden; }
                #publishBtn { white-space: nowrap; padding: 5px 20px; font-weight: bold; }
            `;
        }

        styleTag.innerHTML = css;
        if (!styleTag.parentNode) document.documentElement.appendChild(styleTag);

        // Логіка DOM елементів
        document.addEventListener('DOMContentLoaded', () => {
            if (config.rowButtons) wrapButtons();
            if (config.compactPagination) handlePagination();
            if (config.prettyDates) handleDates();
            if (config.hideImages) handleImages();
            applyBlocking();
        });
    }

    // Змістити кнопки в один ряд
    function wrapButtons() {
        const form = document.getElementById('postForm');
        if (!form || form.querySelector('.actions-row')) return;

        const row = document.createElement('div');
        row.className = 'actions-row';

        const btnEmoji = document.getElementById('emoji-button');
        const inputImg = document.getElementById('imageInput');
        const btnPub = document.getElementById('publishBtn');

        if (btnEmoji && inputImg && btnPub) {
            btnEmoji.parentNode.insertBefore(row, btnEmoji);
            row.appendChild(btnEmoji);
            row.appendChild(inputImg);
            row.appendChild(btnPub);
        }
    }

    // Стиснути пагінацію
    function handlePagination() {
        const pag = document.querySelector('.pagination');
        if (!pag) return;
        const links = Array.from(pag.querySelectorAll('.page-btn'));
        if (links.length <= 12) return;

        const firstBatch = links.slice(0, 10);
        const lastLink = links[links.length - 1];

        const moreBtn = document.createElement('button');
        moreBtn.innerText = '...';
        moreBtn.className = 'page-btn';
        moreBtn.onclick = (e) => {
            e.preventDefault();
            links.forEach(l => l.style.display = 'inline-block');
            moreBtn.remove();
        };

        links.forEach(l => l.style.display = 'none');
        firstBatch.forEach(l => l.style.display = 'inline-block');
        pag.insertBefore(moreBtn, lastLink);
        lastLink.style.display = 'inline-block';
    }

    // Гарні дати
    function handleDates() {
        const months = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
        document.querySelectorAll('.post-time').forEach(el => {
            const raw = el.innerText.trim(); // 2026-02-17 17:05:39
            const match = raw.match(/(\d{4})-(\d{2})-(\d{2})\s(\d{2}:\d{2}:\d{2})/);
            if (match) {
                const [_, y, m, d, t] = match;
                el.innerText = `${parseInt(d)} ${months[parseInt(m)-1]} ${y} о ${t}`;
            }
        });
    }

    // Фото під спойлер
    function handleImages() {
        document.querySelectorAll('.post-images img').forEach(img => {
            const originalSrc = img.src;
            img.style.display = 'none'; 

            const spoiler = document.createElement('div');
            spoiler.style = "background: #333; color: #fff; padding: 10px; border-radius: 8px; cursor: pointer; text-align: center; margin-top: 5px; font-size: 13px;";
            spoiler.innerText = "Показати фото";

            img.parentNode.insertBefore(spoiler, img);

            spoiler.onclick = () => {
                img.style.display = 'block';
                img.src = originalSrc;
                spoiler.remove();
            };

            img.src = ''; 
        });
    }

    function blockUser(username) {
        if (!username) return;
        if (!config.blockedUsers.includes(username)) {
            config.blockedUsers.push(username);
            save();
            location.reload();
        }
    }

    function unblockUser(username) {
        config.blockedUsers = config.blockedUsers.filter(u => u !== username);
        save();
        location.reload();
    }

    function applyBlocking() {
        document.querySelectorAll('.post').forEach(post => {
            const authorNode = post.querySelector('b a');
            if (authorNode) {
                const username = authorNode.innerText.trim();
                if (config.blockedUsers.includes(username)) {
                    post.style.display = 'none';
                }
                if (!post.querySelector('.m3-block-link')) {
                    const blockLink = document.createElement('span');
                    blockLink.className = 'm3-block-link';
                    blockLink.innerText = ' [Блок]';
                    blockLink.style = "font-size: 10px; cursor: pointer; color: gray; margin-left: 5px;";
                    blockLink.onclick = (e) => {
                        if (confirm(`Заблокувати ${username}?`)) blockUser(username);
                    };
                    authorNode.parentNode.appendChild(blockLink);
                }
            }
        });
    }

    // --- 4. CTRL + V ---
    window.addEventListener('paste', (e) => {
        if (!config.ctrlVPaste) return;
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let item of items) {
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const fileInput = document.getElementById('imageInput');
                if (fileInput) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(item.getAsFile());
                    fileInput.files = dataTransfer.files;
                }
            }
        }
    });

    // --- 5. ІНТЕРФЕЙС ---
    function showUI() {
        if (document.getElementById('m3-root')) return;
        const root = document.createElement('div');
        root.id = 'm3-root';
        root.className = config.extDarkTheme ? 'm3-dark' : 'm3-light';
        root.style.left = config.pos.x + 'px';
        root.style.top = config.pos.y + 'px';
        root.innerHTML = `
            <div id="m3-header"><span id="m3-title">Mriya Enhancer 6.0</span><button id="m3-close">✕</button></div>
            <div id="m3-tabs">
                <div class="m3-tab active" data-tab="main">Головна</div>
                <div class="m3-tab" data-tab="settings">Опції</div>
                <div class="m3-tab" data-tab="block">ЧС</div>
            </div>
            <div id="m3-body"></div>
            <div id="m3-footer"><button id="m3-apply">Зберегти та оновити</button></div>
        `;
        document.body.appendChild(root);
        switchTab('main');
        makeDraggable(root);

        document.getElementById('m3-close').onclick = () => root.remove();
        document.getElementById('m3-apply').onclick = () => { save(); location.reload(); };

        root.querySelectorAll('.m3-tab').forEach(t => {
            t.onclick = () => {
                root.querySelectorAll('.m3-tab').forEach(r => r.classList.remove('active'));
                t.classList.add('active');
                switchTab(t.dataset.tab);
            };
        });
    }

    function switchTab(tab) {
        const body = document.getElementById('m3-body');
        if (tab === 'main') {
            body.innerHTML = `
                <div class="m3-field"><label>Шрифт</label><input type="text" id="fnt" value="${config.font}" placeholder="Arial, sans-serif"></div>
                <div class="m3-field"><label>Власний CSS</label><textarea id="css-c" rows="2"></textarea><button id="add-css">Додати</button></div>
                <div id="css-list"></div>
            `;
            document.getElementById('fnt').oninput = (e) => { config.font = e.target.value; save(); };
        } else if (tab === 'settings') {
            body.innerHTML = `
                <div class="m3-opt"><label><input type="checkbox" id="opt-row" ${config.rowButtons?'checked':''}> Кнопки в один ряд</label></div>
                <div class="m3-opt"><label><input type="checkbox" id="opt-pag" ${config.compactPagination?'checked':''}> Стиснути пагінацію (10 + ...)</label></div>
                <div class="m3-opt"><label><input type="checkbox" id="opt-img" ${config.hideImages?'checked':''}> Фото під спойлер</label></div>
                <div class="m3-opt"><label><input type="checkbox" id="opt-date" ${config.prettyDates?'checked':''}> Гарна дата</label></div>
                <div class="m3-opt"><label><input type="checkbox" id="opt-ava" ${config.hideAvatars?'checked':''}> Приховати аватарки</label></div>
                <div class="m3-opt"><label><input type="checkbox" id="opt-long" ${config.longInputs?'checked':''}> Подовжити поля вводу</label></div>
                <hr>
                <div class="m3-opt"><label><input type="checkbox" id="opt-sdark" ${config.siteDarkTheme?'checked':''}> Темна тема сайту</label></div>
                <div class="m3-opt"><label><input type="checkbox" id="opt-edark" ${config.extDarkTheme?'checked':''}> Темна тема меню</label></div>
            `;
            const bind = (id, key) => {
                document.getElementById(id).onchange = (e) => { config[key] = e.target.checked; save(); };
            };
            bind('opt-row', 'rowButtons');
            bind('opt-pag', 'compactPagination');
            bind('opt-img', 'hideImages');
            bind('opt-date', 'prettyDates');
            bind('opt-ava', 'hideAvatars');
            bind('opt-long', 'longInputs');
            bind('opt-sdark', 'siteDarkTheme');
            bind('opt-edark', 'extDarkTheme');

        } else if (tab === 'block') {
            body.innerHTML = `<label>Заблоковані користувачі:</label><div id="block-list"></div>`;
            const blist = document.getElementById('block-list');
            config.blockedUsers.forEach(user => {
                const item = document.createElement('div');
                item.className = 'm3-item';
                item.innerHTML = `<span>${user}</span><button>✕</button>`;
                item.querySelector('button').onclick = () => unblockUser(user);
                blist.appendChild(item);
            });
        }
    }

    function makeDraggable(el) {
        const h = document.getElementById('m3-header');
        let x=0, y=0, nx=0, ny=0;
        h.onmousedown = dragStart;
        function dragStart(e) { nx = e.clientX; ny = e.clientY; document.onmousemove = dragMove; document.onmouseup = dragEnd; }
        function dragMove(e) { x = nx - e.clientX; y = ny - e.clientY; nx = e.clientX; ny = e.clientY; el.style.top = (el.offsetTop - y) + "px"; el.style.left = (el.offsetLeft - x) + "px"; }
        function dragEnd() { document.onmousemove = null; config.pos = { x: el.offsetLeft, y: el.offsetTop }; save(); }
    }

    GM_addStyle(`
        #m3-root { position: fixed; width: 340px; z-index: 1000000; border-radius: 24px; overflow: hidden; font-family: system-ui, -apple-system; box-shadow: 0 10px 40px rgba(0,0,0,0.6); }
        .m3-dark { background: ${M3.surface}; color: ${M3.onSurface}; border: 1px solid #444; }
        .m3-light { background: ${M3.surfaceLight}; color: ${M3.onSurfaceLight}; border: 1px solid #ccc; }
        #m3-header { padding: 16px; background: rgba(0,0,0,0.1); cursor: move; display: flex; justify-content: space-between; align-items: center; }
        #m3-title { font-weight: bold; color: ${M3.primary}; }
        #m3-close { background: none; border: none; color: inherit; cursor: pointer; font-size: 18px; }
        #m3-tabs { display: flex; background: rgba(0,0,0,0.2); }
        .m3-tab { flex: 1; padding: 12px; text-align: center; cursor: pointer; opacity: 0.6; font-size: 13px; }
        .m3-tab.active { opacity: 1; border-bottom: 3px solid ${M3.primary}; font-weight: bold; }
        #m3-body { padding: 16px; max-height: 400px; overflow-y: auto; }
        .m3-field, .m3-opt { margin-bottom: 12px; }
        .m3-opt label { cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 14px; }
        input[type="text"], textarea { width: 100%; border-radius: 8px; border: 1px solid #555; background: rgba(0,0,0,0.2); color: inherit; padding: 8px; box-sizing: border-box; }
        .m3-item { display: flex; justify-content: space-between; background: rgba(0,0,0,0.1); padding: 8px; margin-top: 5px; border-radius: 8px; align-items: center; }
        .m3-item button { background: none; border: none; color: ${M3.error}; cursor: pointer; font-weight: bold; }
        #m3-apply { width: 100%; background: ${M3.primary}; color: #000; padding: 14px; border: none; font-weight: bold; cursor: pointer; }
        hr { border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 10px 0; }
    `);

    GM_registerMenuCommand("⚙️ Mriya Enhancer", showUI);

    applyEverything();
})();
