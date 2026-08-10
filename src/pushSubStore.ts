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
 *    subscription actually matches what the server has on file — so it also
 *    remembers the last endpoint it successfully synced.
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
const LAST_SYNCED_ENDPOINT_KEY = "lastSyncedEndpoint";

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

/**
 * Remember the endpoint the app last successfully POSTed to
 * `/push/subscribe`, so a later boot can detect drift (the live
 * `pushManager` subscription's endpoint no longer matches what the server
 * has on file) even when no `pushsubscriptionchange` event fired.
 */
export async function writeLastSyncedEndpoint(url: string): Promise<void> {
  await putValue(LAST_SYNCED_ENDPOINT_KEY, url);
}

/** Read the last endpoint synced to the server. `undefined` when unset. */
export async function readLastSyncedEndpoint(): Promise<string | undefined> {
  return getValue<string>(LAST_SYNCED_ENDPOINT_KEY);
}
