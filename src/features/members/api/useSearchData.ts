import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useDebouncedValue } from "../../../shared/hooks";
import {
  SEARCH_DATA,
  RECENTS,
  PAGE_SEARCH_ITEMS,
  topicResponseToSearchItem,
  type SearchItem,
} from "../search.data";
import { searchApi } from "./search.api";
import { getTopics } from "../../topics/api/topics.api";
import { resultToSearchItem } from "./search.adapters";
import { readRecents } from "../searchRecents";

export interface SearchDataResult {
  /** Corpus for the current query. Demo: full mock (client-filtered). Live: server hits + static topics/pages. */
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

/**
 * Source for the ⌘K palette and the /search page. Demo serves the colocated
 * mock corpus (client-side filtering, `query` ignored). Live is query-driven:
 * a debounced GET /search plus curated topics/pages merged client-side.
 */
export function useSearchData(query: string): SearchDataResult {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking } = useAuth();
  const needle = query.trim().toLowerCase();
  const debounced = useDebouncedValue(needle, 200);

  const searchQuery = useQuery({
    queryKey: ["search", demoMode, debounced],
    enabled: !demoMode && !checking && loggedIn && debounced.length >= 1,
    // Forward react-query's own cancellation signal into the fetch — a fast
    // retype (new `debounced` → new queryKey) cancels the previous
    // keystroke's request at the network layer, not just in the query cache.
    queryFn: async ({ signal }) => {
      const response = await searchApi(debounced, undefined, signal);
      return response.results.map(resultToSearchItem);
    },
  });

  // Curated topic (hashtag) rows for the live palette. The backend /search
  // endpoint doesn't return topics, so they're fetched once from GET /topics
  // and merged client-side — with real post counts, not the demo mock.
  const topicsQuery = useQuery({
    queryKey: ["search-topics"],
    enabled: !demoMode && !checking && loggedIn,
    queryFn: getTopics,
  });

  if (demoMode) {
    return { data: SEARCH_DATA, recents: RECENTS, signInRequired: false, loading: false };
  }
  if (checking) {
    return { data: [], recents: [], signInRequired: false, loading: true };
  }
  if (!loggedIn) {
    return { data: [], recents: [], signInRequired: true, loading: false };
  }

  // Live static corpus = real navigation pages + real topics from GET /topics.
  const liveStatic: SearchItem[] = [
    ...PAGE_SEARCH_ITEMS,
    ...(topicsQuery.data ?? []).map(topicResponseToSearchItem),
  ];
  const staticHits = needle
    ? liveStatic.filter((item) => matchesStatic(item, needle))
    : liveStatic.filter((item) => item.t === "topic" || item.t === "page");
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
