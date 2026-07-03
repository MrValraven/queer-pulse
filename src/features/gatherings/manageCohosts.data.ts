import { MEMBERS, type Member } from "../members/data/members";

/** A person the host can invite or add as a cohost. */
export interface CohostCandidate {
  slug: string;
  name: string;
  role: string;
  initials: string;
  tint: Member["tint"];
  photo?: string;
}

/** Map a registry member onto the light shape the pickers need. */
function toCandidate(member: Member): CohostCandidate {
  return {
    slug: member.slug,
    name: `${member.first} ${member.last}`,
    role: member.role,
    initials: member.initials,
    tint: member.tint,
    photo: member.photo,
  };
}

/**
 * The full pool the host picks from — every recurring person on the platform,
 * sourced from the canonical member registry so names/avatars stay in sync.
 */
export const MEMBER_POOL: CohostCandidate[] =
  Object.values(MEMBERS).map(toCandidate);

/**
 * Cohosts already on this gathering (Pride Brunch — June). Seeded here because
 * the static event data doesn't carry a cohost list; the manage panel treats
 * this as its starting local state.
 */
export const INITIAL_COHOSTS: CohostCandidate[] = ["anika", "sofia"]
  .map((slug) => MEMBERS[slug])
  .filter((m): m is Member => Boolean(m))
  .map(toCandidate);
