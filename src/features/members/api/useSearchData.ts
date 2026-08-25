import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useDebouncedValue } from "../../../shared/hooks";
import {
  SEARCH_DATA,
  RECENTS,
  PAGE_SEARCH_ITEMS,
  NO_LIVE_SEARCH_TYPES,
  topicResponseToSearchItem,
  type ResultType,
  type SearchItem,
} from "../search.data";
import { searchApi, type LiveResultType } from "./search.api";
import { getTopics } from "../../topics/api/topics.api";
import { resultToSearchItem } from "./search.adapters";
import { readRecents } from "../searchRecents";

export interface SearchDataResult {
  /** Corpus for the current query. Demo: full mock (client-filtered). Live: server hits + static pages. */
  data: SearchItem[];
  /** Recent-search suggestions. Demo: static list. Live: localStorage-backed. */
  recents: string[];
  /** True only when logged out in live mode — the UI shows a sign-in prompt instead of results. */
  signInRequired: boolean;
  /** True while a live search request is in flight. */
  loading: boolean;
}

const matchesStatic = (item: SearchItem, needle: string) =>
  `${item.name} ${item.sub} ${item.kw}`.toLowerCase().includes(needle);

const isLiveSearchType = (type: ResultType): type is LiveResultType =>
  !NO_LIVE_SEARCH_TYPES.has(type);

// Once the caller narrows to a single type — the search page's active tab,
// or its "see all in this category" affordance — ask the backend for more
// than the default per-type cap. The backend only widens that cap when
// `type` is set (see `search.service.ts`'s `perTypeLimit`), so this has no
// effect on an unfiltered, all-types query.
const SEE_ALL_LIMIT = 50;

/**
 * Source for the ⌘K palette and the /search page. Demo serves the colocated
 * mock corpus (client-side filtering, `query` and `type` ignored). Live is
 * query-driven: a debounced GET /search (every result type, topics included,
 * comes straight from the response) plus curated pages/topics for the
 * no-query browse view. `type` narrows the live request to one result type
 * and raises its cap — pass it once the caller has picked a specific tab.
 */
export function useSearchData(
  query: string,
  type: ResultType | "all" = "all",
): SearchDataResult {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking } = useAuth();
  const needle = query.trim().toLowerCase();
  const debounced = useDebouncedValue(needle, 200);
  const liveType = type !== "all" && isLiveSearchType(type) ? type : undefined;

  const searchQuery = useQuery({
    queryKey: ["search", demoMode, debounced, liveType],
    enabled: !demoMode && !checking && loggedIn && debounced.length >= 1,
    // Forward react-query's own cancellation signal into the fetch — a fast
    // retype (new `debounced` → new queryKey) cancels the previous
    // keystroke's request at the network layer, not just in the query cache.
    queryFn: async ({ signal }) => {
      const response = await searchApi(
        debounced,
        liveType,
        signal,
        liveType ? SEE_ALL_LIMIT : undefined,
      );
      return response.results.map(resultToSearchItem);
    },
  });

  // Curated topic (hashtag) rows for the live palette's no-query browse
  // state only, fetched once from GET /topics — with real post counts, not
  // the demo mock. A query's `topic` hits no longer merge this full list
  // client-side; they come back from the real GET /search response above,
  // like every other result type.
  const topicsQuery = useQuery({
    queryKey: ["search-topics"],
    enabled: !demoMode && !checking && loggedIn,
    queryFn: getTopics,
  });

  if (demoMode) {
    return {
      data: SEARCH_DATA,
      recents: RECENTS,
      signInRequired: false,
      loading: false,
    };
  }
  if (checking) {
    return { data: [], recents: [], signInRequired: false, loading: true };
  }
  if (!loggedIn) {
    return { data: [], recents: [], signInRequired: true, loading: false };
  }

  const staticHits = needle
    ? PAGE_SEARCH_ITEMS.filter((item) => matchesStatic(item, needle))
    : [
        ...PAGE_SEARCH_ITEMS,
        ...(topicsQuery.data ?? []).map(topicResponseToSearchItem),
      ];
  const serverHits = needle
    ? (searchQuery.data ?? []).map((item) => ({
        ...item,
        kw: `${item.kw} ${debounced}`,
      }))
    : [];

  return {
    data: [...staticHits, ...serverHits],
    recents: readRecents(),
    signInRequired: false,
    loading: searchQuery.isFetching,
  };
}
