import {
  LISTING_TEAM_LIMITS,
  type ListingTeamMemberView,
} from "./listBusiness/api/listingTeam.types";

/** Splits the public team into the cards shown first and the folded rest. */
export function splitTeamAtFold(members: ListingTeamMemberView[]): {
  visible: ListingTeamMemberView[];
  folded: ListingTeamMemberView[];
} {
  return {
    visible: members.slice(0, LISTING_TEAM_LIMITS.visibleBeforeFold),
    folded: members.slice(LISTING_TEAM_LIMITS.visibleBeforeFold),
  };
}
