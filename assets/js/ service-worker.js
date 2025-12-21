// CipherVault Pro - Service Worker v4.1
// Military-Grade Encryption PWA

const CACHE_NAME = 'ciphervault-v4.1';
const OFFLINE_URL = '/offline.html';
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB maximum cache

// الموارد الأساسية للتخزين المسبق
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/css/style.css',
  '/assets/css/pwa.css',
  '/assets/css/dark-mode.css',
  '/assets/js/config.js',
  '/assets/js/translations.js',
  '/assets/js/three-scene.js',
  '/assets/js/crypto-core.js',
  '/assets/js/main.js',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png'
];

// تركيب Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    Promise.all([
      // تخزين الموارد الأساسية
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('[Service Worker] Caching app shell');
          return cache.addAll(PRECACHE_RESOURCES);
        }),
      
      // تفعيل Service Worker فوراً
      self.skipWaiting()
    ])
  );
});

// التنشيط وتنظيف التخزين القديم
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    Promise.all([
      // تنظيف التخزين القديم
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // التحكم في جميع العملاء
      self.clients.claim()
    ])
  );
});

// اعتراض الطلبات
self.addEventListener('fetch', event => {
  // تجاهل طلبات POST وطلبات التشفير
  if (event.request.method === 'POST') {
    return;
  }
  
  // تجاهل طلبات تحليلية
  if (event.request.url.includes('analytics') ||
      event.request.url.includes('tracking')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('[Service Worker] Serving from cache:', event.request.url);
          return response;
        }
        
        return fetch(event.request)
          .then(response => {
            // التحقق من صحة الاستجابة
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            
            // فتح التخزين وإضافة المورد
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.log('[Service Worker] Fetch failed:', error);
            
            // عرض صفحة Offline للطلبات الملاحية
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            
            // إرجاع رد افتراضي للطلبات الأخرى
            return new Response('Network error', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// استقبال الرسائل من الصفحة
self.addEventListener('message', event => {
  console.log('[Service Worker] Message received:', event.data);
  
  switch (event.data.type) {
    case 'CACHE_ASSETS':
      cacheAdditionalAssets(event.data.assets);
      break;
      
    case 'CLEAR_CACHE':
      clearOldCache();
      break;
      
    case 'GET_CACHE_INFO':
      getCacheInfo(event.source, event.data.requestId);
      break;
  }
});

// تخزين أصول إضافية
async function cacheAdditionalAssets(assets) {
  const cache = await caches.open(CACHE_NAME);
  
  for (const asset of assets) {
    try {
      const response = await fetch(asset);
      if (response.ok) {
        await cache.put(asset, response);
        console.log('[Service Worker] Cached asset:', asset);
      }
    } catch (error) {
      console.warn('[Service Worker] Failed to cache asset:', asset, error);
    }
  }
}

// تنظيف التخزين القديم
async function clearOldCache() {
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  const now = Date.now();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // أسبوع واحد
  
  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const dateHeader = response.headers.get('date');
      if (dateHeader) {
        const fetchDate = new Date(dateHeader).getTime();
        if (now - fetchDate > maxAge) {
          await cache.delete(request);
          console.log('[Service Worker] Cleared old cache:', request.url);
        }
      }
    }
  }
}

// الحصول على معلومات التخزين
async function getCacheInfo(client, requestId) {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  
  let totalSize = 0;
  const items = [];
  
  for (const key of keys) {
    const response = await cache.match(key);
    const size = response.headers.get('content-length') || '0';
    totalSize += parseInt(size);
    
    items.push({
      url: key.url,
      size: parseInt(size),
      type: response.headers.get('content-type')
    });
  }
  
  client.postMessage({
    type: 'CACHE_INFO',
    requestId,
    payload: {
      totalItems: keys.length,
      totalSize,
      items,
      maxSize: MAX_CACHE_SIZE
    }
  });
}

// Push Notifications
self.addEventListener('push', event => {
  console.log('[Service Worker] Push received:', event.data?.text());
  
  const data = event.data ? JSON.parse(event.data.text()) : {};
  const title = data.title || 'CipherVault Pro';
  const options = {
    body: data.body || 'Security notification',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// تفاعل مع الإشعارات
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification click:', event.notification.tag);
  
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        if (clientList.length > 0) {
          const client = clientList[0];
          client.focus();
          client.postMessage({ type: 'NOTIFICATION_CLICKED', payload: event.notification.data });
        } else {
          self.clients.openWindow(event.notification.data.url || '/');
        }
      })
  );
});

// التعامل مع الأخطاء
self.addEventListener('error', event => {
  console.error('[Service Worker] Error:', event.error);
});
