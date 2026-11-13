// Polski Leraar — Service Worker
// 1. Bewaart een kopie van de app, zodat hij ook zonder internet opent.
// 2. Ontvangt Web Push berichten van de Supabase Edge Function en toont notificaties.

// ─── Offline kopie ─────────────────────────────────────────────────────────
// Werkwijze: eerst het netwerk proberen (je krijgt dus de nieuwste versie zodra
// er verbinding is) en de kopie bijwerken; lukt het netwerk niet, dan de kopie.
var CACHE = 'polski-leraar-v1';
var APP_FILES = ['./', './core.js', './manifest.json', './icon.png', './icon-192.png'];
// Externe bestanden die de app nodig heeft om te starten (Supabase-bibliotheek, lettertypen)
var CACHED_HOSTS = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(function(cache) { return cache.addAll(APP_FILES); }).catch(function() {})
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  var sameOrigin = url.origin === self.location.origin;
  // Verkeer met Supabase (inloggen, synchroniseren) gaat hier niet langs
  if (!sameOrigin && CACHED_HOSTS.indexOf(url.hostname) === -1) return;

  event.respondWith(
    fetch(req).then(function(res) {
      if (res && (res.ok || res.type === 'opaque')) {
        var copy = res.clone();
        caches.open(CACHE).then(function(cache) { cache.put(req, copy); });
      }
      return res;
    }).catch(function() {
      return caches.match(req, { ignoreSearch: sameOrigin }).then(function(hit) {
        if (hit) return hit;
        if (req.mode === 'navigate') return caches.match('./');
        return Response.error();
      });
    })
  );
});

// ─── Pushmeldingen ─────────────────────────────────────────────────────────
self.addEventListener('push', function(event) {
  if (!event.data) return;
  var data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || '🇵🇱 Pools oefenen!', {
      body: data.body || 'Vergeet je dagelijkse oefening niet!',
      tag: 'polski-reminder',
      renotify: true,
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.includes('polski-leraar') && 'focus' in list[i])
          return list[i].focus();
      }
      if (clients.openWindow)
        return clients.openWindow('https://johanvanthul.github.io/polski-leraar/');
    })
  );
});
