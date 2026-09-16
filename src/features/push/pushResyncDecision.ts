import type { StoredLastSyncedSubscription } from "../../pushSubStore";

/**
 * How old the last successful `/push/subscribe` may get before a healthy device
 * re-POSTs its unchanged endpoint (ENG-233). The server purges subscriptions
 * whose `last_used_at` is older than 90 days, and a member who receives no
 * pushes for months would otherwise look abandoned; re-posting weekly keeps
 * the row fresh with a wide margin.
 */
export const PUSH_RESYNC_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** Why the health sync decided to re-POST, for tests and for reading the code. */
export type PushResyncReason =
  | "pendingSubscription"
  | "noRecord"
  | "endpointChanged"
  | "memberChanged"
  | "stale"
  | "firstSyncThisPageLoad";

export interface PushResyncInput {
  /** The endpoint of the browser's live subscription. */
  endpoint: string;
  /** Whether the service worker stashed a rotated subscription not yet POSTed. */
  hasPendingSubscription: boolean;
  /**
   * Whether this document already POSTed successfully for `memberId`. The
   * server deletes every push row for a member when their last live session
   * is revoked (sign out everywhere, suspension, refresh-token reuse), which
   * leaves other devices holding a fresh, matching record for a row that no
   * longer exists. Re-posting once per signed-in page load restores them on
   * the next visit instead of up to seven days later.
   */
  hasSyncedThisPageLoad: boolean;
  lastSynced: StoredLastSyncedSubscription | undefined;
  /** The signed-in member this device should deliver to. */
  memberId: string;
  now: number;
}

/**
 * The boot re-sync decision table, in precedence order. Returns `null` when
 * the server already holds exactly this endpoint for this member, recently,
 * and this page load has already confirmed it once.
 *
 * A legacy record (bare endpoint, no member, no time) falls through to
 * `memberChanged`, so it triggers exactly one re-POST, after which the full
 * record is written. A `syncedAt` in the future (the device clock moved back)
 * counts as stale; otherwise it would block every refresh until the clock
 * caught up.
 */
export function decidePushResync(
  input: PushResyncInput,
): PushResyncReason | null {
  const {
    endpoint,
    hasPendingSubscription,
    hasSyncedThisPageLoad,
    lastSynced,
    memberId,
    now,
  } = input;
  if (hasPendingSubscription) return "pendingSubscription";
  if (!lastSynced) return "noRecord";
  if (lastSynced.endpoint !== endpoint) return "endpointChanged";
  if (lastSynced.userId !== memberId) return "memberChanged";
  if (lastSynced.syncedAt === null) return "stale";
  const age = now - lastSynced.syncedAt;
  if (age < 0 || age >= PUSH_RESYNC_MAX_AGE_MS) return "stale";
  if (!hasSyncedThisPageLoad) return "firstSyncThisPageLoad";
  return null;
}

export interface PushRestoreInput {
  /** Whether this document already tried a restore for `memberId`. */
  hasAttemptedRestoreThisPageLoad: boolean;
  /** Whether the browser currently holds any push subscription. */
  hasBrowserSubscription: boolean;
  isPermissionGranted: boolean;
  /** The signed-in member. */
  memberId: string;
  /** Members who turned push on on this device and never turned it off here. */
  pushEnabledMemberIds: readonly string[];
}

/**
 * Whether the health sync should create a subscription this device does not
 * have. Sign-out unsubscribes the browser, so without this a member who signs
 * out and back in on their own device silently loses push. Restored only for
 * a member who enabled push on this device before and never turned it off
 * here, with permission still granted, at most once per signed-in page load. A
 * different member signing in on a shared device is never opted in on someone
 * else's behalf.
 */
export function shouldRestorePushSubscription(
  input: PushRestoreInput,
): boolean {
  const {
    hasAttemptedRestoreThisPageLoad,
    hasBrowserSubscription,
    isPermissionGranted,
    memberId,
    pushEnabledMemberIds,
  } = input;
  return (
    isPermissionGranted &&
    !hasBrowserSubscription &&
    !hasAttemptedRestoreThisPageLoad &&
    pushEnabledMemberIds.includes(memberId)
  );
}
