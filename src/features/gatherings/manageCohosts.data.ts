import { MEMBERS, type Member } from "../members/data/members";
import { initialsFromParts } from "../../shared/lib/initials";
import type { EventHostDTO } from "./api/events.api";

/** A person the host can invite or add as a cohost. */
export interface CohostCandidate {
  slug: string;
  name: string;
  role: string;
  pronouns?: string;
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
    pronouns: member.pronouns,
    initials: member.initials,
    tint: member.tint,
    photo: member.photo,
  };
}

/** Cycles through the same three avatar tints the attendee rows use
 *  (`AV_TINTS` in `api/events.adapters.ts`) — cohosts carry no tint of their
 *  own on the wire, so a stable per-row tint just needs to vary visually. */
const COHOST_TINTS: Member["tint"][] = ["coral", "jade", "plum"];

/** `GET /events/:slug`'s real `cohosts` (`EventOrganizerView[]`, no per-person
 *  role/bio text) -> the light shape `CohostManager` renders. `roleLabel` is
 *  pre-translated by the caller (`t("gatherings:cohost.roleCohost")`) since
 *  this is a plain data mapper, not a component. */
export function hostDtoToCandidate(
  dto: EventHostDTO,
  index: number,
  roleLabel: string,
): CohostCandidate {
  return {
    slug: dto.slug,
    name: `${dto.firstName} ${dto.lastName}`.trim(),
    role: roleLabel,
    initials: initialsFromParts(dto.firstName, dto.lastName),
    tint: COHOST_TINTS[index % COHOST_TINTS.length]!,
    photo: dto.avatarUrl ?? undefined,
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
