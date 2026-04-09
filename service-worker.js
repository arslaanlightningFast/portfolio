/* global self */

const CACHE_NAME = "portfolio-static-v1";

// Keep these URLs relative so the site works when hosted
// under a subpath (e.g. GitHub Pages).
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./about.html",
  "./skills.html",
  "./projects.html",
  "./education.html",
  "./experience.html",
  "./gallery.html",
  "./achievements.html",
  "./resume.html",
  "./contact.html",
  "./css/style.css",
  "./sw-register.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_URLS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => (key === CACHE_NAME ? undefined : caches.delete(key)))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  // HTML navigations: prefer fresh when online, but fall back to cached pages offline.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
          return response;
        } catch {
          return (
            (await caches.match(request)) ||
            (await caches.match("./index.html")) ||
            new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } })
          );
        }
      })()
    );
    return;
  }

  // Static same-origin assets: cache-first, then network (and cache it).
  if (isSameOrigin) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        try {
          const response = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
          return response;
        } catch {
          return cached;
        }
      })()
    );
  }
});

