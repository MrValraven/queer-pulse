import { gatheringPath } from "../gatherings/data";
import type { AffiliationDTO } from "./api/subprofiles.api";

// ── Preset target types + roles (mirror backend `subprofile-validation.ts`) ──

export const AFFILIATION_TARGET_TYPES = ["event", "community"] as const;
export type AffiliationTargetType = (typeof AFFILIATION_TARGET_TYPES)[number];

export const EVENT_ROLES = ["performing", "attending", "hosting"] as const;
export const COMMUNITY_ROLES = ["member", "mod", "founder"] as const;

export const MAX_AFFILIATIONS = 12;

/** The valid preset roles for a given target type; `[]` for an unknown type. */
export function rolesForTargetType(
  targetType: string,
): readonly string[] {
  if (targetType === "event") return EVENT_ROLES;
  if (targetType === "community") return COMMUNITY_ROLES;
  return [];
}

/** Every preset role → its i18n label key, so a component can `t(...)` it
 *  without a switch. Keys live under the `subprofiles:` namespace (C3). */
export const AFFILIATION_ROLE_KEYS: Record<string, string> = {
  performing: "subprofiles:affiliation.role.performing",
  attending: "subprofiles:affiliation.role.attending",
  hosting: "subprofiles:affiliation.role.hosting",
  member: "subprofiles:affiliation.role.member",
  mod: "subprofiles:affiliation.role.mod",
  founder: "subprofiles:affiliation.role.founder",
};

/** The entity link an affiliation card/row points to, built via the app's
 *  existing route helpers — never a hand-rolled path.
 *  - events resolve through `gatheringPath()` (the gatherings feature owns
 *    event detail routing; there is no separate "events" route module).
 *  - communities have no exported path helper — every community surface in
 *    this codebase (CommunityCard, useAllCommunities, communities.adapters)
 *    links via the same literal `/community/:slug` pattern, so this mirrors
 *    that existing convention rather than inventing a new one. */
export function affiliationHref(dto: AffiliationDTO): string {
  if (dto.targetType === "event") return gatheringPath(dto.targetSlug);
  return `/community/${dto.targetSlug}`;
}
