// 离线缓存：首次加载后把同源静态资源缓存下来，之后可离线使用。
const CACHE = 'hagd-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    try {
      const network = await fetch(req);
      if (network && network.ok) cache.put(req, network.clone());
      return network || cached;
    } catch (e) {
      return cached || new Response('Offline', { status: 503 });
    }
  })());
});
