const CACHE_NAME = 'powercon-cache-v3';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/abnlogo.svg',
  '/assets/bg.webp'
];

// =========================================================
// INSTALL
// =========================================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// =========================================================
// ACTIVATE
// =========================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// =========================================================
// FETCH
// =========================================================
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // =======================================================
  // HTML / PAGE NAVIGATION
  //
  // Always try the network first so deployments are fresh.
  // Fall back to cache only when offline.
  // =======================================================
  if (
    request.mode === 'navigate' ||
    request.destination === 'document' ||
    url.pathname.endsWith('.html')
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Save the latest HTML version
          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });

          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then((cachedResponse) => {
              return cachedResponse || caches.match('/index.html');
            });
        })
    );

    return;
  }

  // =======================================================
  // STATIC ASSETS
  //
  // Cache first for images, CSS, JS, fonts, etc.
  // =======================================================
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Only cache successful responses
            if (
              response &&
              response.status === 200 &&
              response.type === 'basic'
            ) {
              const responseClone = response.clone();

              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }

            return response;
          });
      })
  );
});
