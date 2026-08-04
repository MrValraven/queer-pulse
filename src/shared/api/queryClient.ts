import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { ApiError } from "./client";
import { handleQueryError, handleMutationError } from "./errorHandling";

/**
 * Retry only transient failures, once. A deterministic client error (4xx) — a
 * 400 bad request, 401/403 auth denial, 404 not-found, 409 conflict, 422
 * validation — returns the identical result on an immediate re-request, so
 * retrying it only doubles the time-to-error and the backend load for no gain.
 * The transient classes DO benefit: a network fault (an `Error` with no HTTP
 * status), a 5xx, and our own 408 timeout (`ApiError` from a hung backend, see
 * client.ts) can each succeed on a second try.
 */
function retryTransientOnce(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    // 408 is our synthetic "backend timed out" — transient, so retry it once;
    // every other 4xx is deterministic and not worth a second request.
    return error.status === 408 && failureCount < 1;
  }
  return failureCount < 1;
}

/** App-wide query client. Conservative defaults for a community app.
 *  Cache-level `onError` handlers log every failure and surface it as a toast
 *  when appropriate (see errorHandling.ts) — silent in demo mode. */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleQueryError }),
  mutationCache: new MutationCache({ onError: handleMutationError }),
  defaultOptions: {
    queries: {
      retry: retryTransientOnce,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
