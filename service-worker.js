const CACHE_NAME = "empire-quiz-v14";
const staticUrlsToCache = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./script.js",
  "./scripts/character-selection.js",
  "./scripts/quiz.js",
  "./scripts/result.js",
  "./images/favicon.ico",
  "./fonts/Montserrat-Regular.ttf",
  "./fonts/Montserrat-Bold.ttf",
  "./assets/Global.json",
  "./videos/clip.mp4",
  "./images/background.jpg",
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(staticUrlsToCache);
      })
      .catch(err => console.error("Failed to cache static files:", err))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});
