const CACHE_NAME = 'facilita-ai-v3';
const STATIC_ASSETS = /\/assets\/.+\.(js|css|woff2?|png|svg|ico)$/;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Always network-first for HTML (never cache index.html)
  if (event.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(fetch(event.request).catch(() => caches.match('/')));
    return;
  }

  // Cache-first only for hashed static assets (JS/CSS with content hash in filename)
  if (STATIC_ASSETS.test(url.pathname)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(res => {
            cache.put(event.request, res.clone());
            return res;
          });
        })
      )
    );
    return;
  }

  // Everything else: network only
  event.respondWith(fetch(event.request));
});
