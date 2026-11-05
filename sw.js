// PAUTA: guarda o programa para funcionar sem Internet e vai buscar sempre a versão mais recente quando há Internet.
// (Os dados dos alunos NUNCA passam por aqui: ficam cifrados no navegador e na pen.)
const CACHE = 'pauta-app';
const FILES = ['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e => {
  const req = e.request; const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  const key = req.mode === 'navigate' ? './' : req;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await fetch(req, { cache: 'no-cache' });          // com Internet: versão mais recente
      if (res.ok) cache.put(key, res.clone());
      return res;
    } catch (err) {
      return (await cache.match(key, { ignoreSearch: true })) || Response.error();   // sem Internet: a última versão guardada
    }
  })());
});
