/**
 * Guard an untrusted redirect target (a `?next=`, a notification deep-link)
 * before it reaches `navigate()`, an `<a href>`, or the backend OAuth `redirect`
 * param, so it can never become an open redirect to another origin.
 *
 * A naive `startsWith("/") && !startsWith("//")` check blocks `//evil.com` but
 * still lets through `/\evil.com`, `/\/evil.com`, and control-character tricks:
 * several browsers normalize a backslash in a `Location:` header to a forward
 * slash, turning `/\evil.com` into protocol-relative `//evil.com`, and embedded
 * tab/newline/NUL characters can be stripped mid-parse to reveal a new host.
 *
 * This helper rejects any backslash or control character up front, then parses
 * the value against the current origin and returns the path portion only when
 * the resolved origin matches. Anything that fails to parse, points off-origin,
 * or is not a string returns `fallback` (a safe same-origin default).
 *
 * Runs in the window/document context (it reads `window.location.origin`). The
 * ServiceWorker has no `window`, so `sw.ts` keeps a small local copy of this
 * same logic built on `self.location.origin`; keep the two in sync.
 */
export function safeInternalPath(next: unknown, fallback = "/feed"): string {
  if (typeof next !== "string") return fallback;
  // Backslashes and control chars (tab/newline/NUL, U+0000-U+001F and U+007F)
  // are never legitimate in an internal path and are the exact characters used
  // to smuggle a foreign host past a naive prefix check.
  // eslint-disable-next-line no-control-regex
  if (/[\\\u0000-\u001f\u007f]/.test(next)) return fallback;
  try {
    const parsed = new URL(next, window.location.origin);
    if (parsed.origin !== window.location.origin) return fallback;
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return fallback;
  }
}
