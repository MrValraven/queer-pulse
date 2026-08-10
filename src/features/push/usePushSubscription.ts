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

function isSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator &&
    typeof window !== "undefined" &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export interface PushSubscriptionApi {
  supported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  busy: boolean;
  enable: () => Promise<void>;
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

  const enable = useCallback(async () => {
    if (!supported || !vapidPublicKey) return;
    setBusy(true);
    // Track the browser subscription so we can roll it back if the server call
    // fails — otherwise a failed enable leaves a PushSubscription the server
    // never registered (an orphan: it receives no pushes, and a later enable()
    // sees getSubscription() return it and assumes all is well).
    let subscription: PushSubscription | null = null;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") return;
      const registration = await navigator.serviceWorker.ready;
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
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
    } catch {
      // Server registration failed after the browser created a subscription:
      // unsubscribe the browser so it doesn't orphan, and reflect the failure
      // by leaving the toggle off.
      if (subscription) {
        await subscription.unsubscribe().catch(() => {});
      }
      setIsSubscribed(false);
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
