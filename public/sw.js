importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ── Firebase Messaging ──────────────────────────────────────────────────────
firebase.initializeApp({
  apiKey: "AIzaSyA6m9RJa12BflFp9o3z24kEUpF619mU1Fs",
  authDomain: "gen-lang-client-0252520614.firebaseapp.com",
  projectId: "gen-lang-client-0252520614",
  storageBucket: "gen-lang-client-0252520614.firebasestorage.app",
  messagingSenderId: "971090977651",
  appId: "1:971090977651:web:79b9de7de92b0bd7b9db06"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || 'Facilita Aí';
  const body  = payload.notification?.body  || payload.data?.body  || 'Nova notificação';
  const data  = payload.data || {};

  self.registration.showNotification(title, {
    body,
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: data.chatId || 'facilita-notif',
    renotify: true,
    data,
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('/');
    })
  );
});

// ── PWA Cache ───────────────────────────────────────────────────────────────
const CACHE_NAME = 'facilita-ai-v4';
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

  if (event.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(fetch(event.request).catch(() => caches.match('/')));
    return;
  }

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

  event.respondWith(fetch(event.request));
});
