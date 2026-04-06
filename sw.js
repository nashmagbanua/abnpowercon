const CACHE_NAME = 'powercon-cache-v1';
const assets = [
  '/',
  'index.html',
  'assets/abnlogo.svg',
  'assets/bg.webp'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assets);
    })
  );
});

// Fetching assets
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
