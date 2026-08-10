/**
 * Focus-aware push suppression. A push notification for a conversation the
 * recipient is *already looking at, in a focused window* is noise — Signal,
 * WhatsApp and Telegram all suppress it. This module holds the pure decision
 * so `sw.ts`'s push handler (which has to call `clients.matchAll()`, an
 * unmockable browser API) can stay a thin wrapper around a testable predicate.
 *
 * Deliberately conservative per the design doc: only the exact-match,
 * currently-focused case suppresses. Anything else (no focused client, a
 * focused client on a different conversation/page, a background/unfocused
 * client on the same conversation) must still show the notification.
 */

/**
 * True when `clientUrl` (an open window's current URL, e.g. from
 * `WindowClient.url`) is already showing the push's target (`dataUrl`, e.g.
 * `payload.data.url` — typically a same-origin relative path like
 * `"/messages?c=conv-1"`). Compares origin + pathname + search exactly, so a
 * different conversation (`?c=conv-2`) or the bare list view (no `?c=`) is
 * correctly treated as "not viewing it" and never suppresses.
 *
 * Resolves `dataUrl` against `clientUrl` as its base, so both an absolute
 * https URL and a relative path work. Never throws: a malformed URL on
 * either side returns `false` (never suppress on uncertainty).
 */
export function isViewingTarget(clientUrl: string, dataUrl: string): boolean {
  if (!clientUrl || !dataUrl) return false;
  try {
    const client = new URL(clientUrl);
    const target = new URL(dataUrl, clientUrl);
    return (
      client.origin === target.origin &&
      client.pathname === target.pathname &&
      client.search === target.search
    );
  } catch {
    return false;
  }
}
