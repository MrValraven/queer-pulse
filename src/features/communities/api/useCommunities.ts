import { useMemo } from "react";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useCommunityMembership } from "../../../app/providers/useCommunityMembership";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  getCommunities,
  type CommunitiesQuery,
  type CommunityBrowseFacets,
} from "./communities.api";
import { cardDtoToCommunity } from "./communities.adapters";
import { useAllCommunities } from "../useAllCommunities";
import { communities } from "../../homepage/data/communities";
import { COMMUNITY_TAGS } from "../communityTags.data";
import { BUSY_THRESHOLD } from "../communitiesDiscover.data";
import type { Community } from "../../homepage/data/types";

export interface CommunitiesResult {
  /** Every community fetched so far, flattened across the loaded pages. */
  items: Community[];
  /** Server-reported total across all pages (demo: the registry length). */
  total: number;
  /** True when another page is available (live only — always false in demo). */
  hasNextPage: boolean;
  /** Fetch and append the next page (no-op once `hasNextPage` is false). */
  fetchNextPage: () => void;
  /** True while a subsequent page is loading. */
  isFetchingNextPage: boolean;
  /** True while the first page is in flight. */
  isLoading: boolean;
  /**
   * True when the list request failed. Without it an outage renders as the
   * "no communities match" empty state, which reads as an answer rather than
   * as a directory that never loaded (DES-22).
   */
  isError: boolean;
  /** Re-runs the failed request. Wire it to `LoadErrorState`'s `onRetry`. */
  refetch: () => void;
  /**
   * Availability counts for the filters that carry them, read off the FIRST
   * page: every page of one filter run shares the same facets (mirrors
   * `useMembers`). `undefined` until the first page lands, and per-option
   * `undefined` for anything the server didn't count — a chip shows no badge
   * rather than a zero, because "not counted" and "nobody is here" are
   * different answers and only one of them greys the chip out.
   */
  facets?: CommunityBrowseFacets;
  /**
   * True while the rows on screen belong to the PREVIOUS params, held there by
   * `shouldKeepPreviousResults` until the new run's first page lands. Callers
   * use it to hold "Load more" (its `hasNextPage` still describes the old run)
   * and to stop reporting a count that is about to change.
   */
  isShowingPreviousResults: boolean;
}

/**
 * `CommunitiesQuery` with the sort union the backend actually accepts.
 *
 * `CommunitiesService.list` orders by `newest` (`created_at DESC`, the default
 * when the param is omitted), `name` (`name ASC, id ASC`) or `active`
 * (`active_this_week DESC, created_at DESC, id ASC`, off the indexed
 * `IDX_communities_active_this_week` counter), and `ListCommunitiesQuery.sort`
 * validates all three. `communities.api.ts`'s own union still lists only the
 * first two, so it is widened here until that file catches up. `getCommunities`
 * already serialises whatever value it is given.
 */
export type CommunitiesListQuery = Omit<CommunitiesQuery, "sort"> & {
  sort?: "newest" | "name" | "active";
};

interface CommunitiesPageVM {
  items: Community[];
  total: number;
  page: number;
  facets?: CommunityBrowseFacets;
}

/**
 * Discover-grid source, paginated. Demo mode returns the page's own static
 * `communities` registry as a single synthetic page (full fidelity for the type
 * chips + living-card stats) — `getNextPageParam` then sees loaded === total and
 * yields `undefined`, so demo never shows a "Load more" and renders exactly as
 * it does today. Live mode calls GET /communities?filter=…&type=…&page= and
 * appends each page, adapting every card to the same view-model and stopping
 * at the server `total`.
 *
 * The page's category chips are a `type` query param on both paths (demo
 * filters the static registry the same way live filters server-side), so a
 * chip narrows the WHOLE result set — not just whatever page happened to be
 * loaded already (COM-3: a category with more than one page used to false-
 * negative "no communities match" past page 1). Live mode hides private
 * communities from non-members (the API omits them from the list).
 */
export function useCommunities(
  params: CommunitiesListQuery = {},
  options: { enabled?: boolean; shouldKeepPreviousResults?: boolean } = {},
): CommunitiesResult {
  const { enabled = true, shouldKeepPreviousResults = false } = options;
  const { demoMode } = useDemoMode();
  // `language` sits in the key because `cardDtoToCommunity` resolves catalog
  // keys ("48 members" / "Members only") — a language switch has to re-map the
  // already-fetched DTOs, not just re-render stale English strings.
  const { t, language } = useTranslation();
  const { memberships } = useCommunityMembership();
  // The whole demo directory: the static registry plus anything founded this
  // session, with session edits applied. `[]` in live mode by construction.
  const demoDirectory = useAllCommunities();
  const isMineScope = params.filter === "mine";
  // `filter=mine` is a server-side inner join on the viewer's own membership
  // (communities.service.ts). Demo mode has no server, so the session
  // membership store narrows the list here instead — sourced from
  // `useAllCommunities` rather than the static registry so a community you
  // founded this session appears in your own list too, the way it already
  // does in the hub sidebar. Every other scope keeps reading the registry
  // exactly as before.
  const demoSource = useMemo(
    () =>
      demoMode && isMineScope
        ? demoDirectory.filter(
            (community) =>
              community.slug != null && memberships[community.slug],
          )
        : communities,
    [demoMode, isMineScope, demoDirectory, memberships],
  );
  // The narrowed list's identity, for the query key: joining, leaving,
  // founding or renaming a community in demo mode all have to re-derive the
  // cached page, and none of them touches `params`. `null` for every other
  // scope, so no existing caller's key changes shape.
  const demoSourceKey =
    demoMode && isMineScope
      ? demoSource
          .map((community) => `${community.slug}:${community.name}`)
          .join(",")
      : null;
  const query = useInfiniteQuery<CommunitiesPageVM>({
    queryKey: ["communities", demoMode, params, language, demoSourceKey],
    // Callers may gate this fetch off when its result isn't consumed (e.g. a
    // profile viewing another member). Demo mode's queryFn is a local no-network
    // read, but gating it too keeps the discarded-path behaviour consistent.
    enabled,
    // Opt-in, because only the discover grid changes its params while mounted:
    // every facet and the sort ride in the query key, so each pick is a fresh
    // key that would otherwise drop the whole grid to `isLoading` and flash six
    // skeletons over rows that are mostly about to come back. Holding the
    // previous run on screen until the new first page lands makes a re-sort a
    // swap rather than a blank (`useMembers` does the same for the member
    // directory). The other nine call sites pass fixed params, so their loading
    // semantics stay exactly as they were.
    placeholderData: shouldKeepPreviousResults ? keepPreviousData : undefined,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        // Mirror the live endpoint's ILIKE-over-name/tagline search client-side
        // (the mock registry has no separate "purpose" field). Demo has no
        // pagination, so a fresh search always yields its own single page —
        // there's nothing to reset.
        const needle = params.q?.trim().toLowerCase();
        const searched = needle
          ? demoSource.filter((community) =>
              `${community.name} ${community.description}`
                .toLowerCase()
                .includes(needle),
            )
          : demoSource;
        // Mirror the live endpoint's `type=` filter (COM-3) — applied
        // server-side there, applied here over the same static registry so
        // demo behaviour stays byte-for-byte identical to live.
        const typeMatched = params.type
          ? searched.filter((community) => community.type === params.type)
          : searched;
        // Mirror the live endpoint's `access=` filter (used by the Discover
        // page's "Open to all" toggle) over the same static registry.
        const accessMatched = params.access
          ? typeMatched.filter(
              (community) =>
                (community.accessTier ?? "public") === params.access,
            )
          : typeMatched;
        // Mirror the live endpoint's `busy=true` filter (the Discover page's
        // "Busy this week" toggle) over the same static registry. Demo's
        // `activeThisWeek` is the registry's own number, so the cut is the
        // same shape as the server's `active_this_week >= BUSY_THRESHOLD`.
        const busyMatched = params.busy
          ? accessMatched.filter(
              (community) => (community.activeThisWeek ?? 0) >= BUSY_THRESHOLD,
            )
          : accessMatched;
        // Mirror the live endpoint's `tags=` filter (used by the Discover
        // page's tags filter) — a community matches if it carries ANY of the
        // selected tag ids, same OR-within/AND-across-filters semantics as
        // every other facet on this page.
        const matchesTags = (community: Community) =>
          !params.tags?.length ||
          params.tags.some((tagId) => community.tags?.includes(tagId));
        const matches = busyMatched.filter(matchesTags);
        // Mirror the live endpoint's ordering. `name` is A→Z; `active` is the
        // busiest first, off the same `activeThisWeek` number the registry
        // carries and the server keeps in `communities.active_this_week`.
        // `newest`/omitted keeps the registry's own order, same as the
        // backend's `created_at DESC` default reads today. That is also why
        // the `active` sort leans on `Array.prototype.sort` being stable: ties
        // (every quiet community sits at 0) keep registry order, the demo
        // stand-in for the server's `created_at DESC, id ASC` tiebreak.
        const sorted =
          params.sort === "name"
            ? [...matches].sort((first, second) =>
                first.name.localeCompare(second.name),
              )
            : params.sort === "active"
              ? [...matches].sort(
                  (first, second) =>
                    (second.activeThisWeek ?? 0) - (first.activeThisWeek ?? 0),
                )
              : matches;
        // Mirror the live endpoint's `facets.tags`: counted over the same set
        // MINUS this filter's own predicate (`busyMatched`, not `matches`),
        // because a tag's badge answers "how many if I picked this one" and
        // its own filter would have already excluded every other tag's rows.
        // Every curated id is present, zeros included, exactly as the server
        // returns them — a tag nobody carries is a real answer, not a gap.
        const tagCounts: Record<string, number> = Object.fromEntries(
          COMMUNITY_TAGS.map((tag) => [tag.id, 0]),
        );
        for (const community of busyMatched) {
          for (const tagId of community.tags ?? []) {
            // `undefined` means the community carries a tag outside the
            // curated vocabulary, which the live facet wouldn't count either.
            const soFar = tagCounts[tagId];
            if (soFar !== undefined) tagCounts[tagId] = soFar + 1;
          }
        }
        // Mirror the live endpoint's two toggle facets. Same rule as the tag
        // counts, applied to a pair rather than a vocabulary: each is counted
        // with its OWN predicate lifted and the other one still applied, so a
        // toggle that is already on reports how many are there rather than
        // reading back its own result set. The base is every other filter —
        // search, category and tags — with NEITHER toggle applied, which is
        // what the server's `browseBaseQuery(query, 'toggles')` builds.
        const toggleFacetBase = typeMatched.filter(matchesTags);
        const isOpenToAll = (community: Community) =>
          (community.accessTier ?? "public") === "public";
        const isBusy = (community: Community) =>
          (community.activeThisWeek ?? 0) >= BUSY_THRESHOLD;
        const openToAllCount = toggleFacetBase.filter(
          (community) =>
            isOpenToAll(community) && (!params.busy || isBusy(community)),
        ).length;
        const busyCount = toggleFacetBase.filter(
          (community) =>
            isBusy(community) &&
            (!params.access ||
              (community.accessTier ?? "public") === params.access),
        ).length;
        return {
          items: sorted,
          total: sorted.length,
          page: 1,
          facets: {
            tags: tagCounts,
            openToAll: openToAllCount,
            busy: busyCount,
          },
        };
      }
      const res = await getCommunities({
        ...params,
        // `communities.api.ts` types `sort` as `"newest" | "name"` while the
        // endpoint validates `active` too (see `CommunitiesListQuery` above).
        // The assertion is the seam between the two, and goes away the moment
        // that union is widened.
        sort: params.sort as CommunitiesQuery["sort"],
        page: pageParam as number,
      });
      return {
        items: res.items.map((card) => cardDtoToCommunity(card, t)),
        total: res.total,
        page: res.page,
        facets: res.facets,
      };
    },
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((n, p) => n + p.items.length, 0);
      return loaded < last.total ? last.page + 1 : undefined;
    },
  });

  const pages = query.data?.pages ?? [];
  return {
    items: pages.flatMap((p) => p.items),
    total: pages[0]?.total ?? 0,
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
    facets: pages[0]?.facets,
    isShowingPreviousResults: query.isPlaceholderData,
  };
}
