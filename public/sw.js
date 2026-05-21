const CACHE_NAME = 'digitalvidya-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.jpg',
  '/icon-192.png',
  '/icon-512.png'
];

// If on localhost, bypass/unregister service worker immediately to avoid dev caching issues
if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
  self.addEventListener('install', () => {
    self.skipWaiting();
  });
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      self.registration.unregister()
        .then(() => self.clients.claim())
        .then(() => {
          console.log('Service worker unregistered on localhost');
        })
    );
  });
} else {
  self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
    );
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }).then(() => self.clients.claim())
    );
  });

  self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Network-First for HTML/navigation requests, so user always gets fresh pages when online
    if (event.request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html') {
      event.respondWith(
        fetch(event.request)
          .catch(() => {
            // Fall back to cache only when offline
            return caches.match(event.request);
          })
      );
    } else {
      // Cache-First for static assets (icons, manifest, etc.)
      event.respondWith(
        caches.match(event.request).then((response) => {
          return response || fetch(event.request);
        })
      );
    }
  });
}
