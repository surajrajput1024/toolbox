/* Text tools. */
(function () {
  'use strict';
  const { h, tr, field, seg, copyBtn } = TB, L = Logic, ta = (ph) => h('textarea', { class: 'in', placeholder: ph, rows: 8 });
  TB.register('word-count', (b) => { const i = ta(tr('Paste or type text here', 'यहाँ टेक्स्ट लिखें या पेस्ट करें')), o = h('dl', { class: 'kv' });
    const upd = () => { const s = L.textStats(i.value); o.replaceChildren(...[[tr('Words', 'शब्द'), s.words], [tr('Characters', 'अक्षर'), s.chars], [tr('Without spaces', 'स्पेस के बिना'), s.charsNoSpace], [tr('Lines', 'लाइनें'), s.lines], [tr('Sentences', 'वाक्य'), s.sentences]].flatMap(([k, v]) => [h('dt', {}, k), h('dd', { class: 'big', style: 'font-size:1.2rem;margin:0' }, v)])); };
    i.oninput = upd; upd(); b.append(h('div', { class: 'panel' }, i), h('div', { class: 'panel' }, o)); });
  TB.register('case', (b) => { const i = ta(tr('Type or paste text', 'टेक्स्ट लिखें या पेस्ट करें')), o = h('pre', { class: 'out' });
    const names = { upper: 'UPPER', lower: 'lower', title: 'Title Case', sentence: 'Sentence', camel: 'camelCase', snake: 'snake_case', kebab: 'kebab-case' };
    b.append(h('div', { class: 'panel' }, i, h('div', { class: 'row', style: 'margin-top:10px' }, Object.keys(names).map((k) => h('button', { class: 'btn sec sm', onclick: () => { o.textContent = L.CASES[k](i.value); } }, names[k])))), h('div', { class: 'panel' }, o, copyBtn(() => o.textContent))); });
  TB.register('spaces', (b) => { const i = ta(tr('Paste messy text', 'बेतरतीब टेक्स्ट पेस्ट करें')), o = h('pre', { class: 'out' });
    b.append(h('div', { class: 'panel' }, i, h('button', { class: 'btn block', style: 'margin-top:10px', onclick: () => { o.textContent = L.cleanSpaces(i.value); } }, tr('Clean', 'साफ करें'))), h('div', { class: 'panel' }, o, copyBtn(() => o.textContent))); });
})();
