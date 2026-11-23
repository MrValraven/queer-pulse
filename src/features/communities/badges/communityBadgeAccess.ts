import type { CommunityRole } from "../membership.types";
import { isCoOwnerRole, isOwnerRole, isStaffRole } from "../communityStaffRole";

/**
 * Who may create, edit, switch off and delete a community's badges. Live: the
 * owner and co-owners (the backend refuses everyone else, and moderators only
 * read the pane). Demo: any staff seat, because the demo viewer is seeded as a
 * moderator on the flagships and owns none of them, and the pane still has to
 * be reachable there (the same precedent as `canEditCommunityGiving`).
 */
export function canManageCommunityBadges(
  role: CommunityRole | null,
  isDemoMode: boolean,
): boolean {
  if (isOwnerRole(role) || isCoOwnerRole(role)) return true;
  return isDemoMode && isStaffRole(role);
}

/** Who may send a gift: the owner, co-owners and moderators. */
export function canSendCommunityGifts(role: CommunityRole | null): boolean {
  return isStaffRole(role);
}
