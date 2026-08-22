import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { deleteListingAsModerator } from "../../marketing/listBusiness/api/listings.api";
import {
  getDemoListingMutation,
  recordDemoListingMutation,
  restoreDemoListingMutation,
  type DemoListingMutation,
} from "../adminListings.data";
import type { ListingQueueRow } from "./adminListings.api";
import {
  ADMIN_LISTINGS_KEY,
  patchListingInCache,
  restoreAdminListingsQueries,
  snapshotAdminListingsQueries,
} from "./useAdminListings";
import { listingHistoryQueryKey } from "./useListingHistory";
import { useDemoAwareMutation } from "./demoAwareMutation";

export interface RemoveListingVars {
  row: ListingQueueRow;
  /** Optional moderator note, recorded on the listing's moderation event.
   *  Live mode only — see `listings.service.ts`. */
  reason?: string;
}

interface RemoveListingContext {
  previousQueries: ReturnType<typeof snapshotAdminListingsQueries>;
  /** The registry's prior entry for this ref (demo mode only, else
   *  `undefined`) — see `onError` below. */
  previousDemoMutation: DemoListingMutation | undefined;
}

/**
 * A moderator permanently deletes a listing from the moderation queue.
 * Optimistically drops the row from the cached queue on `onMutate` (rolled
 * back on `onError`) so the row disappears immediately with no local
 * removed-refs set — in demo mode that patch is the new truth (the fixture
 * never mutates); in live mode it's reconciled by the `invalidateQueries` in
 * `onLiveSuccess`. Live mode DELETEs `/admin/listings/:ref`.
 */
export function useRemoveListing() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    void,
    Error,
    RemoveListingVars,
    RemoveListingContext
  >({
    demoMode,
    demoResult: () => undefined,
    live: ({ row, reason }) => deleteListingAsModerator(row.ref, reason),
    logLabel: "admin.listing.remove",
    logContext: ({ row, reason }) => ({ ref: row.ref, reason }),
    onMutate: async ({ row }) => {
      await queryClient.cancelQueries({
        queryKey: [ADMIN_LISTINGS_KEY, demoMode],
      });
      const previousQueries = snapshotAdminListingsQueries(
        queryClient,
        demoMode,
      );
      // See `useSetListingStatus` — the registry keeps a not-yet-visited tab's
      // fresh fetch from resurrecting a row this session already removed.
      const previousDemoMutation = demoMode
        ? getDemoListingMutation(row.ref)
        : undefined;
      if (demoMode) recordDemoListingMutation(row.ref, { removed: true });
      patchListingInCache(queryClient, demoMode, row.ref, () => null);
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
    // `DEMO_LISTING_HISTORY` is static and doesn't model this removal, so
    // there's nothing to invalidate/reconcile (hence live-only).
    onLiveSuccess: (_data, { row }) => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_LISTINGS_KEY] });
      void queryClient.invalidateQueries({
        queryKey: listingHistoryQueryKey(row.ref, false),
      });
    },
  });
}
