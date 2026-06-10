// LandingPrep service worker — offline support.
// Bump CACHE_VERSION on every deploy so clients pick up new assets.
const CACHE_VERSION = "lp-v197";
const CORE = [
  "./",
  "./index.html",
  "./theme.css",
  "./manifest.json",
  "./icon.svg",
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_VERSION).then((c) => c.addAll(CORE).catch(() => {})));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (e) => {
  if (e.data === "skipWaiting") self.skipWaiting();
});

// Root SPA shell paths only — these are the ONLY navigations that should ever
// fall back to index.html offline. Static SEO pages (/university/, /compare/,
// /mock-test/, /study-abroad/, /blog/, etc.) must NEVER be served the app shell
// or their relative scripts break (the "blank page" bug).
function isAppShellPath(pathname) {
  return pathname === "/" || pathname === "/index.html";
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Only handle same-origin requests; let cross-origin (CDN) pass through.
  if (url.origin !== self.location.origin) return;
  // NEVER intercept the API — always hit the network so health checks, live
  // content, community and leaderboard are always fresh (no stale cache).
  if (url.pathname.startsWith("/api/")) return;
  // Never cache/serve the service worker script itself through here.
  if (url.pathname.endsWith("/sw.js")) return;

  // Navigation / HTML: network-first so new static pages and ?v= asset versions
  // always load. Offline fallback: the exact cached page, then the app shell
  // ONLY for true SPA root paths.
  if (req.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/")) {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() =>
        caches.match(req).then((m) => m || (isAppShellPath(url.pathname) ? caches.match("./index.html") : Response.error()))
      )
    );
    return;
  }

  // JSX/JS/CSS/JSON: network-first (fresh), fall back to cache offline.
  if (url.pathname.endsWith(".jsx") || url.pathname.endsWith(".js") || url.pathname.endsWith(".json") || url.pathname.endsWith(".css")) {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Everything else (icons, images): cache-first for speed, update in background.
  e.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

// ── Web Push: show daily-reminder notifications + handle clicks ──────────────
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}
  const options = {
    body: data.body || "Time for today's free practice!",
    icon: "/icon.svg",
    badge: "/icon.svg",
    tag: "lp-reminder",
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(data.title || "LandingPrep", options));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) { if (c.url.indexOf(self.location.origin) === 0 && "focus" in c) { try { c.navigate(target); } catch (e) {} return c.focus(); } }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
