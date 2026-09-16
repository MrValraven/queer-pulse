import { useEffect } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import {
  addPushEnabledMemberId,
  clearPendingSubscription,
  readLastSyncedSubscription,
  readPendingSubscription,
  readPushEnabledMemberIds,
  writeLastSyncedSubscription,
} from "../../pushSubStore";
import { subscribePush } from "./push.api";
import {
  decidePushResync,
  shouldRestorePushSubscription,
} from "./pushResyncDecision";
import {
  compareApplicationServerKey,
  hasPushApis,
  vapidPublicKey,
} from "./pushSupport";
import { urlBase64ToUint8Array } from "./urlBase64ToUint8Array";

/**
 * Members this document has POSTed a subscription for. Deliberately in memory
 * and never in storage: it exists to re-POST once per page load (see
 * `hasSyncedThisPageLoad` in `decidePushResync`), so it must start empty on
 * every load. Marked only after a successful POST, so a failed first attempt
 * is retried on the next trigger.
 */
const memberIdsSyncedThisPageLoad = new Set<string>();

/**
 * Members this document already tried to restore a missing subscription for.
 * In memory for the same reason as the set above: a restore runs at most once
 * per signed-in page load, whether it succeeded, failed or was refused.
 */
const memberIdsRestoreAttemptedThisPageLoad = new Set<string>();

interface SubscriptionToPost {
  subscription: PushSubscription;
  /** Created by this pass, so it is POSTed without consulting the table. */
  isNewlyCreated: boolean;
}

/**
 * The subscription this pass should consider posting, or `null` to stop.
 * Covers the two cases where the browser's current state cannot be used as is:
 * no subscription at all, restored only for a returning member (see
 * `shouldRestorePushSubscription`), and one made under a retired VAPID key.
 */
async function resolveSubscriptionToPost(
  registration: ServiceWorkerRegistration,
  memberId: string,
  isCancelled: () => boolean,
): Promise<SubscriptionToPost | null> {
  const existing = await registration.pushManager.getSubscription();
  if (isCancelled()) return null;
  const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

  if (!existing) {
    const shouldRestore = shouldRestorePushSubscription({
      hasAttemptedRestoreThisPageLoad:
        memberIdsRestoreAttemptedThisPageLoad.has(memberId),
      hasBrowserSubscription: false,
      isPermissionGranted: Notification.permission === "granted",
      memberId,
      pushEnabledMemberIds: await readPushEnabledMemberIds(),
    });
    if (!shouldRestore || isCancelled()) return null;
    memberIdsRestoreAttemptedThisPageLoad.add(memberId);
    const restored = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
    if (isCancelled()) {
      // Signed out mid-restore: leave nothing subscribed behind the sign-out.
      await restored.unsubscribe().catch(() => false);
      return null;
    }
    return { subscription: restored, isNewlyCreated: true };
  }

  const isKeyRotated =
    compareApplicationServerKey(existing, applicationServerKey) === "mismatch";
  if (!isKeyRotated) return { subscription: existing, isNewlyCreated: false };
  await existing.unsubscribe().catch(() => false);
  if (isCancelled()) return null;
  const rotated = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });
  return { subscription: rotated, isNewlyCreated: true };
}

/**
 * One pass of the subscription health check for `memberId`. Complements the
 * server-side pruning: the client can also drift from what the server has on
 * file, because sw.ts's `pushsubscriptionchange` handler rotated the
 * subscription (it cannot POST `/push/subscribe` itself; CSRF-guarded, see that
 * handler's comment) and stashed it as pending, or the endpoint no longer
 * matches the last sync, or a different member signed in on this device, or
 * the last sync is old enough that the server's retention purge could mistake
 * a quiet device for an abandoned one, or this page load has not yet confirmed
 * the row exists. See `decidePushResync` for the table.
 *
 * ENG-231: a subscription created under a VAPID key this build no longer uses
 * can never receive a push. It is dropped, re-created with the current key and
 * POSTed, whatever the stored record says.
 *
 * Sign-out drops the browser subscription, so a member who signs back in on
 * the same device finds none. When that member enabled push here and never
 * turned it off, it is re-created and POSTed once per page load; nobody else
 * is ever opted in.
 *
 * Best-effort throughout: any failure is swallowed and the next trigger retries.
 * `isCancelled` is checked before every step that changes something, so a
 * sign-out mid-pass never re-subscribes or re-registers the endpoint.
 */
export async function syncPushSubscriptionHealth(
  memberId: string,
  isCancelled: () => boolean = () => false,
): Promise<void> {
  if (Notification.permission !== "granted") return;
  try {
    const registration = await navigator.serviceWorker.ready;
    const resolved = await resolveSubscriptionToPost(
      registration,
      memberId,
      isCancelled,
    );
    if (!resolved) return;
    const { subscription, isNewlyCreated } = resolved;

    const { endpoint } = subscription;
    const json = subscription.toJSON();
    const p256dh = json.keys?.p256dh;
    const auth = json.keys?.auth;
    if (!p256dh || !auth) return;

    if (!isNewlyCreated) {
      const [pending, lastSynced] = await Promise.all([
        readPendingSubscription(),
        readLastSyncedSubscription(),
      ]);
      const reason = decidePushResync({
        endpoint,
        hasPendingSubscription: Boolean(pending),
        hasSyncedThisPageLoad: memberIdsSyncedThisPageLoad.has(memberId),
        lastSynced,
        memberId,
        now: Date.now(),
      });
      if (reason === null) return;
    }

    if (isCancelled()) return;
    await subscribePush({ endpoint, keys: { p256dh, auth } });
    memberIdsSyncedThisPageLoad.add(memberId);
    await writeLastSyncedSubscription({
      endpoint,
      userId: memberId,
      syncedAt: Date.now(),
    });
    await addPushEnabledMemberId(memberId);
    await clearPendingSubscription();
  } catch {
    // Best-effort: a failed re-sync is retried on the next trigger (the tab
    // becoming visible, a service worker message, or the next app boot).
  }
}

/**
 * Keeps this device's push subscription registered to the signed-in member.
 * Mounted once app-wide through `PushAppEffects`, so the check really runs at
 * boot rather than only while a settings or onboarding screen is open.
 *
 * Live and active members only: `/push/*` sits behind `ActiveMemberGuard`, and
 * demo mode has no server to sync to. Runs on mount, whenever the tab becomes
 * visible again, and whenever the service worker reports it rotated the
 * subscription. One pass at a time; overlapping triggers are dropped.
 */
export function usePushSubscriptionSync(): void {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking, status, user } = useAuth();
  const memberId =
    !demoMode && !checking && loggedIn && status === "active"
      ? (user?.id ?? null)
      : null;

  useEffect(() => {
    if (!memberId || !hasPushApis()) return;
    const syncingMemberId = memberId;
    let isCancelled = false;
    let isSyncing = false;

    function runSync() {
      if (isSyncing) return;
      isSyncing = true;
      void syncPushSubscriptionHealth(
        syncingMemberId,
        () => isCancelled,
      ).finally(() => {
        isSyncing = false;
      });
    }

    runSync();

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") runSync();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    function handleServiceWorkerMessage(event: MessageEvent) {
      if (
        (event.data as { type?: string } | undefined)?.type ===
        "push-subscription-changed"
      ) {
        runSync();
      }
    }
    navigator.serviceWorker.addEventListener(
      "message",
      handleServiceWorkerMessage,
    );

    return () => {
      isCancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      navigator.serviceWorker.removeEventListener(
        "message",
        handleServiceWorkerMessage,
      );
    };
  }, [memberId]);
}
