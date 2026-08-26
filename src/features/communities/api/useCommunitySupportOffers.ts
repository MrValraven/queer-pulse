import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getCommunitySupportOffers,
  respondToCommunitySupportOffer,
  type CommunitySupportOfferDTO,
  type CommunitySupportOfferListDTO,
  type CommunitySupportOfferResponse,
} from "./communitySupportOffers.api";

/**
 * The cache key both the pane and the mod-tools rail's badge read, and the one
 * the admin console's offer mutation writes into.
 *
 * `demoMode` is part of the key because the toggle flips at runtime: a demo
 * offer synthesized in this browser must never survive a switch to live and be
 * read back as something a real staff member sent.
 */
export const communitySupportOffersKey = (
  slug: string | undefined,
  demoMode: boolean,
) => ["community-support-offers", demoMode, slug];

/** Demo's starting point: nobody has offered anything yet. The admin console's
 *  demo mutation writes its synthesized offer into this same cache entry, so
 *  sending support in demo actually reaches this pane. */
const DEMO_SUPPORT_OFFERS: CommunitySupportOfferListDTO = {
  offers: [],
  openCount: 0,
};

export interface CommunitySupportOffersResult {
  offers: CommunitySupportOfferDTO[];
  /** How many are still unanswered — the number the mod rail badges. */
  openCount: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * What platform staff have offered this community
 * (`GET /communities/:slug/support-offers`, owner/co-owner/moderator only),
 * newest first.
 *
 * Demo mode starts from an empty list and never touches the network, but it
 * reads that list out of the cache rather than hard-returning `[]`: the admin
 * console's demo mutation writes the offer it synthesizes into this key, so
 * "Support sent to their moderators" is followed by the moderators actually
 * having it. A demo that toasts a send and then tells the community nobody has
 * offered anything is the exact fake success OPS-05 exists to remove.
 *
 * Gated by where it is mounted (inside the already staff-only Mod tools tab),
 * the same way `useCommunityBans` and `useCommunityReports` are.
 */
export function useCommunitySupportOffers(
  slug: string | undefined,
): CommunitySupportOffersResult {
  const { demoMode } = useDemoMode();
  const query = useQuery({
    queryKey: communitySupportOffersKey(slug, demoMode),
    enabled: Boolean(slug),
    queryFn: () =>
      demoMode ? DEMO_SUPPORT_OFFERS : getCommunitySupportOffers(slug!),
  });

  return {
    offers: query.data?.offers ?? [],
    openCount: query.data?.openCount ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

/**
 * `POST /communities/:slug/support-offers/:id/respond` — take an offer up, or
 * say it is not needed.
 *
 * Answering is one-way on the server, so there is no optimistic patch on the
 * live path: the list is refetched and the row re-renders from what the server
 * actually recorded, including who answered and when. Demo has no server to
 * ask, so it writes the same answer into its own cache entry and the row moves
 * to "answered" the way it would live.
 */
export function useRespondToCommunitySupportOffer(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { offerId: string; response: CommunitySupportOfferResponse }
  >({
    // The pane toasts its own failure, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ offerId, response }) => {
      if (demoMode) return;
      await respondToCommunitySupportOffer(slug, offerId, response);
    },
    onSuccess: (_data, { offerId, response }) => {
      if (demoMode) {
        queryClient.setQueryData<CommunitySupportOfferListDTO>(
          communitySupportOffersKey(slug, true),
          (previous) =>
            previous
              ? withOfferAnswered(previous, offerId, response)
              : previous,
        );
        return;
      }
      void queryClient.invalidateQueries({
        queryKey: communitySupportOffersKey(slug, false),
      });
    },
  });
}

/** The demo list with one offer marked answered, and `openCount` recounted
 *  from the rows so the mod rail's badge and the pane agree. */
function withOfferAnswered(
  list: CommunitySupportOfferListDTO,
  offerId: string,
  response: CommunitySupportOfferResponse,
): CommunitySupportOfferListDTO {
  const offers = list.offers.map((offer) =>
    offer.id === offerId
      ? {
          ...offer,
          status: response,
          respondedAt: new Date().toISOString(),
        }
      : offer,
  );
  return { offers, openCount: countOpenOffers(offers) };
}

/** How many offers are still unanswered. Kept here so the two demo cache
 *  writers (this file and `useOfferCommunitySupport`) count it one way. */
export function countOpenOffers(offers: CommunitySupportOfferDTO[]): number {
  return offers.filter((offer) => offer.status === "new").length;
}
