/* India calculators: live results, INR with lakh/crore grouping. */
(function () {
  'use strict';
  const { h, tr, field, num, seg } = TB, L = Logic, inr = L.inr;
  const kv = (rows) => h('dl', { class: 'kv' }, rows.flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, v)]));
  /** Wire inputs -> render(out) live; shows a friendly hint on invalid input. */
  function calc(b, inputs, compute) { const out = h('div', { class: 'panel' }); const run = () => { try { out.replaceChildren(compute()); } catch (e) { out.replaceChildren(h('div', { class: 'msg info' }, tr('Enter the values above.', 'ऊपर की वैल्यू भरें।'))); } };
    b.append(h('div', { class: 'panel' }, inputs), out); b.addEventListener('input', run); b.addEventListener('click', () => setTimeout(run)); run(); }
  const big = (l, v) => h('div', {}, h('small', { style: 'color:var(--mut)' }, l), h('div', { class: 'big' }, v));

  TB.register('emi', (b) => { const p = num(1000000), r = num(9), y = num(10); let unit = 'y';
    calc(b, h('div', {}, field(tr('Loan amount ₹', 'लोन राशि ₹'), p), field(tr('Interest % per year', 'ब्याज % सालाना'), r), field(tr('Tenure', 'अवधि'), h('div', { class: 'row' }, y, TB.seg([['y', tr('Years', 'साल')], ['m', tr('Months', 'महीने')]], unit, (v) => { unit = v; })))),
      () => { const m = unit === 'y' ? y.value * 12 : +y.value, e = L.emi(+p.value, +r.value, m); return h('div', {}, big(tr('Monthly EMI', 'मासिक EMI'), inr(e.emi)), kv([[tr('Principal', 'मूलधन'), inr(+p.value)], [tr('Total interest', 'कुल ब्याज'), inr(e.interest)], [tr('Total payable', 'कुल भुगतान'), inr(e.total)]])); }); });

  TB.register('gst', (b) => { const a = num(1000); let rate = '18', inc = 'ex';
    calc(b, h('div', {}, field(tr('Amount ₹', 'राशि ₹'), a), field(tr('GST rate', 'GST दर'), TB.seg(['5', '12', '18', '28'].map((x) => [x, x + '%']), rate, (v) => { rate = v; })), field(tr('Amount is', 'राशि है'), TB.seg([['ex', tr('Without GST', 'GST के बिना')], ['in', tr('With GST', 'GST सहित')]], inc, (v) => { inc = v; }))),
      () => { const g = L.gst(+a.value, +rate, inc === 'in'); return h('div', {}, big(tr('Total', 'कुल'), inr(g.total)), kv([[tr('Price before GST', 'GST से पहले'), inr(g.base)], ['CGST', inr(g.cgst)], ['SGST', inr(g.sgst)], [tr('Total GST', 'कुल GST'), inr(g.tax)]])); }); });

  TB.register('sip', (b) => { const m = num(5000), r = num(12), y = num(10);
    calc(b, h('div', {}, field(tr('Monthly SIP ₹', 'मासिक SIP ₹'), m), field(tr('Expected return % per year', 'अनुमानित रिटर्न % सालाना'), r), field(tr('Years', 'साल'), y)),
      () => { const s = L.sip(+m.value, +r.value, +y.value); return h('div', {}, big(tr('Estimated value', 'अनुमानित मूल्य'), inr(s.value)), kv([[tr('Invested', 'निवेश'), inr(s.invested)], [tr('Estimated gain', 'अनुमानित कमाई'), inr(s.gain)]]), h('p', { class: 'msg info' }, tr('Estimate only. Real returns vary and are not guaranteed.', 'सिर्फ अनुमान। असली रिटर्न बदलते हैं, गारंटी नहीं।'))); }); });

  TB.register('percent', (b) => { const a = num(10), c = num(250); let mode = 'of';
    const labels = () => ({ of: [tr('Percent %', 'प्रतिशत %'), tr('Of number', 'संख्या का')], is: [tr('Number', 'संख्या'), tr('Out of', 'में से')], change: [tr('From', 'से'), tr('To', 'तक')] });
    calc(b, h('div', {}, TB.seg([['of', tr('X% of Y', 'Y का X%')], ['is', tr('X is ?% of Y', 'X, Y का ?%')], ['change', tr('% change', '% बदलाव')]], mode, (v) => { mode = v; }), field(tr('First value', 'पहली वैल्यू'), a), field(tr('Second value', 'दूसरी वैल्यू'), c)),
      () => { const x = +a.value, y = +c.value; if (mode === 'of') return big(tr('Result', 'नतीजा'), String(+L.pct.of(x, y).toFixed(4))); if (!y && mode === 'is') throw 0; if (!x && mode === 'change') throw 0; return big(tr('Result', 'नतीजा'), (+(mode === 'is' ? L.pct.is(x, y) : L.pct.change(x, y)).toFixed(2)) + '%'); }); });

  TB.register('age', (b) => { const today = new Date(), iso = (d) => d.toISOString().slice(0, 10), d1 = h('input', { class: 'in', type: 'date', max: iso(today) }), d2 = h('input', { class: 'in', type: 'date', value: iso(today) });
    calc(b, h('div', {}, field(tr('Date of birth', 'जन्म तिथि'), d1), field(tr('Age on', 'किस तारीख को'), d2)), () => { if (!d1.value) throw 0; const a = L.age(new Date(d1.value + 'T00:00'), new Date(d2.value + 'T00:00'));
      return h('div', {}, big(tr('Age', 'उम्र'), `${a.y} ${tr('y', 'साल')} ${a.m} ${tr('m', 'माह')} ${a.d} ${tr('d', 'दिन')}`), kv([[tr('Total days', 'कुल दिन'), a.days.toLocaleString('en-IN')], [tr('Next birthday in', 'अगला जन्मदिन'), a.nextBirthdayDays + tr(' days', ' दिन')]])); }); });
})();
