// Todu service worker — minimal offline shell
const CACHE = "todu-v2";
const CORE = ["/", "/today", "/inbox", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    try { await c.addAll(CORE); } catch {}
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET") return;
  // Network-first for API and pages; cache-first for assets
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(fetch(req).catch(() => new Response(JSON.stringify({ offline: true }), { headers: { "content-type": "application/json" } })));
    return;
  }
  if (url.pathname.startsWith("/_next/static/") || /\.(png|svg|webp|jpg|jpeg|ico|woff2?|css|js)$/.test(url.pathname)) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    })());
    return;
  }
  e.respondWith((async () => {
    try {
      const res = await fetch(req);
      const cache = await caches.open(CACHE);
      if (res.ok) cache.put(req, res.clone());
      return res;
    } catch {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      return cached ?? cache.match("/");
    }
  })());
});
