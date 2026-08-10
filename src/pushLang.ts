import type { PushLang } from "./pushMessages";

/**
 * Persists the app's active language so the service worker — which cannot
 * reach `localStorage` from a worker context, and has no synchronous access
 * to the app's React state — can localize a push notification's copy. Both
 * sides open the SAME tiny IndexedDB store: `writePushLang` runs in the
 * window (app boot + every language switch); `readPushLang` runs inside
 * `sw.ts`'s push handler.
 */

export type { PushLang };

const DB_NAME = "qp-push";
const DB_VERSION = 1;
const STORE_NAME = "prefs";
const LANG_KEY = "lang";
const DEFAULT_LANG: PushLang = "en";

function isPushLang(value: unknown): value is PushLang {
  return value === "en" || value === "pt";
}

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

/**
 * Persist the active language for SW-side push localization. Called from the
 * window context on i18n boot and on every language switch. Best-effort and
 * silent: IndexedDB being unavailable (SSR, a locked-down browser context, a
 * test environment) or a write failing must never block app boot or the
 * language switch it's piggybacking on — the SW simply falls back to English
 * next time it reads.
 */
export async function writePushLang(lang: PushLang): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try {
    const db = await openPushDb();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(lang, LANG_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(rejectionError(tx.error));
      });
    } finally {
      db.close();
    }
  } catch {
    // Best-effort — see doc comment above.
  }
}

/**
 * Read the persisted language from the SW's push handler. Defaults to `"en"`
 * when unset, on any error, or when IndexedDB isn't available — never throws,
 * since a lookup failure must not stop the notification from showing.
 */
export async function readPushLang(): Promise<PushLang> {
  if (typeof indexedDB === "undefined") return DEFAULT_LANG;
  try {
    const db = await openPushDb();
    try {
      const value = await new Promise<unknown>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const request = tx.objectStore(STORE_NAME).get(LANG_KEY);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(rejectionError(request.error));
      });
      return isPushLang(value) ? value : DEFAULT_LANG;
    } finally {
      db.close();
    }
  } catch {
    return DEFAULT_LANG;
  }
}
