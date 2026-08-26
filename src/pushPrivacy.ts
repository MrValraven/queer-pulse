/**
 * A LOCAL MIRROR of the member's server-side "hide notification previews"
 * choice, in the same tiny IndexedDB store as `pushLang.ts` (`qp-push` /
 * `prefs`), for the same reason: a service worker cannot reach `localStorage`
 * and has no synchronous view of React state.
 *
 * Why the setting exists: a push body is rendered on the lock screen, where
 * anyone holding the phone can read it. On a queer community platform that can
 * out someone to a flatmate, a family member, or a colleague. When the flag is
 * set, a notification says something arrived without saying who from or what it
 * said. The app still shows everything once it is open and unlocked.
 *
 * ---------------------------------------------------------------------------
 * THIS FILE IS NO LONGER THE AUTHORITY (ID-13)
 * ---------------------------------------------------------------------------
 * It used to be: the flag lived only here, and `sw.ts` read it inside its push
 * handler and rewrote the payload before `showNotification`. That silently did
 * nothing on iPhone, because iOS never runs the push handler's JavaScript. It
 * renders the payload's plain `title`/`body` itself, and the backend put the
 * sender's name in them. The toggle read "on" while the lock screen kept naming
 * people.
 *
 * The authority is now `member_preferences.hide_push_previews` on the server
 * (`GET|PUT /me/push-previews`), read per recipient by the composer, so a
 * hidden-preview payload never contains a name to begin with. That is what
 * fixes iOS, and it is also what carries the choice to a second device.
 *
 * This store stays for two jobs, both still worth having:
 *  1. DEFENCE IN DEPTH on engines that DO run the worker. If a payload ever
 *     reaches a device with more in it than it should (an older backend, or a
 *     type nobody routed through the privacy split), `sw.ts` still redacts it.
 *  2. It is readable synchronously-ish from the worker, where an authenticated
 *     API call is not available at push time.
 *
 * It is written by the app: on boot/sign-in from the server value
 * (`PushPreviewMirrorProvider`) and again whenever the member flips the toggle.
 * A stale or missing mirror is not a privacy hole any more, because the server
 * has already decided what the payload may say.
 *
 * DEFAULTS TO `true` (previews hidden), matching the server's
 * `DEFAULT_HIDE_PUSH_PREVIEWS`. A device that has never synced, or whose read
 * failed, redacts rather than reveals.
 */

const DB_NAME = "qp-push";
const DB_VERSION = 1;
const STORE_NAME = "prefs";
const HIDE_PREVIEWS_KEY = "hidePreviews";
const DEFAULT_HIDE_PREVIEWS = true;

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
 * Whether this browser can hold a mirror the service worker will ever read.
 *
 * Both halves matter: without `indexedDB` there is nowhere to write, and
 * without a service worker there is nobody to read it, since a push handler is
 * the only consumer. Callers use it to skip the sync entirely rather than fetch a
 * value they would then throw away.
 */
export function canMirrorHidePushPreviews(): boolean {
  return (
    typeof indexedDB !== "undefined" &&
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator
  );
}

/**
 * Write the mirror, best-effort and silent, which is the shape every caller
 * actually wants now that the server is authoritative.
 *
 * Silence is correct here in a way it was not before. When this file WAS the
 * authority, a failed write meant the lock screen kept showing previews the
 * member had asked to hide, so the failure had to reach them. Now the server
 * has already stripped the payload, and the mirror is only the worker's second
 * line of defence: failing to update it can leave this device redacting a
 * payload that no longer needs redacting, which costs the member nothing.
 *
 * Returns whether the write landed, for callers that want to log it.
 */
export async function mirrorHidePushPreviews(
  shouldHidePreviews: boolean,
): Promise<boolean> {
  try {
    await writeHidePushPreviews(shouldHidePreviews);
    return true;
  } catch {
    return false;
  }
}

/**
 * The raw write, which REPORTS failure. `mirrorHidePushPreviews` is the wrapper
 * to reach for; this stays exported for a caller that genuinely needs to know
 * whether IndexedDB accepted the value.
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
 * Read the mirror. The only caller that matters is `sw.ts`'s push handler.
 *
 * Never throws: a lookup failure must not stop a notification from showing. On
 * any error it returns the default, which now HIDES previews: the safe
 * direction for privacy. It used to return "show", which was the safe direction
 * for delivery and the wrong one for a member who had asked to be discreet; the
 * notification still arrives either way, it just says less.
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
