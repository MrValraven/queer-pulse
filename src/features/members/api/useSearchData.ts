import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { SEARCH_DATA, RECENTS, type SearchItem } from "../search.data";

export interface SearchDataResult {
  /** The searchable corpus. Empty in live mode — there's no search backend yet. */
  data: SearchItem[];
  /** Recent-search suggestions (demo only; empty in live mode). */
  recents: string[];
  /**
   * True when running against the live API. Search isn't wired to the backend
   * yet, so live mode has no corpus and callers show a "coming soon" notice
   * instead of the mock `search.data.ts` content.
   */
  comingSoon: boolean;
}

/**
 * Demo-gated source for the command palette and the /search page. Demo mode
 * serves the colocated `search.data.ts` mock; live mode returns nothing (no
 * search endpoint exists yet) so no fake data leaks once the platform is
 * un-populated. Swap the empty branch for a real `GET /search` call when the
 * backend exposes one.
 */
export function useSearchData(): SearchDataResult {
  const { demoMode } = useDemoMode();
  if (demoMode) {
    return { data: SEARCH_DATA, recents: RECENTS, comingSoon: false };
  }
  return { data: [], recents: [], comingSoon: true };
}
