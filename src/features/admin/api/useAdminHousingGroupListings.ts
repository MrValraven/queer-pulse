import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { ItemsPage } from "../../../shared/api/pagination";
import { ADMIN_GROUP_LISTING_QUEUE_DEMO } from "../adminHousingGroupListings.data";
import {
  getGroupListingQueue,
  setGroupListingStatus,
  type AdminGroupListingQueueDTO,
  type GroupListingQueueFilter,
  type GroupListingStatus,
} from "./adminHousingGroupListings.api";
import { useDemoAwareMutation } from "./demoAwareMutation";

/** Shared prefix for every queue page. The full key also carries `demoMode`,
 *  the active status filter and the group slug. */
export const GROUP_LISTING_QUEUE_KEY = "admin-group-listing-queue";

type QueuePage = ItemsPage<AdminGroupListingQueueDTO>;
type QueueCache = InfiniteData<QueuePage>;

/** Demo mode filters and sorts the fixture exactly as the backend orders the
 *  real queue (riskiest first, then newest), so the console demonstrates the
 *  order a moderator will actually meet. */
function demoPage(
  filter: GroupListingQueueFilter,
  groupSlug: string,
): QueuePage {
  const matching = ADMIN_GROUP_LISTING_QUEUE_DEMO.filter(
    (listing) =>
      (filter === "all" || listing.status === filter) &&
      (!groupSlug || listing.groupSlug === groupSlug),
  );
  const ordered = [...matching].sort((left, right) => {
    if (left.riskScore !== right.riskScore) {
      return right.riskScore - left.riskScore;
    }
    return Date.parse(right.createdAt) - Date.parse(left.createdAt);
  });
  return {
    items: ordered,
    total: ordered.length,
    page: 1,
    pageSize: ordered.length || 1,
  };
}

/**
 * The group-listing review queue, paginated, riskiest first.
 *
 * Demo mode returns the colocated fixture and never touches the network: this
 * is a moderator-only endpoint that 403s otherwise, and the fixture is
 * fabricated data that must never surface as platform truth. Live mode calls
 * `GET /admin/housing-groups/listings/queue?status&group&page`, stopping once
 * `page * pageSize` reaches the server's real total.
 */
export function useGroupListingQueue(
  filter: GroupListingQueueFilter,
  groupSlug: string,
) {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery<QueuePage>({
    queryKey: [GROUP_LISTING_QUEUE_KEY, demoMode, filter, groupSlug],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      demoMode
        ? Promise.resolve(demoPage(filter, groupSlug))
        : getGroupListingQueue(
            {
              page: pageParam as number,
              status: filter === "all" ? undefined : filter,
              group: groupSlug || undefined,
            },
            signal,
          ),
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const listings = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, listings, total };
}

export interface DecideGroupListingVars {
  listing: AdminGroupListingQueueDTO;
  status: GroupListingStatus;
  reason?: string;
}

/** The status filter a cached queue page was fetched under, read back off its
 *  own key so a decided row can leave the tab it no longer belongs to. */
function filterOfKey(queryKey: QueryKey): GroupListingQueueFilter {
  const candidate = queryKey[2];
  return typeof candidate === "string"
    ? (candidate as GroupListingQueueFilter)
    : "all";
}

/**
 * Record one review decision.
 *
 * The row is patched in place across every cached tab in BOTH modes (the
 * optimistic patch is demo mode's only source of truth), and then dropped from
 * any tab whose status filter it no longer matches, so a moderator working the
 * "waiting" tab watches their queue shrink and never re-decides a row they
 * just cleared. Live mode refetches afterwards to pick up the server's real
 * ordering. A failure puts every tab back exactly as it was.
 */
export function useDecideGroupListing() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useDemoAwareMutation<
    AdminGroupListingQueueDTO,
    Error,
    DecideGroupListingVars,
    { previousQueues: [QueryKey, QueueCache | undefined][] }
  >({
    demoMode,
    demoResult: ({ listing, status, reason }) => ({
      ...listing,
      status,
      decidedAt: new Date().toISOString(),
      decisionReason: reason?.trim() ? reason.trim() : null,
    }),
    live: ({ listing, status, reason }) =>
      setGroupListingStatus(listing.id, { status, reason }),
    logLabel: "admin.groupListing.setStatus",
    logContext: ({ listing, status }) => ({ id: listing.id, status }),
    meta: { silentError: true }, // the queue toasts locally
    onMutate: async ({ listing, status, reason }) => {
      await queryClient.cancelQueries({ queryKey: [GROUP_LISTING_QUEUE_KEY] });
      const previousQueues = queryClient.getQueriesData<QueueCache>({
        queryKey: [GROUP_LISTING_QUEUE_KEY],
      });
      const decidedRow: AdminGroupListingQueueDTO = {
        ...listing,
        status,
        decidedAt: new Date().toISOString(),
        decisionReason: reason?.trim() ? reason.trim() : null,
      };
      for (const [queryKey] of previousQueues) {
        const keyFilter = filterOfKey(queryKey);
        queryClient.setQueryData<QueueCache>(queryKey, (current) =>
          current
            ? {
                ...current,
                pages: current.pages.map((page) => ({
                  ...page,
                  items: page.items
                    .map((row) => (row.id === listing.id ? decidedRow : row))
                    .filter(
                      (row) => keyFilter === "all" || row.status === keyFilter,
                    ),
                })),
              }
            : current,
        );
      }
      return { previousQueues };
    },
    onError: (_error, _variables, context) => {
      for (const [queryKey, snapshot] of context?.previousQueues ?? []) {
        queryClient.setQueryData(queryKey, snapshot);
      }
    },
    onLiveSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: [GROUP_LISTING_QUEUE_KEY],
      });
    },
  });
}
