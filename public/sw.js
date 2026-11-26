// Service Worker for POS & Multi-Outlet Sembako PWA
const CACHE_NAME = 'pos-sembako-v2';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/favicon.svg',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/maskable-512.png',
  '/brand-logo.svg',
];

// Install: Cache essential shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
            return Promise.resolve();
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: Strategy based on request type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bypass non-GET requests, browser extensions, and cross-origin requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http') || url.origin !== self.location.origin) {
    return;
  }

  // 1. API Requests: Network-first (never cache errors)
  if (url.pathname.startsWith('/api')) {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response(JSON.stringify({ offline: true, error: 'Offline mode' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503,
        });
      })
    );
    return;
  }

  // 2. Navigation (HTML pages): Network-first with guaranteed Response fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedIndex = await cache.match('/index.html');
        if (cachedIndex) return cachedIndex;
        const cachedRoot = await cache.match('/');
        if (cachedRoot) return cachedRoot;
        return new Response('Offline — silakan muat ulang saat koneksi kembali.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      })
    );
    return;
  }

  // 3. Static Assets: Stale-while-revalidate with guaranteed Response fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(
          () =>
            cachedResponse ||
            new Response('', { status: 503, statusText: 'Service Unavailable' })
        );

      return cachedResponse || fetchPromise;
    })
  );
});
