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

/** Wire the live toast emitter (from inside React) into the cache handlers. */
export function setQueryErrorToastEmitter(fn: ToastEmitter | null): void {
  emit = fn;
}

/** Keep the handlers silent in demo mode (mock queryFns shouldn't surface). */
export function setQueryErrorDemoMode(isDemo: boolean): void {
  demo.current = isDemo;
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
    if (error.status >= 500)
      return "Something went wrong on our end — please try again.";
    if (error.status === 403)
      return reasonFor(error) ?? "You don't have access to that.";
    return reasonFor(error) ?? "Something went wrong.";
  }
  return reasonFor(error) ?? "Something went wrong — please try again.";
}

/** QueryCache onError: log always; toast only unexpected 5xx (pages own the rest).
 *  Param types are kept structurally loose so they satisfy the cache callback
 *  contract without importing react-query's deep generics. */
export function handleQueryError(
  error: unknown,
  query: { queryKey: unknown; meta?: Record<string, unknown> },
): void {
  logError(error, { queryKey: query.queryKey });
  if (demo.current) return;
  // Opt-out for queries whose failure is not the visitor's problem: they fail
  // soft by design and the page renders identically either way (see
  // usePlatformStatus). Logged above, never toasted.
  if (query.meta?.silentError) return;
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
  mutation: { options: { mutationKey?: unknown; meta?: { silentError?: boolean } } },
): void {
  logError(error, { mutationKey: mutation.options.mutationKey });
  if (demo.current) return;
  if (mutation.options.meta?.silentError) return; // a component owns this write's error UI
  const msg = messageFor(error);
  if (msg) emit?.(msg, "error", 6000);
}
