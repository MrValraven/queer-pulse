import { useCallback, useEffect, useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { useDisplayMode } from "../../app/providers/displayModeContext";
import { detectPlatform } from "../../shared/hooks/useInstallPrompt";
import {
  addPushEnabledMemberId,
  clearLastSyncedSubscription,
  removePushEnabledMemberId,
  writeLastSyncedSubscription,
} from "../../pushSubStore";
import { subscribePush, unsubscribePush } from "./push.api";
import {
  hasPushApis,
  matchesApplicationServerKey,
  vapidPublicKey,
} from "./pushSupport";
import { urlBase64ToUint8Array } from "./urlBase64ToUint8Array";

/**
 * Why push is or is not available here.
 *
 * `needsInstall` is the case this split exists for. iOS and iPadOS Safari
 * expose `PushManager` ONLY to a web app that has been added to the Home
 * Screen; in a normal Safari tab the API is simply absent, which is
 * indistinguishable from a browser that will never support push unless the
 * platform is checked too. Collapsing both into one boolean told an iPhone
 * member "your browser can't do this yet" when the honest answer is "install
 * it to the Home Screen and it works" — and push is the only out-of-band
 * channel this product has.
 */
export type PushSupportState = "supported" | "needsInstall" | "unsupported";

/**
 * `isInstalled` comes from the app-wide display-mode provider (the same one
 * `PwaPromptPage` reads), so there is exactly one answer to "are we running as
 * an installed app" rather than a second detector drifting from the first.
 */
function resolvePushSupportState(isInstalled: boolean): PushSupportState {
  if (hasPushApis()) return "supported";
  // Only worth offering the install route when installing would actually fix
  // it: an iOS/iPadOS browser tab, on a deploy that has a VAPID key at all.
  if (
    !isInstalled &&
    vapidPublicKey.length > 0 &&
    detectPlatform() === "ios" &&
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator
  ) {
    return "needsInstall";
  }
  return "unsupported";
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
  /** True only for `supportState === "supported"`. */
  supported: boolean;
  /** Why push is (un)available, so callers can offer the install route. */
  supportState: PushSupportState;
  permission: NotificationPermission;
  isSubscribed: boolean;
  busy: boolean;
  enable: () => Promise<PushEnableResult>;
  disable: () => Promise<void>;
}

export function usePushSubscription(): PushSubscriptionApi {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const memberId = user?.id ?? null;
  const { isInstalled } = useDisplayMode();
  const supportState = resolvePushSupportState(isInstalled);
  const supported = supportState === "supported";
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

  // The subscription health re-sync (pending rotation, endpoint drift, member
  // change, weekly refresh, VAPID key rotation) lives in
  // `usePushSubscriptionSync`, mounted once app-wide through `PushAppEffects`.
  // It used to run here, which meant it only ran while Settings or the
  // onboarding opt-in was on screen.

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
          // Record what we just synced, and for whom, so the health re-sync
          // doesn't fire a redundant (idempotent) re-POST on the next visit.
          if (memberId) {
            await writeLastSyncedSubscription({
              endpoint,
              userId: memberId,
              syncedAt: Date.now(),
            });
            // Push is on for this member here, so signing out and back in on
            // this device restores it without asking again.
            await addPushEnabledMemberId(memberId);
          }
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
  }, [demoMode, memberId, supported]);

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
        // The record describes a subscription that no longer exists.
        await clearLastSyncedSubscription();
        // The member turned push off here: a later sign-in must not restore it.
        if (memberId) await removePushEnabledMemberId(memberId);
        setIsSubscribed(false);
      } else {
        if (memberId) await removePushEnabledMemberId(memberId);
        setIsSubscribed(false);
      }
    } finally {
      setBusy(false);
    }
  }, [demoMode, memberId, supported]);

  return {
    supported,
    supportState,
    permission,
    isSubscribed,
    busy,
    enable,
    disable,
  };
}
