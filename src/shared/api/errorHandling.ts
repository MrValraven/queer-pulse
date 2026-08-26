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

/** QueryCache onError: log always; toast only unexpected 5xx (pages own the rest).
 *  Param types are kept structurally loose so they satisfy the cache callback
 *  contract without importing react-query's deep generics. */
export function handleQueryError(
  error: unknown,
  query: {
    queryKey: unknown;
    state?: { data?: unknown };
    meta?: Record<string, unknown>;
  },
): void {
  logError(error, { queryKey: query.queryKey });
  if (demo.current) return;
  // Opt-out for queries whose failure is not the visitor's problem: they fail
  // soft by design and the page renders identically either way (see
  // usePlatformStatus). Logged above, never toasted.
  if (query.meta?.silentError) return;
  // Background-refetch failure vs first-load failure. If the query already holds
  // cached data, that (stale-but-valid) data is still on screen and the page is
  // unchanged by this failure — a toast here would nag on every transient blip
  // behind an intact page (a tab regains focus, a poll fires on a flaky
  // connection). Only an *initial* load with no data yet leaves the user facing
  // an error/empty state that needs explaining. Logged above either way.
  if (query.state?.data !== undefined) return;
  if (error instanceof ApiError && error.status < 500) return;
  const msg = messageFor(error);
  if (msg) emit?.(msg, "error", 6000);
}

/** MutationCache onError: a failing write must always be visible. Signature is
 *  positional per react-query: (error, variables, onMutateResult, mutation). */
export function handleMutationError(
  error: unknown,
  _variables: unknown,
  _onMutateResult: unknown,
  mutation: {
    options: { mutationKey?: unknown; meta?: { silentError?: boolean } };
  },
): void {
  logError(error, { mutationKey: mutation.options.mutationKey });
  if (demo.current) return;
  if (mutation.options.meta?.silentError) return; // a component owns this write's error UI
  const msg = messageFor(error);
  if (msg) emit?.(msg, "error", 6000);
}
