// Service Worker de RUCA Oil Gas - Pedidos
// Estrategia: siempre intenta traer la versión más nueva de internet primero.
// Solo usa la copia guardada si no hay conexión (para que la app funcione offline).
// v2: antes guardaba la primera versión para siempre y nunca buscaba actualizaciones — corregido.

const CACHE_NAME = 'ruca-gulf-v2';
const ARCHIVOS_A_GUARDAR = [
  './RUCA_Oil_Gas_Pedidos.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARCHIVOS_A_GUARDAR))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(nombres.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((respuestaDeRed) => {
        const copia = respuestaDeRed.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
        return respuestaDeRed;
      })
      .catch(() => caches.match(event.request))
  );
});
