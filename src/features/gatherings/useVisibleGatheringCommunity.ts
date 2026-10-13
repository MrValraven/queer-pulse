import { useMyCommunities } from "../communities/api/useMyCommunities";
import type { AccessTier } from "../communities/membership.types";
import type { GatheringGuestCommunity } from "./api/eventCommunities.api";
import type { EventCommunityDTO } from "./api/events.api";
import type { GatheringDetail } from "./data";

/**
 * Whether this viewer may see a hosting community named.
 *
 * A public, request or invite community is listed in Discover, so naming it
 * on a gathering gives nothing away. A `private` one withholds its very
 * existence (a coming-out or survivors' group), so its name is shown only
 * to its own roster and to the gathering's organisers. The server already
 * omits it for everyone else; this is the second line, in case an older
 * server sends it anyway. The lead and every guest pass through it on their
 * own.
 */
export function isCommunityNamedForViewer(
  community: { slug: string; accessTier: AccessTier },
  isOrganizer: boolean,
  memberships: Readonly<Record<string, unknown>>,
): boolean {
  if (community.accessTier !== "private") return true;
  return isOrganizer || Boolean(memberships[community.slug]);
}

/** The lead community, when this viewer may see it named; otherwise `null`. */
export function useVisibleGatheringCommunity(
  gathering: GatheringDetail,
): EventCommunityDTO | null {
  const memberships = useMyCommunities();
  const { community } = gathering;
  if (!community) return null;
  return isCommunityNamedForViewer(
    community,
    Boolean(gathering.viewerIsOrganizer),
    memberships,
  )
    ? community
    : null;
}

/** The accepted guest communities this viewer may see named. */
export function useVisibleGuestCommunities(
  gathering: GatheringDetail,
): GatheringGuestCommunity[] {
  const memberships = useMyCommunities();
  return (gathering.guestCommunities ?? []).filter((guest) =>
    isCommunityNamedForViewer(
      guest,
      Boolean(gathering.viewerIsOrganizer),
      memberships,
    ),
  );
}
