importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA6m9RJa12BflFp9o3z24kEUpF619mU1Fs",
  authDomain: "gen-lang-client-0252520614.firebaseapp.com",
  projectId: "gen-lang-client-0252520614",
  storageBucket: "gen-lang-client-0252520614.firebasestorage.app",
  messagingSenderId: "971090977651",
  appId: "1:971090977651:web:79b9de7de92b0bd7b9db06"
});

const messaging = firebase.messaging();

// Background push handler — fires when app is closed/minimized
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || 'Facilita Aí';
  const body  = payload.notification?.body  || payload.data?.body  || 'Nova notificação';
  const icon  = '/logo1.png';
  const badge = '/logo1.png';
  const data  = payload.data || {};

  self.registration.showNotification(title, {
    body,
    icon,
    badge,
    tag: data.chatId || 'facilita-notif',
    renotify: true,
    data,
    actions: [{ action: 'open', title: 'Abrir' }],
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
