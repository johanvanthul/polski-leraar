// Polski Leraar — Service Worker
// Ontvangt Web Push berichten van Supabase Edge Function en toont notificaties.

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
