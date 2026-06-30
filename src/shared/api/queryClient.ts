import { QueryClient } from "@tanstack/react-query";

/** App-wide query client. Conservative defaults for a community app. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
