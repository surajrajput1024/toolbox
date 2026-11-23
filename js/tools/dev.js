/* Developer tools. Logic lives in lib/logic.js (node-tested). */
(function () {
  'use strict';
  const { h, tr, drop, errBox, field, seg, copyBtn, readBytes } = TB, L = Logic;
  const ta = (ph, rows) => h('textarea', { class: 'in', placeholder: ph || '', rows: rows || 6, spellcheck: false, autocapitalize: 'off' });
  const show = (box, fn) => { try { box.replaceChildren(fn()); } catch (e) { box.replaceChildren(errBox(e)); } };
  const outBox = () => h('pre', { class: 'out' });
  const btn = (t, f, cls) => h('button', { class: 'btn ' + (cls || ''), type: 'button', onclick: f }, t);
  /** Two-way text tool: input, run buttons, output + copy. */
  function textIO(body, ops, ph) { const i = ta(ph), o = outBox(), msg = h('div', {}); let last = '';
    const run = (f) => () => { msg.replaceChildren(); try { last = f(i.value); o.textContent = last; } catch (e) { o.textContent = ''; msg.replaceChildren(errBox(e)); } };
    body.append(h('div', { class: 'panel' }, i, h('div', { class: 'row', style: 'margin-top:10px' }, ops.map(([t, f]) => btn(t, run(f), 'sec sm')))), msg, h('div', { class: 'panel' }, o, copyBtn(() => last))); return { i, o }; }

  TB.register('json', (b) => { const ind = [2]; textIO(b, [[tr('Format', 'फॉर्मेट'), (s) => L.jsonFormat(s, 2)], [tr('Minify', 'मिनिफ़ाई'), (s) => L.jsonFormat(s, 0)], [tr('Validate', 'जाँचें'), (s) => { JSON.parse(s); return tr('Valid JSON ✓', 'सही JSON ✓'); }]], '{"name":"Toolbox"}'); });
  TB.register('url', (b) => textIO(b, [[tr('Encode', 'एन्कोड'), (s) => encodeURIComponent(s)], [tr('Decode', 'डिकोड'), L.urlDecode]], 'https://example.com/?q=नमस्ते world'));

  TB.register('base64', (b) => { textIO(b, [[tr('Encode', 'एन्कोड'), L.b64Encode], [tr('Decode', 'डिकोड'), L.b64Decode]], 'Hello');
    const o = outBox(), fb = h('div', { class: 'panel' }, h('b', {}, tr('File to Base64', 'फाइल से Base64')), drop({ accept: '*/*', hint: tr('Any file, up to a few MB.', 'कोई भी फाइल, कुछ MB तक।'), onFiles: async ([f]) => { if (f.size > 20e6) { o.textContent = tr('File too large (max 20 MB)', 'फाइल बहुत बड़ी (अधिकतम 20 MB)'); return; } o.textContent = L.b64FromBytes(await readBytes(f)); } }), o, copyBtn(() => o.textContent)); b.append(fb); });

  TB.register('jwt', (b) => { const i = ta('eyJhbGciOi…', 5), o = outBox(), msg = h('div', { class: 'msg info' }, tr('Decodes only. The signature is NOT verified, so do not trust the contents for security.', 'सिर्फ डिकोड करता है। सिग्नेचर की जाँच नहीं होती, इसलिए सुरक्षा के लिए भरोसा न करें।'));
    const upd = () => { if (!i.value.trim()) { o.textContent = ''; return; } try { const d = L.jwtDecode(i.value), x = d.payload.exp; o.textContent = JSON.stringify({ header: d.header, payload: d.payload }, null, 2) + (x ? '\n\nexp: ' + new Date(x * 1000).toLocaleString() + (x * 1000 < Date.now() ? '  (EXPIRED)' : '') : ''); } catch (e) { o.textContent = tr('Not a valid JWT', 'सही JWT नहीं है'); } };
    i.oninput = upd; b.append(msg, h('div', { class: 'panel' }, i), h('div', { class: 'panel' }, o, copyBtn(() => o.textContent))); });

  TB.register('hash', (b) => { const i = ta(tr('Type text, or pick a file below', 'टेक्स्ट लिखें या नीचे फाइल चुनें'), 4), o = h('dl', { class: 'kv' }); let bytes = null;
    const calc = async () => { const u = bytes || new TextEncoder().encode(i.value), r = [['MD5', L.md5(u)], ['SHA-1', await L.shaHex('SHA-1', u)], ['SHA-256', await L.shaHex('SHA-256', u)]]; o.replaceChildren(...r.flatMap(([k, v]) => [h('dt', {}, k), h('dd', { style: 'font-family:ui-monospace,monospace;font-size:.78rem;cursor:copy', title: 'copy', onclick: () => navigator.clipboard.writeText(v).then(() => TB.toast(tr('Copied', 'कॉपी हो गया'))) }, v)])); };
    i.oninput = () => { bytes = null; calc(); }; calc();
    b.append(h('div', { class: 'panel' }, i, drop({ accept: '*/*', hint: tr('Hash a file instead (stays on device).', 'फाइल का हैश (डिवाइस पर ही)।'), onFiles: async ([f]) => { bytes = await readBytes(f); calc(); } })), h('div', { class: 'panel' }, o, h('p', { class: 'msg info' }, tr('Tap a hash to copy. MD5 and SHA-1 are not safe for passwords.', 'हैश पर टैप करके कॉपी करें। पासवर्ड के लिए MD5/SHA-1 सुरक्षित नहीं।')))); });

  TB.register('uuid', (b) => { const n = TB.num(5, { min: 1, max: 100 }), o = outBox(); const gen = () => { o.textContent = Array.from({ length: Math.min(100, Math.max(1, +n.value || 1)) }, () => L.uuidV4()).join('\n'); };
    b.append(h('div', { class: 'panel' }, field(tr('How many (1-100)', 'कितने (1-100)'), n), btn(tr('Generate', 'बनाएँ'), gen, 'block')), h('div', { class: 'panel' }, o, copyBtn(() => o.textContent))); gen(); });

  TB.register('timestamp', (b) => { const t = TB.num(Math.floor(Date.now() / 1000)), dt = h('input', { class: 'in', type: 'datetime-local', step: 1 }), o = h('dl', { class: 'kv' });
    const fromTs = () => { try { const d = L.tsToDate(t.value); o.replaceChildren(...[[tr('Local', 'स्थानीय'), d.toLocaleString()], ['UTC', d.toUTCString()], ['ISO', d.toISOString()], ['IST', d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })]].flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, v)])); } catch (e) { o.replaceChildren(errBox(e)); } };
    t.oninput = fromTs; dt.onchange = () => { if (dt.value) { t.value = Math.floor(new Date(dt.value).getTime() / 1000); fromTs(); } };
    b.append(h('div', { class: 'panel' }, field(tr('Unix time (seconds or ms)', 'यूनिक्स समय (सेकंड या ms)'), t), field(tr('or pick date & time', 'या तारीख और समय चुनें'), dt), btn(tr('Now', 'अभी'), () => { t.value = Math.floor(Date.now() / 1000); fromTs(); }, 'sec sm')), h('div', { class: 'panel' }, o)); fromTs(); });

  TB.register('regex', (b) => { const re = h('input', { class: 'in', placeholder: '\\b\\d{4}\\b', autocapitalize: 'off', spellcheck: false }), fl = h('input', { class: 'in', value: 'g', style: 'max-width:90px' }), i = ta(tr('Test text', 'टेस्ट टेक्स्ट'), 5), o = h('div', { class: 'out' }), info = h('div', {});
    const run = () => { info.replaceChildren(); o.replaceChildren(); if (!re.value) return; try { const r = new RegExp(re.value, fl.value.includes('g') ? fl.value : fl.value + 'g'), s = i.value, parts = []; let last = 0, n = 0, m; while ((m = r.exec(s)) && n < 1000) { n++; parts.push(s.slice(last, m.index), h('mark', {}, m[0])); last = m.index + m[0].length; if (!m[0]) r.lastIndex++; } parts.push(s.slice(last)); o.replaceChildren(...parts); info.replaceChildren(h('div', { class: 'msg info' }, n + tr(' matches', ' मैच'))); } catch (e) { info.replaceChildren(errBox(e)); } };
    [re, fl, i].forEach((x) => { x.oninput = run; }); b.append(h('div', { class: 'panel' }, h('div', { class: 'row' }, field(tr('Pattern', 'पैटर्न'), re), field(tr('Flags', 'फ्लैग'), fl)), field(tr('Text', 'टेक्स्ट'), i)), info, h('div', { class: 'panel' }, o)); });

  TB.register('diff', (b) => { const a = ta(tr('Original', 'पुराना'), 6), c = ta(tr('Changed', 'नया'), 6), o = h('div', { class: 'out' });
    const run = () => { const d = L.diffLines(a.value, c.value); o.replaceChildren(...d.map((x) => h('div', { class: 'd ' + (x.t === '+' ? 'p' : x.t === '-' ? 'm' : '') }, (x.t === ' ' ? '  ' : x.t + ' ') + x.s))); }; a.oninput = c.oninput = run;
    b.append(h('div', { class: 'panel' }, a, h('div', { style: 'height:10px' }), c), h('div', { class: 'panel' }, o)); });
})();
