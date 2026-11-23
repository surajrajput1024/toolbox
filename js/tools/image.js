/* Image tools: form photo, signature, resize, compress, convert, crop/rotate. All canvas-based, in-browser. */
(function () {
  'use strict';
  const { h, tr, fmtSize, drop, delta, actions, errBox, field, num, seg, loadImage, canvasBlob, baseName } = TB;
  const DPI = 300;
  const MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
  const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
  const canvasOf = (img, w, h2, bg) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h2)); const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; if (bg) { x.fillStyle = bg; x.fillRect(0, 0, c.width, c.height); } return c; };
  const bytesOf = async (c, type, q) => new Uint8Array(await (await canvasBlob(c, type, q)).arrayBuffer());

  /** Shared flow: pick one image -> options panel -> run -> before/after + download. */
  function flow(body, { options, run, hint }) {
    const stage = h('div', {}); let file = null, img = null, ctx = {};
    const out = h('div', {}), panel = h('div', { class: 'panel', hidden: true }), go = h('button', { class: 'btn block', type: 'button' }, tr('Process', 'शुरू करें'));
    const reset = h('button', { class: 'btn sec sm', type: 'button', onclick: () => location.reload() }, tr('Start over', 'फिर से शुरू'));
    const dz = drop({ accept: 'image/*', hint: hint || tr('JPG, PNG, WebP. Stays on your device.', 'JPG, PNG, WebP। आपके डिवाइस पर ही रहती है।'), onFiles: async ([f]) => {
      out.replaceChildren();
      try { img = await loadImage(f); file = f; } catch (e) { stage.replaceChildren(dz, errBox(tr('This is not an image we can read.', 'यह फोटो पढ़ी नहीं जा सकी।'))); return; }
      dz.hidden = true; panel.hidden = false; panel.replaceChildren(h('div', { class: 'msg info' }, `${f.name} · ${img.naturalWidth}×${img.naturalHeight} px · ${fmtSize(f.size)}`), options(img, ctx = {}), go, h('div', { style: 'margin-top:10px' }, reset));
    } });
    go.onclick = async () => {
      go.disabled = true; out.replaceChildren(h('progress'));
      try {
        const r = await run(img, file, ctx), url = URL.createObjectURL(r.blob);
        out.replaceChildren(delta(file.size, r.blob.size), h('div', { class: 'ba' },
          h('figure', {}, h('img', { src: img.src, alt: tr('Before', 'पहले') }), h('figcaption', {}, tr('Before', 'पहले'), h('b', {}, `${fmtSize(file.size)} · ${img.naturalWidth}×${img.naturalHeight}`))),
          h('figure', {}, h('img', { src: url, alt: tr('After', 'बाद में') }), h('figcaption', {}, tr('After', 'बाद में'), h('b', {}, `${fmtSize(r.blob.size)} · ${r.w}×${r.h}`)))),
          r.note ? h('div', { class: 'msg info' }, r.note) : null, actions(r.blob, r.name));
      } catch (e) { out.replaceChildren(errBox(e)); }
      go.disabled = false; out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    stage.append(dz, panel, out); body.append(stage);
  }

  /** Cover-crop img to w:h at scale, encode as JPEG within [minB,maxB]. */
  async function fitJpeg(img, w, h2, minB, maxB) {
    const r = await FormCompress.fitToRange((s, q) => { const c = canvasOf(img, w * s, h2 * s, '#fff'), ar = w / h2, ir = img.naturalWidth / img.naturalHeight; let sw = img.naturalWidth, sh = img.naturalHeight, sx = 0, sy = 0;
      if (w && ir > ar) { sw = sh * ar; sx = (img.naturalWidth - sw) / 2; } else if (w) { sh = sw / ar; sy = (img.naturalHeight - sh) / 2; }
      c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height); return bytesOf(c, 'image/jpeg', q); }, minB, maxB);
    return r;
  }

  function presetTool(filter) {
    return (body, o) => {
      const list = PRESETS.filter(filter); const sel = h('select', { class: 'in' }), note = h('div', { class: 'msg info' }), src = h('div', { style: 'font-size:.8rem;word-break:break-all' });
      const mn = num(''), mx = num(''), w = num('', { placeholder: 'px' }), hh = num('', { placeholder: 'px' });
      list.forEach((p) => sel.add(new Option(TB.lang === 'hi' ? p.nameHi : p.name, p.id))); sel.add(new Option(tr('Custom', 'कस्टम'), 'custom'));
      const upd = () => { const p = list.find((x) => x.id === sel.value); if (!p) { note.textContent = ''; src.textContent = ''; return; }
        mn.value = p.minKB; mx.value = p.maxKB; const px = p.wPx ? [p.wPx, p.hPx] : p.wCm ? [Math.round(p.wCm / 2.54 * DPI), Math.round(p.hCm / 2.54 * DPI)] : ['', '']; w.value = px[0]; hh.value = px[1];
        note.textContent = (p.verified ? tr('From official notice: ', 'आधिकारिक नोटिस से: ') : tr('Not verified on the official notice. Check yours before uploading. ', 'आधिकारिक नोटिस से जाँचा नहीं गया। अपलोड से पहले अपना नोटिस देखें। ')) + p.note;
        src.replaceChildren(...p.src.map((u) => h('a', { href: u, target: '_blank', rel: 'noopener' }, u.replace(/^https?:\/\//, '').slice(0, 48) + ' ')));
      };
      sel.onchange = upd; if (o && o.preset && list.some((p) => p.id === o.preset)) sel.value = o.preset; upd();
      flow(body, { hint: tr('Pick your photo or scan; get the exact size the form wants.', 'अपनी फोटो चुनें; फॉर्म वाला सही साइज़ पाएँ।'),
        options: () => h('div', {}, field(tr('Exam / size', 'परीक्षा / साइज़'), sel), note, src, field(tr('File size KB (min – max)', 'फाइल साइज़ KB (न्यूनतम – अधिकतम)'), h('div', { class: 'row' }, mn, mx)), field(tr('Width × Height px (optional)', 'चौड़ाई × ऊँचाई px (वैकल्पिक)'), h('div', { class: 'row' }, w, hh))),
        run: async (img, f) => { const minB = Math.round(mn.value * 1024), maxB = Math.round(mx.value * 1024); if (!(maxB > 0 && maxB >= minB)) throw new Error(tr('Check the KB range', 'KB सीमा जाँचें'));
          let W = +w.value, H = +hh.value; if (!W || !H) { const m = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight)); W = Math.round(img.naturalWidth * m); H = Math.round(img.naturalHeight * m); }
          const r = await fitJpeg(img, W, H, minB, maxB); return { blob: new Blob([r.bytes], { type: 'image/jpeg' }), name: baseName(f.name) + '-form.jpg', w: Math.round(W * r.scale), h: Math.round(H * r.scale), note: r.scale < 1 ? tr('Pixels reduced a little to reach the size.', 'साइज़ पाने के लिए पिक्सल थोड़े घटाए गए।') : null }; } });
    };
  }

  TB.register('form-photo', presetTool((p) => true));
  TB.register('signature', presetTool((p) => /sign/.test(p.id)));

  TB.register('img-resize', (body) => {
    const w = num('', { placeholder: 'px' }), hh = num('', { placeholder: 'px' }), pc = num(100, { min: 1, max: 400 }); let keep = true, ar = 1;
    const pct = field(tr('or scale %', 'या स्केल %'), pc);
    w.oninput = () => { if (keep && w.value) hh.value = Math.round(w.value / ar); }; hh.oninput = () => { if (keep && hh.value) w.value = Math.round(hh.value * ar); };
    pc.oninput = (e) => { const i = pc.img; if (i && pc.value) { w.value = Math.round(i.naturalWidth * pc.value / 100); hh.value = Math.round(i.naturalHeight * pc.value / 100); } };
    flow(body, { options: (img) => { ar = img.naturalWidth / img.naturalHeight; pc.img = img; w.value = img.naturalWidth; hh.value = img.naturalHeight;
      return h('div', {}, field(tr('Width × Height px', 'चौड़ाई × ऊँचाई px'), h('div', { class: 'row' }, w, hh)), pct, h('label', { class: 'l' }, h('input', { type: 'checkbox', checked: true, onchange: (e) => { keep = e.target.checked; } }), ' ', tr('Keep proportions', 'अनुपात बनाए रखें'))); },
      run: async (img, f) => { const W = +w.value, H = +hh.value; if (!(W > 0 && H > 0 && W <= 12000 && H <= 12000)) throw new Error(tr('Enter a size between 1 and 12000 px', '1 से 12000 px के बीच साइज़ लिखें'));
        const c = canvasOf(img, W, H); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); const type = f.type === 'image/png' ? 'image/png' : 'image/jpeg'; const blob = await canvasBlob(c, type, 0.92);
        return { blob, name: `${baseName(f.name)}-${c.width}x${c.height}.${EXT[type]}`, w: c.width, h: c.height }; } });
  });

  TB.register('img-compress', (body, o) => {
    const kb = num((o && o.kb) || 100, { min: 1 }); let fmt = 'jpg';
    flow(body, { options: () => h('div', {}, field(tr('Target size (KB)', 'टारगेट साइज़ (KB)'), kb), field(tr('Format', 'फॉर्मेट'), seg([['jpg', 'JPG'], ['webp', 'WebP']], fmt, (v) => { fmt = v; }))),
      run: async (img, f) => { const maxB = Math.round(kb.value * 1024); if (!(maxB > 0)) throw new Error(tr('Enter a target in KB', 'KB में टारगेट लिखें')); const type = MIME[fmt], W = img.naturalWidth, H = img.naturalHeight;
        const r = await FormCompress.fitToRange(async (s, q) => { const c = canvasOf(img, W * s, H * s, '#fff'); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); return bytesOf(c, type, q); }, 0, maxB);
        return { blob: new Blob([r.bytes], { type }), name: `${baseName(f.name)}-${kb.value}kb.${fmt}`, w: Math.round(W * r.scale), h: Math.round(H * r.scale), note: r.scale < 1 ? tr('Pixels reduced to reach the target.', 'टारगेट के लिए पिक्सल घटाए गए।') : null }; } });
  });

  TB.register('img-convert', (body) => {
    let fmt = 'png';
    flow(body, { options: () => h('div', {}, field(tr('Convert to', 'इसमें बदलें'), seg([['jpg', 'JPG'], ['png', 'PNG'], ['webp', 'WebP']], fmt, (v) => { fmt = v; }))),
      run: async (img, f) => { const c = canvasOf(img, img.naturalWidth, img.naturalHeight, fmt === 'jpg' ? '#fff' : null); c.getContext('2d').drawImage(img, 0, 0); const blob = await canvasBlob(c, MIME[fmt], 0.92); if (blob.type !== MIME[fmt]) throw new Error(tr('This browser cannot write ' + fmt.toUpperCase(), 'यह ब्राउज़र ' + fmt.toUpperCase() + ' नहीं बना सकता'));
        return { blob, name: `${baseName(f.name)}.${fmt}`, w: c.width, h: c.height }; } });
  });

  TB.register('img-crop', (body) => {
    let rot = 0, flip = false, ratio = 'free', fmt = 'jpg'; const zoom = num(100, { min: 100, max: 400 });
    flow(body, { options: () => h('div', {}, field(tr('Rotate', 'घुमाएँ'), h('div', { class: 'row' }, h('button', { class: 'btn sec sm', type: 'button', onclick: () => { rot = (rot + 270) % 360; } }, '⟲ 90°'), h('button', { class: 'btn sec sm', type: 'button', onclick: () => { rot = (rot + 90) % 360; } }, '⟳ 90°'), h('button', { class: 'btn sec sm', type: 'button', onclick: () => { flip = !flip; } }, tr('Flip', 'पलटें')))),
      field(tr('Crop ratio (centre)', 'क्रॉप अनुपात (बीच से)'), seg([['free', tr('None', 'नहीं')], ['1:1', '1:1'], ['4:5', '4:5'], ['3:4', '3:4'], ['16:9', '16:9']], ratio, (v) => { ratio = v; })), field(tr('Zoom %', 'ज़ूम %'), zoom), field(tr('Format', 'फॉर्मेट'), seg([['jpg', 'JPG'], ['png', 'PNG']], fmt, (v) => { fmt = v; }))),
      run: async (img, f) => { const sw = rot % 180 ? img.naturalHeight : img.naturalWidth, sh = rot % 180 ? img.naturalWidth : img.naturalHeight;
        const r0 = canvasOf(img, sw, sh, '#fff'), x = r0.getContext('2d'); x.translate(sw / 2, sh / 2); x.rotate(rot * Math.PI / 180); if (flip) x.scale(-1, 1); x.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        let cw = sw, ch = sh; if (ratio !== 'free') { const [a, b] = ratio.split(':').map(Number); if (sw / sh > a / b) cw = sh * a / b; else ch = sw * b / a; }
        const z = Math.max(1, zoom.value / 100); cw /= z; ch /= z; const c = canvasOf(img, cw, ch, '#fff'); c.getContext('2d').drawImage(r0, (sw - cw) / 2, (sh - ch) / 2, cw, ch, 0, 0, c.width, c.height);
        return { blob: await canvasBlob(c, MIME[fmt], 0.92), name: `${baseName(f.name)}-edit.${fmt}`, w: c.width, h: c.height }; } });
  });
})();
