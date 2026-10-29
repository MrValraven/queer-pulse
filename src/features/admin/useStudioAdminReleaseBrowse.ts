import { useState } from "react";
import { useDebouncedValue } from "../../shared/hooks/useDebouncedValue";
import { useAdminStudioReleaseSearch } from "./api/StudioAdminCurationHooks";
import type { AdminStudioReleaseCardDTO } from "./api/studioDiscoveryAdmin.api";

const SEARCH_DEBOUNCE_MS = 250;

interface HeldAnswer {
  term: string;
  items: AdminStudioReleaseCardDTO[];
}

/** The pick dialog's release browsing: a blank search reads the newest
 *  published releases, a typed one the matches. The last answer stays on
 *  screen while the next search runs, so the list never flashes empty
 *  between keystrokes; `isLoading` is only the very first read. Offline,
 *  react-query pauses the read, and `isPaused` lets the dialog say so in
 *  the results frame over any held list. */
export function useStudioAdminReleaseBrowse(query: string) {
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const search = useAdminStudioReleaseSearch(debouncedQuery);
  const term = debouncedQuery.trim();
  const [held, setHeld] = useState<HeldAnswer | null>(null);
  if (search.data && (held?.items !== search.data || held.term !== term))
    setHeld({ term, items: search.data });
  const shown: HeldAnswer | null = search.data
    ? { term, items: search.data }
    : held;
  const isPaused = search.fetchStatus === "paused";
  return {
    results: shown?.items ?? [],
    isBlankTerm: (shown?.term ?? term).length === 0,
    isLoading:
      search.isPending &&
      search.data === undefined &&
      !isPaused &&
      shown === null,
    isRefreshing: search.isFetching && shown !== null,
    isPaused,
    isError: search.isError,
    error: search.error,
    retry: () => void search.refetch(),
  };
}
