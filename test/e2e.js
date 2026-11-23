'use strict';
// Browser test: serves the app, drives tools, checks no external requests / console errors, takes screenshots when SHOTS=dir.
const { chromium } = require('playwright-core'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert');
const ROOT = path.join(__dirname, '..'), SHOTS = process.env.SHOTS, MIME = { html: 'text/html', js: 'text/javascript', css: 'text/css', json: 'application/json', png: 'image/png', md: 'text/plain', xml: 'text/xml' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MIME[f.split('.').pop()] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
(async () => {
  await new Promise((ok) => srv.listen(0, ok)); const U = `http://localhost:${srv.address().port}/index.html`;
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, channel: process.env.CHROME_PATH ? undefined : 'chrome', headless: true });
  const tmp = fs.mkdtempSync(require('os').tmpdir() + '/tb-'); let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('FAIL', m); } else console.log('ok  ', m); };
  async function page(w, hgt, dark, extra) { const ctx = await b.newContext({ viewport: { width: w, height: hgt }, deviceScaleFactor: 2, isMobile: w < 600, hasTouch: w < 600, colorScheme: dark ? 'dark' : 'light', ...extra }), p = await ctx.newPage(); p.errs = []; p.ext = [];
    p.on('pageerror', (e) => p.errs.push(String(e))); p.on('console', (m) => m.type() === 'error' && p.errs.push(m.text())); p.on('request', (r) => { if (!r.url().startsWith('http://localhost') && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) p.ext.push(r.url()); }); return p; }
  const shot = (p, n) => SHOTS && p.screenshot({ path: path.join(SHOTS, n + '.png') });
  // sample files: noisy PNG photo + 2-page PDF
  const lp = await page(390, 844, false); await lp.goto(U);
  const png = await lp.evaluate(() => { const c = document.createElement('canvas'); c.width = 1200; c.height = 1500; const x = c.getContext('2d'), d = x.createImageData(1200, 1500); for (let i = 0; i < d.data.length; i += 4) { d.data[i] = Math.random() * 255; d.data[i + 1] = (i / 4 % 1200) / 5; d.data[i + 2] = 120; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); return c.toDataURL('image/png'); });
  const imgF = tmp + '/photo.png'; fs.writeFileSync(imgF, Buffer.from(png.split(',')[1], 'base64'));
  // home
  await lp.waitForSelector('.card'); const n = await lp.locator('.card').count(); ok(n >= 28, 'home shows ' + n + ' tools');
  ok(await lp.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal scroll at 390');
  const small = await lp.evaluate(() => [...document.querySelectorAll('.card,.ib,.btn,.star')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.height < 47.5 || r.width < 47.5); }).length); ok(small === 0, 'touch targets >=48px (violations: ' + small + ')');
  await shot(lp, 'home-light-390');
  await lp.fill('#q', 'emi'); ok((await lp.locator('.card').count()) === 1, 'search emi -> 1 card'); await lp.fill('#q', 'zzzz'); ok(await lp.locator('.empty').count() === 1, 'empty state'); await lp.fill('#q', '');
  await lp.locator('.card', { hasText: 'Resize image' }).locator('.star').click(); ok(await lp.locator('h2.sec', { hasText: 'Favourites' }).count() === 1, 'favourite row appears'); await lp.locator('.card .star[aria-pressed=true]').first().click();
  await lp.click('#lang'); ok(await lp.locator('.card b', { hasText: 'फॉर्म फोटो' }).count() === 1, 'Hindi labels'); await shot(lp, 'home-hindi-390'); await lp.click('#lang');
  // form photo with preset
  await lp.goto(U + '#/form-photo'); await lp.waitForSelector('input[type=file]'); await lp.setInputFiles('input[type=file]', imgF); await lp.selectOption('select.in', 'ssc-photo'); await lp.click('.btn.block'); await lp.waitForSelector('.delta');
  const kb = await lp.evaluate(() => document.querySelectorAll('.ba figcaption b')[1].textContent); const sz = parseFloat(kb); ok(/KB/.test(kb) && sz >= 20 && sz <= 50, 'SSC photo result ' + kb + ' (want 20-50 KB)'); await shot(lp, 'tool-formphoto-390');
  // img compress to 60KB
  await lp.goto(U + '#/img-compress'); await lp.setInputFiles('input[type=file]', imgF); await lp.fill('input[type=number]', '60'); await lp.click('.btn.block'); await lp.waitForSelector('.delta'); const k2 = await lp.evaluate(() => document.querySelectorAll('.ba figcaption b')[1].textContent); ok(parseFloat(k2) <= 60, 'compress to 60 KB -> ' + k2);
  // images -> pdf -> split/merge/compress/to-images
  await lp.goto(U + '#/pdf-from-images'); await lp.setInputFiles('input[type=file]', [imgF, imgF]); await lp.click('.btn.block:not(.sec)'); await lp.waitForSelector('.delta'); 
  const [dl] = await Promise.all([lp.waitForEvent('download'), lp.click('.btn >> text=Download')]); const pdfF = tmp + '/two.pdf'; await dl.saveAs(pdfF); ok(fs.statSync(pdfF).size > 1000 && fs.readFileSync(pdfF).slice(0, 4).toString() === '%PDF', 'images->PDF ' + fs.statSync(pdfF).size + ' B'); await shot(lp, 'tool-pdf-from-images-390');
  await lp.goto(U + '#/pdf-split'); await lp.setInputFiles('input[type=file]', pdfF); await lp.waitForSelector('.panel:not([hidden]) input.in'); await lp.fill('input.in', '2'); await lp.click('.btn.block'); await lp.waitForSelector('.delta'); ok((await lp.locator('.msg.info', { hasText: '1' }).count()) > 0, 'split keeps 1 page');
  await lp.goto(U + '#/pdf-merge'); await lp.setInputFiles('input[type=file]', [pdfF, pdfF]); await lp.click('.btn.block'); await lp.waitForSelector('.delta'); ok(await lp.locator('.msg.info', { hasText: '4' }).count() > 0, 'merge -> 4 pages');
  await lp.goto(U + '#/pdf-compress'); await lp.setInputFiles('input[type=file]', pdfF); await lp.fill('input[type=number]', '150'); await lp.click('.btn.block'); await lp.waitForSelector('.delta', { timeout: 60000 }); const dtxt = await lp.locator('.delta').innerText(); ok(/KB|MB/.test(dtxt), 'pdf compress: ' + dtxt.replace(/\n/g, ' '));
  await lp.goto(U + '#/pdf-to-images'); await lp.setInputFiles('input[type=file]', pdfF); await lp.waitForSelector('.pages img', { timeout: 30000 }); ok(await lp.locator('.pages img').count() === 2, 'pdf -> 2 images');
  // dev + calc
  await lp.goto(U + '#/json'); await lp.fill('textarea', '{"a":[1,2]}'); await lp.click('button >> text=Format'); ok((await lp.locator('.out').first().innerText()).includes('\n  "a"'), 'json format'); await lp.fill('textarea', '{bad'); await lp.click('button >> text=Validate'); ok(await lp.locator('.msg.err').count() === 1, 'json error shown'); await shot(lp, 'tool-json-390');
  await lp.goto(U + '#/hash'); await lp.fill('textarea', 'abc'); await lp.waitForTimeout(300); ok((await lp.locator('.kv').innerText()).includes('900150983cd24fb0d6963f7d28e17f72'), 'md5 abc');
  await lp.goto(U + '#/emi'); await lp.waitForSelector('.big'); ok((await lp.locator('.big').innerText()).includes('₹12,668'), 'EMI 10L @9% 10y = ' + await lp.locator('.big').innerText()); await shot(lp, 'tool-emi-390');
  for (const id of ['base64', 'url', 'jwt', 'uuid', 'timestamp', 'regex', 'diff', 'word-count', 'case', 'spaces', 'gst', 'percent', 'sip', 'age', 'img-resize', 'img-convert', 'img-crop', 'signature']) { await lp.goto(U + '#/' + id); await lp.waitForTimeout(150); ok(await lp.locator('.tool-h h1').count() === 1 && await lp.locator('.msg.err').count() === 0, 'route #/' + id + ' renders'); }
  ok(lp.errs.length === 0, 'no console errors ' + lp.errs.join('|')); ok(lp.ext.length === 0, 'no external requests ' + lp.ext.join(','));
  // dark + tablet + offline
  const dp = await page(390, 844, true); await dp.goto(U); await dp.waitForSelector('.card'); await shot(dp, 'home-dark-390'); await dp.goto(U + '#/img-compress'); await dp.setInputFiles('input[type=file]', imgF); await dp.fill('input[type=number]', '60'); await dp.click('.btn.block'); await dp.waitForSelector('.delta'); await shot(dp, 'tool-compress-dark-390');
  const tp = await page(820, 1180, false); await tp.goto(U); await tp.waitForSelector('.card'); await shot(tp, 'home-light-820'); await tp.goto(U + '#/pdf-merge'); await shot(tp, 'tool-pdf-merge-820');
  const op = await page(390, 844, false, { serviceWorkers: 'allow' }); await op.goto(U); await op.waitForSelector('.card'); await op.evaluate(() => navigator.serviceWorker.ready); await op.reload(); await op.context().setOffline(true); await op.goto(U + '#/pdf-merge'); await op.waitForSelector('.tool-h h1'); await op.setInputFiles('input[type=file]', [pdfF, pdfF]); await op.click('.btn.block'); await op.waitForSelector('.delta', { timeout: 20000 }); ok(true, 'works fully offline (merge PDF with network off)');
  await b.close(); srv.close(); console.log(bad ? bad + ' FAILED' : 'e2e all ok'); process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
