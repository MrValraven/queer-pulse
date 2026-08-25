import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../../app/providers/authContext";
import {
  acceptCoManagerInvite,
  declineCoManagerInvite,
  getCoManagerInvites,
  getListingCoManagers,
  inviteListingCoManager,
  leaveListingCoManagement,
  removeListingCoManager,
  type ListingCoManagerDTO,
  type ListingCoManagerInviteDTO,
} from "./listingCoManagers.api";

/**
 * Data hooks for co-management: one listing's roster, and the invitations
 * waiting on the signed-in member.
 *
 * Demo mode never reaches the network. A demo persona has no server-side
 * listing to co-manage (`useOwnedListing` is disabled there too), so both
 * queries stay disabled and answer with an empty list, and every mutation
 * resolves without a request. That keeps the demo prototype running standalone
 * without inventing a mock roster nobody can reach.
 */

/** Cache key for the invitations waiting on the signed-in member. */
export const CO_MANAGER_INVITES_KEY = ["listings", "co-manager-invites"];

/** Cache key for one listing's roster. */
const rosterKey = (listingRef: string) => [
  "listings",
  "co-managers",
  listingRef,
];

/**
 * The roster of one listing. Readable by the owner AND by any co-manager, so
 * everyone helping can see who else is helping.
 */
export function useListingCoManagers(listingRef: string) {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const query = useQuery<ListingCoManagerDTO[]>({
    queryKey: rosterKey(listingRef),
    enabled: !demoMode && loggedIn && listingRef.length > 0,
    queryFn: () => getListingCoManagers(listingRef),
  });
  return {
    coManagers: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

/**
 * Invitations waiting on the signed-in member. Kept on the `["listings"]`
 * prefix so accepting one refreshes the member's own listings alongside it.
 */
export function useCoManagerInvites() {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const query = useQuery<ListingCoManagerInviteDTO[]>({
    queryKey: CO_MANAGER_INVITES_KEY,
    enabled: !demoMode && loggedIn,
    queryFn: getCoManagerInvites,
  });
  return { invites: query.data ?? [], isLoading: query.isLoading };
}

/**
 * Answer one invitation. Accepting adds the listing to `GET /listings/mine`
 * and opens the editor to the member, so the whole `["listings"]` tree is
 * invalidated: the roster, the member's own places grid, and this inbox all
 * move at once with no reload.
 */
export function useAnswerCoManagerInvite() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    ListingCoManagerInviteDTO | null,
    Error,
    { inviteId: string; isAccepted: boolean }
  >({
    // The panel renders its own failure message, so silence the global toast.
    meta: { silentError: true },
    mutationFn: async ({ inviteId, isAccepted }) => {
      if (demoMode) return null;
      return isAccepted
        ? acceptCoManagerInvite(inviteId)
        : declineCoManagerInvite(inviteId);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

/** Invite one member to help run this listing. Owner only. */
export function useInviteCoManager(listingRef: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<ListingCoManagerDTO | null, Error, string>({
    // The panel surfaces the 409 (duplicate, already answered, seats full) and
    // the 400 (inviting yourself) itself, so silence the global toast.
    meta: { silentError: true },
    mutationFn: async (memberSlug) => {
      if (demoMode) return null;
      return inviteListingCoManager(listingRef, memberSlug);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: rosterKey(listingRef) });
    },
  });
}

/** Take somebody off the roster, or withdraw an invitation. Owner only. */
export function useRemoveCoManager(listingRef: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    meta: { silentError: true },
    mutationFn: async (memberSlug) => {
      if (demoMode) return;
      await removeListingCoManager(listingRef, memberSlug);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: rosterKey(listingRef) });
    },
  });
}

/**
 * Step down from a listing you help run. The listing leaves the member's own
 * places and the editor closes to them, so this invalidates the whole
 * `["listings"]` tree rather than the roster alone.
 */
export function useLeaveCoManagement(listingRef: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    meta: { silentError: true },
    mutationFn: async () => {
      if (demoMode) return;
      await leaveListingCoManagement(listingRef);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}
