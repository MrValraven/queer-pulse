import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logInfo } from "../../../shared/observability/logger";
import type { ListingStatus } from "../../marketing/listBusiness/listBusiness.data";
import { setListingStatus } from "../../marketing/listBusiness/api/listings.api";
import {
  listingDtoToQueueRow,
  type ListingQueueRow,
} from "./adminListings.api";
import { ADMIN_LISTINGS_KEY } from "./useAdminListings";

/** How long demo mode pretends the round-trip takes, to keep the UX honest. */
const DEMO_LATENCY_MS = 400;

export interface SetListingStatusVars {
  row: ListingQueueRow;
  status: ListingStatus;
}

/**
 * A moderator moves a listing along its review lifecycle (review → question →
 * live, or back). Demo mode resolves after a short simulated delay and never
 * touches the network — the fixture must not appear to mutate platform truth.
 * Live mode PATCHes `/listings/:ref/status` and invalidates the queue.
 */
export function useSetListingStatus() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<ListingQueueRow, Error, SetListingStatusVars>({
    mutationFn: async ({ row, status }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
        logInfo("admin.listing.setStatus (demo — no network)", {
          ref: row.ref,
          status,
        });
        return { ...row, status };
      }
      const updated = await setListingStatus(row.ref, status);
      return listingDtoToQueueRow(updated);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: [ADMIN_LISTINGS_KEY] });
    },
  });
}
