import { useCallback } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
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
  /**
   * True while live results for the current input are not in yet: the
   * debounce has not caught up with the typed query, or the request for it is
   * in flight. Rows still in `data` meanwhile answer the previous query.
   */
  loading: boolean;
  /**
   * True when the live search request failed. A failed request must be
   * presented as an outage with a retry, never as `0 results for "maria"`
   * (DES-23): the query was fine, the request never landed.
   */
  isError: boolean;
  /** Re-runs the failed search. Wire it to the error state's retry button. */
  refetch: () => void;
}

/** Stable no-op retry for the modes that never issue a request. */
const noRetry = () => {};

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
    // The rows travel with the query they answered, so a placeholder page
    // (below) can still be told apart from the current query's answer.
    queryFn: async ({ signal }) => {
      const response = await searchApi(
        debounced,
        liveType,
        signal,
        liveType ? SEE_ALL_LIMIT : undefined,
      );
      return {
        query: debounced,
        items: response.results.map(resultToSearchItem),
      };
    },
    // Keep the previous query's rows on screen while the next key fetches, so
    // typing never blanks the list into an empty state.
    placeholderData: keepPreviousData,
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

  // `refetch` off react-query is referentially stable, so the retry handed to
  // the error panel stays stable too.
  const { refetch: refetchSearch } = searchQuery;
  const refetch = useCallback(() => {
    void refetchSearch();
  }, [refetchSearch]);

  if (demoMode) {
    // Demo serves the mock corpus synchronously: there is no request to fail.
    return {
      data: SEARCH_DATA,
      recents: RECENTS,
      signInRequired: false,
      loading: false,
      isError: false,
      refetch: noRetry,
    };
  }
  if (checking) {
    return {
      data: [],
      recents: [],
      signInRequired: false,
      loading: true,
      isError: false,
      refetch: noRetry,
    };
  }
  if (!loggedIn) {
    return {
      data: [],
      recents: [],
      signInRequired: true,
      loading: false,
      isError: false,
      refetch: noRetry,
    };
  }

  const staticHits = needle
    ? PAGE_SEARCH_ITEMS.filter((item) => matchesStatic(item, needle))
    : [
        ...PAGE_SEARCH_ITEMS,
        ...(topicsQuery.data ?? []).map(topicResponseToSearchItem),
      ];
  // Each server row carries the query it answered in `kw`, so the palette's
  // client-side name/sub/kw filter never hides a server match on a field the
  // client cannot see. That is the ANSWERED query: a placeholder row from the
  // previous query must still earn its place against the current input on its
  // own fields. A row can therefore show while typing and drop out once the
  // server answers the new query.
  const answeredQuery = searchQuery.data?.query ?? "";
  const serverHits = needle
    ? (searchQuery.data?.items ?? []).map((item) => ({
        ...item,
        kw: `${item.kw} ${answeredQuery}`,
      }))
    : [];
  const isAwaitingDebounce = needle !== debounced;

  return {
    data: [...staticHits, ...serverHits],
    recents: readRecents(),
    signInRequired: false,
    loading: Boolean(needle) && (isAwaitingDebounce || searchQuery.isFetching),
    // Gated on `needle` as well as the query's own flag: while the debounce
    // catches up with a just-cleared input, the failed keystroke's query entry
    // is still the active one, and the browse view must not wear its error.
    isError: Boolean(needle) && searchQuery.isError,
    refetch,
  };
}
