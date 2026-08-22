import { useEffect, useState } from "react";
import { useDebouncedValue, useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { Community, CommunityType } from "../homepage/data/types";
import { useCommunities } from "./api/useCommunities";
import { useFeaturedCommunity } from "./api/useFeaturedCommunity";
import { useCommunitiesTagsFilter } from "./useCommunitiesTagsFilter";
import { useDiscoverCategoryCounts } from "./useDiscoverCategoryCounts";
import { BUSY_THRESHOLD, type DiscoverSort } from "./communitiesDiscover.data";

/**
 * All Discover state, queries and derived lists, so `CommunitiesDiscover` is
 * layout only and stays under the repo's 200-line-per-component limit. A plain
 * hook (no JSX), so the limit doesn't apply here.
 */
export function useDiscoverCommunities() {
  const { demoMode } = useDemoMode();
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
  } = useCommunities({
    q: q || undefined,
    // "active" isn't a server-side sort (see the drain note below) — leave the
    // server on its default order and re-sort client-side once fully drained.
    sort: sort === "name" ? "name" : undefined,
    type: filter === "all" ? undefined : filter,
    access: isOpenOnly ? "public" : undefined,
    tags: tagIds.length ? tagIds : undefined,
  });
  // The 600ms placeholder skeleton is a demo-prototype device; live mode waits
  // on the real first page instead of adding half a second to every visit.
  const isSimulatedLoading = useSimulatedLoad();
  const isLoading = demoMode ? isSimulatedLoading : isFetchingFirstPage;

  // The featured card only makes sense against the platform's whole discover
  // pool — once a member is actively narrowing the list (search, category,
  // either toggle) it drops out so it doesn't compete with what they asked for.
  const featured = useFeaturedCommunity();
  const isShowingFeatured =
    Boolean(featured) &&
    !q &&
    filter === "all" &&
    !isOpenOnly &&
    !isBusyOnly &&
    tagIds.length === 0;

  // The backend can't sort/filter by `activeThisWeek` (it's computed
  // post-pagination, not an indexed column), so "Most active" and "Busy this
  // week" fully drain every remaining page client-side before filtering/
  // sorting in memory — correct results over a handful of extra requests,
  // rather than a "most active" that's silently wrong past page 1.
  const needsDrain = isBusyOnly || sort === "active";
  useEffect(() => {
    if (needsDrain && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [needsDrain, hasNextPage, isFetchingNextPage, fetchNextPage]);
  const isDraining = needsDrain && hasNextPage;
  const isShowingSkeletons = isLoading || isDraining;

  // The server does the real `type`/`q`/`access` filtering (`useCommunities`'s
  // params), so `communities` already IS the filtered set — no client-side
  // re-filter over just the loaded page, which used to false-negative "no
  // communities match" once a filtered category had more than one page (COM-3).
  let visible = communities;
  if (isBusyOnly) {
    visible = visible.filter(
      (community) => (community.activeThisWeek ?? 0) >= BUSY_THRESHOLD,
    );
  }
  if (sort === "active") {
    visible = [...visible].sort(
      (a, b) => (b.activeThisWeek ?? 0) - (a.activeThisWeek ?? 0),
    );
  }
  const gridItems = isShowingFeatured
    ? visible.filter((community) => community.slug !== featured!.slug)
    : visible;

  // Category-chip counts are deliberately stable across search/sort/toggles —
  // they read against the whole discover pool, not whatever's currently
  // filtered, so switching a chip doesn't make the other chips' numbers jump.
  const categoryCounts = useDiscoverCategoryCounts();

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
    categoryCounts,
    hasActiveRefinement,
    resetRefinements,
  };
}
