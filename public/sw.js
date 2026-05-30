const CACHE_NAME = 'bayraq-elarab-v2'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.jpg',
  '/manifest.json',
]

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// تفعيل Service Worker وحذف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// استراتيجية Network First مع Fallback للكاش
self.addEventListener('fetch', (event) => {
  // تجاهل طلبات Supabase وAPI الخارجية
  if (event.request.url.includes('supabase.co') ||
      event.request.url.includes('api.anthropic.com') ||
      event.request.url.includes('localhost:3001')) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // حفظ نسخة في الكاش
        if (response.status === 200 && event.request.method === 'GET') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => {
        // عند انقطاع الإنترنت — استخدم الكاش
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('/')
        })
      })
  )
})

// إشعار بالتحديثات
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
})
