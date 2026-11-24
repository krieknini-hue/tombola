const CACHE_NAME = 'tombola-shell-v24';
const SHELL_FILES = [
  './',
  './index.html',
  './styles.css?v=24',
  './app.js?v=24',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(SHELL_FILES.map((file) => cache.add(new Request(file, { cache: 'reload' }))))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    return;
  }
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/docs/')) {
    return;
  }
  const fetchPromise = event.request.method === 'GET'
    ? fetch(event.request, { cache: 'no-cache' })
    : fetch(event.request);
  event.respondWith(
    fetchPromise
      .then((res) => {
        if (event.request.method === 'GET' && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
