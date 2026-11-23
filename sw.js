/* Offline cache: everything is precached so the whole toolbox works with no network. Bump V on any file change. */
const V = 'tb-v1', F = ['./', 'index.html', 'privacy.html', 'manifest.json', 'css/app.css', 'lib/presets.js', 'lib/compress.js', 'lib/logic.js', 'js/tools.js', 'js/core.js',
  'js/tools/pdf.js', 'js/tools/image.js', 'js/tools/dev.js', 'js/tools/text.js', 'js/tools/calc.js', 'vendor/pdf-lib.min.js', 'vendor/pdf.min.js', 'vendor/pdf.worker.min.js', 'icons/icon-48.png', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', (e) => e.waitUntil(caches.open(V).then((c) => c.addAll(F)).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== V).map((x) => caches.delete(x)))).then(() => self.clients.claim())));
// cache-first; ignoreSearch so ?theme= / ?preset= variants and SEO pages fall back to the shell
self.addEventListener('fetch', (e) => { if (e.request.method !== 'GET') return; e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request).catch(() => caches.match('index.html')))); });
