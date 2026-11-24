'use strict';
// One-off: renders og/<tool>.jpg (1200x630) with Playwright. Run: CHROME_PATH=... node tools/make_og.js ; commit the PNGs.
const { chromium } = require('playwright-core'), fs = require('fs'), path = require('path');
const { TOOLS } = require('../js/tools.js'), OUT = path.join(__dirname, '../og'); fs.mkdirSync(OUT, { recursive: true });
const COL = { pdf: '#b3261e', img: '#1d4ed8', dev: '#0b6b3a', txt: '#6d28d9', calc: '#b45309' };
const card = (t, sub, c) => `<body style="margin:0;width:1200px;height:630px;background:linear-gradient(135deg,${c},#0e121b);color:#fff;font:700 76px/1.15 system-ui,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:0 90px;box-sizing:border-box"><div style="font:600 34px system-ui;opacity:.85">Toolbox</div><div style="margin:18px 0">${t}</div><div style="font:500 38px system-ui;opacity:.9">${sub}</div><div style="margin-top:36px;font:600 30px system-ui;opacity:.8">Free &middot; Offline &middot; No upload</div></body>`;
(async () => { const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, channel: process.env.CHROME_PATH ? undefined : 'chrome' }), p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  const jobs = [['home', 'Free online PDF, photo and developer tools', 'Nothing leaves your device', '#1d4ed8']].concat(TOOLS.map((t) => [t.id, t.en, t.de, COL[t.cat]]));
  for (const [id, t, s, c] of jobs) { await p.setContent(card(t, s, c)); await p.screenshot({ path: path.join(OUT, id + '.jpg'), type: 'jpeg', quality: 78 }); }
  await b.close(); console.log(jobs.length + ' images'); })();
