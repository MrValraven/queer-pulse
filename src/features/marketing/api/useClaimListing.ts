import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { apiPost } from "../../../shared/api/client";
import { MY_LISTING_CLAIMS_KEY } from "../listBusiness/api/useListingClaims";

export interface ClaimListingInput {
  /** Free-text note a moderator reads in the claim queue. Optional. */
  note?: string;
}

/**
 * "Claim this existing listing" — a member who runs a business already
 * listed by someone else (or by no one) asks a moderator to reassign
 * ownership to them (`POST /listings/:ref/claim`). Distinct from
 * `useDisputeListing` (a content-accuracy report) and from the "list your
 * business" wizard (which always creates a brand-new listing). Modeled on
 * `useDisputeListing`: demo mode never touches the network.
 */
export function useClaimListing(ref: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useMutation<void, Error, ClaimListingInput>({
    // DirectoryClaimModal renders its own error state, so silence the global
    // duplicate toast.
    meta: { silentError: true },
    mutationFn: async (input) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      }
      await apiPost(`/listings/${ref}/claim`, {
        ...(input.note ? { note: input.note } : {}),
      });
    },
    // So the claim is already on "Claims you've filed" when the claimant
    // follows the link out of the confirmation panel.
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: MY_LISTING_CLAIMS_KEY });
    },
  });
}
