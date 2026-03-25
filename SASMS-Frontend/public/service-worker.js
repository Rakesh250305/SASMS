const CACHE_NAME = "SASMS-v1";
const urlsToCache = [
  "/",
  "/offline.html",
  "/index.html",];

self.addEventListener("install", e => {
    // console.log("Service Worker: Installed");
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// if offline then serve offline page
self.addEventListener("fetch", event => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/offline.html");
      })
    );
  }
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});
