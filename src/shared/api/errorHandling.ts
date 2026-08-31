import { ApiError } from "./client";
import { reasonFor } from "./errorMessage";
import { logError } from "../observability/logger";

type ToastType = "success" | "error" | "info";
type ToastEmitter = (
  message: string,
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

const COPY = {
  server: {
    key: "shared:apiError.server",
    fallback: "Something went wrong on our end. Please try again.",
  },
  forbidden: {
    key: "shared:apiError.forbidden",
    fallback: "You don't have access to that.",
  },
  accountRestricted: {
    key: "shared:apiError.accountRestricted",
    fallback:
      "You can't do that while a moderation restriction is in effect. You can appeal it from your account settings.",
  },
  generic: {
    key: "shared:apiError.generic",
    fallback: "Something went wrong.",
  },
  genericRetry: {
    key: "shared:apiError.genericRetry",
    fallback: "Something went wrong. Please try again.",
  },
} satisfies Record<string, ErrorCopy>;

/** A `reasonFor` string is already the backend's own text — never translated. */
function resolve(copy: ErrorCopy | string): string {
  if (typeof copy === "string") return copy;
  return translate ? translate(copy.key, copy.fallback) : copy.fallback;
}

/** Human message for an error, or null when it should be handled elsewhere. */
function messageFor(error: unknown): string | null {
  if (error instanceof ApiError) {
    if (error.status === 401) return null; // auth refresh / onAuthLost owns this
    if (
      error.status === 503 &&
      (error.data as { code?: string } | null)?.code === "PLATFORM_LOCKED"
    )
      return null; // PlatformLockProvider owns this (maintenance screen)
    if (error.status === 404) return null; // pages own their empty state
    if (error.status >= 500) return resolve(COPY.server);
    if (error.status === 403) {
      // A moderation restriction gets its own translated copy naming the
      // appeal, because the appeal is the only route out of a restriction.
      // Otherwise the member reads the backend's English sentence, which
      // `reasonFor` deliberately passes through untranslated.
      if (
        (error.data as { code?: string } | null)?.code === "ACCOUNT_RESTRICTED"
      ) {
        return resolve(COPY.accountRestricted);
      }
      return resolve(reasonFor(error) ?? COPY.forbidden);
    }
    return resolve(reasonFor(error) ?? COPY.generic);
  }
  return resolve(reasonFor(error) ?? COPY.genericRetry);
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

/**
 * Read failures the classification above already calls expected, so they must
 * never reach error monitoring: the signed-out 401, plus a 404 for a resource
 * that is genuinely gone (the page owns its empty state, and a member opening
 * a deleted thread is normal traffic).
 *
 * A PLATFORM_LOCKED 503 is deliberately absent. It is silent on screen only
 * because the maintenance screen replaces the toast, and an event telling us a
 * lockdown is being hit is worth having (asserted in errorHandling.test.ts).
 */
function isExpectedQueryFailure(error: unknown): boolean {
  if (isSignedOutFailure(error)) return true;
  return error instanceof ApiError && error.status === 404;
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
  const msg = messageFor(error);
  if (msg) emit?.(msg, "error", 6000);
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
  if (!isSignedOutFailure(error)) {
    logError(error, { mutationKey: mutation.options.mutationKey });
  }
  if (demo.current) return;
  if (mutation.options.meta?.silentError) return; // a component owns this write's error UI
  const msg = messageFor(error);
  if (msg) emit?.(msg, "error", 6000);
}
