import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ListingStatus } from "../../marketing/listBusiness/listBusiness.data";
import { recordDemoListingMutation } from "../adminListings.data";
import {
  bulkRemoveListings,
  bulkSetListingStatus,
  type BulkListingResultDTO,
} from "./adminListings.api";
import { ADMIN_LISTINGS_KEY, patchListingInCache } from "./useAdminListings";
import { useDemoAwareMutation } from "./demoAwareMutation";

interface BulkStatusVars {
  refs: string[];
  status: ListingStatus;
  reason?: string;
}

interface BulkRemoveVars {
  refs: string[];
  reason?: string;
}

/**
 * The multi-select counterpart to `useListingModeration` — a moderator moves
 * or removes every currently-selected queue row in one action. Dual-mode like
 * every other listings mutation:
 *
 * - Demo mode never hits the network. It waits out the same demo latency as a
 *   single-row mutation (the `demoAwareMutation` default), then for EACH ref
 *   calls `recordDemoListingMutation`
 *   (the demo-session overlay that survives a not-yet-fetched status tab) and
 *   `patchListingInCache` (the instant same-tab cache patch) — exactly the pair
 *   `useSetListingStatus`/`useRemoveListing` call per row, just looped, so a
 *   bulk move/remove stays consistent across every open tab/filter for the
 *   rest of the demo session the same way a single-row action does.
 * - Live mode calls the BE-3 bulk endpoint once (one transaction server-side,
 *   returning which refs updated and which failed) and invalidates the shared
 *   queue cache. No optimistic patch here: unlike a single-row move, a bulk
 *   request can partially fail, and which refs actually landed is only known
 *   after the round trip — patching ahead of that would risk showing a status
 *   for a ref the server rejected.
 *
 * Every caller gets the same toast: full success reports how many updated,
 * a partial result also names how many were skipped.
 */
export function useBulkListingAction() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showToast } = useToast();

  function reportOutcome(result: BulkListingResultDTO) {
    if (result.failed.length > 0) {
      showToast(
        t("admin:adminListings.bulk.toast.partial", {
          updated: result.updated.length,
          failed: result.failed.length,
        }),
        "warning",
      );
      return;
    }
    showToast(
      t("admin:adminListings.bulk.toast.success", {
        count: result.updated.length,
      }),
      "success",
    );
  }

  const setStatusMutation = useDemoAwareMutation<
    BulkListingResultDTO,
    Error,
    BulkStatusVars
  >({
    demoMode,
    logLabel: "admin.listing.bulkSetStatus",
    logContext: ({ refs, status }) => ({ refs, status }),
    // The per-ref registry record + cache patch IS the demo optimistic update
    // (looped, unlike the single-row hooks), so it belongs in `demoResult`.
    demoResult: ({ refs, status }) => {
      for (const ref of refs) {
        recordDemoListingMutation(ref, { status });
        patchListingInCache(queryClient, demoMode, ref, (row) => ({
          ...row,
          status,
        }));
      }
      return { updated: refs, failed: [] };
    },
    live: ({ refs, status, reason }) =>
      bulkSetListingStatus(refs, status, reason),
    onSuccess: (result) => {
      reportOutcome(result);
    },
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_LISTINGS_KEY] });
    },
  });

  const removeMutation = useDemoAwareMutation<
    BulkListingResultDTO,
    Error,
    BulkRemoveVars
  >({
    demoMode,
    logLabel: "admin.listing.bulkRemove",
    logContext: ({ refs }) => ({ refs }),
    demoResult: ({ refs }) => {
      for (const ref of refs) {
        recordDemoListingMutation(ref, { removed: true });
        patchListingInCache(queryClient, demoMode, ref, () => null);
      }
      return { updated: refs, failed: [] };
    },
    live: ({ refs, reason }) => bulkRemoveListings(refs, reason),
    onSuccess: (result) => {
      reportOutcome(result);
    },
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_LISTINGS_KEY] });
    },
  });

  return {
    bulkSetStatus: (refs: string[], status: ListingStatus, reason?: string) =>
      setStatusMutation.mutateAsync({ refs, status, reason }),
    bulkRemove: (refs: string[], reason?: string) =>
      removeMutation.mutateAsync({ refs, reason }),
    isPending: setStatusMutation.isPending || removeMutation.isPending,
  };
}
