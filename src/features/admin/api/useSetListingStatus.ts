import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logInfo } from "../../../shared/observability/logger";
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

/** How long demo mode pretends the round-trip takes, to keep the UX honest. */
const DEMO_LATENCY_MS = 400;

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
 * `invalidateQueries` below. Live mode PATCHes `/listings/:ref/status`.
 */
export function useSetListingStatus() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    ListingQueueRow,
    Error,
    SetListingStatusVars,
    SetListingStatusContext
  >({
    mutationFn: async ({ row, status, reason }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
        logInfo("admin.listing.setStatus (demo — no network)", {
          ref: row.ref,
          status,
          reason,
        });
        return { ...row, status };
      }
      const updated = await setListingStatus(row.ref, status, reason);
      return listingDtoToQueueRow(updated);
    },
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
    onSuccess: (_data, { row }) => {
      // Demo mode has no server-side history to go stale against — the
      // fixture in `DEMO_LISTING_HISTORY` is static and doesn't model this
      // move, so there's nothing here to invalidate/reconcile.
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: [ADMIN_LISTINGS_KEY] });
      void queryClient.invalidateQueries({
        queryKey: listingHistoryQueryKey(row.ref, false),
      });
    },
  });
}
