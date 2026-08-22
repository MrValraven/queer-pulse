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
import { urlBase64ToUint8Array } from "./features/push/urlBase64ToUint8Array";
import { decideCoalesce } from "./pushCoalesce";
import { isViewingTarget } from "./pushFocus";
import { readPushLang } from "./pushLang";
import { readHidePushPreviews } from "./pushPrivacy";
import { formatPushCopy } from "./pushMessages";
import { type DirectMessagePush, toDirectMessagePush } from "./pushPayload";
import { writePendingSubscription } from "./pushSubStore";

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

// lib.dom.d.ts's NotificationOptions only models the fields TypeScript's DOM
// lib has caught up with (body/tag/data/icon/requireInteraction/silent). The
// Notification API additionally defines image/actions/vibrate/renotify, which
// Chrome/Android implement at runtime — widen locally rather than casting or
// suppressing so this object literal is still checked against everything
// TypeScript *does* know.
type RichNotificationOptions = NotificationOptions & {
  image?: string;
  actions?: { action: string; title: string }[];
  vibrate?: number[];
  renotify?: boolean;
  timestamp?: number;
};

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let raw: unknown;
  try {
    raw = event.data.json();
  } catch {
    return;
  }
  const payload: DirectMessagePush | null = toDirectMessagePush(raw);
  if (!payload) return;
  event.waitUntil(
    (async () => {
      // Focus-aware suppression: a push for a conversation the recipient is
      // ALREADY looking at, in a focused window, is noise (Signal/WhatsApp/
      // Telegram all do this). Conservative by design — isViewingTarget only
      // matches the exact conversation URL, so a focused window on a
      // different conversation, the bare list view, or any unfocused window
      // never suppresses. Checked before the localization read below so a
      // suppressed push skips that work entirely.
      const targetUrl = payload.data?.url;
      if (targetUrl) {
        const windows = await self.clients.matchAll({ type: "window" });
        for (const win of windows) {
          const windowClient = win as WindowClient;
          if (windowClient.focused && isViewingTarget(windowClient.url, targetUrl)) {
            return;
          }
        }
      }
      // The recipient's language lives in IndexedDB (written by the app on
      // boot/language-switch — see pushLang.ts), never in the payload itself:
      // the backend stays language-neutral and does not know the recipient's
      // locale. formatPushCopy resolves payload.l10n's key(s) in that
      // language, falling back to the payload's plain English title/body when
      // there's no l10n block or the key/lang can't be resolved (also what
      // iOS renders — it never runs this handler's JS).
      const lang = await readPushLang();
      // Lock-screen privacy: when the member has asked for hidden
      // previews, nothing identifying may reach showNotification.
      const shouldHidePreviews = await readHidePushPreviews();

      // Message coalescing: a DM push (identified by data.conversationId)
      // checks for an already-showing notification on the SAME tag (every DM
      // push tags itself with its conversationId, and sets renotify: true, so
      // at most one live notification per conversation exists at a time). If
      // one is found, this is a burst — fold it into "{count} new messages
      // from {name}" instead of stacking a second notification, and carry the
      // running count forward in `data` so the NEXT message in the burst can
      // read it back. `decideCoalesce` holds the pure count/label decision so
      // it's unit-testable without the unmockable `getNotifications()` call.
      // Require a tag too (every real DM push sets one to its conversationId):
      // without it, `getNotifications({ tag: undefined })` would return EVERY
      // live notification across the whole origin, not just this conversation's.
      const isDirectMessagePush = Boolean(payload.data?.conversationId && payload.tag);
      const existingNotifications = isDirectMessagePush
        ? await self.registration.getNotifications({ tag: payload.tag })
        : [];
      const { count, coalesced } = decideCoalesce(existingNotifications);
      const { title, body } = coalesced
        ? formatPushCopy(
            {
              title: payload.title,
              body: payload.body,
              l10n: {
                titleKey: payload.l10n?.titleKey,
                bodyKey: "push:messages.coalesced",
                params: { count: String(count), name: payload.title },
              },
            },
            lang,
          )
        : formatPushCopy(payload, lang);
      // Substitute AFTER coalescing so the burst logic still runs (the tag and
      // count are not identifying), but before the options are built so the
      // sender's name in `title` and the message text in `body` never render.
      const { title: shownTitle, body: shownBody } = shouldHidePreviews
        ? formatPushCopy(
            {
              title: "QueerPulse",
              body: "You have a new notification.",
              l10n: {
                titleKey: "push:preview.hidden.title",
                bodyKey: "push:preview.hidden.body",
              },
            },
            lang,
          )
        : { title, body };
      const options: RichNotificationOptions = {
        body: shownBody,
        tag: payload.tag,
        data: isDirectMessagePush ? { ...payload.data, count } : payload.data,
        icon: payload.icon ?? "/icons/icon-192-v2.png",
        // Android/Chrome renders `badge` as a small monochrome status-bar glyph
        // and hard-masks it to a single colour: a full-colour app icon here comes
        // out as a grey blob. Point at a dedicated transparent, single-colour
        // (white-on-transparent) 96×96 mark. ASSET TO PRODUCE:
        // public/icons/badge-monochrome-96.png (see generate-icons.mjs). Falls
        // back gracefully to the app icon on engines that ignore `badge`.
        badge: "/icons/badge-monochrome-96.png",
        // A preview image can be as identifying as the text (an avatar, a
        // photo attachment), so it goes when previews are hidden.
        image: shouldHidePreviews ? undefined : payload.image,
        actions: payload.actions,
        renotify: payload.renotify,
        // Per the Notifications spec, `silent` and a vibration pattern conflict;
        // silent wins, so suppress vibrate when the payload asked for silent.
        vibrate: payload.silent ? undefined : payload.vibrate,
        requireInteraction: payload.requireInteraction,
        silent: payload.silent,
        // The true event time (message createdAt / event start / notification
        // createdAt), not delivery time — every sender now sets this.
        timestamp: payload.timestamp,
      };
      await self.registration.showNotification(shownTitle, options);
    })(),
  );
});

const vapidPublicKey = (import.meta.env.VITE_VAPID_PUBLIC_KEY ?? "").trim();

// Fires when the browser rotates the push subscription out from under us
// (key expiry, browser-initiated refresh) — greenfield without this handler:
// the old subscription silently stops receiving pushes and nothing ever
// re-subscribes. We re-subscribe immediately so delivery keeps working, but
// we do NOT POST the new subscription to /push/subscribe from here — that
// route is CSRF-guarded (double-submit cookie) and the SW has no clean way to
// read the app's CSRF token. Instead: stash the new subscription as "pending"
// in IndexedDB (pushSubStore.ts) and best-effort postMessage any open client
// so it can flush it through the normal API client right away. If no client
// is open, the app's boot health re-sync (usePushSubscription) picks up the
// pending subscription the next time it loads.
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      if (!vapidPublicKey) return;
      try {
        const subscription = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
        await writePendingSubscription(subscription.toJSON());
        const windows = await self.clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });
        for (const win of windows) {
          win.postMessage({ type: "push-subscription-changed" });
        }
      } catch {
        // Best-effort: if re-subscribing here fails, the app's boot health
        // re-sync still detects the missing/stale subscription on next
        // load/focus and repairs it through the normal API path.
      }
    })(),
  );
});

// Only navigate to a same-origin relative path. The push payload's `url` is
// attacker-influenceable, so a value like `https://evil.example`, a
// protocol-relative `//evil.example`, or a backslash/control-char smuggle like
// `/\evil.example` must never reach navigate()/openWindow().
//
// This is a ServiceWorker-local copy of `src/shared/lib/safeInternalPath.ts`:
// the shared helper reads `window.location.origin`, which does not exist in a
// worker, so we apply the SAME backslash/control-char rejection and URL-parse
// origin check against `self.location.origin` here. Keep the two in sync.
function safeNotificationPath(raw: unknown): string {
  const fallback = "/messages";
  if (typeof raw !== "string") return fallback;
  // eslint-disable-next-line no-control-regex
  if (/[\\\u0000-\u001f\u007f]/.test(raw)) return fallback;
  try {
    const parsed = new URL(raw, self.location.origin);
    if (parsed.origin !== self.location.origin) return fallback;
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return fallback;
  }
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  // Every action ("view") and a plain body tap deep-link to the same safe
  // conversation/event path via safeNotificationPath below — there is only one
  // destination today, so we don't need to branch on event.action. A future
  // multi-destination action (e.g. "mark as read" vs. "view") would read
  // event.action here and choose a different target/behaviour per action id.
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
