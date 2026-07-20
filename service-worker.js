// Service Worker de RUCA Oil Gas - Pedidos
// Guarda una copia de la app para que abra rápido y funcione offline
// una vez que el archivo se aloje en un servidor web (http/https).
// Nota: los navegadores no permiten Service Workers en páginas abiertas
// como archivo local (file:///), así que mientras se use así, este
// archivo simplemente no se activa (la app funciona igual, sin este extra).

const CACHE_NAME = 'ruca-gulf-v1';
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
    caches.match(event.request).then((respuesta) => respuesta || fetch(event.request))
  );
});
