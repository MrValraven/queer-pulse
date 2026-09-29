import { ApiError } from "./client";

/** Messages that are just the HTTP status text carry no information — the API
 *  client falls back to `res.statusText` when the error body had no `message`.
 *  Treat these as "no specific reason" so we show a friendly frame instead. */
const BARE_STATUS_WORDS = new Set([
  "bad request",
  "unauthorized",
  "forbidden",
  "not found",
  "conflict",
  "gone",
  "unprocessable entity",
  "too many requests",
  "internal server error",
]);

function isPlatformLocked(error: ApiError): boolean {
  return (
    error.status === 503 &&
    (error.data as { code?: string } | null)?.code === "PLATFORM_LOCKED"
  );
}

/** ENG-450: a co-owner invite (send or accept) refused because of a block
 *  between the invitee and a persona's current owners, or its inviter. Its
 *  raw backend message is deliberately plain, untranslated English. A caller
 *  checks this code first and shows its own translated copy for it, the way
 *  `InviteCoOwnerModal` and `PersonaInvitesBanner` do, keeping that string out
 *  of the `reasonFor` result entirely. */
export function isInviteBlocked(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.data as { code?: string } | null)?.code ===
      "SUBPROFILE_INVITE_BLOCKED"
  );
}

/** ENG-448: a write refused because a moderation restriction is in effect on
 *  the member's account. The backend's sentence names the appeal, so a caller
 *  that handles its own errors (a `silentError` mutation) checks this first
 *  and shows `shared:apiError.accountRestricted`, the copy the global handler
 *  uses. `reasonFor` still returns the server's message for it (every other
 *  caller relies on that reason to show the appeal), so a caller that wants
 *  its own translated copy must check `isAccountRestricted` before calling
 *  `reasonFor` or `describeError`. */
export function isAccountRestricted(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 403 &&
    (error.data as { code?: string } | null)?.code === "ACCOUNT_RESTRICTED"
  );
}

function isMeaningfulMessage(message: string): boolean {
  const trimmed = message.trim();
  return trimmed.length > 0 && !BARE_STATUS_WORDS.has(trimmed.toLowerCase());
}

/**
 * The specific, user-appropriate reason for a failure — or `null` when there
 * isn't one we should show the user. Only an `ApiError` can carry a shown
 * reason, and only when it's a 4xx with a meaningful message:
 *  - 401 / 404 / PLATFORM_LOCKED 503 / SUBPROFILE_INVITE_BLOCKED are owned by
 *    other UI (auth, empty states, the maintenance screen, the invite flow's
 *    own translated copy);
 *  - 5xx must never leak server internals.
 * ACCOUNT_RESTRICTED 403 is not filtered here: its server message is the
 * reason most callers show. A caller that wants the translated appeal copy
 * instead must check `isAccountRestricted(error)` before calling this.
 * Every non-`ApiError` — plain `Error`/`TypeError`/`SyntaxError`, raw network
 * failures, anything else — returns `null` so the caller falls back to its
 * friendly generic instead of surfacing raw runtime noise.
 */
export function reasonFor(error: unknown): string | null {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 404) return null;
    if (isPlatformLocked(error)) return null;
    if (isInviteBlocked(error)) return null;
    if (error.status >= 500) return null;
    return isMeaningfulMessage(error.message) ? error.message.trim() : null;
  }
  return null;
}

/**
 * A user-facing error string: an action frame plus the specific reason when we
 * have one, otherwise the friendly fallback.
 *   describeError("Couldn't save that co-op", err)
 *     → "Couldn't save that co-op: That name is taken."   (reason present)
 *     → "Couldn't save that co-op. Please try again."      (no reason)
 * `action` is a capitalized phrase with no trailing punctuation.
 */
export function describeError(
  action: string,
  error: unknown,
  /**
   * The "please try again" tail, so a caller with a `t()` in hand can hand in
   * the member's language. Defaults to the English this has always emitted, so
   * every existing call site is unchanged; new call sites should pass
   * `t("shared:apiError.tryAgainTail")`. The `action` frame is the caller's to
   * translate too — pass a `t()` string, never a literal.
   */
  retryTail = " Please try again.",
): string {
  const reason = reasonFor(error);
  if (reason) {
    const withoutTrailingPeriod = reason.replace(/\.$/, "");
    return `${action}: ${withoutTrailingPeriod}.`;
  }
  return `${action}.${retryTail}`;
}
