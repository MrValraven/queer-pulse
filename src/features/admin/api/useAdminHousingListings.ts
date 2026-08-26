import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { DEMO_HOUSING_REVIEW_QUEUE as DEMO_QUEUE } from "../adminHousingListings.data";
import type { ItemsPage } from "../../../shared/api/pagination";
import {
  decideHousingListing,
  getHousingReviewQueue,
  type AdminHousingListingDTO,
  type DecideHousingListingBody,
  type HousingReviewQueueSort,
  type HousingReviewQueueStatus,
} from "./adminHousingListings.api";
import { useDemoAwareMutation } from "./demoAwareMutation";

export const HOUSING_REVIEW_QUEUE_KEY = "admin-housing-review-queue";

/** The status the backend moves a listing into for each decision. Kept here so
 * the optimistic patch and the demo fixture agree with the server. */
const DECISION_STATUS: Record<
  DecideHousingListingBody["decision"],
  AdminHousingListingDTO["status"]
> = {
  approve: "live",
  request_changes: "question",
  reject: "rejected",
  take_down: "taken_down",
};

/** Demo mode sorts and filters the fixture the same way the backend does, so
 * the console demonstrates the real queue order rather than a fixed list. */
function demoPage(
  status: HousingReviewQueueStatus,
  sort: HousingReviewQueueSort,
): ItemsPage<AdminHousingListingDTO> {
  const filtered =
    status === "all"
      ? [...DEMO_QUEUE]
      : DEMO_QUEUE.filter((listing) => listing.status === status);
  const sorted = filtered.sort((left, right) => {
    if (sort === "risk" && left.riskScore !== right.riskScore) {
      return right.riskScore - left.riskScore;
    }
    const leftTime = Date.parse(left.createdAt);
    const rightTime = Date.parse(right.createdAt);
    return sort === "newest" ? rightTime - leftTime : leftTime - rightTime;
  });
  return {
    items: sorted,
    total: sorted.length,
    page: 1,
    pageSize: sorted.length || 1,
  };
}

/**
 * The housing review queue, paginated, riskiest first by default.
 *
 * Demo mode returns the colocated fixture and never touches the network: this
 * is a staff-only endpoint that 403s otherwise, and the fixture is fabricated
 * data that must never surface as platform truth. Live mode calls
 * `GET /admin/housing-listings?status&sort&page`, stopping once
 * `page * pageSize` reaches the server's real total.
 */
export function useHousingReviewQueue(
  status: HousingReviewQueueStatus,
  sort: HousingReviewQueueSort,
) {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery<ItemsPage<AdminHousingListingDTO>>({
    queryKey: [HOUSING_REVIEW_QUEUE_KEY, demoMode, status, sort],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      demoMode
        ? Promise.resolve(demoPage(status, sort))
        : getHousingReviewQueue({
            status,
            sort,
            page: pageParam as number,
          }),
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const listings = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, listings, total };
}

export interface DecideHousingListingVars extends DecideHousingListingBody {
  listing: AdminHousingListingDTO;
}

type QueueCache = InfiniteData<ItemsPage<AdminHousingListingDTO>> | undefined;

/**
 * Records one moderator decision.
 *
 * The decided row is dropped from the cached queue straight away in BOTH modes
 * so the moderator's working set shrinks as they go and they never re-decide a
 * row they just cleared, then live mode refetches to pick up the server's real
 * ordering and the notification the lister was sent. A failure puts the row
 * back where it was.
 */
export function useDecideHousingListing() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useDemoAwareMutation<
    AdminHousingListingDTO,
    Error,
    DecideHousingListingVars,
    { previousQueues: [readonly unknown[], QueueCache][] }
  >({
    demoMode,
    demoResult: ({ listing, decision, reason }) => ({
      ...listing,
      status: DECISION_STATUS[decision],
      decision: {
        status: DECISION_STATUS[decision],
        reason: reason?.trim() ? reason.trim() : null,
        at: new Date().toISOString(),
      },
    }),
    live: ({ listing, decision, reason }) =>
      decideHousingListing(listing.ref, { decision, reason }),
    logLabel: "admin.housingListing.decide",
    logContext: ({ listing, decision }) => ({
      ref: listing.ref,
      decision,
    }),
    onMutate: async ({ listing }) => {
      await queryClient.cancelQueries({
        queryKey: [HOUSING_REVIEW_QUEUE_KEY],
      });
      const previousQueues = queryClient.getQueriesData<
        InfiniteData<ItemsPage<AdminHousingListingDTO>>
      >({ queryKey: [HOUSING_REVIEW_QUEUE_KEY] });
      for (const [queryKey] of previousQueues) {
        queryClient.setQueryData<
          InfiniteData<ItemsPage<AdminHousingListingDTO>>
        >(queryKey, (current) =>
          current
            ? {
                ...current,
                pages: current.pages.map((page) => ({
                  ...page,
                  items: page.items.filter((row) => row.ref !== listing.ref),
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
        queryKey: [HOUSING_REVIEW_QUEUE_KEY],
      });
    },
  });
}
