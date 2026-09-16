/**
 * Delivery-reliability store for the web push subscription lifecycle. Two
 * failure modes need a durable record that survives across the window/worker
 * boundary and across reloads:
 *
 * 1. `pushsubscriptionchange` (sw.ts) fires when the browser rotates the
 *    subscription (key expiry, browser-initiated refresh) — the SW re-subscribes
 *    immediately but CANNOT POST the new subscription to `/push/subscribe`
 *    itself (that route is CSRF-guarded and the SW has no clean access to the
 *    double-submit token). It stashes the new subscription here as "pending";
 *    the app flushes it through the normal API client on next boot/focus.
 * 2. Even without a rotation, the app needs to know whether its last known-good
 *    subscription actually matches what the server has on file, so it also
 *    remembers the last successful sync: the endpoint, the member it was
 *    registered to, and when. The member id lets a second person signing in on
 *    the same device move the endpoint onto their account; the timestamp lets
 *    a healthy but quiet device re-POST often enough that the server's
 *    stale-subscription purge never mistakes it for an abandoned one.
 *
 * Both sides open the SAME tiny IndexedDB store used by `pushLang.ts` (db
 * `qp-push`, store `prefs`) under different keys — reusing the store avoids a
 * version bump / second upgrade path for what is still just a few scalar
 * values. Every function here is best-effort and silent, mirroring
 * `pushLang.ts`'s guards: IndexedDB being unavailable or a read/write failing
 * must never throw into the SW's push handler or the app's boot effect.
 */

const DB_NAME = "qp-push";
const DB_VERSION = 1;
const STORE_NAME = "prefs";
const PENDING_SUBSCRIPTION_KEY = "pendingSubscription";
// The key name predates the record shape: it once held the bare endpoint
// string. Keeping the name means an existing device's old value is still found
// and read back as "unknown member, unknown time" (see readLastSyncedSubscription).
const LAST_SYNCED_SUBSCRIPTION_KEY = "lastSyncedEndpoint";

// IDBRequest/IDBTransaction's `.error` is a `DOMException | null` — not
// statically an `Error` — so reject with a real Error, folding the
// DOMException's message in when there is one.
function rejectionError(domException: unknown): Error {
  return domException instanceof Error
    ? domException
    : new Error("IndexedDB request failed");
}

function openPushDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(rejectionError(request.error));
  });
}

async function putValue(key: string, value: unknown): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try {
    const db = await openPushDb();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(rejectionError(tx.error));
      });
    } finally {
      db.close();
    }
  } catch {
    // Best-effort — see the module doc comment above.
  }
}

async function getValue<T>(key: string): Promise<T | undefined> {
  if (typeof indexedDB === "undefined") return undefined;
  try {
    const db = await openPushDb();
    try {
      const value = await new Promise<unknown>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const request = tx.objectStore(STORE_NAME).get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(rejectionError(request.error));
      });
      return value as T | undefined;
    } finally {
      db.close();
    }
  } catch {
    return undefined;
  }
}

async function deleteValue(key: string): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try {
    const db = await openPushDb();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(rejectionError(tx.error));
      });
    } finally {
      db.close();
    }
  } catch {
    // Best-effort — see the module doc comment above.
  }
}

/**
 * Persist a subscription the SW created (on `pushsubscriptionchange`) that
 * hasn't been confirmed synced to the server yet. Called from the SW.
 */
export async function writePendingSubscription(
  json: PushSubscriptionJSON,
): Promise<void> {
  await putValue(PENDING_SUBSCRIPTION_KEY, json);
}

/**
 * Read back a subscription the SW stashed as pending. Called from the app's
 * boot health re-sync — its presence means the server has NOT yet seen this
 * subscription and it must be POSTed through the normal (CSRF-safe) API
 * client. Returns `undefined` when unset or on any error.
 */
export async function readPendingSubscription(): Promise<
  PushSubscriptionJSON | undefined
> {
  return getValue<PushSubscriptionJSON>(PENDING_SUBSCRIPTION_KEY);
}

/** Clear the pending subscription once the app has confirmed it synced. */
export async function clearPendingSubscription(): Promise<void> {
  await deleteValue(PENDING_SUBSCRIPTION_KEY);
}

/** What the app last successfully POSTed to `/push/subscribe`, and for whom. */
export interface LastSyncedSubscription {
  endpoint: string;
  /** The member the endpoint was registered to. */
  userId: string;
  /** `Date.now()` at the moment the POST succeeded. */
  syncedAt: number;
}

/**
 * The record as read back. `userId` and `syncedAt` are `null` for a value
 * written before the record carried them (a bare endpoint string): the member
 * and the time are unknown, which the re-sync treats as reason to POST once.
 */
export interface StoredLastSyncedSubscription {
  endpoint: string;
  userId: string | null;
  syncedAt: number | null;
}

/**
 * Remember the last successful sync, so a later boot can detect drift (the
 * live `pushManager` subscription's endpoint no longer matches what the server
 * has on file, a different member is now signed in, or the sync is old enough
 * to refresh) even when no `pushsubscriptionchange` event fired.
 */
export async function writeLastSyncedSubscription(
  record: LastSyncedSubscription,
): Promise<void> {
  await putValue(LAST_SYNCED_SUBSCRIPTION_KEY, record);
}

/**
 * Narrow whatever is stored under the key into the current shape. A legacy
 * bare endpoint string reads as unknown member and unknown time; anything
 * unrecognisable reads as no record at all.
 */
export function toStoredLastSyncedSubscription(
  value: unknown,
): StoredLastSyncedSubscription | undefined {
  if (typeof value === "string") {
    return value.length > 0
      ? { endpoint: value, userId: null, syncedAt: null }
      : undefined;
  }
  if (typeof value !== "object" || value === null) return undefined;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.endpoint !== "string" || candidate.endpoint.length === 0)
    return undefined;
  return {
    endpoint: candidate.endpoint,
    userId: typeof candidate.userId === "string" ? candidate.userId : null,
    syncedAt:
      typeof candidate.syncedAt === "number" &&
      Number.isFinite(candidate.syncedAt)
        ? candidate.syncedAt
        : null,
  };
}

/** Read the last successful sync. `undefined` when unset or unreadable. */
export async function readLastSyncedSubscription(): Promise<
  StoredLastSyncedSubscription | undefined
> {
  return toStoredLastSyncedSubscription(
    await getValue<unknown>(LAST_SYNCED_SUBSCRIPTION_KEY),
  );
}

/**
 * Forget the last successful sync: on sign-out, and when the member turns push
 * off here. The record describes a subscription that no longer exists.
 */
export async function clearLastSyncedSubscription(): Promise<void> {
  await deleteValue(LAST_SYNCED_SUBSCRIPTION_KEY);
}

/**
 * Members who turned push on on this device and have not turned it off here.
 * Kept across sign-out on purpose: signing out drops the browser subscription
 * so the next person on a shared device receives none of the previous member's
 * pushes, and this record is what lets the same member's next sign-in restore
 * it without asking again (see `shouldRestorePushSubscription`). Member ids
 * only; no endpoint or key is stored here.
 */
const PUSH_ENABLED_MEMBER_IDS_KEY = "pushEnabledMemberIds";

/** Most recent members kept, so a shared device's list cannot grow forever. */
export const PUSH_ENABLED_MEMBER_IDS_LIMIT = 20;

/** Narrow whatever is stored into a list of member ids; anything else reads as empty. */
export function toPushEnabledMemberIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (storedMemberId): storedMemberId is string =>
      typeof storedMemberId === "string" && storedMemberId.length > 0,
  );
}

/** The members with push enabled on this device. Empty when unset or unreadable. */
export async function readPushEnabledMemberIds(): Promise<string[]> {
  return toPushEnabledMemberIds(
    await getValue<unknown>(PUSH_ENABLED_MEMBER_IDS_KEY),
  );
}

/**
 * Record that `memberId` has push enabled on this device: after `enable()` or
 * any successful health sync POST. Moves the id to the most recent end and
 * keeps the newest `PUSH_ENABLED_MEMBER_IDS_LIMIT`.
 */
export async function addPushEnabledMemberId(memberId: string): Promise<void> {
  const storedMemberIds = await readPushEnabledMemberIds();
  if (storedMemberIds[storedMemberIds.length - 1] === memberId) return;
  const otherMemberIds = storedMemberIds.filter(
    (storedMemberId) => storedMemberId !== memberId,
  );
  await putValue(
    PUSH_ENABLED_MEMBER_IDS_KEY,
    [...otherMemberIds, memberId].slice(-PUSH_ENABLED_MEMBER_IDS_LIMIT),
  );
}

/** Forget `memberId`: only when that member turns push off on this device. */
export async function removePushEnabledMemberId(
  memberId: string,
): Promise<void> {
  const storedMemberIds = await readPushEnabledMemberIds();
  if (!storedMemberIds.includes(memberId)) return;
  await putValue(
    PUSH_ENABLED_MEMBER_IDS_KEY,
    storedMemberIds.filter((storedMemberId) => storedMemberId !== memberId),
  );
}
