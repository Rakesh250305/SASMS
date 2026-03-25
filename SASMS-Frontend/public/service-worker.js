const CACHE_NAME = "SASMS-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "offline.html",];

self.addEventListener("install", e => {
    // console.log("Service Worker: Installed");
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// if offline then serve from cache and if not in cache then serve offline page
self.addEventListener("fetch", e => {
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, res.clone());
            return res;
          });
        })
        .catch(() => caches.match(e.request))
        .then(res => res || caches.match("/offline.html"))
    );
  }
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});
