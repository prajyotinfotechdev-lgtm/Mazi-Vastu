// ─── MaziVastu Service Worker ────────────────────────────────────────────────
// Handles push notifications and basic offline caching for PWA.
// ──────────────────────────────────────────────────────────────────────────────

const CACHE_NAME = 'mazivastu-v2';

// Install — skip waiting immediately (don't try to cache dynamic pages)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Only cache the manifest and static assets, NOT the dynamic "/" page
      return cache.addAll(['/manifest.json', '/images/logo.jpg']);
    })
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network-first strategy with cache fallback
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  // Skip API calls and auth routes
  if (event.request.url.includes('/api/')) return;
  if (event.request.url.includes('/admin/')) return;

  // For navigation requests (HTML pages), always go network-first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // For static assets, cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: 'MaziVastu', body: event.data.text() };
  }

  const options = {
    body: data.body || 'New update from MaziVastu',
    icon: '/images/logo.jpg',
    badge: '/images/logo.jpg',
    data: {
      url: data.url || '/',
    },
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open', title: 'View' },
      { action: 'close', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'MaziVastu', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Focus existing window if available
      for (const client of clients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      return self.clients.openWindow(url);
    })
  );
});
