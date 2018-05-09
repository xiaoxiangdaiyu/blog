const PRECACHE = 'precache_test_1'
const RUNTIME = 'runtime';
const PRECACHE_URLS = [
    '/',
    'pwa/asset/sw.jpg',
    'pwa/index.js'
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
      
    e.waitUntil(
        caches.keys().then(cacheNames=>{
          return Promise.all(
            cacheNames.map(function(cacheName) {
              if (cacheName !== PRECACHE) {
                return caches.delete(cacheName);
              }
            })
      )}).then(() => self.clients.claim())
   )
  })
  
  
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