import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { patchListingClaim, type ListingClaimDTO } from "./listingClaims.api";
import { LISTING_CLAIMS_KEY } from "./useListingClaims";
import { useDemoAwareMutation } from "./demoAwareMutation";

export interface ReviewListingClaimVars {
  claim: ListingClaimDTO;
  decision: "approved" | "declined";
}

/**
 * A moderator approves or declines a listing-claim request. Demo mode
 * resolves after a short simulated delay and never touches the network — the
 * fixture must not appear to mutate platform truth (mirrors
 * `useResolveEditSuggestion`). Live mode PATCHes `/admin/listings/claims/:id`
 * (which, on approval, reassigns the listing's owner server-side) and
 * invalidates the queue query.
 */
export function useReviewListingClaim() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<ListingClaimDTO, Error, ReviewListingClaimVars>({
    demoMode,
    logLabel: "admin.listingClaim.review",
    logContext: ({ claim, decision }) => ({ id: claim.id, decision }),
    demoResult: ({ claim, decision }) => ({ ...claim, status: decision }),
    live: ({ claim, decision }) => patchListingClaim(claim.id, decision),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [LISTING_CLAIMS_KEY] });
    },
  });
}
