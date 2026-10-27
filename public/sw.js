var CACHE_NAME = "habit-tracker-v1";

self.addEventListener("install", function (event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (key) {
        return key.indexOf("habit-tracker-") === 0 && key !== CACHE_NAME;
      }).map(function (key) {
        return caches.delete(key);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request).then(function (response) {
      if (!response.ok) return response;
      return caches.open(CACHE_NAME).then(function (cache) {
        cache.put(request, response.clone());
        return response;
      });
    }).catch(function () {
      return caches.match(request).then(function (cached) {
        return cached || Response.error();
      });
    })
  );
});