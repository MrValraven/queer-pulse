import type { GroupMemberView } from "./data";
import { sameMember } from "./groupOwnershipDemo";

/**
 * DES-228: who inherits ownership if the current owner leaves. Mirrors the
 * backend rule (`messaging.service.ts`'s auto-succession on leave/dissolve):
 * the longest-standing admin, else the longest-standing member, else nobody
 * (the group ends). "Longest-standing" reads as roster ARRAY ORDER here,
 * because the wire contract (`ConversationMemberSummary`) carries no
 * `joinedAt`, so this is a best-effort mirror of the server's own
 * participant-creation-order query rather than an exact timestamp
 * comparison. It is display-only (the `GroupLeaveConfirm` preview): the
 * server is the one that actually decides and writes `owner_changed` on the
 * real leave.
 */
export function computeGroupSuccessor(
  members: GroupMemberView[],
  leavingOwner: GroupMemberView,
): GroupMemberView | null {
  const candidates = members.filter(
    (member) => member !== leavingOwner && !sameMember(member, leavingOwner),
  );
  const longestStandingAdmin = candidates.find(
    (member) => member.role === "admin",
  );
  if (longestStandingAdmin) return longestStandingAdmin;
  return candidates.find((member) => member.role === "member") ?? null;
}
