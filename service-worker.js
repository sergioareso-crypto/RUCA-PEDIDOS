// Service Worker de RUCA Oil Gas - Pedidos
// Estrategia: siempre intenta traer la versión más nueva de internet primero.
// Solo usa la copia guardada si no hay conexión (para que la app funcione offline).
// v2: antes guardaba la primera versión para siempre y nunca buscaba actualizaciones — corregido.
// v3: antes intentaba guardar en caché TODOS los pedidos de red, incluidas las llamadas a
//     Google Drive (que usan POST/PATCH) — el caché no admite eso y rompía la sincronización
//     con un error "Failed to fetch". Ahora el caché solo aplica a los archivos propios de la app.

const CACHE_NAME = 'ruca-gulf-v3';
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
  const req = event.request;
  let esPropioYGet = false;
  try{
    esPropioYGet = (req.method === 'GET') && (new URL(req.url).origin === self.location.origin);
  }catch(e){ /* si la URL no se puede parsear, la tratamos como ajena y no la tocamos */ }

  // Cualquier otra cosa (llamadas a Google Drive u otras APIs externas, POST/PATCH, etc.)
  // pasa directo a la red, sin pasar por el caché.
  if(!esPropioYGet){
    event.respondWith(fetch(req));
    return;
  }

  event.respondWith(
    fetch(req)
      .then((respuestaDeRed) => {
        const copia = respuestaDeRed.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copia));
        return respuestaDeRed;
      })
      .catch(() => caches.match(req))
  );
});

