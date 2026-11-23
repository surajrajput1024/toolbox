/* Toolbox core: tiny DOM helper, i18n, theme, router, home grid, shared widgets. No dependencies. */
(function (g) {
  'use strict';
  const BASE = new URL('../', document.currentScript.src).href;
  const LS = { get: (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } } };
  let lang = LS.get('tb.lang', /^hi/.test(navigator.language) ? 'hi' : 'en');
  const tr = (en, hi) => (lang === 'hi' && hi ? hi : en);
  const $ = (s, r) => (r || document).querySelector(s);
  function h(tag, a, ...kids) {
    const el = tag === 'svg' || tag === 'path' ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
    for (const k in a || {}) { const v = a[k]; if (k.startsWith('aria-') && typeof v === 'boolean') { el.setAttribute(k, String(v)); continue; } if (v == null || v === false) continue; if (k === 'class') el.setAttribute('class', v); else if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else if (k === 'html') el.innerHTML = v; else if (k in el && tag !== 'svg' && k !== 'list') el[k] = v; else el.setAttribute(k, v === true ? '' : v); }
    kids.flat(9).forEach((c) => { if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(c)); });
    return el;
  }
  const P = { user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21c0-4 3.6-7 8-7s8 3 8 7', resize: 'M4 9V4h5M20 15v5h-5M4 4l6 6M20 20l-6-6', shrink: 'M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7', swap: 'M7 7h13l-4-4M17 17H4l4 4', crop: 'M6 2v16h16M2 6h16v16', pen: 'M4 20l4-1L19 8l-3-3L5 16zM14 7l3 3', imgpdf: 'M5 3h9l5 5v13H5zM14 3v5h5M8 17l3-3 2 2 2-2', merge: 'M6 3v5a4 4 0 0 0 4 4h4a4 4 0 0 1 4 4v5M18 3v5M15 6l3-3 3 3', split: 'M12 3v8M12 11l-6 6v4M12 11l6 6v4M3 21h6M15 21h6', images: 'M3 6h14v14H3zM7 3h14v14M6 17l4-4 3 3', braces: 'M8 4c-3 0-3 2-3 4s0 3-2 4c2 1 2 2 2 4s0 4 3 4M16 4c3 0 3 2 3 4s0 3 2 4c-2 1-2 2-2 4s0 4-3 4', code: 'M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14', link: 'M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1', key: 'M15 3a6 6 0 0 0-5 9l-6 6v3h3v-2h2v-2h2l1-1a6 6 0 1 0 3-13zM16 8h.01', hash: 'M5 9h15M4 15h15M10 3L8 21M16 3l-2 18', id: 'M3 5h18v14H3zM7 10h4M7 14h10M15 9h2', clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 7v5l3 2', regex: 'M12 4v10M7.5 6.5l9 5M16.5 6.5l-9 5M6 19h.01', diff: 'M5 4h6v16H5zM13 4h6v16h-6zM7 9h2M15 14h2', count: 'M4 7V5h16v2M12 5v14M9 19h6', case: 'M3 18l5-12 5 12M5 14h6M15 18v-7a3 3 0 0 1 6 0v7M15 14h6', space: 'M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4', cake: 'M4 20h16v-7H4zM4 16c3 2 5-2 8 0s5-2 8 0M12 13V8M12 3v2', bank: 'M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18', receipt: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6', percent: 'M19 5L5 19M7 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4M17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4', trend: 'M3 17l6-6 4 4 8-8M15 7h6v6', star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z', search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14M20 20l-4-4', back: 'M15 5l-7 7 7 7', up: 'M12 16V4M7 9l5-5 5 5M4 20h16', down: 'M12 4v12M7 11l5 5 5-5M4 20h16', share: 'M12 15V3M8 7l4-4 4 4M5 12v8h14v-8', moon: 'M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z', lock: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3', file: 'M6 3h8l5 5v13H6zM14 3v5h5', copy: 'M8 8h12v12H8zM4 16V4h12', trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13', warn: 'M12 3l10 18H2zM12 10v4M12 17h.01' };
  const icon = (n, sz) => h('svg', { viewBox: '0 0 24 24', width: sz || 24, height: sz || 24, fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' }, h('path', { d: P[n] || P.file }));
  const fmtSize = (b) => (b >= 1048576 ? (b / 1048576).toFixed(b >= 10485760 ? 1 : 2) + ' MB' : b >= 1024 ? (b / 1024).toFixed(b >= 10240 ? 0 : 1) + ' KB' : b + ' B');
  const toast = (m) => { const t = h('div', { class: 'toast', role: 'status' }, m); document.body.append(t); setTimeout(() => t.remove(), 2200); };
  const loadScript = (() => { const c = {}; return (src) => c[src] || (c[src] = new Promise((ok, no) => { const s = h('script', { src: BASE + src }); s.onload = ok; s.onerror = () => { delete c[src]; no(new Error('load ' + src)); }; document.head.append(s); })); })();
  const readBytes = async (f) => new Uint8Array(await f.arrayBuffer());
  const loadImage = (blob) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('bad image')); i.src = URL.createObjectURL(blob); });
  const canvasBlob = (c, type, q) => new Promise((ok, no) => c.toBlob((b) => (b ? ok(b) : no(new Error('encode failed'))), type, q));
  const baseName = (n) => n.replace(/\.[^.]+$/, '');

  /** Drop zone + "pick file" button. onFiles(File[]). */
  function drop({ accept, multiple, onFiles, hint }) {
    const inp = h('input', { type: 'file', accept, multiple: !!multiple, class: 'sr', tabindex: -1, onchange: () => { if (inp.files.length) onFiles([...inp.files]); inp.value = ''; } });
    const z = h('div', { class: 'drop' }, h('div', { class: 'ic' }, icon('up')), h('b', {}, tr(multiple ? 'Drag files here' : 'Drag a file here', multiple ? 'फाइलें यहाँ खींचें' : 'फाइल यहाँ खींचें')), h('p', {}, hint || ''),
      h('button', { class: 'btn', type: 'button', onclick: () => inp.click() }, icon('file', 20), tr(multiple ? 'Pick files' : 'Pick file', multiple ? 'फाइलें चुनें' : 'फाइल चुनें')), inp);
    ['dragenter', 'dragover'].forEach((e) => z.addEventListener(e, (ev) => { ev.preventDefault(); z.classList.add('over'); }));
    ['dragleave', 'drop'].forEach((e) => z.addEventListener(e, (ev) => { ev.preventDefault(); z.classList.remove('over'); }));
    z.addEventListener('drop', (ev) => { const fs = [...ev.dataTransfer.files]; if (fs.length) onFiles(multiple ? fs : fs.slice(0, 1)); });
    return z;
  }
  const privacy = () => h('div', { class: 'priv' }, icon('lock', 18), tr('Runs in your browser. No file is ever uploaded.', 'आपके ब्राउज़र में चलता है। कोई फाइल अपलोड नहीं होती।'));
  /** Before -> after summary with percent saved. */
  function delta(before, after) {
    const p = Math.round((1 - after / before) * 100);
    return h('div', { class: 'delta' }, fmtSize(before), ' → ', fmtSize(after), p > 0 ? h('span', { class: 'p' }, '−' + p + '%') : h('span', { class: 'p' }, '+' + -p + '%'));
  }
  /** Download + share buttons for a Blob. */
  function actions(blob, name) {
    const file = new File([blob], name, { type: blob.type });
    const dl = h('button', { class: 'btn', onclick: () => { const a = h('a', { href: URL.createObjectURL(blob), download: name }); document.body.append(a); a.click(); a.remove(); } }, icon('down', 20), tr('Download', 'डाउनलोड'));
    const can = navigator.canShare && navigator.canShare({ files: [file] });
    return h('div', { class: 'row' }, dl, can ? h('button', { class: 'btn sec', onclick: () => navigator.share({ files: [file], title: name }).catch(() => {}) }, icon('share', 20), tr('Share', 'शेयर')) : null);
  }
  const errBox = (e) => h('div', { class: 'msg err', role: 'alert' }, tr('Could not do that: ', 'यह नहीं हो सका: '), e && e.message ? e.message : String(e));
  const copyBtn = (get) => h('button', { class: 'btn sec sm', onclick: () => { navigator.clipboard.writeText(get()).then(() => toast(tr('Copied', 'कॉपी हो गया')), () => toast(tr('Copy failed', 'कॉपी नहीं हुआ'))); } }, icon('copy', 18), tr('Copy', 'कॉपी'));
  const field = (label, input) => h('div', {}, h('label', { class: 'l' }, label), input);
  const num = (v, a) => h('input', Object.assign({ class: 'in', type: 'number', inputMode: 'decimal', value: v }, a));
  const seg = (opts, cur, on) => { const w = h('div', { class: 'seg', role: 'group' }); const set = (v) => { [...w.children].forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === v)); on(v); }; opts.forEach(([v, l]) => w.append(h('button', { type: 'button', 'data-v': v, 'aria-pressed': v === cur, onclick: () => set(v) }, l))); return w; };

  // ---- theme ----
  const root = document.documentElement;
  const qt = new URLSearchParams(location.search).get('theme');
  let theme = qt || LS.get('tb.theme', null);
  const applyTheme = () => { theme ? root.setAttribute('data-theme', theme) : root.removeAttribute('data-theme'); const dark = theme ? theme === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches; $('meta[name=theme-color]').content = dark ? '#0e121b' : '#f4f6fb'; };

  // ---- favourites / recent ----
  let favs = LS.get('tb.fav', []), recent = LS.get('tb.recent', []);
  const toggleFav = (id) => { favs = favs.includes(id) ? favs.filter((x) => x !== id) : [id, ...favs]; LS.set('tb.fav', favs); };
  const pushRecent = (id) => { recent = [id, ...recent.filter((x) => x !== id)].slice(0, 6); LS.set('tb.recent', recent); };
  const byId = (id) => TB_TOOLS.find((t) => t.id === id);

  function card(t) {
    const f = favs.includes(t.id);
    return h('a', { class: 'card ' + t.cat, href: '#/' + t.id }, h('div', { class: 'ic' }, icon(t.icon)), h('b', {}, tr(t.en, t.hi)), h('small', {}, tr(t.de, t.dh)),
      h('button', { class: 'star', 'aria-label': tr('Favourite', 'पसंदीदा'), 'aria-pressed': f, onclick: (e) => { e.preventDefault(); e.stopPropagation(); toggleFav(t.id); home(); } }, icon('star', 22)));
  }
  const section = (title, list) => list.length ? [h('h2', { class: 'sec' }, title), h('div', { class: 'grid' }, list.map(card))] : [];
  function home() {
    const q = $('#q').value.trim().toLowerCase(), v = $('#view'); v.replaceChildren();
    document.title = 'Toolbox: PDF, photo, developer tools | टूलबॉक्स';
    if (q) {
      const r = TB_TOOLS.filter((t) => (t.en + ' ' + t.hi + ' ' + t.de + ' ' + t.kw).toLowerCase().includes(q));
      v.append(...(r.length ? section(tr('Results', 'नतीजे'), r) : [h('div', { class: 'empty' }, h('div', { class: 'ic' }, icon('search')), h('b', {}, tr('No tool found', 'कोई टूल नहीं मिला')), h('p', {}, tr('Try "pdf", "photo", "emi" or "json".', '"pdf", "photo", "emi" या "json" लिखकर देखें।')))]));
      return;
    }
    v.append(...section(tr('★ Favourites', '★ पसंदीदा'), favs.map(byId).filter(Boolean)), ...section(tr('Recent', 'हाल के'), recent.map(byId).filter(Boolean).filter((t) => !favs.includes(t.id)).slice(0, 4)));
    Object.keys(TB_CATS).forEach((c) => v.append(...section(tr(...TB_CATS[c].n), TB_TOOLS.filter((t) => t.cat === c))));
  }

  // ---- router ----
  const reg = {}; const TB = { h, $, tr, icon, fmtSize, toast, loadScript, readBytes, loadImage, canvasBlob, baseName, drop, privacy, delta, actions, errBox, copyBtn, field, num, seg, BASE, reg, register: (id, fn) => { reg[id] = fn; }, get lang() { return lang; }, LS };
  g.TB = TB;
  let rid = 0;
  async function route() {
    const hm = location.hash.match(/^#\/([\w-]*)/), id = hm ? hm[1] : document.body.dataset.route || '', t = byId(id), v = $('#view'), my = ++rid;
    $('.search').hidden = !!t; window.scrollTo(0, 0);
    if (!t) { home(); return; }
    pushRecent(id);
    const cc = TB_CATS[t.cat];
    if (!(document.body.dataset.route === id && !hm)) document.title = tr(t.en, t.hi) + ' | Toolbox';
    v.replaceChildren(h('div', { class: 'tool-h ' + t.cat }, h('a', { class: 'back', href: '#/', 'aria-label': tr('Back', 'वापस') }, icon('back')), h('div', {}, h('h1', {}, tr(t.en, t.hi)), h('p', {}, tr(t.de, t.dh)))), privacy());
    const body = h('div', {}); v.append(body);
    try {
      await loadScript('js/tools/' + cc.mod + '.js'); if (my !== rid) return;
      if (!reg[id]) throw new Error('tool missing');
      await reg[id](body, { preset: document.body.dataset.preset, kb: document.body.dataset.kb });
    } catch (e) { body.replaceChildren(errBox(e)); }
  }
  function init() {
    applyTheme();
    $('#lang').onclick = () => { lang = lang === 'en' ? 'hi' : 'en'; LS.set('tb.lang', lang); chrome(); route(); };
    $('#theme').onclick = () => { theme = (theme || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light')) === 'dark' ? 'light' : 'dark'; LS.set('tb.theme', theme); applyTheme(); };
    $('#q').addEventListener('input', home);
    addEventListener('hashchange', () => { $('#q').value = ''; route(); });
    addEventListener('scroll', () => $('.top').classList.toggle('s', scrollY > 4), { passive: true });
    chrome(); route();
    if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register(BASE + 'sw.js').catch(() => {});
  }
  function chrome() {
    root.lang = lang; $('#lang').textContent = lang === 'en' ? 'हिं' : 'EN'; $('#lang').setAttribute('aria-label', 'Language');
    $('#q').placeholder = tr('Search tools: pdf, photo, emi…', 'टूल खोजें: pdf, photo, emi…'); $('#q').setAttribute('aria-label', $('#q').placeholder);
    $('#theme').replaceChildren(icon('moon', 22)); $('#theme').setAttribute('aria-label', tr('Dark / light', 'डार्क / लाइट'));
    $('#foot').textContent = tr('No ads. No sign-up. Your files never leave this device.', 'कोई विज्ञापन नहीं। कोई साइन-अप नहीं। आपकी फाइलें इस डिवाइस से बाहर नहीं जातीं।');
  }
  init();
})(window);
