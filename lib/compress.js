/* Core compressor. encode(scale, quality) -> Uint8Array (JPEG bytes). Pure, DOM-free so node can test it. */
(function (g) {
  'use strict';
  /** Search quality (and, if needed, scale) so JPEG size lands in [minB, maxB]. Pads trailing bytes after EOI if too small. */
  async function fitToRange(encode, minB, maxB) {
    if (!(maxB >= minB && minB >= 0)) throw new Error('bad range');
    let scale = 1;
    for (let round = 0; round < 8; round++) {
      let lo = 0.05, hi = 0.95, best = null;
      for (let i = 0; i < 9; i++) {
        const q = (lo + hi) / 2;
        const b = await encode(scale, q);
        if (b.length <= maxB) { best = { b, q, scale }; lo = q; } else hi = q;
      }
      if (best) return pad(best.b, minB, best);
      scale *= 0.8; // even min quality too big: shrink pixels
    }
    throw new Error('cannot reach target size');
  }
  function pad(bytes, minB, meta) {
    if (bytes.length >= minB) return { bytes, padded: 0, q: meta.q, scale: meta.scale };
    const out = new Uint8Array(minB); out.set(bytes); // zero bytes after JPEG EOI are ignored by decoders
    return { bytes: out, padded: minB - bytes.length, q: meta.q, scale: meta.scale };
  }
  const api = { fitToRange };
  g.FormCompress = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
