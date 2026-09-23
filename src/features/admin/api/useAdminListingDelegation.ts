import {
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  buildDemoCoManagerSeat,
  buildDemoOwnerOffer,
  getDemoListingDelegation,
  recordDemoDelegationMutation,
} from "../adminListingDelegation.data";
import {
  getListingDelegation,
  inviteListingCoManager,
  isDelegationNotFoundError,
  offerListingOwnership,
  revokeListingCoManager,
  revokeListingOwnershipOffer,
  type AdminListingDelegationDTO,
  type ListingCoManagerDTO,
  type ListingOwnerOfferDTO,
} from "./adminListingDelegation.api";
import { useDemoAwareMutation } from "./demoAwareMutation";

/** Cache key root for one listing's delegation picture. */
export const ADMIN_LISTING_DELEGATION_KEY = "admin-listing-delegation";

/** The exact key `useAdminListingDelegation` queries with. `demoMode` sits
 *  before `listingRef`, matching `listingHistoryQueryKey`, so a mutation
 *  reaching for one listing's entry has to pass the mode too. */
export function adminListingDelegationKey(
  listingRef: string,
  demoMode: boolean,
): [string, boolean, string] {
  return [ADMIN_LISTING_DELEGATION_KEY, demoMode, listingRef];
}

const EMPTY_DELEGATION: AdminListingDelegationDTO = {
  openOffer: null,
  coManagers: [],
};

/** Patch the cached picture for one listing in place, so the panel moves the
 *  moment a mutation resolves. An entry that has never been fetched is left
 *  absent: writing a synthesized picture into it would put a one-line roster
 *  on screen where the server has a full one, and the query will answer with
 *  server truth the first time it runs. */
function patchDelegationInCache(
  queryClient: QueryClient,
  listingRef: string,
  demoMode: boolean,
  patch: (current: AdminListingDelegationDTO) => AdminListingDelegationDTO,
): void {
  queryClient.setQueryData<AdminListingDelegationDTO>(
    adminListingDelegationKey(listingRef, demoMode),
    (current) => (current ? patch(current) : current),
  );
}

/**
 * Who owns this listing, what offer is open on it, and who is seated to help.
 *
 * Demo mode reads the fixture plus this session's overlay
 * (`getDemoListingDelegation`); live mode calls
 * `GET /admin/listings/:ref/co-managers`, which is admin-only, so the caller
 * mounts this only for an admin. The argument is spelled `listingRef`: a
 * variable literally named `ref` trips the `react-hooks/refs` compiler lint,
 * as `useListingHistory` records.
 */
export function useAdminListingDelegation(listingRef: string) {
  const { demoMode } = useDemoMode();
  const query = useQuery<AdminListingDelegationDTO>({
    queryKey: adminListingDelegationKey(listingRef, demoMode),
    enabled: listingRef.length > 0,
    queryFn: () =>
      demoMode
        ? Promise.resolve(getDemoListingDelegation(listingRef))
        : getListingDelegation(listingRef),
  });

  return {
    delegation: query.data ?? EMPTY_DELEGATION,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

/** Offer ownership of an unowned listing to one member, by profile slug. The
 *  server refuses a listing that already has an owner or an open offer, so the
 *  panel offers this only where it can succeed and explains the 409. */
export function useOfferListingOwnership(listingRef: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    ListingOwnerOfferDTO,
    Error,
    { memberSlug: string; note?: string }
  >({
    demoMode,
    // The panel says what went wrong itself, so the global toast stays quiet.
    meta: { silentError: true },
    demoResult: ({ memberSlug, note }) =>
      buildDemoOwnerOffer(listingRef, memberSlug, note),
    live: ({ memberSlug, note }) =>
      offerListingOwnership(listingRef, { memberSlug, note }),
    logLabel: "admin.listing.offerOwnership",
    logContext: ({ memberSlug }) => ({ ref: listingRef, memberSlug }),
    onSuccess: (offer) => {
      patchDelegationInCache(queryClient, listingRef, demoMode, (current) => ({
        ...current,
        openOffer: offer,
      }));
      if (demoMode) {
        recordDemoDelegationMutation(listingRef, { openOffer: offer });
      }
    },
  });
}

/**
 * Withdraw the open offer. Also the first half of offering the listing to
 * somebody else, since one open offer per listing is a unique index.
 *
 * A 404 here means the offer is already gone: the member accepted or declined
 * it, or another admin withdrew it, while this drawer sat open. The panel says
 * that in its own words, and the query is invalidated so the re-read replaces
 * the offer on screen with whatever is true now.
 */
export function useRevokeListingOwnershipOffer(listingRef: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<ListingOwnerOfferDTO | null, Error, void>({
    demoMode,
    meta: { silentError: true },
    demoResult: () => null,
    live: () => revokeListingOwnershipOffer(listingRef),
    logLabel: "admin.listing.revokeOwnershipOffer",
    logContext: () => ({ ref: listingRef }),
    onSuccess: () => {
      patchDelegationInCache(queryClient, listingRef, demoMode, (current) => ({
        ...current,
        openOffer: null,
      }));
      if (demoMode) {
        recordDemoDelegationMutation(listingRef, { openOffer: null });
      }
    },
    onLiveError: (error) => {
      if (!isDelegationNotFoundError(error)) return;
      void queryClient.invalidateQueries({
        queryKey: adminListingDelegationKey(listingRef, false),
      });
    },
  });
}

/** Seat one member as co-manager. The seat lands `invited` and grants nothing
 *  until they accept, in both modes. */
export function useInviteListingCoManager(listingRef: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<ListingCoManagerDTO, Error, string>({
    demoMode,
    meta: { silentError: true },
    demoResult: (memberSlug) => buildDemoCoManagerSeat(listingRef, memberSlug),
    live: (memberSlug) => inviteListingCoManager(listingRef, { memberSlug }),
    logLabel: "admin.listing.inviteCoManager",
    logContext: (memberSlug) => ({ ref: listingRef, memberSlug }),
    onSuccess: (seat) => {
      patchDelegationInCache(queryClient, listingRef, demoMode, (current) => ({
        ...current,
        coManagers: [...current.coManagers, seat],
      }));
      // The overlay is built from the fixture plus this session's own history,
      // which is what `getDemoListingDelegation` already resolves, so a demo
      // change made before the query ever cached still lands on a full roster.
      if (demoMode) {
        recordDemoDelegationMutation(listingRef, {
          coManagers: [
            ...getDemoListingDelegation(listingRef).coManagers,
            seat,
          ],
        });
      }
    },
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminListingDelegationKey(listingRef, false),
      });
    },
  });
}

/** Take a seat back, accepted or still unanswered. */
export function useRevokeListingCoManager(listingRef: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<void, Error, string>({
    demoMode,
    meta: { silentError: true },
    demoResult: () => undefined,
    live: (memberSlug) => revokeListingCoManager(listingRef, memberSlug),
    logLabel: "admin.listing.revokeCoManager",
    logContext: (memberSlug) => ({ ref: listingRef, memberSlug }),
    onSuccess: (_data, memberSlug) => {
      const withoutSeat = (seats: ListingCoManagerDTO[]) =>
        seats.filter((seat) => seat.member?.slug !== memberSlug);
      patchDelegationInCache(queryClient, listingRef, demoMode, (current) => ({
        ...current,
        coManagers: withoutSeat(current.coManagers),
      }));
      if (demoMode) {
        recordDemoDelegationMutation(listingRef, {
          coManagers: withoutSeat(
            getDemoListingDelegation(listingRef).coManagers,
          ),
        });
      }
    },
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminListingDelegationKey(listingRef, false),
      });
    },
  });
}
