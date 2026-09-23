import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../../app/providers/authContext";
import {
  acceptOwnerOffer,
  declineOwnerOffer,
  getOwnerOffers,
  type ListingOwnerOfferDTO,
} from "./ownerOffers.api";

/**
 * Data hooks for the owner offers waiting on the signed-in member.
 *
 * Demo mode never reaches the network. A demo persona has no server-side
 * listing and no server-side offer, so the query stays disabled and answers
 * with an empty list, and the mutation resolves without a request. The inbox
 * that reads this hook is therefore gated in one place, at the query, and the
 * component itself needs no demo branch.
 */

/**
 * Cache key for the offers waiting on the signed-in member. Kept under the
 * `["listings"]` prefix so accepting one refreshes the member's own places
 * alongside it.
 */
export const OWNER_OFFERS_KEY = ["listings", "owner-offers"];

/** The open offers waiting on the signed-in member. */
export function useOwnerOffers() {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const query = useQuery<ListingOwnerOfferDTO[]>({
    queryKey: OWNER_OFFERS_KEY,
    enabled: !demoMode && loggedIn,
    queryFn: getOwnerOffers,
  });
  return {
    offers: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

/**
 * Answer one offer.
 *
 * Accepting writes ownership, which adds the listing to `GET /listings/mine`
 * and opens the editor to the member, so the whole `["listings"]` tree is
 * invalidated: this inbox, the member's own places grid, and the directory
 * entry all move at once with no reload. The offers key is named on its own
 * line as well, so the refresh survives that key being moved off the
 * `["listings"]` prefix later.
 */
export function useAnswerOwnerOffer() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    ListingOwnerOfferDTO | null,
    Error,
    { offerId: string; isAccepted: boolean }
  >({
    // The inbox renders its own failure toast, so silence the global one.
    meta: { silentError: true },
    mutationFn: async ({ offerId, isAccepted }) => {
      if (demoMode) return null;
      return isAccepted
        ? acceptOwnerOffer(offerId)
        : declineOwnerOffer(offerId);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: OWNER_OFFERS_KEY });
      void queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}
