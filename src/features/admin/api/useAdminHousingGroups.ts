import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { ItemsPage } from "../../../shared/api/pagination";
import {
  ADMIN_GROUP_JOIN_REQUESTS_DEMO,
  ADMIN_GROUP_LISTINGS_DEMO,
} from "../adminHousingGroups.data";
import {
  type AdminGroupJoinRequestDTO,
  type AdminGroupListingDTO,
  type GroupTriageAction,
  getAdminGroupJoinRequests,
  getAdminGroupListings,
  setAdminGroupListingHidden,
  triageAdminGroupJoinRequest,
} from "./adminHousingGroups.api";
import { useDemoAwareMutation } from "./demoAwareMutation";

export const ADMIN_GROUP_JOIN_REQUESTS_KEY =
  "admin-housing-group-join-requests";
export const ADMIN_GROUP_LISTINGS_KEY = "admin-housing-group-listings";

/**
 * The PENDING group join requests across all groups, for the admin triage queue,
 * paginated (ENG-41).
 *
 * Two things changed here, and the first one was a correctness bug rather than a
 * truncation: this hook used to fetch every request in every status and the page
 * filtered to `status === "pending"` in the browser. The endpoint capped that
 * fetch at the newest 200 rows, so a group with 200 decided requests newer than
 * a pending one showed the moderator an EMPTY queue while somebody waited. The
 * filter now travels in the query, and `total` is the real number of people
 * waiting rather than the length of whatever arrived. `fetchNextPage` walks the
 * rest, stopping once `page * pageSize` reaches that total.
 *
 * Demo mode returns the colocated (empty) fixture as a single synthetic page and
 * never hits the network: this is a moderator/admin-only endpoint that 403s for
 * anyone else. Mirrors `useGroupListingQueue` beside it.
 */
export function useAdminGroupJoinRequests() {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery<ItemsPage<AdminGroupJoinRequestDTO>>({
    queryKey: [ADMIN_GROUP_JOIN_REQUESTS_KEY, demoMode],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      demoMode
        ? Promise.resolve({
            items: ADMIN_GROUP_JOIN_REQUESTS_DEMO,
            total: ADMIN_GROUP_JOIN_REQUESTS_DEMO.length,
            page: 1,
            pageSize: ADMIN_GROUP_JOIN_REQUESTS_DEMO.length || 1,
          })
        : getAdminGroupJoinRequests({
            page: pageParam as number,
            status: "pending",
          }),
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const requests = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, requests, total };
}

/** Every group listing, including hidden ones, for norm enforcement. */
export function useAdminGroupListings() {
  const { demoMode } = useDemoMode();
  return useQuery<AdminGroupListingDTO[]>({
    queryKey: [ADMIN_GROUP_LISTINGS_KEY, demoMode],
    initialData: demoMode ? ADMIN_GROUP_LISTINGS_DEMO : undefined,
    queryFn: () =>
      demoMode ? ADMIN_GROUP_LISTINGS_DEMO : getAdminGroupListings(),
  });
}

export interface TriageGroupJoinRequestVars {
  id: string;
  action: GroupTriageAction;
}

/**
 * Admin approves or declines a group join request. No-op in demo mode (the demo
 * queue is intentionally empty); live mode PATCHes and invalidates the queue.
 */
export function useTriageGroupJoinRequest() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminGroupJoinRequestDTO | undefined,
    Error,
    TriageGroupJoinRequestVars
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // the page toasts locally
    demoResult: () => undefined,
    live: ({ id, action }) => triageAdminGroupJoinRequest(id, action),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_GROUP_JOIN_REQUESTS_KEY],
      });
    },
  });
}

export interface SetGroupListingHiddenVars {
  id: string;
  hidden: boolean;
  reason?: string;
}

/**
 * Admin hides or un-hides a group listing for a norm violation. No-op in demo
 * mode; live mode PATCHes and invalidates the listings table.
 */
export function useSetGroupListingHidden() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminGroupListingDTO | undefined,
    Error,
    SetGroupListingHiddenVars
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // the page toasts locally
    demoResult: () => undefined,
    live: ({ id, hidden, reason }) =>
      setAdminGroupListingHidden(id, hidden, reason),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_GROUP_LISTINGS_KEY],
      });
    },
  });
}
