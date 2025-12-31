// Service Worker cho PWA và Push Notifications
const CACHE_NAME = 'social-custom-v2'
const STATIC_CACHE = 'static-v2'
const DYNAMIC_CACHE = 'dynamic-v2'

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.svg',
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
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  return self.clients.claim()
})

// Fetch event - Cache first strategy với network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip Firebase và external APIs
  if (
    url.origin.includes('firebase') ||
    url.origin.includes('googleapis') ||
    url.origin.includes('gstatic')
  ) {
    return
  }

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

            // Cache in dynamic cache
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache)
              })

            return response
          })
          .catch(() => {
            // Network failed, return offline page if available
            if (request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html')
            }
          })
      })
  )
})

// Push event listener
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)
  
  let notificationData = {
    title: 'Social Custom',
    body: 'Bạn có thông báo mới',
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/icon-72x72.svg',
    tag: 'social-custom-notification',
    requireInteraction: false,
    data: {}
  }

  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || data.message || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        image: data.image || null,
        tag: data.tag || notificationData.tag,
        requireInteraction: data.requireInteraction || false,
        data: data.data || {},
        actions: data.actions || []
      }
    } catch (e) {
      notificationData.body = event.data.text() || notificationData.body
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      image: notificationData.image,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      actions: notificationData.actions,
      vibrate: [200, 100, 200],
      timestamp: Date.now()
    })
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()

  const notificationData = event.notification.data || {}
  let urlToOpen = '/'

  // Determine URL based on notification type
  if (notificationData.type === 'message' && notificationData.relatedUserId) {
    urlToOpen = `/chat?userId=${notificationData.relatedUserId}`
  } else if (notificationData.type === 'comment' || notificationData.type === 'like' || notificationData.type === 'new_post') {
    if (notificationData.relatedPostId) {
      urlToOpen = `/?postId=${notificationData.relatedPostId}`
    }
  } else if (notificationData.type === 'follow' && notificationData.relatedUserId) {
    urlToOpen = `/profile/${notificationData.relatedUserId}`
  } else if (notificationData.link) {
    urlToOpen = notificationData.link
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i]
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

