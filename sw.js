const CACHE = 'naik01-v4';

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './data.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png'
];

// ---------- Install ----------
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS))
      .catch(() => {}) // jangan gagalkan install kalau ada aset yang belum ada
  );
  self.skipWaiting();
});

// ---------- Activate ----------
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ---------- Fetch: stale-while-revalidate ----------
self.addEventListener('fetch', (e) => {
  const req = e.request;

  // Hanya GET
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Hanya same-origin dan Google Fonts
  const isSameOrigin = url.origin === location.origin;
  const isFont = url.hostname === 'fonts.googleapis.com'
              || url.hostname === 'fonts.gstatic.com';
  if (!isSameOrigin && !isFont) return;

  // Navigasi HTML: network-first supaya update cepat kelihatan
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // Aset lain: stale-while-revalidate
  e.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type !== 'opaque') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

// ---------- Pesan dari klien (misal: skipWaiting manual) ----------
self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
