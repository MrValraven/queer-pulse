import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { logInfo } from "../../../shared/observability/logger";
import type {
  VerificationLevel,
  VerificationRequestStatus,
  VerificationType,
} from "../../economy/api/verification.api";
import {
  ADMIN_VERIFICATION_HISTORY,
  filterDemoVerifications,
} from "../adminVerifications.data";
import {
  DEMO_VERIFICATION_REQUESTS,
  DEMO_VERIFICATION_REQUEST_DETAIL,
  filterDemoVerificationRequests,
} from "../verificationRequests.data";
import { DEMO_LATENCY_MS, useDemoAwareMutation } from "./demoAwareMutation";
import {
  bulkDecideVerificationRequests,
  decideVerificationRequest,
  getAdminVerificationRequestDetail,
  getAdminVerificationRequests,
  getAdminVerifications,
  getVerificationHistory,
  overrideVerification,
  type AdminVerificationDTO,
  type AdminVerificationListDTO,
  type AdminVerificationRequestDetailDTO,
  type AdminVerificationRequestDTO,
  type AdminVerificationRequestListDTO,
  type BulkDecideVerificationRequestsResultDTO,
  type VerificationEventDTO,
  type VerificationLevelFilter,
  type VerificationRequestCounts,
  type VerificationRequestDecisionAction,
  type VerificationRequestSort,
  type VerificationRequestStatusFilter,
  type VerificationSort,
} from "./adminVerifications.api";

export const ADMIN_VERIFICATIONS_KEY = "admin-verifications";
export const ADMIN_VERIFICATION_HISTORY_KEY = "admin-verification-history";

const EMPTY_VERIFICATION_COUNTS: AdminVerificationListDTO["counts"] = {
  none: 0,
  email: 0,
  phone: 0,
  id_verified: 0,
};

export interface UseAdminVerificationsFilter {
  level: VerificationLevelFilter;
  query: string;
  sort: VerificationSort;
}

/**
 * The manual/stub verification review queue for the admin console —
 * filterable by level, free-text search, and sort, with real keyset
 * pagination via `useInfiniteQuery` (`fetchNextPage`/`hasNextPage` accumulate
 * `rows` across pages instead of truncating at page 1). `counts` reflects
 * the `query` search but is NOT scoped by `level` — it's the axis the four
 * level tabs vary across, per `GET /admin/verifications`.
 *
 * Demo mode returns the colocated fixture filtered/sorted in-memory (never
 * hits the network) as a single full page — this is a Moderator/Admin-only
 * endpoint that 403s for anyone else, so this fabricated data must never
 * appear as platform truth in live mode.
 */
export function useAdminVerifications(filter: UseAdminVerificationsFilter) {
  const { demoMode } = useDemoMode();
  const { level, query, sort } = filter;

  const infiniteQuery = useInfiniteQuery<AdminVerificationListDTO>({
    queryKey: [ADMIN_VERIFICATIONS_KEY, demoMode, filter],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => {
      if (demoMode) {
        return Promise.resolve(filterDemoVerifications({ level, query, sort }));
      }
      return getAdminVerifications({
        level,
        query: query || undefined,
        sort,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const rows = infiniteQuery.data?.pages.flatMap((page) => page.rows) ?? [];
  const counts =
    infiniteQuery.data?.pages[0]?.counts ?? EMPTY_VERIFICATION_COUNTS;

  return { ...infiniteQuery, rows, counts };
}

/** A member's verification audit history for the drawer's history panel.
 *  Demo returns the colocated fixture's history for that member and never
 *  hits the (admin-only) network. */
export function useVerificationHistory(userId: string) {
  const { demoMode } = useDemoMode();
  const query = useQuery<VerificationEventDTO[]>({
    queryKey: [ADMIN_VERIFICATION_HISTORY_KEY, demoMode, userId],
    queryFn: () =>
      demoMode
        ? Promise.resolve(ADMIN_VERIFICATION_HISTORY[userId] ?? [])
        : getVerificationHistory(userId),
    enabled: Boolean(userId),
  });
  return { events: query.data ?? [], isLoading: query.isLoading };
}

/** Manual override — live only (demo has no real record to change; the
 *  review UI disables the control there). `reason` maps to the backend's
 *  `note` field and is required by the service when lowering a level. */
export function useApplyVerificationLevel() {
  const queryClient = useQueryClient();
  return useMutation<
    AdminVerificationDTO,
    Error,
    { userId: string; level: VerificationLevel; reason?: string }
  >({
    mutationFn: ({ userId, level, reason }) =>
      overrideVerification(userId, level, reason),
    onSuccess: (_updated, variables) => {
      // Override only ever runs live (demo disables the control), so these
      // invalidations target the live ("demoMode: false") cache entries the
      // same way the pre-existing override hook did.
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_VERIFICATIONS_KEY, false],
      });
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_VERIFICATION_HISTORY_KEY, false, variables.userId],
      });
    },
  });
}

// --- request lifecycle (Phase 2 review queue) ---

export const ADMIN_VERIFICATION_REQUESTS_KEY = "admin-verification-requests";
export const ADMIN_VERIFICATION_REQUEST_DETAIL_KEY =
  "admin-verification-request-detail";

const EMPTY_VERIFICATION_REQUEST_COUNTS: VerificationRequestCounts = {
  pending: 0,
  in_review: 0,
  approved: 0,
  rejected: 0,
  appealing: 0,
  withdrawn: 0,
};

export interface UseVerificationRequestsFilter {
  status: VerificationRequestStatusFilter;
  type?: VerificationType;
  query: string;
  sort: VerificationRequestSort;
  /**
   * OPS-04's "Assigned to me" filter. Applied SERVER-side in live mode (and
   * over the fixture in demo mode, so the two agree): this queue is keyset
   * paginated, and narrowing after the fetch would hide claimed rows that had
   * simply not loaded yet. Part of the query key, so switching it starts a new
   * keyset rather than reusing a cursor issued under the other value.
   */
  assignedTo?: "me" | "unassigned";
}

/**
 * The Phase 2 manual-review request queue for the admin console's "Review
 * queue" segment — filterable by status, type, free-text search, and sort,
 * with real keyset pagination via `useInfiniteQuery` (mirrors
 * `useAdminVerifications` above exactly). `counts` reflects the `query`/`type`
 * search but is NOT scoped by `status` — it's the axis the six status tabs
 * vary across, per `GET /admin/verifications/requests`.
 *
 * Demo mode returns the colocated fixture filtered/sorted in-memory (never
 * hits the network) as a single full page — this is a Moderator/Admin-only
 * endpoint that 403s for anyone else, so this fabricated data must never
 * appear as platform truth in live mode.
 */
export function useVerificationRequests(filter: UseVerificationRequestsFilter) {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const { status, type, query, sort, assignedTo } = filter;

  const infiniteQuery = useInfiniteQuery<AdminVerificationRequestListDTO>({
    queryKey: [ADMIN_VERIFICATION_REQUESTS_KEY, demoMode, filter],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => {
      if (demoMode) {
        return Promise.resolve(
          filterDemoVerificationRequests({
            status,
            type,
            query,
            sort,
            assignedTo,
            // Demo mode has no server to resolve "me" against, so the signed-in
            // demo user is passed in. The live branch never sends an id at all.
            currentUserId: user?.id ?? null,
          }),
        );
      }
      return getAdminVerificationRequests({
        status,
        type,
        query: query || undefined,
        sort,
        assignedTo,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const rows = infiniteQuery.data?.pages.flatMap((page) => page.rows) ?? [];
  const counts =
    infiniteQuery.data?.pages[0]?.counts ?? EMPTY_VERIFICATION_REQUEST_COUNTS;

  return { ...infiniteQuery, rows, counts };
}

/** A single request's full detail (context, evidence, signals, history) for
 *  the review drawer. Demo returns the colocated fixture and never hits the
 *  (admin-only) network. */
export function useVerificationRequestDetail(id: string) {
  const { demoMode } = useDemoMode();
  const query = useQuery<AdminVerificationRequestDetailDTO | null>({
    queryKey: [ADMIN_VERIFICATION_REQUEST_DETAIL_KEY, demoMode, id],
    queryFn: () =>
      demoMode
        ? Promise.resolve(DEMO_VERIFICATION_REQUEST_DETAIL[id] ?? null)
        : getAdminVerificationRequestDetail(id),
    enabled: Boolean(id),
  });
  return { detail: query.data ?? null, isLoading: query.isLoading };
}

const STATUS_BY_DECISION_ACTION: Record<
  VerificationRequestDecisionAction,
  VerificationRequestStatus
> = {
  in_review: "in_review",
  approve: "approved",
  reject: "rejected",
};

export interface DecideVerificationRequestVars {
  id: string;
  action: VerificationRequestDecisionAction;
  reason?: string;
}

type RequestsData = InfiniteData<AdminVerificationRequestListDTO>;
type CachedListEntry = [QueryKey, RequestsData | undefined];
interface DecideRequestContext {
  previousLists: CachedListEntry[];
  previousDetail: AdminVerificationRequestDetailDTO | null | undefined;
}

/** Patches one request row's `status` across every cached queue filter —
 *  module-level (not a hook-local closure) so both the single-row
 *  `useDecideVerificationRequest` and the bulk `useBulkDecideVerificationRequests`
 *  below share the exact same cache-patch logic instead of drifting apart. */
function patchRequestRowStatus(
  queryClient: QueryClient,
  id: string,
  status: VerificationRequestStatus,
) {
  queryClient.setQueriesData<RequestsData>(
    { queryKey: [ADMIN_VERIFICATION_REQUESTS_KEY] },
    (data) =>
      data
        ? {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              rows: page.rows.map((row) =>
                row.id === id
                  ? { ...row, status, updatedAt: new Date().toISOString() }
                  : row,
              ),
            })),
          }
        : data,
  );
}

/** Patches the open detail drawer's cache entry for one request, if one is
 *  cached. Shared the same way as {@link patchRequestRowStatus}. */
function patchRequestDetailStatus(
  queryClient: QueryClient,
  demoMode: boolean,
  id: string,
  status: VerificationRequestStatus,
  reason: string | undefined,
) {
  queryClient.setQueryData<AdminVerificationRequestDetailDTO | null>(
    [ADMIN_VERIFICATION_REQUEST_DETAIL_KEY, demoMode, id],
    (data) =>
      data
        ? {
            ...data,
            status,
            decisionReason: reason ?? data.decisionReason,
            updatedAt: new Date().toISOString(),
          }
        : data,
  );
}

/**
 * Decide a request from the review drawer — mark in-review, approve, or
 * reject. Dual-mode like `useAdminReadingGroupProposalMutations`/
 * `useAdminConcernMutations`: in demo mode the optimistic cache patch IS the
 * source of truth (no network, no invalidation of the request itself — the
 * fixture never goes stale); in live mode it calls
 * `PATCH /admin/verifications/requests/:id` and reconciles by invalidating on
 * settle. Both modes patch the row's `status` across every cached queue
 * filter AND the open detail drawer optimistically, and roll back on error.
 *
 * Approve raises the member's level via the Phase 1 override path
 * server-side, so on a successful approve this ALSO invalidates the level
 * console's list + history caches (live only — demo's level console is a
 * separate static fixture with no real level to change).
 */
export function useDecideVerificationRequest() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const patchRow = (id: string, status: VerificationRequestStatus) =>
    patchRequestRowStatus(queryClient, id, status);

  const patchDetail = (
    id: string,
    status: VerificationRequestStatus,
    reason: string | undefined,
  ) => patchRequestDetailStatus(queryClient, demoMode, id, status, reason);

  const mutation = useMutation<
    AdminVerificationRequestDTO,
    Error,
    DecideVerificationRequestVars,
    DecideRequestContext
  >({
    mutationFn: async ({ id, action, reason }) => {
      const status = STATUS_BY_DECISION_ACTION[action];
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
        logInfo("admin.verificationRequest.decide (demo — no network)", {
          id,
          action,
        });
        const base =
          DEMO_VERIFICATION_REQUESTS.find((row) => row.id === id) ??
          DEMO_VERIFICATION_REQUESTS[0]!;
        return { ...base, status, updatedAt: new Date().toISOString() };
      }
      return decideVerificationRequest(id, action, reason);
    },
    onMutate: async ({ id, action, reason }) => {
      await queryClient.cancelQueries({
        queryKey: [ADMIN_VERIFICATION_REQUESTS_KEY],
      });
      const previousLists = queryClient.getQueriesData<RequestsData>({
        queryKey: [ADMIN_VERIFICATION_REQUESTS_KEY],
      });
      const previousDetail =
        queryClient.getQueryData<AdminVerificationRequestDetailDTO | null>([
          ADMIN_VERIFICATION_REQUEST_DETAIL_KEY,
          demoMode,
          id,
        ]);
      const status = STATUS_BY_DECISION_ACTION[action];
      patchRow(id, status);
      patchDetail(id, status, reason);
      return { previousLists, previousDetail };
    },
    onError: (_error, { id }, context) => {
      context?.previousLists.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (context) {
        queryClient.setQueryData(
          [ADMIN_VERIFICATION_REQUEST_DETAIL_KEY, demoMode, id],
          context.previousDetail,
        );
      }
    },
    onSuccess: (updated) => {
      if (!demoMode && updated.status === "approved") {
        void queryClient.invalidateQueries({
          queryKey: [ADMIN_VERIFICATIONS_KEY, false],
        });
        void queryClient.invalidateQueries({
          queryKey: [ADMIN_VERIFICATION_HISTORY_KEY, false],
        });
      }
    },
    onSettled: (_data, _error, { id }) => {
      if (!demoMode) {
        void queryClient.invalidateQueries({
          queryKey: [ADMIN_VERIFICATION_REQUESTS_KEY],
        });
        void queryClient.invalidateQueries({
          queryKey: [ADMIN_VERIFICATION_REQUEST_DETAIL_KEY, false, id],
        });
      }
    },
    meta: { silentError: true },
  });

  return { decide: mutation.mutate, pending: mutation.isPending };
}

// --- bulk decide (Phase 3, Task 4) ---

export interface BulkDecideVerificationRequestsVars {
  ids: string[];
  action: VerificationRequestDecisionAction;
  reason?: string;
}

/**
 * The multi-select counterpart to `useDecideVerificationRequest` — the
 * Review-queue's `VerificationBulkActionBar` and the single-row keyboard
 * shortcuts (`A`/`R`, one id at a time) both go through this one hook.
 * Dual-mode like `useBulkListingAction`:
 *
 * - Demo mode never hits the network. It waits out the same demo latency,
 *   then for EACH id patches the row status across every cached queue filter
 *   AND the open detail drawer (the same pair `useDecideVerificationRequest`
 *   patches per row, just looped) — so a bulk decision stays consistent
 *   across every open tab/filter for the rest of the demo session, same as a
 *   single-row decision.
 * - Live mode calls the bulk endpoint once (one request server-side,
 *   returning which ids succeeded and which failed per-id) and invalidates
 *   the shared queue cache on success. No optimistic patch: unlike a
 *   single-row decision, a bulk request can partially fail, and which ids
 *   actually landed is only known after the round trip.
 *
 * Approve raises each member's level via the Phase 1 override path
 * server-side, so a successful LIVE bulk approve (action === "approve" AND
 * at least one id succeeded) ALSO invalidates the level console's list +
 * history caches — same condition `useDecideVerificationRequest.onSuccess`
 * gates on (`updated.status === "approved"`), just checked against the
 * request `action` here since a bulk result has no single `status` to read.
 * A bulk reject or mark-in-review never touches those two caches.
 *
 * Every caller gets the same toast here (not left to `VerificationBulkActionBar`
 * to compose): full success reports how many succeeded, a partial result
 * also names how many were skipped.
 */
export function useBulkDecideVerificationRequests() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showToast } = useToast();

  function reportOutcome(result: BulkDecideVerificationRequestsResultDTO) {
    if (result.failed.length > 0) {
      showToast(
        t("admin:verifications.requests.bulk.toast.partial", {
          succeeded: result.succeeded.length,
          failed: result.failed.length,
        }),
        "warning",
      );
      return;
    }
    showToast(
      t("admin:verifications.requests.bulk.toast.success", {
        count: result.succeeded.length,
      }),
      "success",
    );
  }

  const mutation = useDemoAwareMutation<
    BulkDecideVerificationRequestsResultDTO,
    Error,
    BulkDecideVerificationRequestsVars
  >({
    demoMode,
    logLabel: "admin.verificationRequest.bulkDecide",
    logContext: ({ ids, action }) => ({ ids, action }),
    // The per-id cache patch IS the demo optimistic update (looped, unlike
    // the single-row hook), so it belongs in `demoResult`.
    demoResult: ({ ids, action, reason }) => {
      const status = STATUS_BY_DECISION_ACTION[action];
      for (const id of ids) {
        patchRequestRowStatus(queryClient, id, status);
        patchRequestDetailStatus(queryClient, demoMode, id, status, reason);
      }
      return { succeeded: ids, failed: [] };
    },
    live: ({ ids, action, reason }) =>
      bulkDecideVerificationRequests(ids, action, reason),
    onSuccess: (result) => {
      reportOutcome(result);
    },
    onLiveSuccess: (result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_VERIFICATION_REQUESTS_KEY],
      });
      // Only a bulk APPROVE raises a member's level server-side — a bulk
      // reject or mark-in-review has nothing for the level console to
      // reflect, so gate this on the action, not just on "something
      // succeeded" (see the doc comment above).
      if (variables.action === "approve" && result.succeeded.length > 0) {
        void queryClient.invalidateQueries({
          queryKey: [ADMIN_VERIFICATIONS_KEY, false],
        });
        void queryClient.invalidateQueries({
          queryKey: [ADMIN_VERIFICATION_HISTORY_KEY, false],
        });
      }
    },
    meta: { silentError: true },
  });

  return {
    bulkDecide: (
      ids: string[],
      action: VerificationRequestDecisionAction,
      reason?: string,
    ) => mutation.mutateAsync({ ids, action, reason }),
    pending: mutation.isPending,
  };
}
