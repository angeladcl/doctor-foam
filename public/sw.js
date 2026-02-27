const CACHE_NAME = "doctor-foam-v3";
const STATIC_ASSETS = [
    "/",
    "/login",
    "/mi-cuenta",
    "/manifest.json",
    "/favicon.ico",
];

// Install: cache static assets
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch: network first, fallback to cache
self.addEventListener("fetch", (event) => {
    // Skip non-GET and API requests
    if (event.request.method !== "GET" || event.request.url.includes("/api/")) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache successful responses
                if (response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() =>
                caches.match(event.request).then(
                    (cached) =>
                        cached ||
                        new Response(
                            '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Doctor Foam</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a1628;color:#cbd5e1;font-family:"Segoe UI",sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:2rem}.c{max-width:400px}h1{color:white;font-size:1.3rem;margin-bottom:1rem}p{line-height:1.6;margin-bottom:1.5rem}a{color:#60a5fa;text-decoration:none}</style></head><body><div class="c"><h1>🚗 Doctor Foam</h1><p>Parece que no tienes conexión a internet. Verifica tu conexión e intenta de nuevo.</p><a href="/">Reintentar →</a></div></body></html>',
                            { status: 200, headers: { "Content-Type": "text/html" } }
                        )
                )
            )
    );
});

// ─── Push Notifications ───
self.addEventListener("push", (event) => {
    if (!event.data) return;

    let data;
    try {
        data = event.data.json();
    } catch {
        data = {
            title: "Doctor Foam",
            body: event.data.text(),
            url: "/admin/mensajes",
            icon: "/icon-192.png",
        };
    }

    const options = {
        body: data.body || "Nuevo mensaje recibido",
        icon: data.icon || "/icon-192.png",
        badge: data.badge || "/icon-192.png",
        vibrate: [200, 100, 200],
        tag: "drfoam-chat-" + Date.now(),
        renotify: true,
        data: {
            url: data.url || "/admin/mensajes",
        },
        actions: [
            { action: "open", title: "Ver mensaje" },
            { action: "close", title: "Cerrar" },
        ],
    };

    event.waitUntil(
        self.registration.showNotification(data.title || "Doctor Foam", options)
    );
});

// ─── Notification Click Handler ───
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    if (event.action === "close") return;

    const targetUrl = event.notification.data?.url || "/admin/mensajes";

    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
            // Focus existing window if already open
            for (const client of clients) {
                if (client.url.includes("/admin") && "focus" in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }
            // Otherwise open a new window
            return self.clients.openWindow(targetUrl);
        })
    );
});
