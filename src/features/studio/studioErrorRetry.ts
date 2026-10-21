import { createContext, useContext } from "react";

export interface StudioErrorRetry {
  /** Re-renders the page that crashed. */
  onRetry: () => void;
  /** A Retry already ran since the last navigation; the page offers a full
   *  reload instead, which also picks up a newer build. */
  hasRetried: boolean;
}

/** Set by StudioErrorBoundary around its 500 fallback. Absent on the
 *  /studio/500 route itself, where Retry reloads the tab. */
const StudioErrorRetryContext = createContext<StudioErrorRetry | null>(null);

export const StudioErrorRetryProvider = StudioErrorRetryContext.Provider;

export function useStudioErrorRetry(): StudioErrorRetry | null {
  return useContext(StudioErrorRetryContext);
}
