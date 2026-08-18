import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ADMIN_LISTING_CLAIMS } from "../listingClaims.data";
import { getListingClaims, type ListingClaimDTO } from "./listingClaims.api";

/** Shared with `useReviewListingClaim`, which invalidates this key on
 *  success. */
export const LISTING_CLAIMS_KEY = "admin-listing-claims";

/**
 * The pending "claim this listing" review queue. Demo mode reads the
 * colocated fixture and never hits the network — this is a Moderator/Admin-
 * only endpoint that 403s for anyone else. Live mode calls
 * `GET /listings/admin/claims`.
 */
export function useListingClaims() {
  const { demoMode } = useDemoMode();
  const query = useQuery<ListingClaimDTO[]>({
    queryKey: [LISTING_CLAIMS_KEY, demoMode],
    initialData: demoMode ? ADMIN_LISTING_CLAIMS : undefined,
    queryFn: async () => {
      if (demoMode) return ADMIN_LISTING_CLAIMS;
      return getListingClaims();
    },
  });
  return { ...query, rows: query.data ?? [] };
}
