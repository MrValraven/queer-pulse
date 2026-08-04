import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logInfo } from "../../../shared/observability/logger";
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

/** How long demo mode pretends the round-trip takes, to keep the UX honest. */
const DEMO_LATENCY_MS = 400;

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
 * never mutates); in live mode it's reconciled by the `invalidateQueries`
 * below. Live mode DELETEs `/listings/admin/:ref`.
 */
export function useRemoveListing() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, RemoveListingVars, RemoveListingContext>({
    mutationFn: async ({ row, reason }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
        logInfo("admin.listing.remove (demo — no network)", {
          ref: row.ref,
          reason,
        });
        return;
      }
      await deleteListingAsModerator(row.ref, reason);
    },
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
    onSuccess: (_data, { row }) => {
      // Demo mode has no server-side history to go stale against — the
      // fixture in `DEMO_LISTING_HISTORY` is static and doesn't model this
      // removal, so there's nothing here to invalidate/reconcile.
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: [ADMIN_LISTINGS_KEY] });
      void queryClient.invalidateQueries({
        queryKey: listingHistoryQueryKey(row.ref, false),
      });
    },
  });
}
