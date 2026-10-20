import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { DIRECTORY_KEY } from "../../api/directoryQueryKey";
import {
  acceptListingTeamInvite,
  cancelListingTeamRequest,
  declineListingTeamInvite,
  leaveListingTeam,
  requestToJoinListingTeam,
} from "./listingTeam.api";
import { toListingTeamPersonaRowView } from "./listingTeam.adapters";
import {
  demoAcceptListingTeamInvite,
  demoCancelListingTeamRequest,
  demoDeclineListingTeamInvite,
  demoLeaveListingTeam,
  demoRequestToJoinListingTeam,
} from "./listingTeam.demo";
import { listingTeamQueryKeys } from "./listingTeamQueryKeys";
import { isStaleProvingTeamRefusal } from "./useListingTeamMutations";
import type { ListingTeamPersonaRowView } from "./listingTeam.types";

/**
 * Refreshes everything a persona-side team write can move: this persona's
 * links and its open searches, both public pages (the business page's team
 * section and the persona's "works at" line), and the business side's lists
 * for a member who runs both. Resolves once this persona's own links have
 * refetched, so a mutation that returns it stays pending until then.
 */
function refreshAfterPersonaWrite(
  queryClient: QueryClient,
  subprofileId: string,
  isDemoMode: boolean,
): Promise<void> {
  const ownListRefresh = queryClient.invalidateQueries({
    queryKey: listingTeamQueryKeys.persona(subprofileId, isDemoMode),
    exact: true,
  });
  void queryClient.invalidateQueries({
    queryKey: listingTeamQueryKeys.personaCandidatesPrefix(subprofileId),
  });
  void queryClient.invalidateQueries({ queryKey: [DIRECTORY_KEY, "detail"] });
  void queryClient.invalidateQueries({ queryKey: ["subprofile", "public"] });
  void queryClient.invalidateQueries({ queryKey: ["listings", "team"] });
  return ownListRefresh;
}

/**
 * Every write a persona's owner makes on its team links. Each surface shows
 * its own refusal copy, so the global error toast stays quiet.
 */
export function usePersonaTeamLinkMutations(subprofileId: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const refresh = () =>
    refreshAfterPersonaWrite(queryClient, subprofileId, demoMode);
  const refreshWhenStale = (error: Error) =>
    isStaleProvingTeamRefusal(error) ? refresh() : undefined;

  const request = useMutation<
    ListingTeamPersonaRowView,
    Error,
    { listingId: string }
  >({
    meta: { silentError: true },
    mutationFn: async ({ listingId }) =>
      toListingTeamPersonaRowView(
        demoMode
          ? demoRequestToJoinListingTeam(subprofileId, { listingId })
          : await requestToJoinListingTeam(subprofileId, { listingId }),
      ),
    onSuccess: refresh,
    onError: refreshWhenStale,
  });

  const accept = useMutation<
    ListingTeamPersonaRowView,
    Error,
    { linkId: string }
  >({
    meta: { silentError: true },
    mutationFn: async ({ linkId }) =>
      toListingTeamPersonaRowView(
        demoMode
          ? demoAcceptListingTeamInvite(subprofileId, linkId)
          : await acceptListingTeamInvite(subprofileId, linkId),
      ),
    onSuccess: refresh,
    onError: refreshWhenStale,
  });

  const decline = useMutation<void, Error, { linkId: string }>({
    meta: { silentError: true },
    mutationFn: async ({ linkId }) => {
      if (demoMode) demoDeclineListingTeamInvite(subprofileId, linkId);
      else await declineListingTeamInvite(subprofileId, linkId);
    },
    onSuccess: refresh,
    onError: refreshWhenStale,
  });

  const cancelRequest = useMutation<void, Error, { linkId: string }>({
    meta: { silentError: true },
    mutationFn: async ({ linkId }) => {
      if (demoMode) demoCancelListingTeamRequest(subprofileId, linkId);
      else await cancelListingTeamRequest(subprofileId, linkId);
    },
    onSuccess: refresh,
    onError: refreshWhenStale,
  });

  const leave = useMutation<void, Error, { linkId: string }>({
    meta: { silentError: true },
    mutationFn: async ({ linkId }) => {
      if (demoMode) demoLeaveListingTeam(subprofileId, linkId);
      else await leaveListingTeam(subprofileId, linkId);
    },
    onSuccess: refresh,
    onError: refreshWhenStale,
  });

  return { request, accept, decline, cancelRequest, leave };
}
