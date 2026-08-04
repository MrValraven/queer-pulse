import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { askListingQuestion } from "../../marketing/listBusiness/api/listings.api";
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

export interface AskListingQuestionVars {
  row: ListingQueueRow;
  body: string;
}

interface AskListingQuestionContext {
  previousQueries: ReturnType<typeof snapshotAdminListingsQueries>;
  /** The registry's prior entry for this ref (demo mode only, else
   *  `undefined`) — see `onError` below. */
  previousDemoMutation: DemoListingMutation | undefined;
}

/**
 * A moderator asks a listing's submitter a question. Optimistically patches
 * the cached queue row to `question` on `onMutate` (rolled back on `onError`)
 * so the row reflects the new status immediately with no local override map —
 * in demo mode that patch is the new truth (the fixture never mutates); in
 * live mode it's reconciled by the `invalidateQueries` below. Live mode POSTs
 * `/listings/:ref/question` (which DMs the submitter and moves the listing to
 * `question`).
 */
export function useAskListingQuestion() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    ListingQueueRow,
    Error,
    AskListingQuestionVars,
    AskListingQuestionContext
  >({
    demoMode,
    // AskQuestionModal shows its own inline error, so silence the global
    // MutationCache toast — otherwise a failed ask double-surfaces.
    meta: { silentError: true },
    demoResult: ({ row }) => ({ ...row, status: "question" }),
    live: async ({ row, body }) =>
      listingDtoToQueueRow(await askListingQuestion(row.ref, body)),
    logLabel: "admin.listing.askQuestion",
    logContext: ({ row, body }) => ({ ref: row.ref, length: body.length }),
    onMutate: async ({ row }) => {
      await queryClient.cancelQueries({
        queryKey: [ADMIN_LISTINGS_KEY, demoMode],
      });
      const previousQueries = snapshotAdminListingsQueries(
        queryClient,
        demoMode,
      );
      // See `useSetListingStatus` — the registry keeps a not-yet-visited
      // status tab's fresh fetch consistent with this ask, beyond what the
      // cache patch below alone can reach.
      const previousDemoMutation = demoMode
        ? getDemoListingMutation(row.ref)
        : undefined;
      if (demoMode) {
        recordDemoListingMutation(row.ref, { status: "question" });
      }
      patchListingInCache(queryClient, demoMode, row.ref, (current) => ({
        ...current,
        status: "question",
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
    // `DEMO_LISTING_HISTORY` is static and doesn't model this ask, so there's
    // nothing to invalidate/reconcile (hence live-only).
    onLiveSuccess: (_data, { row }) => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_LISTINGS_KEY] });
      void queryClient.invalidateQueries({
        queryKey: listingHistoryQueryKey(row.ref, false),
      });
    },
  });
}
