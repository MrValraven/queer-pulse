import { useMemo, useState } from "react";
import { useDebouncedValue } from "../../shared/hooks";
import type { SubprofileKind } from "./api/subprofiles.api";
import { useSubprofileDirectory } from "./api/useSubprofileDirectory";
import { groupProfessionsByFamily } from "./subprofileDirectory.data";
import type { DirectoryAvailability } from "./subprofileDirectoryAvailability.data";
import { DIRECTORY_FACET_TAG_CAP, topTags } from "./subprofileDirectoryFacets";
import {
  DEFAULT_DIRECTORY_SORT,
  type SubprofileDirectorySort,
} from "./subprofileDirectorySort";
import { useQuestTableFacet } from "./useQuestTableFacet";
import { useLatchedFlag, useSeenVocabulary } from "./useSeenVocabulary";

/** How long the search box waits after the last keystroke before its term
 *  becomes a query key and reaches the network. Matches every other
 *  list-with-search control in the app (`useDiscoverCommunities`,
 *  `AdminListingsHeader`). */
const SEARCH_DEBOUNCE_MS = 300;

/**
 * The directory page's whole refine state (professions, tags, free-text
 * search, the single availability choice, the "At the table" facet, the sort)
 * plus the paginated query
 * that feeds it, extracted out of `SubprofileDirectoryPage` so that component
 * stays under the 200-line cap. Owning the fetch here is what lets every
 * filter reach the server, the shape `/communities` uses
 * (`useDiscoverCommunities`).
 *
 * EVERY FILTER IS SERVER-SIDE. The search term is debounced; the chip groups
 * go out as they are picked. `useSubprofileDirectory` sends them all as
 * params, so they narrow the whole table before paging, and the grid, `total`
 * and "Show more" are the exact answer. Demo mode runs the same predicates
 * over the mock inside the query function, so this hook never filters.
 *
 * THE COUNTS ARE THE SERVER'S `facets` BLOCK, each group counted with its own
 * selection lifted and the others applied, so picking "Poet" leaves the other
 * professions' numbers standing. Every count is `undefined` when the block is
 * missing (nothing loaded yet, a failed fetch, an older server): the sidebar
 * then draws no number and keeps the option pickable, because "not counted"
 * is a different answer from "nobody".
 *
 * Professions are multi-select and OR within the facet, matching the tag row
 * beside them: "poets or illustrators" is a question somebody browsing a
 * directory actually has, and single-select could not answer it.
 */
export function useSubprofileDirectoryFilters() {
  const [kinds, setKinds] = useState<SubprofileKind[]>([]);
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [availability, setAvailability] =
    useState<DirectoryAvailability | null>(null);
  const [sort, setSort] = useState<SubprofileDirectorySort>(
    DEFAULT_DIRECTORY_SORT,
  );
  const table = useQuestTableFacet();
  const { tableFormats, tableVibes, hasTableSelection } = table;

  const term = query.trim();
  // Only a settled term becomes a query key, so a fast typist fans out once
  // per settled term. `useSubprofileDirectory` holds the previous
  // set's cards on screen until the new one lands.
  const debouncedTerm = useDebouncedValue(term, SEARCH_DEBOUNCE_MS);
  const directoryQuery = useSubprofileDirectory({
    query: debouncedTerm,
    kinds,
    tags: activeTags,
    availability: availability ?? undefined,
    sort,
    tableFormats,
    tableVibes,
  });
  const { cards, facets } = directoryQuery;

  // The two chip vocabularies are latched (`useSeenVocabulary`), so neither
  // row reshuffles as the sidebar's own facets are picked, and a search term
  // that narrows the set keeps its chips on the row at 0 and dimmed. What
  // moves is the counts. Professions come from the loaded cards and from every
  // profession the facet block counts above 0; tags come from the block's own
  // vocabulary (the directory's top tags), or from the loaded cards when an
  // older server sends no block.
  const loadedKinds = useMemo(() => {
    const countedKinds = facets
      ? (Object.keys(facets.kinds) as SubprofileKind[]).filter(
          (kind) => (facets.kinds[kind] ?? 0) > 0,
        )
      : [];
    return [...new Set([...cards.map((card) => card.kind), ...countedKinds])];
  }, [cards, facets]);
  const seenKinds = useSeenVocabulary(loadedKinds);
  const professionGroups = useMemo(
    () => groupProfessionsByFamily(new Set(seenKinds)),
    [seenKinds],
  );
  const loadedTopTags = useMemo(
    () =>
      facets
        ? facets.tags.map((entry) => entry.tag)
        : topTags(cards, DIRECTORY_FACET_TAG_CAP),
    [cards, facets],
  );
  const availableTags = useSeenVocabulary(loadedTopTags);
  const tagCounts = useMemo(
    () =>
      facets
        ? (Object.fromEntries(
            facets.tags.map((entry) => [entry.tag, entry.count]),
          ) as Partial<Record<string, number>>)
        : undefined,
    [facets],
  );

  // The "At the table" section folds in once any persona has a table, read
  // off the loaded cards or the facet block, and is latched like the chip
  // vocabularies, so a search that matches no Quest persona leaves the
  // section standing with its chips at 0.
  const hasLoadedTableData = useMemo(
    () =>
      cards.some((card) => card.table) ||
      (facets !== undefined &&
        [
          ...Object.values(facets.tableFormats),
          ...Object.values(facets.tableVibes),
        ].some((count) => (count ?? 0) > 0)),
    [cards, facets],
  );
  const hasTableData = useLatchedFlag(hasLoadedTableData);

  const onToggleKind = (kind: string) => {
    const next = kind as SubprofileKind;
    setKinds((current) =>
      current.includes(next)
        ? current.filter((activeKind) => activeKind !== next)
        : [...current, next],
    );
  };

  const onToggleTag = (tag: string) => {
    setActiveTags((current) =>
      current.includes(tag)
        ? current.filter((activeTag) => activeTag !== tag)
        : [...current, tag],
    );
  };

  const onClearFilters = () => {
    setKinds([]);
    setQuery("");
    setActiveTags([]);
    setAvailability(null);
    table.clearTable();
  };

  // The Filters badge counts the sidebar's own filters only. The search term
  // lives in the hero and the sort is an order, so neither adds to it.
  const sidebarActiveCount =
    kinds.length +
    activeTags.length +
    (availability === null ? 0 : 1) +
    tableFormats.length +
    tableVibes.length;

  return {
    kinds,
    onToggleKind,
    setKinds,
    query,
    setQuery,
    activeTags,
    onToggleTag,
    setActiveTags,
    /** The single availability choice, or `null` for "Any availability". */
    availability,
    setAvailability,
    /** Personas per availability value under every other filter; `undefined`
     *  when not counted. */
    availabilityCounts: facets?.availability as
      Partial<Record<DirectoryAvailability, number>> | undefined,
    /** The order the grid is fetched in. */
    sort,
    setSort,
    /** What the sidebar's Filters badge shows: kinds, tags, availability and
     *  the table facet, never the search term. */
    sidebarActiveCount,
    tableFormats,
    setTableFormats: table.setTableFormats,
    onToggleTableFormat: table.onToggleTableFormat,
    tableVibes,
    setTableVibes: table.setTableVibes,
    onToggleTableVibe: table.onToggleTableVibe,
    tableFormatCounts: facets?.tableFormats,
    tableVibeCounts: facets?.tableVibes,
    /** True once any persona loaded since the page opened carried an "At the
     *  table" summary; the sidebar's "At the table" section stays hidden until
     *  then, and stays put after. */
    hasTableData,
    professionGroups,
    professionCounts: facets?.kinds,
    availableTags,
    tagCounts,
    /** True while anything is narrowing the grid, the search term included. */
    hasActiveRefinement:
      kinds.length > 0 ||
      activeTags.length > 0 ||
      availability !== null ||
      hasTableSelection ||
      term !== "",
    /** True while the FIRST page for the current term is in flight. */
    isLoading: directoryQuery.isLoading,
    /** True when the directory fetch failed: a retryable outage, distinct
     *  from a refinement that matched nobody. */
    isError: directoryQuery.isError,
    /** ENG-501: true when a fetch failed while personas were already loaded,
     *  which is "Show more" failing on the next page. The loaded cards stay on
     *  screen and the pager retries that page. Derived from the loaded count
     *  because `useSubprofileDirectory` keeps react-query's own flag to
     *  itself. */
    isFetchNextPageError: directoryQuery.isError && cards.length > 0,
    refetch: directoryQuery.refetch,
    /** True while the cards and counts on screen belong to the PREVIOUS
     *  search or filters, held there by `keepPreviousData` until the new page
     *  lands. */
    isShowingPreviousResults: directoryQuery.isShowingPreviousResults,
    /** Server-reported count of everything matching the search and every
     *  filter, across all pages. */
    total: directoryQuery.total,
    /** What the grid renders: every page loaded so far, already narrowed by
     *  the server. */
    shownCards: cards,
    hasMore: directoryQuery.hasNextPage,
    isFetchingMore: directoryQuery.isFetchingNextPage,
    onShowMore: directoryQuery.fetchNextPage,
    onClearFilters,
  };
}

/** The whole refine state, passed to the toolbar as one prop the way
 *  `/communities` passes `discover`. */
export type SubprofileDirectoryFilters = ReturnType<
  typeof useSubprofileDirectoryFilters
>;
