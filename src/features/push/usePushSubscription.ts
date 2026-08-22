import { useCallback, useEffect, useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import {
  clearPendingSubscription,
  readLastSyncedEndpoint,
  readPendingSubscription,
  writeLastSyncedEndpoint,
} from "../../pushSubStore";
import { subscribePush, unsubscribePush } from "./push.api";
import { urlBase64ToUint8Array } from "./urlBase64ToUint8Array";

const vapidPublicKey = (import.meta.env.VITE_VAPID_PUBLIC_KEY ?? "").trim();

/**
 * A deploy with no `VITE_VAPID_PUBLIC_KEY` cannot create a subscription at
 * all, so it counts as unsupported rather than as a toggle that flips back
 * with no explanation. The row then shows its "your browser can't do this yet"
 * helper, which is at least an honest dead end.
 */
function isSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator &&
    typeof window !== "undefined" &&
    "PushManager" in window &&
    "Notification" in window &&
    vapidPublicKey.length > 0
  );
}

/**
 * Whether an existing browser subscription was created with the VAPID key this
 * build uses. A mismatch (a redeploy with rotated keys, a shared device) makes
 * `pushManager.subscribe()` throw `InvalidStateError` forever, so the stale one
 * has to be dropped before re-subscribing.
 */
function matchesApplicationServerKey(
  subscription: PushSubscription,
  key: Uint8Array,
): boolean {
  const existing = subscription.options?.applicationServerKey;
  if (!existing) return false;
  const bytes = new Uint8Array(existing);
  if (bytes.length !== key.length) return false;
  return bytes.every((byte, index) => byte === key[index]);
}

/**
 * How an `enable()` attempt ended. `denied` is the member's own choice (the
 * calling row already explains it through `permission`); `failed` carries the
 * error so the caller can say WHY instead of just snapping the toggle back.
 */
export type PushEnableResult =
  | { status: "enabled" }
  | { status: "denied" }
  | { status: "unsupported" }
  | { status: "failed"; error: unknown };

export interface PushSubscriptionApi {
  supported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  busy: boolean;
  enable: () => Promise<PushEnableResult>;
  disable: () => Promise<void>;
}

export function usePushSubscription(): PushSubscriptionApi {
  const { demoMode } = useDemoMode();
  const supported = isSupported();
  const [permission, setPermission] = useState<NotificationPermission>(
    supported ? Notification.permission : "denied",
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  // Reflect an existing subscription on mount (e.g. subscribed on a prior visit).
  useEffect(() => {
    if (!supported) return;
    let active = true;
    void navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        if (active) setIsSubscribed(Boolean(subscription));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [supported]);

  // Boot-time subscription health re-sync. Complements the server-side
  // 404/410 pruning: the *client* can also drift from what the server has on
  // file — either because sw.ts's `pushsubscriptionchange` handler rotated
  // the subscription (it can't POST /push/subscribe itself; CSRF-guarded, see
  // that handler's comment) and stashed it as "pending", or because the live
  // subscription's endpoint no longer matches the last one we successfully
  // synced (e.g. IndexedDB was cleared, or a sync attempt failed silently
  // before this session). Skipped in demo mode — there is no server to sync
  // to. Runs on mount, on the tab becoming visible again, and whenever the SW
  // reports it rotated the subscription — the three moments a drift is worth
  // checking for.
  useEffect(() => {
    if (!supported || demoMode) return;

    async function syncSubscriptionHealth() {
      if (Notification.permission !== "granted") return;
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) return;
        const { endpoint } = subscription;
        const [pending, lastSyncedEndpoint] = await Promise.all([
          readPendingSubscription(),
          readLastSyncedEndpoint(),
        ]);
        if (!pending && endpoint === lastSyncedEndpoint) return;
        const json = subscription.toJSON();
        const p256dh = json.keys?.p256dh;
        const auth = json.keys?.auth;
        if (!p256dh || !auth) return;
        await subscribePush({ endpoint, keys: { p256dh, auth } });
        await writeLastSyncedEndpoint(endpoint);
        await clearPendingSubscription();
      } catch {
        // Best-effort — a failed re-sync here just gets retried on the next
        // trigger (visibility change, SW message, or the next app boot).
      }
    }

    void syncSubscriptionHealth();

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") void syncSubscriptionHealth();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    function handleServiceWorkerMessage(event: MessageEvent) {
      if ((event.data as { type?: string } | undefined)?.type === "push-subscription-changed") {
        void syncSubscriptionHealth();
      }
    }
    navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
    };
  }, [supported, demoMode]);

  const enable = useCallback(async (): Promise<PushEnableResult> => {
    if (!supported) return { status: "unsupported" };
    setBusy(true);
    // Track the browser subscription so we can roll it back if the server call
    // fails — otherwise a failed enable leaves a PushSubscription the server
    // never registered (an orphan: it receives no pushes, and a later enable()
    // sees getSubscription() return it and assumes all is well).
    let subscription: PushSubscription | null = null;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") return { status: "denied" };
      const registration = await navigator.serviceWorker.ready;
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      // Drop a subscription left over from a different VAPID key first, or
      // subscribe() below throws InvalidStateError and every future attempt
      // fails the same way with nothing to show for it.
      const stale = await registration.pushManager.getSubscription();
      if (stale && !matchesApplicationServerKey(stale, applicationServerKey)) {
        await stale.unsubscribe().catch(() => {});
      }
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
      if (!demoMode) {
        const json = subscription.toJSON();
        const endpoint = json.endpoint;
        const p256dh = json.keys?.p256dh;
        const auth = json.keys?.auth;
        if (endpoint && p256dh && auth) {
          await subscribePush({ endpoint, keys: { p256dh, auth } });
          // Record what we just synced so the boot-time health re-sync doesn't
          // fire a redundant (idempotent) re-POST on the next visit.
          await writeLastSyncedEndpoint(endpoint);
        }
      }
      setIsSubscribed(true);
      return { status: "enabled" };
    } catch (error) {
      // Server registration failed after the browser created a subscription:
      // unsubscribe the browser so it doesn't orphan, and reflect the failure
      // by leaving the toggle off. The error travels back to the caller so the
      // member is told what went wrong rather than watching the toggle snap.
      if (subscription) {
        await subscription.unsubscribe().catch(() => {});
      }
      setIsSubscribed(false);
      return { status: "failed", error };
    } finally {
      setBusy(false);
    }
  }, [demoMode, supported]);

  const disable = useCallback(async () => {
    if (!supported) return;
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const { endpoint } = subscription;
        const removed = await subscription.unsubscribe();
        // Only drop the server record / flip the toggle once the browser
        // actually released the subscription; if unsubscribe() returned false
        // the device is still subscribed, so leave state untouched.
        if (!removed) return;
        if (!demoMode) {
          // Best-effort: the browser subscription is already gone, so a failure
          // here can't leave a browser-side orphan — the server drops the dead
          // endpoint on its next 410 (Gone) push response.
          await unsubscribePush(endpoint).catch(() => {});
        }
        setIsSubscribed(false);
      } else {
        setIsSubscribed(false);
      }
    } finally {
      setBusy(false);
    }
  }, [demoMode, supported]);

  return { supported, permission, isSubscribed, busy, enable, disable };
}
