// Service Worker cho PWA - chỉ cache tài nguyên http(s) của app
const CACHE_VERSION = 'v4'
const STATIC_CACHE = `static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`
const IMAGE_CACHE = `images-${CACHE_VERSION}`

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

/** Chỉ cache request same-origin hoặc http(s) — bỏ extension, blob, data, devtools */
function isCacheableRequest(request) {
  try {
    const url = new URL(request.url)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false
    }
    // Bỏ qua extension & devtools (phòng trường hợp origin lạ)
    if (
      url.protocol === 'chrome-extension:' ||
      url.protocol === 'moz-extension:' ||
      url.protocol === 'safari-extension:'
    ) {
      return false
    }
    return true
  } catch {
    return false
  }
}

function shouldSkipProxy(url) {
  return (
    url.origin.includes('firebase') ||
    url.origin.includes('googleapis') ||
    url.origin.includes('gstatic') ||
    url.origin.includes('cloudinary')
  )
}

function safeCachePut(cache, request, response) {
  if (!isCacheableRequest(request)) return Promise.resolve()
  return cache.put(request, response).catch(() => {
    // Không log — request không hỗ trợ Cache API (extension, opaque, v.v.)
  })
}

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((error) => {
        console.error('[SW] Cache install error:', error)
      })
  )
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== STATIC_CACHE &&
            cacheName !== DYNAMIC_CACHE &&
            cacheName !== IMAGE_CACHE
          ) {
            return caches.delete(cacheName)
          }
        })
      )
    )
  )
  self.clients.claim()
})

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return
  if (!isCacheableRequest(request)) return

  const url = new URL(request.url)
  if (shouldSkipProxy(url)) return

  // Images
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(request).then((cachedImage) => {
          if (cachedImage) return cachedImage
          return fetch(request)
            .then((response) => {
              if (response && response.status === 200 && response.type === 'basic') {
                safeCachePut(cache, request, response.clone())
              }
              return response
            })
            .catch(() => new Response('', { status: 404 }))
        })
      )
    )
    return
  }

  // HTML & assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          const responseToCache = response.clone()
          const cacheName =
            request.destination === 'document' || request.url.endsWith('.html')
              ? STATIC_CACHE
              : DYNAMIC_CACHE

          caches.open(cacheName).then((cache) => {
            safeCachePut(cache, request, responseToCache)
          })

          return response
        })
        .catch(() => {
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html')
          }
          return new Response('', { status: 503, statusText: 'Service Unavailable' })
        })
    })
  )
})

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(Promise.resolve())
  }
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  if (event.data?.type === 'CACHE_URLS' && Array.isArray(event.data.urls)) {
    const httpUrls = event.data.urls.filter((u) => {
      try {
        const parsed = new URL(u, self.location.origin)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      } catch {
        return false
      }
    })
    if (httpUrls.length > 0) {
      event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => cache.addAll(httpUrls))
      )
    }
  }
})
