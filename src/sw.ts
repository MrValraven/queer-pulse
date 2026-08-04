/// <reference lib="webworker" />
import { ExpirationPlugin } from "workbox-expiration";
import {
  cleanupOutdatedCaches,
  matchPrecache,
  precacheAndRoute,
} from "workbox-precaching";
import {
  NavigationRoute,
  registerRoute,
  setCatchHandler,
} from "workbox-routing";
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

// The app registers with registerType: "prompt", so a waiting worker sits idle
// until the user accepts the update pill. That pill's Reload button calls
// updateServiceWorker(true), which posts { type: "SKIP_WAITING" } to this
// worker. Without this listener the message is ignored: the worker never
// activates, controllerchange never fires, and the page never reloads — the
// button appears to do nothing. Activating here lets the new build take over
// and the plugin's controllerchange handler reload the page.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    void self.skipWaiting();
  }
});

cleanupOutdatedCaches();

// Precache diet: __WB_MANIFEST is scoped by injectManifest.globPatterns
// (vite.config.ts) to the *app shell only* — index.html, CSS, the entry chunk,
// the core react/query vendor chunks, fonts, and icons. The ~470 lazy route
// chunks (Studio, Cinema, maplibre, visx, per-page bundles) are deliberately
// NOT in the manifest; they are runtime-cached on first use by the script route
// below, so a first visit no longer downloads the whole app up front.
//
// directoryIndex: null keeps "/" from being served out of the precached
// index.html before the NetworkFirst navigation route runs — so a deploy's
// fresh index.html is picked up.
precacheAndRoute(self.__WB_MANIFEST, { directoryIndex: null });

// Lazy JS/CSS chunks (everything not precached): stale-while-revalidate so a
// route that was opened once keeps working offline, and refreshes in the
// background on the next online visit. Bounded so storage can't grow forever.
registerRoute(
  ({ request }) =>
    request.destination === "script" || request.destination === "style",
  new StaleWhileRevalidate({
    cacheName: "qp-assets",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 120,
        maxAgeSeconds: 30 * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

// Fonts: cache-first with a long TTL — they change roughly never and are on the
// shell's critical path, but are heavy enough that we don't want them bloating
// the upfront precache.
registerRoute(
  ({ request }) => request.destination === "font",
  new CacheFirst({
    cacheName: "qp-fonts",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 16,
        maxAgeSeconds: 365 * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

// Navigations go to the network first; the cache is a fallback only. Capped at
// 20 entries because the app has ~275 routes.
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: "qp-navigations",
      networkTimeoutSeconds: 4,
      plugins: [new ExpirationPlugin({ maxEntries: 20 })],
    }),
  ),
);

// Offline navigation fallback. When a document navigation can't be served from
// the network OR the navigation cache (e.g. a never-visited route while
// offline), NetworkFirst throws and the browser would otherwise show its own
// offline error ("dinosaur") page. Instead, hand back the precached app shell
// so the SPA boots: the app's OfflineGate (App.tsx) then detects
// !navigator.onLine and renders the branded OfflinePage. index.html is always
// in the precache manifest, so this is available on the very first offline hit.
setCatchHandler(async ({ request }) => {
  if (request.destination === "document") {
    const shell = await matchPrecache("index.html");
    if (shell) return shell;
  }
  return Response.error();
});

interface DirectMessagePush {
  title: string;
  body: string;
  tag?: string;
  data?: { conversationId?: string; url?: string };
}

/** True for a non-null, non-array plain object we can safely index into. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validate a raw push payload before it reaches showNotification(). The bytes
 * come off the wire and are handed straight to the notification UI, so a
 * malformed or shape-drifted payload (a backend field rename, a truncated body)
 * must not throw here or render garbage like "undefined" in the notification.
 * We only assert the fields we actually use, and only their primitive shape;
 * a body that fails returns null and the caller drops the push silently.
 */
function toDirectMessagePush(raw: unknown): DirectMessagePush | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.title !== "string" || raw.title.length === 0) return null;
  if (typeof raw.body !== "string") return null;
  if (raw.tag !== undefined && typeof raw.tag !== "string") return null;
  if (raw.data !== undefined && !isRecord(raw.data)) return null;
  return {
    title: raw.title,
    body: raw.body,
    tag: typeof raw.tag === "string" ? raw.tag : undefined,
    data: isRecord(raw.data)
      ? {
          conversationId:
            typeof raw.data.conversationId === "string"
              ? raw.data.conversationId
              : undefined,
          url: typeof raw.data.url === "string" ? raw.data.url : undefined,
        }
      : undefined,
  };
}

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let raw: unknown;
  try {
    raw = event.data.json();
  } catch {
    return;
  }
  const payload = toDirectMessagePush(raw);
  if (!payload) return;
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: payload.tag,
      data: payload.data,
      icon: "/icons/icon-192-v2.png",
      // Android/Chrome renders `badge` as a small monochrome status-bar glyph
      // and hard-masks it to a single colour: a full-colour app icon here comes
      // out as a grey blob. Point at a dedicated transparent, single-colour
      // (white-on-transparent) 96×96 mark. ASSET TO PRODUCE:
      // public/icons/badge-monochrome-96.png (see generate-icons.mjs). Falls
      // back gracefully to the app icon on engines that ignore `badge`.
      badge: "/icons/badge-monochrome-96.png",
    }),
  );
});

// Only navigate to a same-origin relative path. The push payload's `url` is
// attacker-influenceable, so a value like `https://evil.example` or a
// protocol-relative `//evil.example` must never reach navigate()/openWindow().
// Mirrors the app's `safeNext` guard: accept only a single leading "/".
function safeNotificationPath(raw: unknown): string {
  const fallback = "/messages";
  if (typeof raw !== "string") return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = safeNotificationPath(event.notification.data?.url);
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          // Focus an already-open PWA window and route it to the conversation.
          client.focus();
          if ("navigate" in client) {
            void (client as WindowClient).navigate(targetUrl);
          }
          return;
        }
        return self.clients.openWindow(targetUrl);
      }),
  );
});
