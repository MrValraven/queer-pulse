/**
 * Group membership limits: FE mirrors of the backend caps, so the member
 * pickers (NewGroupModal, GroupAddMembersModal) can stop a member from
 * selecting more than the server will ever accept, instead of letting the
 * request round-trip into a 400.
 */

/** Mirrors queerpulse-backend `src/messaging/messaging.constants.ts`. */
export const MAX_GROUP_MEMBERS = 256;

/** Mirrors the per-request array cap in queerpulse-backend's
 *  `add-members.dto.ts` / `create-group.dto.ts` (`ArrayMaxSize(50)`). */
export const MAX_MEMBERS_PER_REQUEST = 50;

/**
 * How many more members a single create/add request can pick right now, given
 * the group's current active member count (the creator counts as one for a
 * new group). Never negative and never above the per-request cap, so a picker
 * can never let a member select more than the server will accept.
 */
export function remainingGroupSlots(activeMemberCount: number): number {
  return Math.max(
    0,
    Math.min(MAX_MEMBERS_PER_REQUEST, MAX_GROUP_MEMBERS - activeMemberCount),
  );
}
