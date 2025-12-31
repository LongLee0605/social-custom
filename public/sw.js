// Service Worker cho PWA - Enhanced với offline support
const CACHE_VERSION = 'v3'
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

// Install event - Cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(urlsToCache)
      })
      .catch((error) => {
        console.error('[SW] Cache install error:', error)
      })
  )
  self.skipWaiting()
})

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== IMAGE_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  return self.clients.claim()
})

// Fetch event - Enhanced caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip Firebase và external APIs (không cache)
  if (
    url.origin.includes('firebase') ||
    url.origin.includes('googleapis') ||
    url.origin.includes('gstatic')
  ) {
    return
  }

  // Cache images separately
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE)
        .then((cache) => {
          return cache.match(request)
            .then((cachedImage) => {
              if (cachedImage) {
                return cachedImage
              }
              return fetch(request)
                .then((response) => {
                  if (response && response.status === 200) {
                    cache.put(request, response.clone())
                  }
                  return response
                })
                .catch(() => {
                  // Return placeholder image if offline
                  return new Response('', { status: 404 })
                })
            })
        })
    )
    return
  }

  // HTML và assets - Cache first với network fallback
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse
        }

        // Fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone response for caching
            const responseToCache = response.clone()

            // Cache in appropriate cache
            const cacheName = request.destination === 'document' || request.url.endsWith('.html')
              ? STATIC_CACHE
              : DYNAMIC_CACHE

            caches.open(cacheName)
              .then((cache) => {
                cache.put(request, responseToCache)
              })

            return response
          })
          .catch(() => {
            // Network failed - return offline page for HTML requests
            if (request.headers.get('accept')?.includes('text/html')) {
              return caches.match('/index.html')
            }
            // For other requests, return empty response
            return new Response('', { status: 503, statusText: 'Service Unavailable' })
          })
      })
  )
})

// Background Sync - Sync data when back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData())
  }
})

async function syncData() {
  console.log('[SW] Background sync: Syncing data...')
  // Có thể thêm logic sync data khi online lại
  return Promise.resolve()
}

// Message event - Communication với main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(event.data.urls)
      })
    )
  }
})

