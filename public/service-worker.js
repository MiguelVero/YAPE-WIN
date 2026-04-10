/* =========================================================
   YAPE-WIN — Service Worker
   Handles push notifications and offline caching basics.
   ========================================================= */

const CACHE_NAME = 'yape-win-v1';
const STATIC_ASSETS = ['/', '/index.html', '/app.js', '/styles.css', '/manifest.json'];

// ── Install: pre-cache static assets ──────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ── Activate: clean up old caches ─────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first, fall back to cache ──────────────
self.addEventListener('fetch', (event) => {
  // Only handle same-origin GET requests
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// ── Push: show notification ────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'Yape Automático', body: 'Tienes un nuevo pago.' };
  try {
    data = event.data ? event.data.json() : data;
  } catch (_) { /* keep defaults */ }

  const title = data.title || 'Yape Automático';
  const options = {
    body: data.body || 'Tienes un nuevo pago.',
    icon: '/yape-static-qr.png',
    badge: '/yape-static-qr.png',
    tag: 'yape-payment',
    renotify: true,
    data: data.order || null,
    actions: [
      { action: 'view', title: 'Ver historial' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification click: focus or open the app ─────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const targetUrl = self.location.origin + '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and post a message
      for (const client of windowClients) {
        if (client.url.startsWith(targetUrl) && 'focus' in client) {
          client.focus();
          client.postMessage({ type: 'notification_click', action, order: event.notification.data });
          return;
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
