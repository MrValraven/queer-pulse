import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { DIRECTORY_KEY } from "../../api/directoryQueryKey";
import {
  approveListingTeamRequest,
  cancelListingTeamInvite,
  declineListingTeamRequest,
  inviteMemberToListingTeam,
  inviteToListingTeam,
  removeFromListingTeam,
  reorderListingTeam,
  updateListingTeamRoleLabel,
} from "./listingTeam.api";
import { toListingTeamManagerRowView } from "./listingTeam.adapters";
import {
  demoApproveListingTeamRequest,
  demoCancelListingTeamInvite,
  demoDeclineListingTeamRequest,
  demoInviteMemberToListingTeam,
  demoInviteToListingTeam,
  demoRemoveFromListingTeam,
  demoReorderListingTeam,
  demoUpdateListingTeamRoleLabel,
} from "./listingTeam.demo";
import { listingTeamQueryKeys } from "./listingTeamQueryKeys";
import { listingTeamErrorCode } from "../team/listingTeamErrors.data";
import type {
  InviteMemberToListingTeamBody,
  InviteToListingTeamBody,
  ListingTeamErrorCode,
  ListingTeamManagerListView,
  ListingTeamManagerRowView,
} from "./listingTeam.types";

/** Refusals that prove the open list is out of date, so it refetches. */
const STALE_PROVING_ERROR_CODES: ReadonlySet<ListingTeamErrorCode> = new Set([
  "listing_team_link_not_found",
  "listing_team_not_pending",
  "listing_team_not_accepted",
  "listing_team_already_pending",
  "listing_team_already_accepted",
  "listing_team_order_mismatch",
]);

/** True when a team write was refused because the list it read has moved on. */
export function isStaleProvingTeamRefusal(error: unknown): boolean {
  const code = listingTeamErrorCode(error);
  return code !== null && STALE_PROVING_ERROR_CODES.has(code);
}

/**
 * Refreshes everything a business-side team write can move: this listing's
 * team list and its open searches, both public pages (the business page's
 * team section and a persona's "works at" line), and the persona side's
 * lists for a member who runs both. Resolves once this listing's own team
 * list has refetched, so a mutation that returns it stays pending until then.
 */
function refreshAfterBusinessWrite(
  queryClient: QueryClient,
  listingRef: string,
  isDemoMode: boolean,
): Promise<void> {
  const ownListRefresh = queryClient.invalidateQueries({
    queryKey: listingTeamQueryKeys.manager(listingRef, isDemoMode),
    exact: true,
  });
  void queryClient.invalidateQueries({
    queryKey: listingTeamQueryKeys.managerCandidatesPrefix(listingRef),
  });
  void queryClient.invalidateQueries({ queryKey: [DIRECTORY_KEY, "detail"] });
  void queryClient.invalidateQueries({ queryKey: ["subprofile", "public"] });
  void queryClient.invalidateQueries({
    queryKey: ["subprofile", "team-links"],
  });
  return ownListRefresh;
}

/**
 * Every write the people who run a listing make on its team. Each surface
 * shows its own refusal copy, so the global error toast stays quiet.
 */
export function useListingTeamMutations(listingRef: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const refresh = () =>
    refreshAfterBusinessWrite(queryClient, listingRef, demoMode);
  const refreshWhenStale = (error: Error) =>
    isStaleProvingTeamRefusal(error) ? refresh() : undefined;

  const invite = useMutation<
    ListingTeamManagerRowView,
    Error,
    InviteToListingTeamBody
  >({
    meta: { silentError: true },
    mutationFn: async (body) =>
      toListingTeamManagerRowView(
        demoMode
          ? demoInviteToListingTeam(listingRef, body)
          : await inviteToListingTeam(listingRef, body),
      ),
    onSuccess: refresh,
    onError: refreshWhenStale,
  });

  // The invitee is a connection; the member sees the invite under their
  // places and the team shows it as a pending row until they answer.
  const inviteMember = useMutation<
    ListingTeamManagerRowView,
    Error,
    InviteMemberToListingTeamBody
  >({
    meta: { silentError: true },
    mutationFn: async (body) =>
      toListingTeamManagerRowView(
        demoMode
          ? demoInviteMemberToListingTeam(listingRef, body)
          : await inviteMemberToListingTeam(listingRef, body),
      ),
    onSuccess: refresh,
    onError: refreshWhenStale,
  });

  const approve = useMutation<
    ListingTeamManagerRowView,
    Error,
    { memberId: string; roleLabel?: string | null }
  >({
    meta: { silentError: true },
    mutationFn: async ({ memberId, roleLabel }) => {
      // An absent label keeps the one the persona asked with.
      const body = roleLabel === undefined ? {} : { roleLabel };
      return toListingTeamManagerRowView(
        demoMode
          ? demoApproveListingTeamRequest(listingRef, memberId, body)
          : await approveListingTeamRequest(listingRef, memberId, body),
      );
    },
    onSuccess: refresh,
    onError: refreshWhenStale,
  });

  const decline = useMutation<void, Error, { memberId: string }>({
    meta: { silentError: true },
    mutationFn: async ({ memberId }) => {
      if (demoMode) demoDeclineListingTeamRequest(listingRef, memberId);
      else await declineListingTeamRequest(listingRef, memberId);
    },
    onSuccess: refresh,
    onError: refreshWhenStale,
  });

  const cancelInvite = useMutation<void, Error, { memberId: string }>({
    meta: { silentError: true },
    mutationFn: async ({ memberId }) => {
      if (demoMode) demoCancelListingTeamInvite(listingRef, memberId);
      else await cancelListingTeamInvite(listingRef, memberId);
    },
    onSuccess: refresh,
    onError: refreshWhenStale,
  });

  const updateRoleLabel = useMutation<
    ListingTeamManagerRowView,
    Error,
    { memberId: string; roleLabel: string | null }
  >({
    meta: { silentError: true },
    mutationFn: async ({ memberId, roleLabel }) =>
      toListingTeamManagerRowView(
        demoMode
          ? demoUpdateListingTeamRoleLabel(listingRef, memberId, { roleLabel })
          : await updateListingTeamRoleLabel(listingRef, memberId, {
              roleLabel,
            }),
      ),
    onSuccess: refresh,
    onError: refreshWhenStale,
  });

  const reorder = useMutation<
    ListingTeamManagerRowView[],
    Error,
    { memberIds: string[] }
  >({
    meta: { silentError: true },
    mutationFn: async ({ memberIds }) => {
      const result = demoMode
        ? demoReorderListingTeam(listingRef, { memberIds })
        : await reorderListingTeam(listingRef, { memberIds });
      return result.accepted.map(toListingTeamManagerRowView);
    },
    onSuccess: (accepted) => {
      // The list holds the server's order at once, so a moved row stays put.
      queryClient.setQueryData<ListingTeamManagerListView>(
        listingTeamQueryKeys.manager(listingRef, demoMode),
        (current) => (current ? { ...current, accepted } : current),
      );
      return refresh();
    },
    onError: refreshWhenStale,
  });

  const remove = useMutation<void, Error, { memberId: string }>({
    meta: { silentError: true },
    mutationFn: async ({ memberId }) => {
      if (demoMode) demoRemoveFromListingTeam(listingRef, memberId);
      else await removeFromListingTeam(listingRef, memberId);
    },
    onSuccess: refresh,
    onError: refreshWhenStale,
  });

  return {
    invite,
    inviteMember,
    approve,
    decline,
    cancelInvite,
    updateRoleLabel,
    reorder,
    remove,
  };
}
