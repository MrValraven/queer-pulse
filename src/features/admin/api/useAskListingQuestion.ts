import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logInfo } from "../../../shared/observability/logger";
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

/** How long demo mode pretends the round-trip takes, to keep the UX honest. */
const DEMO_LATENCY_MS = 400;

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
  return useMutation<
    ListingQueueRow,
    Error,
    AskListingQuestionVars,
    AskListingQuestionContext
  >({
    // AskQuestionModal shows its own inline error, so silence the global
    // MutationCache toast — otherwise a failed ask double-surfaces.
    meta: { silentError: true },
    mutationFn: async ({ row, body }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
        logInfo("admin.listing.askQuestion (demo — no network)", {
          ref: row.ref,
          length: body.length,
        });
        return { ...row, status: "question" };
      }
      const updated = await askListingQuestion(row.ref, body);
      return listingDtoToQueueRow(updated);
    },
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
    onSuccess: (_data, { row }) => {
      // Demo mode has no server-side history to go stale against — the
      // fixture in `DEMO_LISTING_HISTORY` is static and doesn't model this
      // ask, so there's nothing here to invalidate/reconcile.
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: [ADMIN_LISTINGS_KEY] });
      void queryClient.invalidateQueries({
        queryKey: listingHistoryQueryKey(row.ref, false),
      });
    },
  });
}
