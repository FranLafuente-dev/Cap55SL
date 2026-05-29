const CACHE = 'mf-v4';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Dejar pasar Firebase sin interceptar (auth tokens, Firestore)
  if (e.request.url.includes('firebaseapp.com') ||
      e.request.url.includes('firestore.googleapis.com') ||
      e.request.url.includes('identitytoolkit') ||
      e.request.url.includes('securetoken')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const net = fetch(e.request).then(r => {
        if (r && r.ok) {
          const cl = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, cl));
        }
        return r;
      }).catch(() => cached || new Response('', { status: 408 }));
      return cached || net;
    })
  );
});
