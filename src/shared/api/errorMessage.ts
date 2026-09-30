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

/**
 * Resolves a catalog key to the member's language, falling back to the English
 * passed alongside it when the catalog has no entry. Same contract as the
 * translator `errorHandling.ts` receives.
 */
export type ErrorReasonTranslator = (key: string, fallback: string) => string;

/** What `reasonFor` and `describeError` need to speak the member's language. */
export interface ErrorReasonLocale {
  translate: ErrorReasonTranslator;
  /** The resolved UI language code ("en", "pt", ...). */
  getLanguage: () => string;
}

/**
 * Wired in by `QueryErrorToastBridge`, the same boot site that wires the toast
 * handlers, because these helpers run outside React and cannot call hooks.
 * Until it is wired (early boot, and every unit test that does not set it)
 * both helpers keep their English output.
 */
let reasonLocale: ErrorReasonLocale | null = null;

/** Wire the i18n resolver and language (from inside React) into these helpers. */
export function setErrorReasonLocale(locale: ErrorReasonLocale | null): void {
  reasonLocale = locale;
}

/** A catalog key plus its English text, kept identical to the EN catalog. */
export interface ReasonCopy {
  key: string;
  fallback: string;
}

/** The translated copy for a restricted account, shared with the global toast. */
export const ACCOUNT_RESTRICTED_COPY: ReasonCopy = {
  key: "shared:apiError.accountRestricted",
  fallback:
    "You can't do that while a moderation restriction is in effect. You can appeal it from your account settings.",
};

/**
 * PRD-467: the translated stand-in for a backend sentence, chosen by status.
 * The backend writes its refusals in English only, so a member reading any
 * other language gets one of these plain lines in their own language.
 */
const STATUS_REASON_COPY = {
  invalid: {
    key: "shared:apiError.reasonInvalid",
    fallback: "Some details weren't accepted. Check them and try again.",
  },
  forbidden: {
    key: "shared:apiError.forbidden",
    fallback: "You don't have access to that.",
  },
  conflict: {
    key: "shared:apiError.reasonConflict",
    fallback: "This changed or already exists. Refresh and try again.",
  },
  gone: {
    key: "shared:apiError.reasonGone",
    fallback: "This is no longer available.",
  },
  tooLarge: {
    key: "shared:apiError.reasonTooLarge",
    fallback: "That's too large to send.",
  },
  rateLimited: {
    key: "shared:apiError.reasonRateLimited",
    fallback: "Too many attempts. Wait a moment and try again.",
  },
  generic: {
    key: "shared:apiError.generic",
    fallback: "Something went wrong.",
  },
} satisfies Record<string, ReasonCopy>;

const DEFAULT_RETRY_TAIL: ReasonCopy = {
  key: "shared:apiError.tryAgainTail",
  fallback: " Please try again.",
};

/** The registered locale when the member reads a language other than English. */
function nonEnglishLocale(): ErrorReasonLocale | null {
  if (!reasonLocale) return null;
  const language = reasonLocale.getLanguage().toLowerCase();
  return language.startsWith("en") ? null : reasonLocale;
}

function statusReasonCopy(error: ApiError): ReasonCopy {
  if (isAccountRestricted(error)) return ACCOUNT_RESTRICTED_COPY;
  switch (error.status) {
    case 400:
    case 422:
      return STATUS_REASON_COPY.invalid;
    case 403:
      return STATUS_REASON_COPY.forbidden;
    case 409:
      return STATUS_REASON_COPY.conflict;
    case 410:
      return STATUS_REASON_COPY.gone;
    case 413:
      return STATUS_REASON_COPY.tooLarge;
    case 429:
      return STATUS_REASON_COPY.rateLimited;
    default:
      return STATUS_REASON_COPY.generic;
  }
}

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
 *  uses. In English `reasonFor` still returns the server's message for it
 *  (every other caller relies on that reason to show the appeal), so a caller
 *  that wants its own translated copy must check `isAccountRestricted` before
 *  calling `reasonFor` or `describeError`. */
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
 *
 * PRD-467: the backend's sentence is English only. When the member reads
 * another language (see `setErrorReasonLocale`), the same cases return a
 * translated line chosen by status, and ACCOUNT_RESTRICTED returns the
 * translated appeal copy. English output is unchanged.
 */
export function reasonFor(error: unknown): string | null {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 404) return null;
    if (isPlatformLocked(error)) return null;
    if (isInviteBlocked(error)) return null;
    if (error.status >= 500) return null;
    if (!isMeaningfulMessage(error.message)) return null;
    const locale = nonEnglishLocale();
    if (locale) {
      const copy = statusReasonCopy(error);
      return locale.translate(copy.key, copy.fallback);
    }
    return error.message.trim();
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
   * the member's language. Defaults to `shared:apiError.tryAgainTail` once
   * `setErrorReasonLocale` has wired a translator, and to the English this has
   * always emitted before that (early boot, unit tests). The `action` frame is
   * the caller's to translate too: pass a `t()` string.
   */
  retryTail?: string,
): string {
  const reason = reasonFor(error);
  if (reason) {
    const withoutTrailingPeriod = reason.replace(/\.$/, "");
    return `${action}: ${withoutTrailingPeriod}.`;
  }
  return `${action}.${retryTail ?? defaultRetryTail()}`;
}

function defaultRetryTail(): string {
  return reasonLocale
    ? reasonLocale.translate(
        DEFAULT_RETRY_TAIL.key,
        DEFAULT_RETRY_TAIL.fallback,
      )
    : DEFAULT_RETRY_TAIL.fallback;
}
