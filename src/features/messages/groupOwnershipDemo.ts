import type { Conversation, GroupMemberView } from "./data";
import { computeGroupSuccessor } from "./groupSuccession";
import { withDemoSystemPill } from "./useMessagesController.helpers";

/** Compares two roster entries by the same identity chain used across this
 *  feature (`id` when live, else `slug`, else the display name). Exported so
 *  `groupSuccession.ts` (and any other roster-identity check) shares this
 *  one chain rather than growing its own copy. */
export function sameMember(a: GroupMemberView, b: GroupMemberView): boolean {
  return (a.id ?? a.slug ?? a.name) === (b.id ?? b.slug ?? b.name);
}

/** Every can-flag PRD-357 says a member who has left/a dissolved group must
 *  show false for, in one place so `simulateDissolveGroup` and the leave-
 *  with-no-successor path in `simulateOwnerLeave` can't drift apart. Typed as
 *  a `Partial<Conversation>` (not `as const`) so `pendingInvites` stays the
 *  mutable `ConversationPendingInvite[]` the field expects, not a `readonly
 *  []` literal. */
const SEVERED_CAPABILITY_FLAGS: Partial<Conversation> = {
  canAddMembers: false,
  canRemoveMembers: false,
  canRename: false,
  canManageRoles: false,
  canTransferOwnership: false,
  canDissolve: false,
  canManageInviteLink: false,
  inviteToken: null,
  pendingInvites: [],
};

/**
 * DES-228: demo-local ownership transfer, mirroring `POST :id/owner`. The
 * signed-in member is always the one initiating this from their own roster
 * (`canTransferOwnership` is only ever true for the owner), so this always
 * demotes THEM to admin and promotes `target` to owner, then posts
 * `owner_changed` (actor = previous owner = the viewer, target = the new
 * owner).
 */
export function simulateTransferOwnership(
  group: Conversation,
  target: GroupMemberView,
  myDisplayName: string,
): Conversation {
  const members = (group.members ?? []).map((member) => {
    if (member.role === "owner") return { ...member, role: "admin" as const };
    if (sameMember(member, target))
      return { ...member, role: "owner" as const };
    return member;
  });
  const next: Conversation = {
    ...group,
    members,
    myRole: "admin",
    canManageRoles: false,
    canTransferOwnership: false,
    canDissolve: false,
  };
  return withDemoSystemPill(next, {
    type: "owner_changed",
    actorName: myDisplayName,
    targetName: target.name,
    actorIsMe: true,
  });
}

/** PRD-357: demo-local `POST :id/dissolve`, ending the group for the signed-in
 *  member (the only participant a single-user demo can represent): every
 *  capability flag drops, the roster empties (ENG-238), and a
 *  `group_dissolved` pill is posted before the severed state is applied,
 *  mirroring the real transaction's write order. */
export function simulateDissolveGroup(
  group: Conversation,
  myDisplayName: string,
): Conversation {
  const next: Conversation = {
    ...group,
    ...SEVERED_CAPABILITY_FLAGS,
    dissolvedAt: new Date().toISOString(),
    hasLeft: true,
    leftReason: "dissolved",
    members: [],
  };
  return withDemoSystemPill(next, {
    type: "group_dissolved",
    actorName: myDisplayName,
    actorIsMe: true,
  });
}

/** PRD-358: demo-local `PATCH :id` (title/avatar/description branch), posting
 *  `group_renamed`/`group_photo_changed`/`group_description_changed`, one
 *  pill per field that actually changed, mirroring the live `updateGroup`
 *  mutation's own pills. Pulled out of `useMessageGroupActions.ts` purely to
 *  keep that hook's `updateGroupInfo` under the per-function line cap. */
export function simulateUpdateGroupInfo(
  group: Conversation,
  changes: { title?: string; avatarUrl?: string; description?: string },
  myDisplayName: string,
): Conversation {
  const trimmedTitle = changes.title?.trim();
  const renamed = !!trimmedTitle && trimmedTitle !== group.name;
  const photoChanged =
    changes.avatarUrl !== undefined && changes.avatarUrl !== group.avatarUrl;
  const descriptionChanged =
    changes.description !== undefined &&
    changes.description !== (group.description ?? "");
  let next: Conversation = {
    ...group,
    name: trimmedTitle || group.name,
    avatarUrl: changes.avatarUrl ?? group.avatarUrl,
    description:
      changes.description !== undefined
        ? changes.description || null
        : group.description,
  };
  if (renamed) {
    next = withDemoSystemPill(next, {
      type: "group_renamed",
      actorName: myDisplayName,
      value: trimmedTitle,
      actorIsMe: true,
    });
  }
  if (photoChanged) {
    next = withDemoSystemPill(next, {
      type: "group_photo_changed",
      actorName: myDisplayName,
      actorIsMe: true,
    });
  }
  if (descriptionChanged) {
    next = withDemoSystemPill(next, {
      type: "group_description_changed",
      actorName: myDisplayName,
      actorIsMe: true,
    });
  }
  return next;
}

/**
 * DES-228: demo-local auto-succession when the OWNER leaves (mirrors the
 * backend rule `computeGroupSuccessor` approximates): hand ownership to the
 * longest-standing admin, else the longest-standing member (posting
 * `owner_changed` then `member_left`), or (PRD-357) end the group with no
 * pill if nobody remains ("the last leaver with no successor also sets
 * dissolved_at"). Only exercised in demo when the viewer holding
 * `canManageRoles`/owner role leaves; every other leave stays the plain
 * severance `leaveGroupThread` already did.
 */
export function simulateOwnerLeave(
  group: Conversation,
  leavingOwner: GroupMemberView,
  myDisplayName: string,
): Conversation {
  const successor = computeGroupSuccessor(group.members ?? [], leavingOwner);
  if (!successor) {
    return {
      ...group,
      ...SEVERED_CAPABILITY_FLAGS,
      dissolvedAt: new Date().toISOString(),
      hasLeft: true,
      leftReason: "left",
      members: [],
    };
  }
  const remainingMembers = (group.members ?? [])
    .filter((member) => !sameMember(member, leavingOwner))
    .map((member) =>
      sameMember(member, successor)
        ? { ...member, role: "owner" as const }
        : member,
    );
  let next: Conversation = {
    ...group,
    members: remainingMembers,
    hasLeft: true,
    leftReason: "left",
    ...SEVERED_CAPABILITY_FLAGS,
  };
  next = withDemoSystemPill(next, {
    type: "owner_changed",
    actorName: myDisplayName,
    targetName: successor.name,
    actorIsMe: true,
  });
  next = withDemoSystemPill(next, {
    type: "member_left",
    actorName: myDisplayName,
    actorIsMe: true,
  });
  return next;
}
