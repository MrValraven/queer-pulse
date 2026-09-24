import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { deleteListingAsModerator } from "../../marketing/listBusiness/api/listings.api";
import { recordDemoListingMutation } from "../adminListings.data";
import type { ListingQueueRow } from "./adminListings.api";
import { ADMIN_LISTINGS_KEY, patchListingInCache } from "./useAdminListings";
import { listingHistoryQueryKey } from "./useListingHistory";
import { useDemoAwareMutation } from "./demoAwareMutation";

export interface RemoveListingVars {
  row: ListingQueueRow;
  /** The moderator's required reason, recorded on the listing's moderation
   *  event and sent to the owner as a message. Live mode only; see
   *  `listings.service.ts`. */
  reason: string;
}

/**
 * A moderator permanently deletes a listing from the moderation queue. The
 * delete is hard and has no undo, so the row leaves the cached queue only
 * once the server confirms (`onSuccess`, both modes). Waiting keeps the row,
 * and the `ListingDeleteFlow` mounted from its menu, on screen while the
 * request runs, so a failure can surface inline in that flow. That inline
 * error is the one failure surface, which is why `meta.silentError` quiets
 * the app-wide MutationCache toast. In demo mode the success patch is the
 * new truth (the fixture never mutates); in live mode it is reconciled by the
 * `invalidateQueries` in `onLiveSuccess`. Live mode DELETEs
 * `/admin/listings/:ref`.
 */
export function useRemoveListing() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<void, Error, RemoveListingVars>({
    demoMode,
    meta: { silentError: true },
    demoResult: () => undefined,
    live: ({ row, reason }) => deleteListingAsModerator(row.ref, reason),
    logLabel: "admin.listing.remove",
    logContext: ({ row, reason }) => ({ ref: row.ref, reason }),
    onMutate: async () => {
      // Stop an in-flight queue fetch from landing after the success patch
      // below and putting the removed row back.
      await queryClient.cancelQueries({
        queryKey: [ADMIN_LISTINGS_KEY, demoMode],
      });
    },
    onSuccess: (_data, { row }) => {
      // See `useSetListingStatus`: the registry keeps a not-yet-visited tab's
      // fresh fetch from resurrecting a row this session already removed.
      if (demoMode) recordDemoListingMutation(row.ref, { removed: true });
      patchListingInCache(queryClient, demoMode, row.ref, () => null);
    },
    // Demo mode has no server-side history to go stale against: the fixture in
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
