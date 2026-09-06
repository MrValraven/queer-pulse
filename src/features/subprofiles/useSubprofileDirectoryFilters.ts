import { useMemo, useState } from "react";
import { useDebouncedValue } from "../../shared/hooks";
import type { SubprofileKind } from "./api/subprofiles.api";
import { useSubprofileDirectory } from "./api/useSubprofileDirectory";
import { groupProfessionsByFamily } from "./subprofileDirectory.data";
import {
  countByKind,
  countByTag,
  matchesKind,
  matchesOpenToCollabs,
  matchesTags,
  topTags,
} from "./subprofileDirectoryFacets";

const AVAILABLE_TAGS_CAP = 20;
/** How long the search box waits after the last keystroke before its term
 *  becomes a query key and reaches the network. Matches every other
 *  list-with-search control in the app (`useDiscoverCommunities`,
 *  `AdminListingsHeader`). */
const SEARCH_DEBOUNCE_MS = 300;

/**
 * The directory page's whole refine state (professions, tags, free-text
 * search, open-to-collabs) plus the paginated query that feeds it, extracted
 * out of `SubprofileDirectoryPage` so that component stays
 * under the 200-line cap. Owning the fetch here is what lets the search term
 * reach the server, the shape `/communities` uses (`useDiscoverCommunities`).
 *
 * SEARCH IS SERVER-SIDE. The term is debounced, then handed to
 * `useSubprofileDirectory`, which sends it as `?query=`: an ILIKE over
 * displayName and tagline applied across the whole table. It used to be a
 * browser-side `matchesQuery` over whatever pages had been pulled, which could
 * not see past the walk's 2000-persona ceiling. That predicate is gone rather
 * than left on top of the server's: two spellings of one filter is how a
 * correct result set quietly loses rows. Every facet count below already
 * counted under the search term, so counting them over an already-searched set
 * gives the identical numbers.
 *
 * PAGING IS SERVER-SIDE TOO. "Show more" fetches the next page rather than
 * revealing rows the browser was already sitting on, so first paint is one
 * request instead of the walk that used to drain up to twenty pages before a
 * card appeared.
 *
 * PROFESSION, TAGS AND OPEN-TO-COLLABS stay in the browser, because the
 * endpoint has no param for them (`kind` is single-valued against a
 * multi-select OR facet; there is no `tags` param) and returns no facet counts.
 * They therefore narrow the pages LOADED SO FAR, and `isNarrowedInBrowser`
 * says when that is happening so the page can tell the member rather than let
 * a partial answer read as the whole one.
 *
 * Professions replaced the old page-family facet (see
 * `groupProfessionsByFamily`). They are multi-select and OR within the facet,
 * matching the tag row beside them: "poets or illustrators" is a question
 * somebody browsing a directory actually has, and single-select could not
 * answer it.
 */
export function useSubprofileDirectoryFilters() {
  const [kinds, setKinds] = useState<SubprofileKind[]>([]);
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [openToCollabs, setOpenToCollabs] = useState(false);

  const term = query.trim();
  // Only a settled term becomes a query key, so a fast typist fans out once
  // rather than once per keystroke. `useSubprofileDirectory` holds the previous
  // term's cards on screen until the new set lands.
  const debouncedTerm = useDebouncedValue(term, SEARCH_DEBOUNCE_MS);
  const directoryQuery = useSubprofileDirectory({ query: debouncedTerm });
  const cards = directoryQuery.cards;

  // The two chip vocabularies come from the loaded set, so neither row
  // reshuffles as the drawer's own facets are picked. What moves is the counts.
  // A search term does reshape them, because the term narrows the set itself
  // now: a chip that would yield nothing under the term leaves the row instead
  // of sitting there dimmed at 0. Loading a further page can add a chip, which
  // is the honest read of a vocabulary drawn from what is actually in hand.
  const professionGroups = useMemo(
    () => groupProfessionsByFamily(new Set(cards.map((card) => card.kind))),
    [cards],
  );
  const availableTags = useMemo(
    () => topTags(cards, AVAILABLE_TAGS_CAP),
    [cards],
  );

  // Each facet is counted under the OTHER three, never under itself: counting
  // professions under the profession selection would read every unpicked chip
  // as 0 the moment one was picked, which is exactly backwards for an OR facet.
  const professionCounts = useMemo(
    () =>
      countByKind(
        cards.filter(
          (card) =>
            matchesTags(card, activeTags) &&
            matchesOpenToCollabs(card, openToCollabs),
        ),
      ),
    [cards, activeTags, openToCollabs],
  );
  const tagCounts = useMemo(
    () =>
      countByTag(
        cards.filter(
          (card) =>
            matchesKind(card, kinds) &&
            matchesOpenToCollabs(card, openToCollabs),
        ),
      ),
    [cards, kinds, openToCollabs],
  );

  // The availability pill is a facet too, so it carries the same live count as
  // the chip rows and dims at 0. Counted under the professions and tags (and
  // the server's search, which already shaped `cards`) but NOT under itself:
  // with the toggle already on, counting under it would just restate the
  // grid's own size rather than answer "how many are open to collabs".
  const openToCollabsCount = useMemo(
    () =>
      cards.filter(
        (card) =>
          matchesKind(card, kinds) &&
          matchesTags(card, activeTags) &&
          matchesOpenToCollabs(card, true),
      ).length,
    [cards, kinds, activeTags],
  );

  const visibleCards = useMemo(
    () =>
      cards.filter(
        (card) =>
          matchesKind(card, kinds) &&
          matchesTags(card, activeTags) &&
          matchesOpenToCollabs(card, openToCollabs),
      ),
    [cards, kinds, activeTags, openToCollabs],
  );

  // True while a facet the ENDPOINT cannot express is narrowing the grid. The
  // page says so beside the count, because these three cut the pages already
  // loaded rather than the whole directory, and a count that looks total when
  // it is partial is worse than no count.
  const isNarrowedInBrowser =
    kinds.length > 0 || activeTags.length > 0 || openToCollabs;

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

  const onToggleOpenToCollabs = () => setOpenToCollabs((current) => !current);

  const onClearFilters = () => {
    setKinds([]);
    setQuery("");
    setActiveTags([]);
    setOpenToCollabs(false);
  };

  return {
    kinds,
    onToggleKind,
    setKinds,
    query,
    setQuery,
    activeTags,
    onToggleTag,
    setActiveTags,
    openToCollabs,
    onToggleOpenToCollabs,
    setOpenToCollabs,
    openToCollabsCount,
    professionGroups,
    professionCounts,
    availableTags,
    tagCounts,
    /** True while anything is narrowing the grid, the search term included. */
    hasActiveRefinement:
      kinds.length > 0 || activeTags.length > 0 || openToCollabs || term !== "",
    isNarrowedInBrowser,
    /** True while the FIRST page for the current term is in flight. */
    isLoading: directoryQuery.isLoading,
    /** True when the directory fetch failed: a retryable outage, distinct
     *  from a refinement that matched nobody. */
    isError: directoryQuery.isError,
    refetch: directoryQuery.refetch,
    /** True while the cards on screen belong to the PREVIOUS search term,
     *  held there by `keepPreviousData` until the new page lands. */
    isShowingPreviousResults: directoryQuery.isShowingPreviousResults,
    /** Server-reported count of everything matching the current term. */
    total: directoryQuery.total,
    visibleCards,
    /** What the grid renders. Identical to `visibleCards`: paging is the
     *  endpoint's job now, so there is nothing held back locally. */
    shownCards: visibleCards,
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
