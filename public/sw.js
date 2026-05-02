// TBH Service Worker — PWA caching + Firebase background push

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js')

const CACHE = 'tbh-v1'
const OFFLINE_URL = '/offline'

// ── Firebase background messaging ──────────────────────────────────────────

// Config is injected at runtime via self.__FIREBASE_CONFIG set by NotificationSetup.tsx.
// Until that message arrives we queue it up.
let firebaseReady = false

self.addEventListener('message', event => {
  if (event.data?.type === 'FIREBASE_CONFIG' && !firebaseReady) {
    firebaseReady = true
    firebase.initializeApp(event.data.config)
    const messaging = firebase.messaging()
    messaging.onBackgroundMessage(payload => {
      const title = payload.notification?.title ?? 'TBH'
      const body  = payload.notification?.body  ?? 'You have a new anonymous message'
      self.registration.showNotification(title, {
        body,
        icon:  '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        data:  payload.data ?? {},
        vibrate: [200, 100, 200],
      })
    })
  }
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/home'
  event.waitUntil(clients.openWindow(url))
})

// ── PWA cache-first for static assets, network-first for pages ─────────────

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll([OFFLINE_URL]).catch(() => {})
    )
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  // Cache-first for static assets (JS, CSS, images, fonts)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        return fetch(request).then(res => {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(request, clone))
          return res
        })
      })
    )
    return
  }

  // Network-first for everything else, fall back to cache or offline page
  event.respondWith(
    fetch(request).catch(() =>
      caches.match(request).then(cached => cached ?? caches.match(OFFLINE_URL))
    )
  )
})
