/**
 * Persists the member's "hide notification previews" choice so the service
 * worker can honour it. Same shape and same tiny IndexedDB store as
 * `pushLang.ts` (`qp-push` / `prefs`), for the same reason: a worker cannot
 * reach `localStorage` and has no synchronous view of React state.
 *
 * Why this exists: a push body is rendered on the lock screen, where anyone
 * holding the phone can read it. On a queer community platform that can out
 * someone to a flatmate, a family member, or a colleague. When this flag is
 * set, `sw.ts` shows a generic title and body and drops any preview image, so
 * a notification says a message arrived without saying who from or what it
 * said. The app still shows everything once it is open and unlocked.
 *
 * Defaults to `false` (previews shown), matching the behaviour that shipped
 * before this option existed, so an upgrade never silently changes what a
 * member already sees.
 */

const DB_NAME = "qp-push";
const DB_VERSION = 1;
const STORE_NAME = "prefs";
const HIDE_PREVIEWS_KEY = "hidePreviews";
const DEFAULT_HIDE_PREVIEWS = false;

// IDBRequest/IDBTransaction's `.error` is a `DOMException | null`, not
// statically an `Error`, so reject with a real Error and fold the
// DOMException's message in when there is one.
function rejectionError(domException: unknown): Error {
  return domException instanceof Error
    ? domException
    : new Error("IndexedDB request failed");
}

function openPushDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    // Must match pushLang.ts: both modules open the same database at the same
    // version, so whichever runs first has to create the shared store.
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

/**
 * Persist the choice from the window context (the settings toggle). Unlike
 * `writePushLang` this one REPORTS failure, because the caller is a member
 * flipping a privacy control: silently failing would leave the UI claiming
 * previews are hidden while the worker keeps showing them.
 */
export async function writeHidePushPreviews(
  shouldHidePreviews: boolean,
): Promise<void> {
  if (typeof indexedDB === "undefined") {
    throw new Error("IndexedDB is unavailable");
  }
  const db = await openPushDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(shouldHidePreviews, HIDE_PREVIEWS_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(rejectionError(tx.error));
    });
  } finally {
    db.close();
  }
}

/**
 * Read the choice. Used by `sw.ts`'s push handler and by the settings row to
 * seed the toggle. Never throws: a lookup failure must not stop a
 * notification from showing. On any error it returns the default, which shows
 * previews. That is the safe direction for delivery but the unsafe direction
 * for privacy, so the failure is deliberately silent only here, where the
 * alternative is dropping the notification entirely.
 */
export async function readHidePushPreviews(): Promise<boolean> {
  if (typeof indexedDB === "undefined") return DEFAULT_HIDE_PREVIEWS;
  try {
    const db = await openPushDb();
    try {
      const value = await new Promise<unknown>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const request = tx.objectStore(STORE_NAME).get(HIDE_PREVIEWS_KEY);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(rejectionError(request.error));
      });
      return typeof value === "boolean" ? value : DEFAULT_HIDE_PREVIEWS;
    } finally {
      db.close();
    }
  } catch {
    return DEFAULT_HIDE_PREVIEWS;
  }
}
