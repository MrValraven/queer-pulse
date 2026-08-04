import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { ListingStatus } from "../../marketing/listBusiness/listBusiness.data";
import { setListingStatus } from "../../marketing/listBusiness/api/listings.api";
import {
  getDemoListingMutation,
  recordDemoListingMutation,
  restoreDemoListingMutation,
  type DemoListingMutation,
} from "../adminListings.data";
import {
  listingDtoToQueueRow,
  type ListingQueueRow,
} from "./adminListings.api";
import {
  ADMIN_LISTINGS_KEY,
  patchListingInCache,
  restoreAdminListingsQueries,
  snapshotAdminListingsQueries,
} from "./useAdminListings";
import { listingHistoryQueryKey } from "./useListingHistory";
import { useDemoAwareMutation } from "./demoAwareMutation";

export interface SetListingStatusVars {
  row: ListingQueueRow;
  status: ListingStatus;
  /** Optional moderator note, recorded on the listing's moderation event and
   *  DM'd to the submitter on a send-back (live mode only — see
   *  `listings.service.ts`). */
  reason?: string;
}

interface SetListingStatusContext {
  previousQueries: ReturnType<typeof snapshotAdminListingsQueries>;
  /** The registry's prior entry for this ref (demo mode only, else
   *  `undefined`) — see `onError` below. */
  previousDemoMutation: DemoListingMutation | undefined;
}

/**
 * A moderator moves a listing along its review lifecycle (review → question →
 * live, or back). Optimistically patches the cached queue row on `onMutate`
 * (rolled back on `onError`) so the page reflects the new status immediately
 * with no local override map — in demo mode that patch is the new truth (the
 * fixture never mutates); in live mode it's reconciled by the
 * `invalidateQueries` in `onLiveSuccess`. Live mode PATCHes
 * `/listings/:ref/status`.
 */
export function useSetListingStatus() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    ListingQueueRow,
    Error,
    SetListingStatusVars,
    SetListingStatusContext
  >({
    demoMode,
    demoResult: ({ row, status }) => ({ ...row, status }),
    live: async ({ row, status, reason }) =>
      listingDtoToQueueRow(await setListingStatus(row.ref, status, reason)),
    logLabel: "admin.listing.setStatus",
    logContext: ({ row, status, reason }) => ({ ref: row.ref, status, reason }),
    onMutate: async ({ row, status }) => {
      await queryClient.cancelQueries({
        queryKey: [ADMIN_LISTINGS_KEY, demoMode],
      });
      const previousQueries = snapshotAdminListingsQueries(
        queryClient,
        demoMode,
      );
      // The cache patch below only reaches queries already cached this
      // session; the registry is what makes a not-yet-visited status tab's
      // fresh fetch agree with this move too (see `applyDemoListingMutations`).
      const previousDemoMutation = demoMode
        ? getDemoListingMutation(row.ref)
        : undefined;
      if (demoMode) recordDemoListingMutation(row.ref, { status });
      patchListingInCache(queryClient, demoMode, row.ref, (current) => ({
        ...current,
        status,
      }));
      return { previousQueries, previousDemoMutation };
    },
    onError: (_error, { row }, context) => {
      if (context?.previousQueries) {
        restoreAdminListingsQueries(queryClient, context.previousQueries);
      }
      if (demoMode) {
        restoreDemoListingMutation(row.ref, context?.previousDemoMutation);
      }
    },
    // Demo mode has no server-side history to go stale against — the fixture in
    // `DEMO_LISTING_HISTORY` is static and doesn't model this move, so there's
    // nothing to invalidate/reconcile (hence live-only).
    onLiveSuccess: (_data, { row }) => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_LISTINGS_KEY] });
      void queryClient.invalidateQueries({
        queryKey: listingHistoryQueryKey(row.ref, false),
      });
    },
  });
}
