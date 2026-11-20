import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import {
  isDebounceSettling,
  useDebouncedValue,
} from "../../../../shared/hooks/useDebouncedValue";
import { searchCulturalStaff } from "./culturalProduction.api";
import {
  CULTURAL_SEARCH_QUERY_MAX,
  type CulturalStaffSummaryDTO,
} from "./culturalProduction.types";
import { culturalKeys } from "./culturalProductionKeys";

const SEARCH_DEBOUNCE_MS = 250;
const LIVE_STALE_MS = 30_000;

/** The staff picker's search state (the `LeadStaffSearch` shape). */
export interface CulturalStaffSearch {
  term: string;
  results: CulturalStaffSummaryDTO[];
  isSearching: boolean;
  isError: boolean;
  error: unknown;
  retry: () => void;
}

/** One shared empty list, so a caller's memo over `results` stays stable. */
const NO_RESULTS: CulturalStaffSummaryDTO[] = [];

/**
 * The staff picker's search. The typed text is trimmed and cut to 100 code
 * points, then debounced by 250ms. A blank term also asks the server, which
 * answers the short preview list (the viewer first). While the next term
 * loads, the previous results stay on screen. The key holds typed text, so
 * it stays out of error reports.
 */
export function useCulturalStaffSearch(query: string): CulturalStaffSearch {
  const { demoMode } = useDemoMode();
  const typedTerm = Array.from(query.trim())
    .slice(0, CULTURAL_SEARCH_QUERY_MAX)
    .join("");
  const debouncedTerm = useDebouncedValue(typedTerm, SEARCH_DEBOUNCE_MS);
  // A cleared field skips the debounce, so the preview list asks at once.
  const term = typedTerm === "" ? "" : debouncedTerm;
  const searchQuery = useQuery<CulturalStaffSummaryDTO[]>({
    queryKey: culturalKeys.staffSearch(term, demoMode),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : LIVE_STALE_MS,
    placeholderData: keepPreviousData,
    meta: { silentError: true, isPrivateQueryKey: true },
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { demoSearchCulturalStaff } =
          await import("../culturalProductionDemoStore");
        return demoSearchCulturalStaff(term);
      }
      return searchCulturalStaff(term, signal);
    },
  });
  const isWaitingForDebounce =
    typedTerm !== "" && isDebounceSettling(typedTerm, term);
  // The last term's results leave with a cleared field and never stand in
  // for the preview list.
  const isClearedWithOldResults = term === "" && searchQuery.isPlaceholderData;
  return {
    term,
    results: isClearedWithOldResults
      ? NO_RESULTS
      : (searchQuery.data ?? NO_RESULTS),
    isSearching: isWaitingForDebounce || searchQuery.isFetching,
    isError: searchQuery.isError,
    error: searchQuery.error,
    retry: () => {
      void searchQuery.refetch();
    },
  };
}
