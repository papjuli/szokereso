var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
  '/web/szokereso/szokereso.html',
  '/web/szokereso/game.js',
  '/web/szokereso/cloud.js',
  '/web/szokereso/style.css',
  '/web/szokereso/manifest.webmanifest',
];

self.addEventListener('install', function(event) {
  // Perform install steps
  console.log("Installing service worker");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  console.log("Fetching in service worker");
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
