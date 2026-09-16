import {
  clearLastSyncedSubscription,
  clearPendingSubscription,
} from "../../pushSubStore";

/**
 * How long sign-out waits to learn this device's push endpoint before it sends
 * the logout request without one. The read is local (no network) and normally
 * takes a few milliseconds; the ceiling keeps a slow or wedged service worker
 * from holding the logout, so the session cookie is revoked even when the tab
 * is closed straight after "Sign out".
 */
export const PUSH_ENDPOINT_READ_BUDGET_MS = 300;

interface ThisDevicePush {
  registration: ServiceWorkerRegistration | null;
  subscription: PushSubscription | null;
}

const NO_DEVICE_PUSH: ThisDevicePush = {
  registration: null,
  subscription: null,
};

/**
 * This device's worker registration and push subscription, each `null` when
 * absent or unreadable. Uses `getRegistration()` because `serviceWorker.ready`
 * never settles on a page without a registered worker.
 */
async function readThisDevicePush(): Promise<ThisDevicePush> {
  let registration: ServiceWorkerRegistration | null;
  try {
    registration = (await navigator.serviceWorker.getRegistration()) ?? null;
  } catch {
    return NO_DEVICE_PUSH;
  }
  try {
    const subscription = registration?.pushManager
      ? await registration.pushManager.getSubscription()
      : null;
    return { registration, subscription };
  } catch {
    return { registration, subscription: null };
  }
}

/** `work`'s value, or `fallback` once `budgetMs` passes first. */
function settleWithin<Value>(
  work: Promise<Value>,
  fallback: Value,
  budgetMs: number,
): Promise<Value> {
  let budgetTimer: ReturnType<typeof setTimeout> | undefined;
  const budget = new Promise<Value>((resolve) => {
    budgetTimer = setTimeout(() => resolve(fallback), budgetMs);
  });
  return Promise.race([work, budget]).finally(() => {
    clearTimeout(budgetTimer);
  });
}

/**
 * Close every notification this origin is showing, so the next person to pick
 * up a shared device cannot read the previous member's previews in the tray.
 */
async function closeShownNotifications(
  registration: ServiceWorkerRegistration | null,
): Promise<void> {
  if (!registration || typeof registration.getNotifications !== "function") {
    return;
  }
  try {
    const shownNotifications = await registration.getNotifications();
    for (const shownNotification of shownNotifications) {
      shownNotification.close();
    }
  } catch {
    // Best-effort: nothing to close, or the worker is going away.
  }
}

/** Clear the installed app's icon badge, where the Badging API exists. */
function clearAppBadge(): void {
  try {
    if (typeof navigator.clearAppBadge === "function") {
      void navigator.clearAppBadge().catch(() => {});
    }
  } catch {
    // Best-effort: not installed, or no permission.
  }
}

/** The browser-side half of the detach: tray first, then the subscription. */
async function detachBrowserPush(devicePush: ThisDevicePush): Promise<void> {
  await Promise.all([
    closeShownNotifications(devicePush.registration),
    devicePush.subscription?.unsubscribe().catch(() => false),
  ]);
}

/**
 * The live sign-out network sequence (ENG-225). Local session state must
 * already be cleared; the caller fires this and forgets it.
 *
 * ONE logout request goes out as soon as this device's push endpoint is known,
 * or once `PUSH_ENDPOINT_READ_BUDGET_MS` passes, and carries the endpoint so
 * the backend removes the push row in the same request that revokes the
 * session. No detach step gates it. In parallel, locally and best-effort: the
 * badge is cleared, the sync records are forgotten, every shown notification
 * is closed (I-2) and the browser subscription is dropped.
 *
 * The record of members with push enabled on this device is kept on purpose,
 * so the same member's next sign-in restores push (C-2, see
 * `shouldRestorePushSubscription`).
 *
 * Resolves with the logout's own result once the local steps settle too.
 */
export async function logoutAndDetachPush<Result>(
  logout: (pushEndpoint?: string) => Promise<Result>,
): Promise<Result> {
  if (typeof navigator === "undefined") return logout();
  clearAppBadge();
  if (!("serviceWorker" in navigator)) return logout();

  const recordsCleared = Promise.all([
    clearLastSyncedSubscription(),
    clearPendingSubscription(),
  ]);
  const devicePushRead = readThisDevicePush();
  const devicePushInTime = await settleWithin(
    devicePushRead,
    NO_DEVICE_PUSH,
    PUSH_ENDPOINT_READ_BUDGET_MS,
  );
  const logoutRequest = logout(devicePushInTime.subscription?.endpoint);
  const browserDetached = devicePushRead.then(detachBrowserPush);
  const [logoutResult] = await Promise.all([
    logoutRequest,
    recordsCleared,
    browserDetached,
  ]);
  return logoutResult;
}
