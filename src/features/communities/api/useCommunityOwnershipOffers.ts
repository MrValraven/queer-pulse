import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { MemberRefDTO } from "../../../shared/api/refs";
import { communityBadgeKeys } from "../badges/api/communityBadgeKeys";
import {
  demoIncomingOwnershipOffers,
  demoSentOwnershipOffer,
} from "../communityOwnershipOffers.data";
import {
  cancelCommunityOwnershipOffer,
  getCommunityOwnershipOffer,
  getMyCommunityOwnershipOffers,
  offerCommunityOwnership,
  respondToCommunityOwnershipOffer,
  type CommunityOwnershipOfferDTO,
} from "./communityOwnershipOffers.api";

/**
 * PRD-514 hooks: the owner's open offer, sending and cancelling it, and the
 * offered member's inbox with its two answers.
 *
 * Demo mode keeps its state in the query cache under a `"demo"`-suffixed key:
 * the query reads the colocated mock once (`staleTime: Infinity`) and each
 * demo mutation writes the cache directly, so the panel and the inbox move
 * exactly as they do live without touching the network. Only live mode ever
 * invalidates, so a demo entry is never refetched back to the mock.
 */
export const ownershipOfferKeys = {
  owner: (slug: string) => ["community-ownership-offer", slug] as const,
  mine: () => ["my-community-ownership-offers"] as const,
};

function modeKey<T extends readonly unknown[]>(key: T, isDemo: boolean) {
  return isDemo ? ([...key, "demo"] as const) : key;
}

export interface CommunityOwnershipOfferResult {
  offer: CommunityOwnershipOfferDTO | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/** `GET /communities/:slug/ownership-offer`: the owner's open offer. Demo
 *  starts with none. */
export function useCommunityOwnershipOffer(
  slug: string,
  enabled = true,
): CommunityOwnershipOfferResult {
  const { demoMode } = useDemoMode();
  const query = useQuery({
    queryKey: modeKey(ownershipOfferKeys.owner(slug), demoMode),
    enabled: enabled && Boolean(slug),
    staleTime: demoMode ? Infinity : undefined,
    queryFn: () =>
      demoMode ? Promise.resolve(null) : getCommunityOwnershipOffer(slug),
  });
  return {
    offer: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

/** `POST /communities/:slug/ownership-offer`. `offeree` is only read by demo
 *  mode, which builds the pending offer from it. */
export function useOfferCommunityOwnership(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    CommunityOwnershipOfferDTO,
    Error,
    { memberSlug: string; offeree: MemberRefDTO }
  >({
    // The modal says what went wrong itself, so silence the global toast.
    meta: { silentError: true },
    mutationFn: async ({ memberSlug, offeree }) =>
      demoMode
        ? demoSentOwnershipOffer(slug, offeree)
        : offerCommunityOwnership(slug, memberSlug),
    onSuccess: (offer) => {
      queryClient.setQueryData(
        modeKey(ownershipOfferKeys.owner(slug), demoMode),
        offer,
      );
    },
    onError: () => {
      // OWNERSHIP_OFFER_OPEN means the panel is showing stale state.
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: ownershipOfferKeys.owner(slug),
      });
    },
  });
}

/** `DELETE /communities/:slug/ownership-offer`. */
export function useCancelCommunityOwnershipOffer(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    meta: { silentError: true },
    mutationFn: async () => {
      if (demoMode) return;
      await cancelCommunityOwnershipOffer(slug);
    },
    onSettled: (_data, error) => {
      if (demoMode) {
        if (!error) {
          queryClient.setQueryData(
            modeKey(ownershipOfferKeys.owner(slug), true),
            null,
          );
        }
        return;
      }
      // A refusal (the offer was answered or lapsed meanwhile) also means the
      // panel is out of date, so it re-reads either way.
      void queryClient.invalidateQueries({
        queryKey: ownershipOfferKeys.owner(slug),
      });
    },
  });
}

export interface MyCommunityOwnershipOffersResult {
  offers: CommunityOwnershipOfferDTO[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/** `GET /me/community-ownership-offers`: the open offers addressed to the
 *  caller. `enabled` lets an every-page surface (the account-menu badge) wait
 *  for a settled, active session. Demo reads the colocated mock inbox. */
export function useMyCommunityOwnershipOffers(
  options: { enabled?: boolean; retry?: false } = {},
): MyCommunityOwnershipOffersResult {
  const { enabled = true, retry } = options;
  const { demoMode } = useDemoMode();
  const query = useQuery({
    queryKey: modeKey(ownershipOfferKeys.mine(), demoMode),
    enabled,
    staleTime: demoMode ? Infinity : undefined,
    ...(retry === false ? { retry: false } : {}),
    queryFn: () =>
      demoMode
        ? Promise.resolve(demoIncomingOwnershipOffers())
        : getMyCommunityOwnershipOffers(),
  });
  return {
    offers: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

export type OwnershipOfferAnswer = "accept" | "decline";

/** `POST /me/community-ownership-offers/:offerId/accept|decline`. */
export function useRespondToOwnershipOffer() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { offerId: string; communitySlug: string; answer: OwnershipOfferAnswer }
  >({
    meta: { silentError: true },
    mutationFn: async ({ offerId, answer }) => {
      if (demoMode) return;
      await respondToCommunityOwnershipOffer(offerId, answer);
    },
    onSettled: (_data, error, { offerId, communitySlug, answer }) => {
      if (demoMode) {
        if (!error) {
          queryClient.setQueryData<CommunityOwnershipOfferDTO[]>(
            modeKey(ownershipOfferKeys.mine(), true),
            (previous) =>
              (previous ?? []).filter((offer) => offer.id !== offerId),
          );
        }
        return;
      }
      // Answered, expired or cancelled meanwhile: the inbox re-reads so the
      // stale row leaves along with the answered one.
      void queryClient.invalidateQueries({
        queryKey: ownershipOfferKeys.mine(),
      });
      if (error || answer === "decline") return;
      // Accepting moves the owner seat: the community, its roster, the badge
      // sheet and the caller's own memberships all change.
      void queryClient.invalidateQueries({
        queryKey: ["community", communitySlug],
      });
      void queryClient.invalidateQueries({
        queryKey: ["roster", communitySlug],
      });
      void queryClient.invalidateQueries({
        queryKey: communityBadgeKeys.all(communitySlug),
      });
      void queryClient.invalidateQueries({ queryKey: ["my-communities"] });
    },
  });
}
