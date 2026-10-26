import { useCallback, useMemo } from "react";
import {
  useMutationState,
  useQuery,
  type InfiniteData,
  type QueryClient,
  type QueryFilters,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  HIDEABLE_UPCOMING_LISTS,
  isDemoSlugHidden,
} from "../hiddenEventCommunities";
import { eventKeys } from "./eventKeys";
import {
  getHiddenEventCommunities,
  type HiddenEventCommunityDTO,
} from "./hiddenEventCommunities.api";
import type { EventsPageVM } from "./useEvents";

/** The hidden list query. Demo starts empty and lives in the cache for the
 *  session (the actions write it, and it never refetches back to the seed);
 *  live reads `/me/hidden-event-communities`. */
function useHiddenListQuery(isDemo: boolean) {
  return useQuery<HiddenEventCommunityDTO[]>({
    queryKey: eventKeys.hiddenCommunities(isDemo),
    queryFn: isDemo
      ? () => Promise.resolve<HiddenEventCommunityDTO[]>([])
      : getHiddenEventCommunities,
    staleTime: isDemo ? Infinity : 30_000,
    ...(isDemo ? { gcTime: Infinity } : {}),
  });
}

export interface HiddenEventCommunitiesResult {
  /** The member's hidden communities, newest first. */
  communities: HiddenEventCommunityDTO[];
  hiddenIds: ReadonlySet<string>;
  hiddenSlugs: ReadonlySet<string>;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * The communities the member hid from their events lists. Read by the Browse
 * refine group, the Browse notice and the settings pane; changed through
 * `useHiddenEventCommunityActions`.
 */
export function useHiddenEventCommunities(): HiddenEventCommunitiesResult {
  const { demoMode } = useDemoMode();
  const query = useHiddenListQuery(demoMode);
  const communities = useMemo(() => query.data ?? [], [query.data]);
  const hiddenIds = useMemo(
    () => new Set(communities.map((community) => community.communityId)),
    [communities],
  );
  const hiddenSlugs = useMemo(
    () => new Set(communities.map((community) => community.slug)),
    [communities],
  );
  const { refetch } = query;
  return {
    communities,
    hiddenIds,
    hiddenSlugs,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: useCallback(() => void refetch(), [refetch]),
  };
}

/** For the homepage's static demo strip (it renders its own list, outside the
 *  events query): whether the demo gathering with this slug is hidden. */
export function useIsDemoGatheringHidden(): (slug: string) => boolean {
  const query = useHiddenListQuery(true);
  const hiddenIds = useMemo(
    () => new Set((query.data ?? []).map((row) => row.communityId)),
    [query.data],
  );
  return useCallback(
    (slug: string) => isDemoSlugHidden(slug, hiddenIds),
    [hiddenIds],
  );
}

/** Whether a hide or unhide of this slug is in flight, from any component
 *  (keyed under the hidden list root). A row disables its button meanwhile. */
export function useIsHiddenCommunityChangePending(): (slug: string) => boolean {
  const pendingSlugs = useMutationState({
    filters: {
      mutationKey: eventKeys.hiddenCommunitiesRoot,
      status: "pending",
    },
    select: (mutation) =>
      (mutation.state.variables as { slug?: string } | undefined)?.slug,
  });
  return useCallback(
    (slug: string) => pendingSlugs.includes(slug),
    [pendingSlugs],
  );
}

/**
 * Refetches every list a hidden community can change, once the LAST hide or
 * unhide in flight settles (the settling one still counts as mutating). An
 * earlier settle would refetch the lists and the hidden list while a later
 * change is pending, bringing its cards and its chip back until it lands.
 * Demo never refetches the hidden list (it resolves the seed). Resolves true
 * once the active lists have refetched, false when it skipped.
 */
export async function refreshAfterLastHiddenChange(
  queryClient: QueryClient,
  isDemo: boolean,
): Promise<boolean> {
  const changesInFlight = queryClient.isMutating({
    mutationKey: eventKeys.hiddenCommunitiesRoot,
  });
  if (changesInFlight > 1) return false;
  const roots = [
    eventKeys.listRoot,
    eventKeys.homepageGatheringsRoot,
    eventKeys.moreFromHostRoot,
    ...(isDemo ? [] : [eventKeys.hiddenCommunitiesRoot]),
  ];
  await Promise.all(
    roots.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );
  return true;
}

/** Every row the cached upcoming lists the filters match currently hold. */
function cachedUpcomingRows(queryClient: QueryClient, filters: QueryFilters) {
  return queryClient
    .getQueriesData<InfiniteData<EventsPageVM>>(filters)
    .flatMap(([, data]) => data?.pages ?? [])
    .flatMap((page) => page.items);
}

/**
 * Whether a co-hosted event the member hid a community from stays listed.
 * Demo applies the rule to its registry against the saved hidden list. Live
 * reads the upcoming lists on screen once they hold the server's answer,
 * refetching them here when `refreshing` skipped for a later change.
 */
export async function doesHiddenEventStay(
  queryClient: QueryClient,
  isDemo: boolean,
  slug: string,
  refreshing: Promise<boolean>,
): Promise<boolean> {
  if (isDemo) {
    const hiddenRows =
      queryClient.getQueryData<HiddenEventCommunityDTO[]>(
        eventKeys.hiddenCommunities(true),
      ) ?? [];
    return !isDemoSlugHidden(
      slug,
      new Set(hiddenRows.map((row) => row.communityId)),
    );
  }
  const activeUpcomingLists: QueryFilters = {
    ...HIDEABLE_UPCOMING_LISTS,
    type: "active",
  };
  if (!(await refreshing)) {
    await queryClient.refetchQueries(activeUpcomingLists);
  }
  return cachedUpcomingRows(queryClient, activeUpcomingLists).some(
    (event) => event.slug === slug,
  );
}

/** The id of a community a cached upcoming card names by `slug`, for a hide
 *  that arrives with a slug alone (the refine search). */
export function findCachedCommunityId(
  queryClient: QueryClient,
  slug: string,
): string | undefined {
  return cachedUpcomingRows(queryClient, HIDEABLE_UPCOMING_LISTS).find(
    (event) => event.hostingCommunity?.slug === slug,
  )?.hostingCommunity?.id;
}

/**
 * Demo mode keeps the hidden list in the query cache alone, so it must outlive
 * every observer: a hide made from a card on Highlights, with no hidden list
 * mounted, would otherwise be garbage collected five minutes later and quietly
 * bring the events back. The actions call it before each demo write (a
 * mounted list query sets the same options). Idempotent, demo key only.
 */
export function keepDemoHiddenListForSession(queryClient: QueryClient): void {
  queryClient.setQueryDefaults(eventKeys.hiddenCommunities(true), {
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
