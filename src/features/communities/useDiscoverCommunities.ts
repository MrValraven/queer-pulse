import { useEffect, useState } from "react";
import { useDebouncedValue, useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { Community, CommunityType } from "../homepage/data/types";
import { useCommunities } from "./api/useCommunities";
import { useFeaturedCommunity } from "./api/useFeaturedCommunity";
import { useCommunitiesTagsFilter } from "./useCommunitiesTagsFilter";
import { useDiscoverCategoryCounts } from "./useDiscoverCategoryCounts";
import type {
  CommunitiesScope,
  DiscoverSort,
} from "./communitiesDiscover.data";

/**
 * All communities-grid state, queries and derived lists, so `CommunitiesGrid`
 * is layout only and stays under the repo's 200-line-per-component limit. A
 * plain hook (no JSX), so the limit doesn't apply here.
 *
 * Called ONCE per `/communities` visit, up in `CommunitiesHubPage`, because
 * the toolbar that drives it now lives in the page header while the cards it
 * feeds live in the tab body. One consequence is deliberate: a search or a
 * filter survives the My communities / Discover switch, so "nothing in mine,
 * show me everyone's" is one click rather than a retype.
 *
 * `scope` picks the pool the grid draws from. "discover" is the whole
 * directory; "mine" is the same grid, the same facets and the same cards over
 * only the communities the viewer belongs to — the `/communities?tab=mine`
 * body. Everything scope-specific funnels through the list endpoint's
 * `filter` param, so the two tabs cannot drift in behaviour.
 */
/** Everything `CommunitiesToolbar` and `CommunitiesGrid` need, as one object,
 *  so the hub page can thread the shared state through both without 20 props
 *  at every level. */
export type DiscoverCommunities = ReturnType<typeof useDiscoverCommunities>;

export function useDiscoverCommunities(scope: CommunitiesScope = "discover") {
  const { demoMode } = useDemoMode();
  const isMineScope = scope === "mine";
  const [searchInput, setSearchInput] = useState("");
  // Search only fans out to the network once the member pauses typing for
  // 300ms (same debounce timing as the other list-with-search controls, e.g.
  // AdminListingsHeader) — every distinct debounced term is its own react-query
  // key, so a fresh search naturally restarts pagination at page 1 instead of
  // appending onto whatever the previous term had loaded.
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const q = debouncedSearch.trim();
  // Unlike search, sort isn't debounced — it's a discrete pick, not typed
  // text, so it fans out immediately. Same mechanism resets pagination to
  // page 1 either way: it's part of the react-query key `useCommunities`
  // builds from `params`, so a changed sort is a fresh key, not an append.
  const [sort, setSort] = useState<DiscoverSort>("newest");
  const [filter, setFilter] = useState<"all" | CommunityType>("all");
  const [isOpenOnly, setIsOpenOnly] = useState(false);
  const [isBusyOnly, setIsBusyOnly] = useState(false);
  // Synced with `?tags=` — see the hook's doc comment for why only this
  // filter round-trips through the URL.
  const [tagIds, setTagIds] = useCommunitiesTagsFilter();
  const [joining, setJoining] = useState<Community | null>(null);

  const {
    items: communities,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: isFetchingFirstPage,
    isError: hasListFailed,
    refetch: retryList,
    facets,
  } = useCommunities({
    filter: isMineScope ? "mine" : undefined,
    q: q || undefined,
    // "active" is not sent (the backend does support it) — leave the server on
    // its default order and re-sort client-side once fully drained. See the
    // drain note below for the follow-up that would retire that.
    sort: sort === "name" ? "name" : undefined,
    type: filter === "all" ? undefined : filter,
    access: isOpenOnly ? "public" : undefined,
    // Server-side since the backend gained `?busy=true` over the indexed
    // `communities.active_this_week` counter. It used to be a client-side cut
    // that first had to drain every remaining page into the browser.
    busy: isBusyOnly || undefined,
    tags: tagIds.length ? tagIds : undefined,
  });
  // The 600ms placeholder skeleton is a demo-prototype device; live mode waits
  // on the real first page instead of adding half a second to every visit.
  const isSimulatedLoading = useSimulatedLoad();
  const isLoading = demoMode ? isSimulatedLoading : isFetchingFirstPage;

  // The featured card only makes sense against the platform's whole discover
  // pool — once a member is actively narrowing the list (search, category,
  // either toggle) it drops out so it doesn't compete with what they asked for.
  // It belongs to that scope alone: on "My communities" it would promote
  // either a community the viewer already belongs to (a duplicate card) or one
  // they don't (a stranger in a list of your own), so the fetch is skipped
  // outright there rather than just hidden.
  const featured = useFeaturedCommunity({ enabled: !isMineScope });
  const isShowingFeatured =
    !isMineScope &&
    Boolean(featured) &&
    !q &&
    filter === "all" &&
    !isOpenOnly &&
    !isBusyOnly &&
    tagIds.length === 0;

  // "Most active" still drains every remaining page and re-sorts in memory:
  // the FE sends no `sort=active`, so a server-ordered page 1 wouldn't be the
  // most active overall. ("Busy this week" no longer drains — it is a real
  // query param now. Adopting `sort=active` the same way is the obvious
  // follow-up; it is a separate change from this one.)
  const needsDrain = sort === "active";
  useEffect(() => {
    if (needsDrain && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [needsDrain, hasNextPage, isFetchingNextPage, fetchNextPage]);
  const isDraining = needsDrain && hasNextPage;
  const isShowingSkeletons = isLoading || isDraining;

  // The server does the real `type`/`q`/`access`/`busy` filtering
  // (`useCommunities`'s params), so `communities` already IS the filtered set
  // — no client-side re-filter over just the loaded page, which used to
  // false-negative "no communities match" once a filtered category had more
  // than one page (COM-3).
  let visible = communities;
  if (sort === "active") {
    visible = [...visible].sort(
      (a, b) => (b.activeThisWeek ?? 0) - (a.activeThisWeek ?? 0),
    );
  }
  const gridItems = isShowingFeatured
    ? visible.filter((community) => community.slug !== featured!.slug)
    : visible;

  // Tag-chip counts, unlike the category chips just above them, are a live
  // facet: the server counts them over this same request's filters with the
  // `tags` filter itself lifted, so a number answers "how many would I get if
  // I picked this tag as well", and a 0 is a dead end worth greying out. The
  // one remaining client-side narrowing (`sort=active`'s drain) is applied
  // after pagination and is not part of the query, so it doesn't move these
  // numbers in either mode. `undefined` until the first page lands.
  const tagCounts = facets?.tags;
  // The same live facet for the two pill toggles, each counted with its own
  // predicate lifted and the other still applied. `undefined` until the first
  // page lands (and on a server that predates the facet), which the panel
  // renders as no badge — "not counted" and "nobody is here" are different
  // answers and only the second one may grey a toggle out.
  const openToAllCount = facets?.openToAll;
  const busyCount = facets?.busy;

  // Category-chip counts are deliberately stable across search/sort/toggles —
  // they read against the whole pool for this scope, not whatever's currently
  // filtered, so switching a chip doesn't make the other chips' numbers jump.
  const categoryCounts = useDiscoverCategoryCounts(scope);

  const hasActiveRefinement =
    Boolean(q) ||
    filter !== "all" ||
    isOpenOnly ||
    isBusyOnly ||
    tagIds.length > 0;

  const resetRefinements = () => {
    setSearchInput("");
    setFilter("all");
    setIsOpenOnly(false);
    setIsBusyOnly(false);
    setTagIds([]);
    setSort("newest");
  };

  return {
    demoMode,
    scope,
    q,
    searchInput,
    setSearchInput,
    sort,
    setSort,
    filter,
    setFilter,
    isOpenOnly,
    setIsOpenOnly,
    isBusyOnly,
    setIsBusyOnly,
    tagIds,
    setTagIds,
    joining,
    setJoining,
    featured,
    isShowingFeatured,
    isShowingSkeletons,
    needsDrain,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    visible,
    gridItems,
    // Kept apart from "nothing matched": a failed directory read must not be
    // rendered as an empty result set (DES-22).
    hasListFailed,
    retryList,
    categoryCounts,
    tagCounts,
    openToAllCount,
    busyCount,
    hasActiveRefinement,
    resetRefinements,
  };
}
