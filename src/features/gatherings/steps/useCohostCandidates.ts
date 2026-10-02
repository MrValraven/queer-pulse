import {
  useConnectionCandidates,
  type ConnectionCandidates,
} from "../../connect/useConnectionCandidates";
import {
  COHOST_RESULT_LIMIT,
  COHOST_SEARCH_DEBOUNCE_MS,
} from "./whoChapter.data";

export type CohostCandidates = ConnectionCandidates;

/** The co-host picker's candidates: the host's connections, at the co-host
 *  list's size and pace (see `useConnectionCandidates`). */
export function useCohostCandidates(params: {
  searchTerm: string;
  hasOpenedList: boolean;
  pickedSlugs: readonly string[];
}): CohostCandidates {
  return useConnectionCandidates({
    ...params,
    resultLimit: COHOST_RESULT_LIMIT,
    debounceMs: COHOST_SEARCH_DEBOUNCE_MS,
  });
}
