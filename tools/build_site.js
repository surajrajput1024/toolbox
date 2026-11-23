'use strict';
// Builds the GitHub Pages site into <out> (default ./dist): app files + per-tool pages + 20 exam/size landing pages + sitemap/robots/404.
// Usage: node tools/build_site.js [outDir] [baseUrl]
const fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, '..'), OUT = path.resolve(process.argv[2] || path.join(SRC, '../../deploy/toolbox')), BASE = (process.argv[3] || 'https://surajrajput1024.github.io/toolbox/').replace(/\/?$/, '/');
const { TOOLS } = require('../js/tools.js'), P = Object.fromEntries(require('../lib/presets.js').map((p) => [p.id, p]));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const KEEP = ['index.html', 'privacy.html', 'manifest.json', 'sw.js', 'LICENSES.md', 'css', 'js', 'lib', 'vendor', 'icons'];
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const cp = (a, b) => { const s = fs.statSync(a); if (s.isDirectory()) { fs.mkdirSync(b, { recursive: true }); fs.readdirSync(a).forEach((f) => cp(path.join(a, f), path.join(b, f))); } else fs.copyFileSync(a, b); };
KEEP.forEach((k) => cp(path.join(SRC, k), path.join(OUT, k)));
const shell = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
const urls = [BASE];
/** page: { dir, title, desc, h1, body, route, preset, kb } */
function page(o) {
  const depth = o.dir.split('/').length, pre = '../'.repeat(depth), canon = BASE + o.dir + '/';
  let h = shell.replace(/(href|src)="(?!https?:|#|data:)([^"]+)"/g, (m, a, u) => `${a}="${pre}${u}"`)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(o.title)}</title>`).replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(o.desc)}"><link rel="canonical" href="${canon}"><meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.desc)}"><meta property="og:type" content="website"><meta property="og:url" content="${canon}"><script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebApplication', name: o.h1, url: canon, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' } })}</script>`)
    .replace('<body>', `<body data-route="${o.route}"${o.preset ? ` data-preset="${o.preset}"` : ''}${o.kb ? ` data-kb="${o.kb}"` : ''}>`)
    .replace(/<main id="view">.*?<\/main>/, `<main id="view"><h1>${esc(o.h1)}</h1>${o.body}<noscript><p>This tool needs JavaScript. It runs fully in your browser and uploads nothing.</p></noscript></main>`);
  fs.mkdirSync(path.join(OUT, o.dir), { recursive: true }); fs.writeFileSync(path.join(OUT, o.dir, 'index.html'), h); urls.push(canon);
}
TOOLS.forEach((t) => page({ dir: t.id, route: t.id, title: `${t.en} - free, offline, no upload | Toolbox`, desc: `${t.en}: ${t.de}. Runs in your browser, works offline, nothing is uploaded.`, h1: t.en, body: `<p>${esc(t.de)}. Free, no sign-up, works offline. Your files never leave your device.</p>` }));
const exam = (slug, presetId, label) => { const p = P[presetId], kind = /sign/.test(presetId) ? 'signature' : 'photo', px = p.wPx ? `${p.wPx} x ${p.hPx} px` : p.wCm ? `${p.wCm} x ${p.hCm} cm` : 'size as per notice';
  page({ dir: `exam/${slug}`, route: kind === 'signature' ? 'signature' : 'form-photo', preset: presetId, title: `${label} resize ${p.minKB}-${p.maxKB} KB online - free, no upload | Toolbox`, desc: `Resize your ${label} to ${p.minKB}-${p.maxKB} KB (${px}) in your browser. Free, works offline, your photo is never uploaded.`, h1: `${label} resize to ${p.minKB}-${p.maxKB} KB`,
    body: `<p>Target for ${esc(label)}: ${p.minKB} KB to ${p.maxKB} KB, ${esc(px)}, JPEG.</p><p>${p.verified ? 'Read from the official notice: ' : 'Not verified on the official notice, check yours before uploading: '}${esc(p.note)}</p><p>Pick your file, press Process, download. Everything happens on your device.</p><ul>${p.src.map((u) => `<li><a href="${esc(u)}" rel="noopener">${esc(u)}</a></li>`).join('')}</ul>` }); };
[['ssc-photo-resize-20-50-kb', 'ssc-photo', 'SSC photo'], ['ssc-signature-resize-10-20-kb', 'ssc-sign', 'SSC signature'], ['upsc-photo-resize-20-200-kb', 'upsc-photo', 'UPSC photo'], ['upsc-signature-resize-20-100-kb', 'upsc-sign', 'UPSC signature'],
 ['ibps-photo-resize-20-50-kb', 'ibps-photo', 'IBPS photo'], ['ibps-signature-resize-10-20-kb', 'ibps-sign', 'IBPS signature'], ['neet-photo-resize-10-200-kb', 'neet-photo', 'NEET UG photo'], ['neet-signature-resize-10-100-kb', 'neet-sign', 'NEET UG signature'],
 ['railway-rrb-photo-resize-20-50-kb', 'rrb-photo', 'Railway RRB photo'], ['passport-photo-resize-kb', 'passport', 'Passport photo']].forEach((a) => exam(...a));
[[20, 'img-compress', 'photo', 'Photo'], [50, 'img-compress', 'photo', 'Photo'], [100, 'img-compress', 'photo', 'Photo'], [200, 'img-compress', 'photo', 'Photo'], [100, 'pdf-compress', 'pdf', 'PDF'], [200, 'pdf-compress', 'pdf', 'PDF'], [500, 'pdf-compress', 'pdf', 'PDF']].forEach(([kb, route, k, L]) =>
  page({ dir: `exam/compress-${k}-to-${kb}-kb`, route, kb, title: `Compress ${L} to ${kb} KB online - free, no upload | Toolbox`, desc: `Reduce a ${L.toLowerCase()} to about ${kb} KB for online forms. Runs in your browser, works offline, nothing is uploaded.`, h1: `Compress ${L} to ${kb} KB`, body: `<p>Choose your ${L.toLowerCase()}, we shrink it to ${kb} KB or the closest we can reach. ${k === 'pdf' ? 'Best effort: pages are re-saved as images.' : ''} Nothing is uploaded.</p>` }));
[['jpg-to-pdf-for-online-form', 'pdf-from-images', 'JPG to PDF for online forms'], ['merge-pdf-free-offline', 'pdf-merge', 'Merge PDF files free'], ['extract-pages-from-pdf', 'pdf-split', 'Extract pages from a PDF']].forEach(([slug, route, h1]) =>
  page({ dir: `exam/${slug}`, route, title: `${h1} - no upload | Toolbox`, desc: `${h1} in your browser. Works offline, no sign-up, your files never leave your device.`, h1, body: `<p>${esc(h1)}. Free, offline, nothing is uploaded.</p>` }));
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${BASE}sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, '404.html'), `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${BASE}"><title>Toolbox</title><a href="${BASE}">Toolbox</a>`);
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
const exams = urls.filter((u) => u.includes('/exam/')).length; console.log(`site: ${urls.length} urls (${TOOLS.length} tools, ${exams} landing pages) -> ${OUT}`);
