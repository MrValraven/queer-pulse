import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../../app/providers/authContext";
import { getMemberTeamLinks } from "./listingTeam.api";
import { toListingTeamMemberLinkListView } from "./listingTeam.adapters";
import { demoGetMemberTeamLinks } from "./listingTeam.demo";
import { listingTeamQueryKeys } from "./listingTeamQueryKeys";
import type { ListingTeamMemberLinkListView } from "./listingTeam.types";

/**
 * The signed-in member's own team links: invites waiting from a business and
 * the teams they are on. Live only when logged in; demo reads the in-memory
 * store through the same adapters as live.
 */
export function useMemberTeamLinks(): {
  links: ListingTeamMemberLinkListView | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const query = useQuery({
    queryKey: listingTeamQueryKeys.memberLinks(demoMode),
    enabled: loggedIn,
    queryFn: async () =>
      toListingTeamMemberLinkListView(
        demoMode ? demoGetMemberTeamLinks() : await getMemberTeamLinks(),
      ),
  });
  return {
    links: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
