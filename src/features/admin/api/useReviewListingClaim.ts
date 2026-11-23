import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { patchListingClaim, type ListingClaimDTO } from "./listingClaims.api";
import { LISTING_CLAIMS_KEY } from "./useListingClaims";
import { ApiError } from "../../../shared/api/client";
import { useDemoAwareMutation } from "./demoAwareMutation";

export interface ReviewListingClaimVars {
  claim: ListingClaimDTO;
  decision: "approved" | "declined";
}

/** The reason code the backend answers 403 with when the reviewer filed the
 *  claim themselves (`ListingClaimsService.review`). */
export const CLAIM_REVIEWER_IS_CLAIMANT = "claim_reviewer_is_claimant";

/** True when a review failed because the reviewer is the claimant. */
export function isOwnClaimReviewRefusal(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 403) return false;
  const data = error.data as { code?: string } | undefined;
  return data?.code === CLAIM_REVIEWER_IS_CLAIMANT;
}

/**
 * A moderator approves or declines a listing-claim request. Demo mode
 * resolves after a short simulated delay and never touches the network — the
 * fixture must not appear to mutate platform truth (mirrors
 * `useResolveEditSuggestion`). Live mode PATCHes `/admin/listings/claims/:id`
 * (which, on approval, reassigns the listing's owner server-side) and
 * invalidates the queue query. The global error toast is silenced because the
 * row names the cause itself, including the refusal when the reviewer filed
 * the claim (see `isOwnClaimReviewRefusal`).
 */
export function useReviewListingClaim() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<ListingClaimDTO, Error, ReviewListingClaimVars>({
    demoMode,
    meta: { silentError: true },
    logLabel: "admin.listingClaim.review",
    logContext: ({ claim, decision }) => ({ id: claim.id, decision }),
    demoResult: ({ claim, decision }) => ({ ...claim, status: decision }),
    live: ({ claim, decision }) => patchListingClaim(claim.id, decision),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [LISTING_CLAIMS_KEY] });
    },
  });
}
