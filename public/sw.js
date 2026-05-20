// Service Worker — chỉ cache tài nguyên cùng origin (không chặn Firebase/Google APIs)
const CACHE_VERSION = 'v5'
const STATIC_CACHE = `static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`

const urlsToCache = [
  '/',
  '/index.html',
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

function isSameOriginRequest(request) {
  try {
    return new URL(request.url).origin === self.location.origin
  } catch {
    return false
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((err) => console.error('[SW] install', err))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  if (!isSameOriginRequest(request)) return

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          const clone = response.clone()
          const cacheName =
            request.destination === 'document' || request.url.endsWith('.html')
              ? STATIC_CACHE
              : DYNAMIC_CACHE

          caches.open(cacheName).then((cache) => {
            cache.put(request, clone).catch(() => {})
          })

          return response
        })
        .catch(() => {
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html')
          }
          return new Response('', { status: 503 })
        })
    })
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
