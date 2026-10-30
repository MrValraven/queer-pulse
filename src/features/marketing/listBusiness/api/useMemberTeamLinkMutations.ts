import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { DIRECTORY_KEY } from "../../api/directoryQueryKey";
import {
  acceptMemberTeamLink,
  declineMemberTeamLink,
  leaveMemberTeamLink,
} from "./listingTeam.api";
import { toListingTeamMemberLinkRowView } from "./listingTeam.adapters";
import {
  demoAcceptMemberTeamLink,
  demoDeclineMemberTeamLink,
  demoLeaveMemberTeamLink,
} from "./listingTeam.demo";
import { listingTeamQueryKeys } from "./listingTeamQueryKeys";
import { isStaleProvingTeamRefusal } from "./useListingTeamMutations";
import type { ListingTeamMemberLinkRowView } from "./listingTeam.types";

/**
 * Refreshes everything a member-side team write can move: the member's own
 * links, the public business page (the team section), and the business
 * side's lists for the listing's managers. Resolves once the member's own
 * links have refetched, so a mutation that returns it stays pending until then.
 */
function refreshAfterMemberWrite(
  queryClient: QueryClient,
  isDemoMode: boolean,
): Promise<void> {
  const ownListRefresh = queryClient.invalidateQueries({
    queryKey: listingTeamQueryKeys.memberLinks(isDemoMode),
    exact: true,
  });
  void queryClient.invalidateQueries({ queryKey: [DIRECTORY_KEY, "detail"] });
  void queryClient.invalidateQueries({ queryKey: ["listings", "team"] });
  return ownListRefresh;
}

/**
 * Every write the signed-in member makes on their own team links. Each
 * surface shows its own refusal copy, so the global error toast stays quiet.
 */
export function useMemberTeamLinkMutations() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const refresh = () => refreshAfterMemberWrite(queryClient, demoMode);
  const refreshWhenStale = (error: Error) =>
    isStaleProvingTeamRefusal(error) ? refresh() : undefined;

  const accept = useMutation<
    ListingTeamMemberLinkRowView,
    Error,
    { linkId: string }
  >({
    meta: { silentError: true },
    mutationFn: async ({ linkId }) =>
      toListingTeamMemberLinkRowView(
        demoMode
          ? demoAcceptMemberTeamLink(linkId)
          : await acceptMemberTeamLink(linkId),
      ),
    onSuccess: refresh,
    onError: refreshWhenStale,
  });

  const decline = useMutation<void, Error, { linkId: string }>({
    meta: { silentError: true },
    mutationFn: async ({ linkId }) => {
      if (demoMode) demoDeclineMemberTeamLink(linkId);
      else await declineMemberTeamLink(linkId);
    },
    onSuccess: refresh,
    onError: refreshWhenStale,
  });

  const leave = useMutation<void, Error, { linkId: string }>({
    meta: { silentError: true },
    mutationFn: async ({ linkId }) => {
      if (demoMode) demoLeaveMemberTeamLink(linkId);
      else await leaveMemberTeamLink(linkId);
    },
    onSuccess: refresh,
    onError: refreshWhenStale,
  });

  return { accept, decline, leave };
}
