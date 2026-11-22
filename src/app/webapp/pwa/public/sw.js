const VERSION = "v1";
const SHELL_CACHE = `omnitrack-shell-${VERSION}`;
const RUNTIME_CACHE = `omnitrack-runtime-${VERSION}`;
const CDN_HOSTS = ["cdn.tailwindcss.com", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(SHELL_CACHE)
            .then((cache) => cache.addAll(["/", "/manifest.webmanifest", "/icons/icon-192.png"]))
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys.filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE).map((k) => caches.delete(k)),
                ),
            )
            .then(() => self.clients.claim()),
    );
});

async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok || response.type === "opaque") {
        (await caches.open(cacheName)).put(request, response.clone());
    }
    return response;
}

self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET") return;
    const url = new URL(request.url);

    // Never cache live data.
    if (url.origin === self.location.origin && url.pathname.startsWith("/graphql")) return;

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(SHELL_CACHE).then((c) => c.put("/", copy));
                    return response;
                })
                .catch(() => caches.match("/")),
        );
        return;
    }

    if (url.origin === self.location.origin && (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/icons/"))) {
        event.respondWith(cacheFirst(request, RUNTIME_CACHE));
        return;
    }

    if (CDN_HOSTS.includes(url.hostname)) {
        event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    }
});
