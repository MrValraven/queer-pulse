import { useState } from "react";
import type { SimilarThread } from "./useSimilarThreads";

// ── What "Already discussed?" is allowed to claim ───────────────────────────
// A new search empties the list while it is in flight. This hook holds the
// last real answer through that window so the block does not fold and regrow
// on every debounce. (`useSimilarThreads` itself reports, through
// `isAwaitingFirstSearch`, when a searchable title has not been searched yet.)

export interface SimilarResults {
  threads: readonly SimilarThread[];
  isDuplicate: boolean;
  duplicateTitle: string | null;
}

/** The latest results that were not mid-search. `useSimilarThreads` hands
 *  back stable arrays, so the render-time update settles in one pass. */
export function useSettledResults(
  results: SimilarResults,
  isLoading: boolean,
): SimilarResults {
  const [settled, setSettled] = useState(results);
  const hasChanged =
    settled.threads !== results.threads ||
    settled.isDuplicate !== results.isDuplicate ||
    settled.duplicateTitle !== results.duplicateTitle;
  if (!isLoading && hasChanged) setSettled(results);
  return isLoading ? settled : results;
}
