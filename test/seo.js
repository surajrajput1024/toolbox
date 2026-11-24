'use strict';
// SEO gate on the BUILT site (dist/): unique titles/descriptions, one H1, JSON-LD parses, canonical, sitemap == pages, 150+ words of copy.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '../dist')); let bad = 0; const fail = (m) => { bad++; console.log('FAIL', m); };
const files = []; (function w(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) { if (!/^(js|lib|vendor|css|icons|og)$/.test(f)) w(p); } else if (f === 'index.html') files.push(p); } })(ROOT);
const titles = new Map(), descs = new Map(), words = [];
for (const f of files) { const h = fs.readFileSync(f, 'utf8'), rel = path.relative(ROOT, f) || 'index.html', g = (re) => (h.match(re) || [])[1];
  const t = g(/<title>([^<]*)<\/title>/), d = g(/<meta name="description" content="([^"]*)"/), canon = g(/<link rel="canonical" href="([^"]*)"/);
  if (!t || t.length > 70) fail(`${rel} title length ${t && t.length}`); if (titles.has(t)) fail(`${rel} duplicate title with ${titles.get(t)}`); titles.set(t, rel);
  if (!d || d.length > 170 || d.length < (/^hi\//.test(rel) ? 40 : 70)) fail(`${rel} description length ${d && d.length}`); if (descs.has(d)) fail(`${rel} duplicate description`); descs.set(d, rel);
  if (!canon) fail(`${rel} no canonical`); if ((h.match(/<h1[ >]/g) || []).length !== 1) fail(`${rel} h1 count`);
  for (const m of h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)) try { JSON.parse(m[1]); } catch (e) { fail(`${rel} bad JSON-LD`); }
  if (rel !== 'index.html') { const s = (h.match(/<section id="seo".*?<\/section>/s) || [''])[0].replace(/<[^>]+>/g, ' '), n = s.split(/\s+/).filter(Boolean).length; words.push([rel, n]); if (n < (/^hi\//.test(rel) ? 90 : 130)) fail(`${rel} only ${n} words`); if (!/FAQPage/.test(h)) fail(`${rel} no FAQPage`); } }
const sm = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8'), locs = (sm.match(/<loc>/g) || []).length; if (locs !== files.length) fail(`sitemap ${locs} vs pages ${files.length}`);
if (!/Sitemap:/.test(fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8'))) fail('robots sitemap line');
words.sort((a, b) => a[1] - b[1]); console.log(`${files.length} pages, words min ${words[0][1]} (${words[0][0]}) max ${words[words.length - 1][1]}`); console.log(bad ? `${bad} FAIL` : 'seo ok'); process.exit(bad ? 1 : 0);
