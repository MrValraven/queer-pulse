import { ApiError } from "./client";
import { asDetailSentence, reasonFor } from "./errorMessage";
import { logError } from "../observability/logger";
import {
  EMAIL_CODE_REASONS,
  SIGNUP_REJECTED_REASONS,
} from "../../features/auth/api/emailCodeFailure";

type ToastType = "success" | "error" | "info";
/** A toast's text: a title line, plus an optional detail line beneath it.
 *  Kept structural so this module stays clear of the component tree. */
interface ToastMessage {
  title: string;
  detail?: string;
}
type ToastEmitter = (
  message: string | ToastMessage,
  type?: ToastType,
  durationMs?: number,
) => void;

// The cache-level handlers run outside React, so a bridge component wires the
// live toast function + demo flag in (same pattern as AuthErrorToast).
let emit: ToastEmitter | null = null;
const demo = { current: false };

/**
 * Resolves an i18n key to the member's language. Wired in by
 * `QueryErrorToastBridge`, which has the `t()` these module-scope handlers
 * cannot reach. Until it is wired (and in tests) the English fallback below is
 * used, so behaviour never depends on the bridge having mounted.
 */
type Translator = (key: string, fallback: string) => string;
let translate: Translator | null = null;

/** Wire the live toast emitter (from inside React) into the cache handlers. */
export function setQueryErrorToastEmitter(fn: ToastEmitter | null): void {
  emit = fn;
}

/** Wire the i18n resolver (from inside React) into the cache handlers. */
export function setQueryErrorTranslator(fn: Translator | null): void {
  translate = fn;
}

/** Keep the handlers silent in demo mode (mock queryFns shouldn't surface). */
export function setQueryErrorDemoMode(isDemo: boolean): void {
  demo.current = isDemo;
}

/**
 * An error message as a catalog key plus its English text. These toasts fire at
 * the most stressful moments in the UI, so they must speak the member's
 * language; keeping the English alongside the key means a catalog that has not
 * shipped the key yet degrades to today's copy instead of a raw key string.
 */
interface ErrorCopy {
  key: string;
  fallback: string;
}

/** The two-line toast copy: a short title, plus the reason or the next step
 *  on the detail line beneath it. */
const TOAST_COPY = {
  serverTitle: {
    key: "shared:apiError.toast.serverTitle",
    fallback: "Something went wrong on our end",
  },
  serverDetail: {
    key: "shared:apiError.toast.serverDetail",
    fallback: "Please try again in a moment.",
  },
  failedTitle: {
    key: "shared:apiError.toast.failedTitle",
    fallback: "That didn't go through",
  },
  genericTitle: {
    key: "shared:apiError.toast.genericTitle",
    fallback: "Something went wrong",
  },
  retryDetail: {
    key: "shared:apiError.toast.retryDetail",
    fallback: "Please try again.",
  },
  offlineTitle: {
    key: "shared:apiError.toast.offlineTitle",
    fallback: "You're offline",
  },
  offlineDetail: {
    key: "shared:apiError.toast.offlineDetail",
    fallback: "Check your connection and try again.",
  },
  forbiddenTitle: {
    key: "shared:apiError.toast.forbiddenTitle",
    fallback: "You don't have access to that",
  },
  restrictedTitle: {
    key: "shared:apiError.toast.restrictedTitle",
    fallback: "A moderation restriction is in effect",
  },
  restrictedDetail: {
    key: "shared:apiError.toast.restrictedDetail",
    fallback: "You can appeal it from Safety, under Appeal a decision.",
  },
} satisfies Record<string, ErrorCopy>;

/** Coded refusals the member reads in their own language, ahead of the
 *  backend's English sentence. Additive: one entry per code. */
const CODED_COPY: Readonly<Record<string, ErrorCopy>> = {
  // PATCH /events/:slug would leave a quiz with adults rounds on an event
  // that is no longer 18+ (quizshow contract, section 3).
  quizshow_quiz_has_adults_rounds: {
    key: "shared:apiError.quizshowAdultsRounds",
    fallback:
      "This event's live game has adults rounds. Change their label in the Live game tab first, then turn off 18+",
  },
};

/** A `reasonFor` string is final as it stands: the backend's own sentence in
 *  English, or the translated status line `reasonFor` picks for every other
 *  language (PRD-467). */
function resolve(copy: ErrorCopy | string): string {
  if (typeof copy === "string") return copy;
  return translate ? translate(copy.key, copy.fallback) : copy.fallback;
}

/** The browser reports no network at all, so the toast can name that cause. */
function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/** Human toast copy for an error, or null when it should be handled elsewhere. */
function messageFor(error: unknown): ToastMessage | null {
  if (error instanceof ApiError) {
    if (error.status === 401) return null; // auth refresh / onAuthLost owns this
    const errorCode = (error.data as { code?: unknown } | null)?.code;
    const codedCopy =
      typeof errorCode === "string" && Object.hasOwn(CODED_COPY, errorCode)
        ? CODED_COPY[errorCode]
        : undefined;
    if (codedCopy) {
      return {
        title: resolve(TOAST_COPY.failedTitle),
        detail: asDetailSentence(resolve(codedCopy)),
      };
    }
    if (
      error.status === 503 &&
      (error.data as { code?: string } | null)?.code === "PLATFORM_LOCKED"
    )
      return null; // PlatformLockProvider owns this (maintenance screen)
    if (error.status === 404) return null; // pages own their empty state
    if (error.status >= 500) {
      return {
        title: resolve(TOAST_COPY.serverTitle),
        detail: resolve(TOAST_COPY.serverDetail),
      };
    }
    if (error.status === 403) {
      // A moderation restriction gets its own translated copy naming the
      // appeal, because the appeal is the only route out of a restriction.
      // Otherwise the member reads `reasonFor`'s reason: the backend's own
      // sentence in English, a translated status line in any other language.
      if (
        (error.data as { code?: string } | null)?.code === "ACCOUNT_RESTRICTED"
      ) {
        return {
          title: resolve(TOAST_COPY.restrictedTitle),
          detail: resolve(TOAST_COPY.restrictedDetail),
        };
      }
      const forbiddenReason = reasonFor(error);
      if (forbiddenReason) {
        return {
          title: resolve(TOAST_COPY.failedTitle),
          detail: asDetailSentence(resolve(forbiddenReason)),
        };
      }
      return { title: resolve(TOAST_COPY.forbiddenTitle) };
    }
    const reason = reasonFor(error);
    if (reason) {
      return {
        title: resolve(TOAST_COPY.failedTitle),
        detail: asDetailSentence(resolve(reason)),
      };
    }
    return { title: resolve(TOAST_COPY.genericTitle) };
  }
  // A raw network failure while the browser is offline names that cause and
  // the way out of it.
  if (isOffline()) {
    return {
      title: resolve(TOAST_COPY.offlineTitle),
      detail: resolve(TOAST_COPY.offlineDetail),
    };
  }
  const reason = reasonFor(error);
  if (reason) {
    return {
      title: resolve(TOAST_COPY.failedTitle),
      detail: asDetailSentence(resolve(reason)),
    };
  }
  return {
    title: resolve(TOAST_COPY.genericTitle),
    detail: resolve(TOAST_COPY.retryDetail),
  };
}

/**
 * A 401 is the backend saying "you are signed out", which is an answer rather
 * than a fault. Member-scoped queries also run for anonymous visitors, so
 * reporting these spent monitoring quota on every signed-out page load. The
 * auth refresh / `onAuthLost` path owns the real session-loss experience.
 */
function isSignedOutFailure(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

const EMAIL_CODE_REFUSAL_REASONS: ReadonlySet<unknown> = new Set([
  ...EMAIL_CODE_REASONS,
  ...SIGNUP_REJECTED_REASONS,
]);

/**
 * An email-code call the backend refused with a contract reason (a wrong
 * code, a cap reached, a signup refusal). The flow words each one on screen,
 * and they are everyday traffic, so they stay out of error monitoring.
 */
function isEmailCodeRefusal(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  const { data } = error;
  if (typeof data !== "object" || data === null) return false;
  return EMAIL_CODE_REFUSAL_REASONS.has((data as { reason?: unknown }).reason);
}

/**
 * Read failures the classification above already calls expected, so they must
 * never reach error monitoring: the signed-out 401, plus a 404 for a resource
 * that is genuinely gone (the page owns its empty state, and a member opening
 * a deleted thread is normal traffic), and a Studio release's coded 410.
 *
 * A PLATFORM_LOCKED 503 is deliberately absent. It is silent on screen only
 * because the maintenance screen replaces the toast, and an event telling us a
 * lockdown is being hit is worth having (asserted in errorHandling.test.ts).
 */
function isExpectedQueryFailure(error: unknown): boolean {
  if (isSignedOutFailure(error)) return true;
  if (isStudioWithdrawnFailure(error)) return true;
  return error instanceof ApiError && error.status === 404;
}

/** Coded 410s a Studio page renders as its own view: a release our team
 *  took down, and (Studio safety) a track a copyright claim holds offline.
 *  A listener opening one is normal traffic; a 410 with any other body
 *  stays reportable. */
const EXPECTED_STUDIO_GONE_CODES: ReadonlySet<string> = new Set([
  "studio_release_withdrawn",
  "studio_track_withheld",
]);

function isStudioWithdrawnFailure(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 410) return false;
  const body = error.data;
  if (typeof body !== "object" || body === null) return false;
  const code = (body as { code?: unknown }).code;
  return typeof code === "string" && EXPECTED_STUDIO_GONE_CODES.has(code);
}

/**
 * QueryCache onError: classify first, report only the unexpected, toast only an
 * unexpected 5xx (pages own the rest).
 *
 * The order is the contract. `isExpectedQueryFailure` runs before `logError`,
 * so an outcome this module already declines to show anyone files no monitoring
 * event either. Everything after that call is the member-facing half and is
 * untouched by the gate: the toast decisions read the same error and the same
 * query state they always did.
 *
 * Param types are kept structurally loose so they satisfy the cache callback
 * contract without importing react-query's deep generics.
 */
export function handleQueryError(
  error: unknown,
  query: {
    queryKey: unknown;
    state?: { data?: unknown };
    meta?: Record<string, unknown>;
  },
): void {
  if (!isExpectedQueryFailure(error)) {
    logError(error, { queryKey: query.queryKey });
  }
  if (demo.current) return;
  // Opt-out for queries whose failure is not the visitor's problem: they fail
  // soft by design and the page renders identically either way (see
  // usePlatformStatus). Reported above when unexpected, never toasted.
  if (query.meta?.silentError) return;
  // Background-refetch failure vs first-load failure. If the query already holds
  // cached data, that (stale-but-valid) data is still on screen and the page is
  // unchanged by this failure — a toast here would nag on every transient blip
  // behind an intact page (a tab regains focus, a poll fires on a flaky
  // connection). Only an *initial* load with no data yet leaves the user facing
  // an error/empty state that needs explaining. Reported above either way when
  // the failure was unexpected.
  if (query.state?.data !== undefined) return;
  if (error instanceof ApiError && error.status < 500) return;
  const message = messageFor(error);
  if (message) emit?.(message, "error", 6000);
}

/**
 * MutationCache onError: a failing write must always be visible to the member.
 * Same contract as the query handler on the monitoring side: classify first,
 * report only the unexpected.
 *
 * Only the signed-out 401 is excluded here. A 404 stays reportable on a write,
 * where it usually means a wrong endpoint path or a resource that vanished
 * under an action the member could still see, both of which are defects.
 *
 * Signature is positional per react-query:
 * (error, variables, onMutateResult, mutation).
 */
export function handleMutationError(
  error: unknown,
  _variables: unknown,
  _onMutateResult: unknown,
  mutation: {
    options: { mutationKey?: unknown; meta?: { silentError?: boolean } };
  },
): void {
  if (!isSignedOutFailure(error) && !isEmailCodeRefusal(error)) {
    logError(error, { mutationKey: mutation.options.mutationKey });
  }
  if (demo.current) return;
  if (mutation.options.meta?.silentError) return; // a component owns this write's error UI
  const message = messageFor(error);
  if (message) emit?.(message, "error", 6000);
}
