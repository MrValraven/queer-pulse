import { useCallback, useEffect, useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
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

  const enable = useCallback(async () => {
    if (!supported || !vapidPublicKey) return;
    setBusy(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") return;
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      const json = subscription.toJSON();
      const endpoint = json.endpoint;
      const p256dh = json.keys?.p256dh;
      const auth = json.keys?.auth;
      if (!demoMode && endpoint && p256dh && auth) {
        await subscribePush({ endpoint, keys: { p256dh, auth } });
      }
      setIsSubscribed(true);
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
        await subscription.unsubscribe();
        if (!demoMode) await unsubscribePush(endpoint);
      }
      setIsSubscribed(false);
    } finally {
      setBusy(false);
    }
  }, [demoMode, supported]);

  return { supported, permission, isSubscribed, busy, enable, disable };
}
