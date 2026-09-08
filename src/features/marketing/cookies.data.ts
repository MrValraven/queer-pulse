/**
 * The cookie catalog that used to live here is gone. It published seven names
 * (`qp_session`, `qp_csrf`, `qp_auth`, `qp_prefs`, `qp_theme`, `qp_lang`,
 * `qp_notif`) that **nothing in either repo ever set** — a transparency page
 * that was itself inaccurate. The real, verified list of every cookie and
 * every piece of device storage now lives in ONE place, rendered by both the
 * `/cookies` page and the in-app preference center:
 *
 *     src/shared/consent/storageInventory.ts
 *
 * Adding a cookie or a storage key means adding a row there.
 *
 * What remains below is unrelated to that catalog and genuinely in use.
 */

/** localStorage key that records an explicit sign-out for the prototype auth state. */
export const AUTH_STORAGE_KEY = "qp_logged_in";
