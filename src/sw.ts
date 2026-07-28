/// <reference lib="webworker" />
import { ExpirationPlugin } from "workbox-expiration";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

cleanupOutdatedCaches();

// directoryIndex: null keeps "/" from being served out of the precached
// index.html before the NetworkFirst navigation route runs — so a deploy's
// fresh index.html is picked up. (Ported from the old generateSW config.)
precacheAndRoute(self.__WB_MANIFEST, { directoryIndex: null });

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

interface DirectMessagePush {
  title: string;
  body: string;
  tag?: string;
  data?: { conversationId?: string; url?: string };
}

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload: DirectMessagePush;
  try {
    payload = event.data.json() as DirectMessagePush;
  } catch {
    return;
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: payload.tag,
      data: payload.data,
      icon: "/icons/icon-192-v2.png",
      badge: "/icons/icon-192-v2.png",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? "/messages";
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
