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
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { urlBase64ToUint8Array } from "./features/push/urlBase64ToUint8Array";
import {
  PUSH_BRIDGE_NAVIGATE,
  isNavigateReply,
  requestPushBridgeReply,
} from "./pushBridge";
import {
  decideCoalesce,
  resolveShownPushCopy,
  sumAppBadgeCount,
} from "./pushCoalesce";
import { isAnyWindowViewingConversation, isViewingTarget } from "./pushFocus";
import { readPushLang } from "./pushLang";
import { readHidePushPreviews } from "./pushPrivacy";
import { type PushLang, formatPushCopy } from "./pushMessages";
import {
  type DirectMessagePush,
  createFallbackPush,
  readPushEventPayload,
} from "./pushPayload";
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
//
// maxEntries was 120, which was well under what one session actually touches:
// the production entry chunk references ~556 lazy chunks, and a page pulls its
// own JS plus its CSS plus whatever shared chunks it imports, so a member who
// browses for a while evicted (LRU) chunks they were about to navigate back to.
// Every eviction turns a would-be instant navigation back into a network round
// trip. 400 covers a deep session without letting the cache grow without limit,
// and purgeOnQuotaError below still empties it rather than failing writes if a
// device is tight on storage.
registerRoute(
  ({ request }) =>
    request.destination === "script" || request.destination === "style",
  new StaleWhileRevalidate({
    cacheName: "qp-assets",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 400,
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

// PRD-335. A push whose `tag` starts with this prefix is a "this thread was
// read elsewhere" marker for `data.conversationId`, carrying nothing to
// show, sent so a standing notification for that thread clears on this
// device too. LOCKSTEP with the backend
// (queerpulse-backend/src/push/push.service.ts, `READ_DISMISS_TAG_PREFIX`):
// the exact string must match on both sides, since the two repos share no
// package to enforce this at compile time.
const READ_DISMISS_TAG_PREFIX = "qp-read-dismiss:";

function isReadDismissPush(payload: DirectMessagePush): boolean {
  return (
    payload.tag !== undefined && payload.tag.startsWith(READ_DISMISS_TAG_PREFIX)
  );
}

self.addEventListener("push", (event) => {
  // ENG-234: every subscription is created with userVisibleOnly: true, so
  // every push has to end in showNotification. A push with no data, a body
  // that is not JSON, or a payload the validator rejects renders the generic
  // fallback (readPushEventPayload) instead of returning before waitUntil.
  const { payload, isFallback } = readPushEventPayload(event.data);
  event.waitUntil(
    !isFallback && isReadDismissPush(payload)
      ? handleReadDismissPush(payload)
      : showPushNotification(payload, isFallback),
  );
});

/**
 * PRD-335: the receiving half of "reading a thread anywhere clears its
 * notification everywhere". `payload` carries no message to show, only
 * `data.conversationId`, the thread that was just read on another device.
 *
 * `userVisibleOnly: true` (every subscription here is created that way)
 * still obliges a `showNotification` call for THIS push too, or the engine
 * can start showing its own "this site has been updated in the background"
 * notice and eventually revoke the permission (see ENG-234's note above).
 * There is no way to opt out of that platform contract for a genuinely
 * silent/data-only push, so this shows a throwaway marker notification
 * (`silent: true`, `payload`'s own near-empty title/body) and closes it again
 * in the same tick, before this handler resolves; the standard workaround,
 * and in practice no visible frame is painted.
 *
 * The actual work: close every notification tagged with the conversation's
 * OWN bare tag (what a real message push for that thread uses; see
 * `isReadDismissPush`'s doc for why this marker's tag is namespaced away
 * from it) and re-sync the app badge from what's left, exactly as if the
 * member had opened or dismissed them by hand.
 */
async function handleReadDismissPush(
  payload: DirectMessagePush,
): Promise<void> {
  const markerTag = payload.tag ?? `${READ_DISMISS_TAG_PREFIX}unknown`;
  try {
    await self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: markerTag,
      silent: true,
    });
    const markerNotifications = await self.registration.getNotifications({
      tag: markerTag,
    });
    markerNotifications.forEach((notification) => notification.close());
  } catch {
    // Nothing to fall back to: this marker was never meant to stay visible.
  }
  const conversationId = payload.data?.conversationId;
  if (!conversationId) return;
  try {
    const staleNotifications = await self.registration.getNotifications({
      tag: conversationId,
    });
    staleNotifications.forEach((notification) => notification.close());
    await syncAppBadge();
  } catch {
    // Best-effort: worst case the stale row/badge count lingers until the
    // member opens the thread themself, which already clears both.
  }
}

/**
 * Focus-aware suppression: a push for a conversation the recipient is ALREADY
 * looking at, in a focused window, is noise (Signal, WhatsApp and Telegram all
 * suppress it). Only focused windows are considered, so an unfocused or
 * background window never suppresses. Two paths, and either one suppresses:
 *
 * - `isViewingTarget` matches a focused window whose URL is exactly the push's
 *   target. It rarely fires for messages, since the inbox strips `?c=` once a
 *   deep link is consumed, but it still covers every other push type.
 * - For a message push, `isAnyWindowViewingConversation` asks each focused
 *   window over the page bridge (pushBridge.ts) whether that conversation is
 *   on screen (ENG-226). A window that does not answer in time counts as not
 *   viewing, so on uncertainty the notification shows.
 *
 * `includeUncontrolled: true` for the same reason as openNotificationTarget
 * below: right after a deploy the tabs opened under the previous build are
 * uncontrolled, and they are still the member's open windows.
 */
async function isPushTargetOnScreen(
  payload: DirectMessagePush,
  isDirectMessagePush: boolean,
): Promise<boolean> {
  const targetUrl = payload.data?.url;
  const conversationId = isDirectMessagePush
    ? payload.data?.conversationId
    : undefined;
  if (!targetUrl && !conversationId) return false;
  const windows = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  const focusedWindows = windows.filter((windowClient) => windowClient.focused);
  if (focusedWindows.length === 0) return false;
  if (
    targetUrl &&
    focusedWindows.some((focusedWindow) =>
      isViewingTarget(focusedWindow.url, targetUrl),
    )
  ) {
    return true;
  }
  if (!conversationId) return false;
  return isAnyWindowViewingConversation(focusedWindows, conversationId);
}

/**
 * Render one push. Resolves once the notification is on screen, or once the
 * suppression check decides this push is noise. Never rejects: anything that
 * throws on the way (an IndexedDB read, getNotifications, showNotification
 * itself) ends in the generic fallback notification, for the same
 * userVisibleOnly reason as the push listener above.
 */
async function showPushNotification(
  payload: DirectMessagePush,
  isFallback: boolean,
): Promise<void> {
  let lang: PushLang = "en";
  try {
    // A message push carries data.conversationId and a tag; see the
    // coalescing note below for why the tag is required. Worked out before
    // the suppression check, which only asks windows about message pushes.
    const isDirectMessagePush = Boolean(
      payload.data?.conversationId && payload.tag,
    );
    // Checked before the localization read below so a suppressed push skips
    // that work entirely. The fallback has no target to match, so it always
    // shows.
    if (
      !isFallback &&
      (await isPushTargetOnScreen(payload, isDirectMessagePush))
    ) {
      return;
    }
    // The recipient's language lives in IndexedDB (written by the app on
    // boot/language-switch — see pushLang.ts), never in the payload itself:
    // the backend stays language-neutral and does not know the recipient's
    // locale. formatPushCopy resolves payload.l10n's key(s) in that
    // language, falling back to the payload's plain English title/body when
    // there's no l10n block or the key/lang can't be resolved (also what
    // iOS renders — it never runs this handler's JS).
    lang = await readPushLang();
    // Lock-screen privacy: when the member has asked for hidden
    // previews, nothing identifying may reach showNotification.
    const shouldHidePreviews = await readHidePushPreviews();

    // Message coalescing: a DM push (identified by data.conversationId)
    // checks for an already-showing notification on the SAME tag (every DM
    // push tags itself with its conversationId, and sets renotify: true, so
    // at most one live notification per conversation exists at a time). If
    // one is found, this is a burst — fold it into "{count} new messages
    // from {name}" (or "in {group}" for a group, PRD-333) instead of stacking
    // a second notification, and carry the running count forward in `data`
    // so the NEXT message in the burst can read it back. `decideCoalesce`
    // holds the pure count/label decision so it's unit-testable without the
    // unmockable `getNotifications()` call.
    // Require a tag too (every real DM push sets one to its conversationId):
    // without it, `getNotifications({ tag: undefined })` would return EVERY
    // live notification across the whole origin, not just this conversation's.
    const existingNotifications = isDirectMessagePush
      ? await self.registration.getNotifications({ tag: payload.tag })
      : [];
    const decision = decideCoalesce(existingNotifications);
    // DEFENCE IN DEPTH, no longer the primary mechanism (ID-13). The server
    // now reads `member_preferences.hide_push_previews` per recipient and
    // composes a generic payload for anyone hiding previews, so on the happy
    // path there is nothing left here to redact. This substitution stays
    // because it costs nothing and covers what the server cannot: a payload
    // composed by an older backend, or a type that reaches `showNotification`
    // without having gone through the split. It has never worked on iOS,
    // which is why the server had to take over.
    //
    // Substitute AFTER coalescing so the burst logic still runs (the tag and
    // count are not identifying), but before the options are built so the
    // sender's name in `title` and the message text in `body` never render.
    // resolveShownPushCopy (pushCoalesce.ts) makes the whole copy decision;
    // for a hidden message push it keeps the message wording and the burst
    // count (ENG-229).
    const { title: shownTitle, body: shownBody } = resolveShownPushCopy({
      payload,
      lang,
      isDirectMessagePush,
      decision,
      shouldHidePreviews,
    });
    const options: RichNotificationOptions = {
      body: shownBody,
      tag: payload.tag,
      data: isDirectMessagePush
        ? { ...payload.data, count: decision.count }
        : payload.data,
      // The sender's avatar arrives as `payload.icon` on most types, and a
      // face on the lock screen names them as surely as the text does, so
      // hidden previews fall back to the app icon rather than merely
      // rewriting the words above it. The server no longer sends an actor
      // icon to a member who hides previews; this is the same rule applied
      // locally, for a payload composed before that landed.
      icon: shouldHidePreviews
        ? "/icons/icon-192-v3.png"
        : (payload.icon ?? "/icons/icon-192-v3.png"),
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
    // The icon badge follows the message notifications on screen (PRD-335).
    // Other push types leave it alone, so they never overwrite the unread
    // count the open app set.
    if (isDirectMessagePush) await syncAppBadge();
  } catch {
    await showFallbackNotification(lang);
  }
}

/** ENG-234: the generic notification, for a push that failed to render. */
async function showFallbackNotification(lang: PushLang): Promise<void> {
  const fallback = createFallbackPush();
  const { title, body } = formatPushCopy(fallback, lang);
  try {
    await self.registration.showNotification(title, {
      body,
      tag: fallback.tag,
      data: fallback.data,
      icon: "/icons/icon-192-v3.png",
      badge: "/icons/badge-monochrome-96.png",
    });
  } catch {
    // Nothing left to try: the engine refused to show even the generic copy
    // (permission revoked mid-flight). Swallowed so the push promise settles.
  }
}

interface AppBadgeNavigator {
  setAppBadge(contents?: number): Promise<void>;
  clearAppBadge(): Promise<void>;
}

/** The Badging API ships on some engines only; detect it at runtime. */
function hasAppBadge(
  navigatorLike: object,
): navigatorLike is AppBadgeNavigator {
  return (
    "setAppBadge" in navigatorLike &&
    typeof navigatorLike.setAppBadge === "function" &&
    "clearAppBadge" in navigatorLike &&
    typeof navigatorLike.clearAppBadge === "function"
  );
}

/**
 * PRD-335 worker half: set the installed app's icon badge to the number of
 * messages the notifications on screen represent (`sumAppBadgeCount`), or
 * clear it at zero. `excludedTag` leaves out a notification that was just
 * closed. Best-effort and never rejects: a badge is a hint, and the open app
 * sets the authoritative unread count itself.
 */
async function syncAppBadge(excludedTag?: string): Promise<void> {
  const workerNavigator: object = self.navigator;
  if (!hasAppBadge(workerNavigator)) return;
  try {
    const notifications = await self.registration.getNotifications();
    const badgeCount = sumAppBadgeCount(notifications, excludedTag);
    if (badgeCount > 0) {
      await workerNavigator.setAppBadge(badgeCount);
    } else {
      await workerNavigator.clearAppBadge();
    }
  } catch {
    // A refused badge write changes nothing the member relies on.
  }
}

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

/**
 * Raise the app on `targetUrl` after a notification tap.
 *
 * Every step is awaited, and the whole thing is handed to `event.waitUntil` as
 * one promise, because a browser is free to suspend the worker the moment that
 * promise settles. A fire-and-forget `navigate()` / `focus()` is then dropped
 * on the floor and the member lands on whatever screen the app happened to be
 * showing instead of the conversation the notification was about.
 *
 * `navigate()` and `focus()` both reject for legitimate reasons (a window this
 * worker does not control, an engine that refuses focus without user
 * activation), so every call is handled rather than left to become an unhandled
 * rejection inside the worker.
 *
 * `includeUncontrolled: true` matters on the first load after a deploy: a
 * freshly activated worker does not control tabs that were opened under the
 * previous build, and without it those windows are invisible here and every tap
 * would open a duplicate window.
 */
async function openNotificationTarget(targetUrl: string): Promise<void> {
  const clientList = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  // Any open window will do: the app is single-window in practice, and the
  // first match is the most recently focused one.
  const existingWindow = clientList[0];

  if (existingWindow) {
    let windowToFocus = existingWindow;
    // ENG-235: ask the running app to route in-app first. navigate() is a
    // full document load that throws away the socket, the react-query cache,
    // scroll position and in-memory state, then refetches the inbox before
    // the deep link resolves. `targetUrl` has already been through
    // safeNotificationPath, so the page receives the same same-origin path
    // navigate() would. The bridge request never rejects, and a window that
    // does not answer within the bridge timeout (an older build, no listener
    // mounted) resolves null and takes the navigate() path below unchanged.
    const navigateReply = await requestPushBridgeReply(
      existingWindow,
      { type: PUSH_BRIDGE_NAVIGATE, url: targetUrl },
      isNavigateReply,
    );
    const isRoutedInApp = navigateReply?.isHandled === true;
    // Guarded at runtime as well as by the type: WindowClient.navigate is not
    // implemented everywhere the rest of this handler works.
    if (!isRoutedInApp && "navigate" in existingWindow) {
      try {
        // Route first, then focus, so the window is already on the conversation
        // when it comes up. navigate() resolves with the client that ended up
        // at the URL, which can be a different object than the one we started
        // from, so focus whatever it hands back.
        const navigatedWindow = await existingWindow.navigate(targetUrl);
        if (navigatedWindow) windowToFocus = navigatedWindow;
      } catch {
        // Uncontrolled or mid-navigation window: its navigation is not ours to
        // drive. Raising it anyway beats doing nothing, so fall through to
        // focus() with the client we already have.
      }
    }
    try {
      await windowToFocus.focus();
      return;
    } catch {
      // Some engines refuse focus() without user activation, and a window can
      // close between matchAll() and here. Fall through and open a fresh one.
    }
  }

  try {
    await self.clients.openWindow(targetUrl);
  } catch {
    // Nothing left to try: there was no window to raise and the engine refused
    // to open one (a notification tap outside a user-activation window, on
    // engines that require it). Swallowed on purpose so the handler resolves
    // instead of logging an unhandled rejection the member cannot act on.
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
  // Closing a message notification lowers the icon badge (PRD-335). The
  // badge sync runs beside the navigation inside the same waitUntil, and it
  // never rejects, so it cannot hold up or break raising the window.
  const isMessageNotification =
    typeof event.notification.data?.conversationId === "string";
  event.waitUntil(
    Promise.all([
      openNotificationTarget(targetUrl),
      isMessageNotification
        ? syncAppBadge(event.notification.tag)
        : Promise.resolve(),
    ]),
  );
});
