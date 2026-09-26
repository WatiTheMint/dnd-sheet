/* Лист героя — service worker. Сгенерирован при сборке. */
const VERSION = "175gi3b";
const CACHE = 'dnd-sheet-' + VERSION;
const RUNTIME = 'dnd-sheet-runtime-' + VERSION;
const PRECACHE = ["./","./assets/index-ClqLQgMW.js","./assets/engine-DBZIfe-E.js","./assets/alegreya-cyrillic-500-normal-uJUgykjJ.woff2","./assets/alegreya-cyrillic-700-normal-Bftrb-m-.woff2","./assets/alegreya-cyrillic-800-normal-TM6to0H1.woff2","./assets/alegreya-latin-500-normal-C25lLdV_.woff2","./assets/alegreya-latin-700-normal-Vpz_43wJ.woff2","./assets/alegreya-latin-800-normal-BcufLBxY.woff2","./assets/alegreya-sans-cyrillic-400-normal-CFUoBDld.woff2","./assets/alegreya-sans-cyrillic-500-normal-kQHBM3cE.woff2","./assets/alegreya-sans-cyrillic-700-normal-BMO00Gdb.woff2","./assets/alegreya-sans-cyrillic-800-normal-D2Jsre_s.woff2","./assets/alegreya-sans-latin-400-normal-DtLlO8BS.woff2","./assets/alegreya-sans-latin-500-normal-DS713u5J.woff2","./assets/alegreya-sans-latin-700-normal-DEbcy2sF.woff2","./assets/alegreya-sans-latin-800-normal-CpHsWMQ0.woff2","./assets/alegreya-sc-cyrillic-500-normal-BjmNXJC0.woff2","./assets/alegreya-sc-cyrillic-700-normal-DywRGmLG.woff2","./assets/alegreya-sc-latin-500-normal-4QwauZv7.woff2","./assets/alegreya-sc-latin-700-normal-ztAmjLTs.woff2","./assets/caveat-cyrillic-500-normal-DpMZbbjM.woff2","./assets/caveat-latin-500-normal-B9SDL8cy.woff2","./assets/index-DzRyNigE.css","./index.html","./favicon.svg","./manifest.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png"];
// Скрипты-модули и шрифты запрашиваются с заголовком Origin, а хостинги отвечают с Vary — без ignoreVary кэш не находится
const MATCH = { ignoreVary: true };

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' })))),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('dnd-sheet-') && k !== CACHE && k !== RUNTIME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    const root = new URL(self.registration.scope).pathname;
    const appEntry = url.pathname === root || url.pathname === root + 'index.html';
    const fromCache = caches
      .open(CACHE)
      .then((cache) => cache.match('./index.html', MATCH).then((hit) => hit || cache.match('./', MATCH)));
    // Свой адрес — сразу из кэша, сайт открывается мгновенно и без интернета.
    // Чужой адрес — с сервера, чтобы показалась страница 404; без сети открываем сайт.
    event.respondWith(
      appEntry
        ? fromCache.then((hit) => hit || fetch(request))
        : fetch(request).catch(() => fromCache.then((hit) => hit || Response.error())),
    );
    return;
  }

  // Файлы: из кэша, иначе из сети; то, что грузится по требованию (pdf.js), кэшируем при первом использовании
  event.respondWith(
    caches.match(request, MATCH).then((hit) => {
      if (hit) return hit;
      return fetch(request).then((response) => {
        if (response.ok && url.pathname.includes('/assets/')) {
          const copy = response.clone();
          caches.open(RUNTIME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
