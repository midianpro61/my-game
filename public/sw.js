const CACHE_NAME = 'apex-hill-racing-network-first-v26';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const hadLegacyCache = keys.some((key) => key !== CACHE_NAME);
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.clients.claim();
      if (hadLegacyCache) {
        const windowClients = await self.clients.matchAll({ type: 'window' });
        for (const client of windowClients) {
          if ('navigate' in client) {
            client.navigate(client.url).catch(() => {});
          }
        }
      }
    })()
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

