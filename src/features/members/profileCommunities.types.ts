import type { CommunityType } from "../homepage/data/types";
import type { CommunityRole } from "../communities/membership.types";

/**
 * A lightweight reference to one of the viewer's own communities, shaped for
 * featuring on their profile. Built by joining the authoritative membership
 * map against the loaded community registry — see `useMyCommunityCards`.
 */
export interface FeaturedCommunityRef {
  slug: string;
  name: string;
  /** Community.description */
  tagline: string;
  type: CommunityType;
  typeLabel: string;
  /** Community.count, e.g. "128 members" */
  countLabel: string;
  /** the OWNER's role in this community */
  role: CommunityRole;
  /** Curated tag ids (⊆ `COMMUNITY_TAGS`, `communities/communityTags.data.ts`)
   *  — rendered as pills on `ProfileCommunityCard`. Absent when the source
   *  doesn't carry it. */
  tags?: string[];
  /** Resolved cover-image URL, standing in for the flat category colour as the
   *  card's letterhead ground. Absent/null when the community has none. */
  coverImageUrl?: string | null;
  /** The community's own square identity mark. Optional on the card shell:
   *  an absent mark draws nothing, no placeholder and no reserved gap. */
  avatarImageUrl?: string | null;
  /** How many members were active in the community this week, when the source
   *  knows it. Absent in sources that don't carry it (the demo registry, whose
   *  flagship communities carry their own number on the `living` mock). */
  activeThisWeek?: number;
}

/** members-namespace i18n key for each role's badge label. */
export const ROLE_LABEL_KEY: Record<CommunityRole, string> = {
  owner: "members:profile.communities.role.owner",
  co_owner: "members:profile.communities.role.coOwner",
  mod: "members:profile.communities.role.mod",
  member: "members:profile.communities.role.member",
};
