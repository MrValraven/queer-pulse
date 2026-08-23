import type { CommunityRole } from "./membership.types";

/**
 * The co-owner roster role. Declared as a widened string comparison rather
 * than as a `CommunityRole` member because the shared `CommunityRole` union is
 * still `owner | mod | member` while the backend already issues `co_owner`;
 * this stays correct either way, including after that union is widened.
 */
export const CO_OWNER_ROLE = "co_owner";

export function isOwnerRole(role: CommunityRole | null): boolean {
  return role === "owner";
}

export function isCoOwnerRole(role: CommunityRole | null): boolean {
  return (role as string | null) === CO_OWNER_ROLE;
}

/** Owner, co-owner or moderator: the three roles the backend treats as a
 *  community's staff. */
export function isStaffRole(role: CommunityRole | null): boolean {
  return isOwnerRole(role) || isCoOwnerRole(role) || role === "mod";
}

/**
 * The i18n key naming a viewer's own standing in a community. Owner-only
 * powers (transferring ownership, archiving) are named in the co-owner and
 * moderator copy, so a co-owner who cannot see those rows knows why.
 */
export function staffRoleLabelKey(role: CommunityRole | null): string | null {
  if (isOwnerRole(role)) return "communities:detail.dangerZone.yourRole.owner";
  if (isCoOwnerRole(role))
    return "communities:detail.dangerZone.yourRole.coOwner";
  if (role === "mod") return "communities:detail.dangerZone.yourRole.mod";
  return null;
}
