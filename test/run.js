'use strict';
// Compress a generated noisy sample into every preset range, using macOS sips as the JPEG encoder.
const { execFileSync } = require('child_process'), fs = require('fs'), os = require('os'), path = require('path');
const { fitToRange } = require('../lib/compress.js'), presets = require('../lib/presets.js');
const d = fs.mkdtempSync(path.join(os.tmpdir(), 'fp-')), W = 800, H = 1000;
// 24-bit BMP with gradient + noise (large photo-like source)
const row = Math.ceil(W * 3 / 4) * 4, buf = Buffer.alloc(54 + row * H);
buf.write('BM'); buf.writeUInt32LE(buf.length, 2); buf.writeUInt32LE(54, 10); buf.writeUInt32LE(40, 14);
buf.writeInt32LE(W, 18); buf.writeInt32LE(H, 22); buf.writeUInt16LE(1, 26); buf.writeUInt16LE(24, 28);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const o = 54 + y * row + x * 3; buf[o] = (x / 4 + Math.random() * 60) & 255; buf[o + 1] = (y / 4 + Math.random() * 60) & 255; buf[o + 2] = ((x + y) / 8 + Math.random() * 60) & 255; }
fs.writeFileSync(d + '/src.bmp', buf);
async function encode(scale, q) {
  const out = d + '/o.jpg', w = Math.round(W * scale), h = Math.round(H * scale);
  execFileSync('sips', ['-z', String(h), String(w), '-s', 'format', 'jpeg', '-s', 'formatOptions', String(Math.round(q * 100)), d + '/src.bmp', '--out', out], { stdio: 'ignore' });
  return new Uint8Array(fs.readFileSync(out));
}
(async () => {
  let bad = 0;
  for (const p of presets) {
    const r = await fitToRange(encode, p.minKB * 1024, p.maxKB * 1024), kb = r.bytes.length / 1024;
    const ok = kb >= p.minKB && kb <= p.maxKB; if (!ok) bad++;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${p.id.padEnd(11)} ${kb.toFixed(1)} KB in [${p.minKB},${p.maxKB}] q=${r.q.toFixed(2)} pad=${r.padded}`);
  }
  fs.rmSync(d, { recursive: true }); process.exit(bad ? 1 : 0);
})();
