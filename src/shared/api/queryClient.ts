import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { handleQueryError, handleMutationError } from "./errorHandling";

/** App-wide query client. Conservative defaults for a community app.
 *  Cache-level `onError` handlers log every failure and surface it as a toast
 *  when appropriate (see errorHandling.ts) — silent in demo mode. */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleQueryError }),
  mutationCache: new MutationCache({ onError: handleMutationError }),
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
