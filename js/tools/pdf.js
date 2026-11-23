/* PDF tools. pdf-lib (edit) and pdf.js (render) are vendored and lazy-loaded; nothing leaves the device. */
(function () {
  'use strict';
  const { h, tr, fmtSize, drop, delta, actions, errBox, field, num, seg, icon, loadImage, canvasBlob, readBytes, baseName } = TB;
  const lib = () => TB.loadScript('vendor/pdf-lib.min.js').then(() => window.PDFLib);
  const pjs = () => TB.loadScript('vendor/pdf.min.js').then(() => { pdfjsLib.GlobalWorkerOptions.workerSrc = TB.BASE + 'vendor/pdf.worker.min.js'; return pdfjsLib; });
  const PDF_ERR = () => tr('This PDF could not be read (damaged or password-protected).', 'यह PDF पढ़ी नहीं जा सकी (खराब या पासवर्ड वाली)।');

  /** Ordered multi-file list with remove / move up. Returns {el, files(), add(fs)}. */
  function fileList(onChange) {
    let fs = []; const ul = h('ul', { class: 'files' });
    const paint = () => { ul.replaceChildren(...fs.map((f, i) => h('li', {}, h('span', { class: 'n' }, f.name), h('span', { class: 'z' }, fmtSize(f.size)),
      i ? h('button', { 'aria-label': 'Move up', onclick: () => { [fs[i - 1], fs[i]] = [fs[i], fs[i - 1]]; paint(); } }, '↑') : null, h('button', { 'aria-label': 'Remove', onclick: () => { fs.splice(i, 1); paint(); } }, '✕')))); onChange(fs); };
    return { el: ul, files: () => fs, add: (n) => { fs = fs.concat(n); paint(); } };
  }
  const resultBox = () => h('div', {});
  const done = (box, before, blob, name, extra) => { box.replaceChildren(delta(before, blob.size), extra || null, actions(blob, name)); box.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const busy = (box) => box.replaceChildren(h('progress'));

  function multiTool(body, { accept, hint, button, run, options }) {
    const out = resultBox(), go = h('button', { class: 'btn block', type: 'button', disabled: true }, button);
    const L = fileList((fs) => { go.disabled = !fs.length; out.replaceChildren(); });
    go.onclick = async () => { go.disabled = true; busy(out); try { await run(L.files(), out); } catch (e) { out.replaceChildren(errBox(e)); } go.disabled = !L.files().length; };
    body.append(drop({ accept, multiple: true, hint, onFiles: L.add }), L.el, options ? h('div', { class: 'panel' }, options) : null, go, out);
  }

  TB.register('pdf-from-images', (body) => { let size = 'a4';
    multiTool(body, { accept: 'image/*', hint: tr('Add photos in the order you want. Use ↑ to reorder.', 'फोटो क्रम से जोड़ें। ↑ से क्रम बदलें।'), button: tr('Make PDF', 'PDF बनाएँ'),
      options: field(tr('Page size', 'पेज साइज़'), seg([['a4', 'A4'], ['fit', tr('Fit photo', 'फोटो जितना')]], size, (v) => { size = v; })),
      run: async (fs, out) => { const { PDFDocument } = await lib(), doc = await PDFDocument.create(); let total = 0;
        for (const f of fs) { total += f.size; let bytes = await readBytes(f), im;
          if (f.type === 'image/png') im = await doc.embedPng(bytes); else if (f.type === 'image/jpeg') im = await doc.embedJpg(bytes);
          else { const i = await loadImage(f), c = document.createElement('canvas'); c.width = i.naturalWidth; c.height = i.naturalHeight; c.getContext('2d').drawImage(i, 0, 0); im = await doc.embedJpg(new Uint8Array(await (await canvasBlob(c, 'image/jpeg', 0.92)).arrayBuffer())); }
          let [pw, ph] = size === 'a4' ? [595.28, 841.89] : [im.width, im.height]; const p = doc.addPage([pw, ph]), m = size === 'a4' ? 24 : 0, s = Math.min((pw - 2 * m) / im.width, (ph - 2 * m) / im.height), w = im.width * s, hh = im.height * s;
          p.drawImage(im, { x: (pw - w) / 2, y: (ph - hh) / 2, width: w, height: hh }); }
        done(out, total, new Blob([await doc.save()], { type: 'application/pdf' }), 'photos.pdf'); } });
  });

  TB.register('pdf-merge', (body) => multiTool(body, { accept: 'application/pdf', hint: tr('Add 2 or more PDFs. Use ↑ to reorder.', '2 या ज़्यादा PDF जोड़ें। ↑ से क्रम बदलें।'), button: tr('Merge', 'जोड़ें'),
    run: async (fs, out) => { if (fs.length < 2) throw new Error(tr('Add at least 2 PDFs', 'कम से कम 2 PDF जोड़ें')); const { PDFDocument } = await lib(), doc = await PDFDocument.create(); let total = 0;
      for (const f of fs) { total += f.size; let src; try { src = await PDFDocument.load(await readBytes(f)); } catch (e) { throw new Error(f.name + ': ' + PDF_ERR()); } (await doc.copyPages(src, src.getPageIndices())).forEach((p) => doc.addPage(p)); }
      done(out, total, new Blob([await doc.save()], { type: 'application/pdf' }), 'merged.pdf', h('div', { class: 'msg info' }, doc.getPageCount() + tr(' pages', ' पेज'))); } }));

  /** "1-3, 5" -> [0,1,2,4] (0-based, validated against n). */
  function parseRanges(s, n) { const out = []; for (const part of s.split(',').map((x) => x.trim()).filter(Boolean)) { const m = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/); if (!m) throw new Error(tr('Write pages like 1-3, 5', 'पेज ऐसे लिखें: 1-3, 5')); const a = +m[1], b = +(m[2] || m[1]); if (a < 1 || b < a || b > n) throw new Error(tr(`Pages must be between 1 and ${n}`, `पेज 1 से ${n} के बीच हों`)); for (let i = a; i <= b; i++) out.push(i - 1); } if (!out.length) throw new Error(tr('Enter pages to keep', 'रखने वाले पेज लिखें')); return out; }

  TB.register('pdf-split', (body) => { const box = h('div', {}), out = resultBox(); let doc, file;
    const pg = h('input', { class: 'in', placeholder: '1-3, 5', inputMode: 'text' }), info = h('div', { class: 'msg info' }), go = h('button', { class: 'btn block', type: 'button' }, tr('Extract pages', 'पेज निकालें'));
    const panel = h('div', { class: 'panel', hidden: true }, info, field(tr('Pages to keep', 'रखने वाले पेज'), pg), go);
    go.onclick = async () => { go.disabled = true; busy(out); try { const { PDFDocument } = await lib(), idx = parseRanges(pg.value, doc.getPageCount()), nd = await PDFDocument.create(); (await nd.copyPages(doc, idx)).forEach((p) => nd.addPage(p));
      done(out, file.size, new Blob([await nd.save()], { type: 'application/pdf' }), baseName(file.name) + '-pages.pdf', h('div', { class: 'msg info' }, idx.length + tr(' pages kept', ' पेज रखे'))); } catch (e) { out.replaceChildren(errBox(e)); } go.disabled = false; };
    body.append(drop({ accept: 'application/pdf', hint: tr('Choose one PDF, then type the pages to keep.', 'एक PDF चुनें, फिर रखने वाले पेज लिखें।'), onFiles: async ([f]) => { out.replaceChildren(); try { const { PDFDocument } = await lib(); doc = await PDFDocument.load(await readBytes(f)); file = f; info.textContent = `${f.name} · ${doc.getPageCount()} ${tr('pages', 'पेज')} · ${fmtSize(f.size)}`; pg.value = '1'; panel.hidden = false; } catch (e) { out.replaceChildren(errBox(PDF_ERR())); } } }), panel, out);
  });

  /** Render every page of pdf bytes to canvases at scale. */
  async function renderPages(bytes, scale, onPage) { const pdf = await (await pjs()).getDocument({ data: bytes.slice() }).promise, cs = [];
    for (let i = 1; i <= pdf.numPages; i++) { const pg = await pdf.getPage(i), vp = pg.getViewport({ scale }), c = document.createElement('canvas'); c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height); const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); await pg.render({ canvasContext: x, viewport: vp }).promise; cs.push(c); if (onPage) onPage(i, pdf.numPages); }
    return cs; }

  TB.register('pdf-compress', (body, o) => { const kb = num((o && o.kb) || 200, { min: 10 }), out = resultBox(), go = h('button', { class: 'btn block', type: 'button' }, tr('Compress', 'छोटी करें')); let file;
    const panel = h('div', { class: 'panel', hidden: true }, field(tr('Target size (KB)', 'टारगेट साइज़ (KB)'), kb), h('div', { class: 'msg info' }, tr('Best effort: pages are re-saved as images, so text will not be selectable.', 'कोशिश के आधार पर: पेज फोटो बनकर सेव होते हैं, टेक्स्ट सेलेक्ट नहीं होगा।')), go);
    go.onclick = async () => { go.disabled = true; const target = kb.value * 1024; try { const { PDFDocument } = await lib(), bytes = await readBytes(file); let best = null, hit = false;
      for (const scale of [1.4, 1.1, 0.85, 0.65, 0.5]) { out.replaceChildren(h('progress'), h('p', { class: 'msg info' }, tr('Trying quality level…', 'क्वालिटी आज़मा रहे हैं…'))); const cs = await renderPages(bytes, scale);
        for (const q of [0.7, 0.5, 0.35, 0.22]) { const doc = await PDFDocument.create(); for (const c of cs) { const im = await doc.embedJpg(new Uint8Array(await (await canvasBlob(c, 'image/jpeg', q)).arrayBuffer())); const p = doc.addPage([c.width / scale, c.height / scale]); p.drawImage(im, { x: 0, y: 0, width: c.width / scale, height: c.height / scale }); }
          const u = await doc.save(); if (!best || u.length < best.length) best = u; if (u.length <= target) { best = u; hit = true; break; } } if (hit) break; }
      if (best.length >= file.size) { out.replaceChildren(h('div', { class: 'msg info' }, tr('This PDF is already small; re-saving did not make it smaller.', 'यह PDF पहले से छोटी है; दोबारा सेव करने से छोटी नहीं हुई।'))); }
      else done(out, file.size, new Blob([best], { type: 'application/pdf' }), baseName(file.name) + '-small.pdf', best.length > target ? h('div', { class: 'msg err' }, tr('Could not reach ' + kb.value + ' KB; this is the smallest we could make.', kb.value + ' KB तक नहीं पहुँचे; यह सबसे छोटी बनी।')) : null);
    } catch (e) { out.replaceChildren(errBox(e)); } go.disabled = false; };
    body.append(drop({ accept: 'application/pdf', hint: tr('Choose a PDF, set the size you need.', 'PDF चुनें, चाहिए वाला साइज़ लिखें।'), onFiles: ([f]) => { file = f; panel.hidden = false; out.replaceChildren(h('div', { class: 'msg info' }, `${f.name} · ${fmtSize(f.size)}`)); } }), panel, out);
  });

  TB.register('pdf-to-images', (body) => { let fmt = 'jpg'; const out = resultBox();
    body.append(h('div', { class: 'panel' }, field(tr('Format', 'फॉर्मेट'), seg([['jpg', 'JPG'], ['png', 'PNG']], fmt, (v) => { fmt = v; }))),
      drop({ accept: 'application/pdf', hint: tr('Each page becomes a photo.', 'हर पेज एक फोटो बनेगा।'), onFiles: async ([f]) => { busy(out); try { const type = fmt === 'png' ? 'image/png' : 'image/jpeg', cs = await renderPages(await readBytes(f), 1.6), items = [];
        for (let i = 0; i < cs.length; i++) { const b = await canvasBlob(cs[i], type, 0.9), n = `${baseName(f.name)}-p${i + 1}.${fmt}`; items.push([b, n]); }
        out.replaceChildren(h('div', { class: 'msg info' }, `${cs.length} ${tr('pages', 'पेज')} · ${fmtSize(items.reduce((s, x) => s + x[0].size, 0))}`), h('div', { class: 'pages' }, items.map(([b, n], i) => h('figure', {}, h('img', { src: URL.createObjectURL(b), alt: 'p' + (i + 1) }), h('button', { class: 'btn sec sm block', onclick: () => { const a = h('a', { href: URL.createObjectURL(b), download: n }); a.click(); } }, icon('down', 18), i + 1)))));
      } catch (e) { out.replaceChildren(errBox(PDF_ERR())); } } }), out);
  });
})();
