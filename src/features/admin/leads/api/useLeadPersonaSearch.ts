import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import {
  isDebounceSettling,
  useDebouncedValue,
} from "../../../../shared/hooks/useDebouncedValue";
import { searchLeadPersonas } from "./leads.api";
import { leadKeys } from "./leadKeys";
import {
  LEAD_SEARCH_QUERY_MAX,
  type LeadPersonaSearch,
  type LeadPersonaSearchResultDTO,
} from "./leads.types";

const SEARCH_DEBOUNCE_MS = 250;
const LIVE_STALE_MS = 30_000;

/** One shared empty list, so a caller's memo over `results` stays stable. */
const NO_RESULTS: LeadPersonaSearchResultDTO[] = [];

/**
 * The Link persona dialog's search. The typed text is trimmed and cut to
 * 100 code points, then debounced by 250ms. A blank term sends no request,
 * since the server answers an empty list for it anyway. While the next term
 * loads, the previous results stay on screen.
 */
export function useLeadPersonaSearch(query: string): LeadPersonaSearch {
  const { demoMode } = useDemoMode();
  const typedTerm = Array.from(query.trim())
    .slice(0, LEAD_SEARCH_QUERY_MAX)
    .join("");
  const debouncedTerm = useDebouncedValue(typedTerm, SEARCH_DEBOUNCE_MS);
  // A cleared field skips the debounce, so the idle prompt shows at once and
  // the last term's results leave with it.
  const term = typedTerm === "" ? "" : debouncedTerm;
  const isEnabled = term.length > 0;
  const searchQuery = useQuery<LeadPersonaSearchResultDTO[]>({
    queryKey: leadKeys.personaSearch(term, demoMode),
    enabled: isEnabled,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : LIVE_STALE_MS,
    placeholderData: keepPreviousData,
    meta: { silentError: true, isPrivateQueryKey: true },
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { demoSearchLeadPersonas } = await import("../leadsDemoStore");
        return demoSearchLeadPersonas(term);
      }
      return searchLeadPersonas(term, signal);
    },
  });
  const isWaitingForDebounce =
    typedTerm !== "" && isDebounceSettling(typedTerm, term);
  return {
    term,
    results: isEnabled ? (searchQuery.data ?? NO_RESULTS) : NO_RESULTS,
    isIdle: term === "",
    isSearching: isWaitingForDebounce || (isEnabled && searchQuery.isFetching),
    isError: isEnabled && searchQuery.isError,
    error: searchQuery.error,
    retry: () => {
      if (isEnabled) void searchQuery.refetch();
    },
  };
}
