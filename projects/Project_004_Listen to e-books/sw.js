/* ==========================================================================
   AuraReader AI - Service Worker (PWA Offline Support)
   ========================================================================== */

const CACHE_NAME = "aurareader-v2";
const STATIC_ASSETS = [
    "./",
    "index.html",
    "style.css",
    "app.js",
    "manifest.json",
    "icon-192.svg",
    "icon-512.svg",
];

// CDN resources to cache on first access (cache-first)
const CDN_ORIGINS = [
    "fonts.googleapis.com",
    "fonts.gstatic.com",
    "unpkg.com",
    "cdnjs.cloudflare.com",
];

// Install: pre-cache core static assets
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch((err) => {
                console.warn("[SW] Pre-cache partial:", err.message);
            });
        }).then(() => self.skipWaiting())
    );
});

// Activate: clean up old cache versions
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Helper: is this a CDN resource?
function isCdnResource(url) {
    return CDN_ORIGINS.some((origin) => url.includes(origin));
}

// Helper: is this an API or TTS call?
function isApiCall(url) {
    return url.includes("/api/") ||
           url.includes("generativelanguage.googleapis.com") ||
           url.includes("localhost:11434");
}

// Fetch: cache strategies
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== "GET") return;

    // Skip chrome-extension and blob URLs
    if (url.protocol === "chrome-extension:" || url.protocol === "blob:") return;

    // API calls: network-first, no cache
    if (isApiCall(request.url)) {
        return;
    }

    // CDN resources: cache-first (stale-while-revalidate)
    if (isCdnResource(request.url)) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(request).then((cached) => {
                    const fetchPromise = fetch(request).then((response) => {
                        if (response.ok) {
                            cache.put(request, response.clone());
                        }
                        return response;
                    }).catch(() => cached);
                    return cached || fetchPromise;
                });
            })
        );
        return;
    }

    // Local static assets: cache-first, network fallback
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) {
                // Stale-while-revalidate: update cache in background
                fetch(request).then((response) => {
                    if (response.ok) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, response);
                        });
                    }
                }).catch(() => {});
                return cached;
            }
            return fetch(request).then((response) => {
                if (!response.ok) return response;
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, clone);
                });
                return response;
            }).catch(() => {
                // Offline: return index.html for navigation requests
                if (request.mode === "navigate") {
                    return caches.match("index.html");
                }
                return new Response("離線狀態，請連接網路後重試", { status: 503 });
            });
        })
    );
});
