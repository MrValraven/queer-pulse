import { useMyCommunities } from "../communities/api/useMyCommunities";
import type { EventCommunityDTO } from "./api/events.api";
import type { GatheringDetail } from "./data";

/**
 * The community a gathering is hosted with, when this viewer may see it named;
 * otherwise `null`.
 *
 * A public, request or invite community is listed in Discover, so naming it on
 * a Public gathering gives nothing away. A `private` one withholds its very
 * existence (a coming-out or survivors' group), so its name is shown only to
 * its own roster and to the gathering's organizers. The server already omits
 * it for everyone else (see `EventCommunityDTO`); this is the second line, in
 * case an older server sends it anyway.
 */
export function useVisibleGatheringCommunity(
  gathering: GatheringDetail,
): EventCommunityDTO | null {
  const memberships = useMyCommunities();
  const { community } = gathering;
  if (!community) return null;
  if (community.accessTier !== "private") return community;
  return gathering.viewerIsOrganizer || memberships[community.slug]
    ? community
    : null;
}
