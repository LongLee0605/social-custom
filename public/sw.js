// PWA offline — không intercept /assets (tránh cache HTML thay cho chunk JS sau deploy)
const CACHE_VERSION = 'v6'
const STATIC_CACHE = `static-${CACHE_VERSION}`

const PRECACHE_URLS = [
  '/manifest.json',
  '/icons/icon-72x72.svg',
  '/icons/icon-96x96.svg',
  '/icons/icon-128x128.svg',
  '/icons/icon-144x144.svg',
  '/icons/icon-152x152.svg',
  '/icons/icon-192x192.svg',
  '/icons/icon-384x384.svg',
  '/icons/icon-512x512.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch((err) => console.error('[SW] install', err))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== STATIC_CACHE)
          .map((name) => caches.delete(name))
      )
    )
  )
  self.clients.claim()
})

/** Chỉ xử lý điều hướng trang — chunk JS/CSS do trình duyệt tải trực tiếp */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  if (event.request.mode !== 'navigate') return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response?.ok) {
          const copy = response.clone()
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put('/index.html', copy).catch(() => {})
          })
        }
        return response
      })
      .catch(() => caches.match('/index.html'))
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
