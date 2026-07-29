import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ADMIN_LISTINGS_QUEUE } from "../adminListings.data";
import {
  getListingQueue,
  listingDtoToQueueRow,
  type ListingQueueRow,
} from "./adminListings.api";

/** Shared with `useSetListingStatus`, which invalidates this key on success. */
export const ADMIN_LISTINGS_KEY = "admin-listings";

/**
 * The full moderation queue of member-submitted listings, unfiltered. Callers
 * filter by status client-side (see `AdminListingsPage`) so a row that was
 * just moved to a new status — which a status-filtered fetch of a static demo
 * fixture would never reflect — still shows up under its destination tab.
 * Demo mode returns the colocated fixture and never hits the network — this
 * is a Moderator/Admin-only endpoint that 403s for anyone else.
 */
export function useAdminListings() {
  const { demoMode } = useDemoMode();
  const query = useQuery<ListingQueueRow[]>({
    queryKey: [ADMIN_LISTINGS_KEY, demoMode],
    initialData: demoMode ? ADMIN_LISTINGS_QUEUE : undefined,
    queryFn: async () => {
      if (demoMode) return ADMIN_LISTINGS_QUEUE;
      const page = await getListingQueue();
      return page.items.map(listingDtoToQueueRow);
    },
  });
  return { ...query, rows: query.data ?? [] };
}
