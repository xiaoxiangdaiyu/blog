const PRECACHE = 'precache_test_1'
const RUNTIME = 'runtime';
const PRECACHE_URLS = [
    './',
    '/asset/sw.jpg',
    'index.js'
]
self.addEventListener('install',e=>{
    e.waitUntil(
        caches.open(PRECACHE).then(cache=>{
            cache.addAll(PRECACHE_URLS)
        }).then(
            self.skipWaiting()
        )
    )
})
self.addEventListener('activate', e => {
    const currentCaches = [PRECACHE, RUNTIME];
    e.waitUntil(
      Promise.all(
        caches.keys().filter(name => {
          return name !== PRECACHE
        }).map(name => {
          return caches.delete(name)
        })
      ).then(() => self.clients.claim())
    )
  });
  
  
  self.addEventListener('fetch', e => {
    e.respondWith(
      caches.match(e.request).then(function(response) {
        if (response != null) {
          return response
        }
        return fetch(e.request.url)
      })
    )
  });