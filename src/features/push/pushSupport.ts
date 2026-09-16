/**
 * Environment checks shared by the push settings hook (`usePushSubscription`)
 * and the app-wide subscription health sync (`usePushSubscriptionSync`), so the
 * two can never disagree about whether push is usable here or which VAPID key
 * this build subscribes with.
 */

export const vapidPublicKey = (
  import.meta.env.VITE_VAPID_PUBLIC_KEY ?? ""
).trim();

/**
 * A deploy with no `VITE_VAPID_PUBLIC_KEY` cannot create a subscription at
 * all, so it counts as unsupported rather than as a toggle that flips back
 * with no explanation.
 */
export function hasPushApis(): boolean {
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
 * How an existing browser subscription's VAPID key compares with the key this
 * build uses. `unknown` covers a browser that does not expose
 * `subscription.options.applicationServerKey`: nothing proves a mismatch, so a
 * background sync must not tear the subscription down on that basis alone.
 */
export type ApplicationServerKeyMatch = "match" | "mismatch" | "unknown";

export function compareApplicationServerKey(
  subscription: PushSubscription,
  key: Uint8Array,
): ApplicationServerKeyMatch {
  const existing = subscription.options?.applicationServerKey;
  if (!existing) return "unknown";
  const bytes = new Uint8Array(existing);
  if (bytes.length !== key.length) return "mismatch";
  return bytes.every((byte, index) => byte === key[index])
    ? "match"
    : "mismatch";
}

/**
 * Whether an existing browser subscription was created with the VAPID key this
 * build uses. A mismatch (a redeploy with rotated keys, a shared device) makes
 * `pushManager.subscribe()` throw `InvalidStateError` forever, so the stale one
 * has to be dropped before re-subscribing. An unreadable key counts as no match
 * here, because `enable()` is about to subscribe anyway.
 */
export function matchesApplicationServerKey(
  subscription: PushSubscription,
  key: Uint8Array,
): boolean {
  return compareApplicationServerKey(subscription, key) === "match";
}
