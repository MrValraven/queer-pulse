/**
 * Section 8 (Groups) write hooks beyond the Phase-2 set already in
 * `useMessageMutations.ts` (add/remove/role/title-avatar-description, that
 * last one rides the EXISTING `useUpdateGroup`, which now also accepts
 * `description`; it is not duplicated here).
 *
 * Split across two colocated files to stay under the repo's ~200-line
 * guidance, this file is the single, stable import path for both:
 *  - `useGroupOwnershipMutations.ts`: transfer ownership, dissolve, and the
 *    invite-link lifecycle (create/rotate, disable).
 *  - `useGroupInviteMutations.ts`: join by link, accept/decline an invite,
 *    and the owner/admin's revoke.
 */
export {
  useTransferGroupOwnership,
  useDissolveGroup,
  useCreateGroupInviteLink,
  useDisableGroupInviteLink,
} from "./useGroupOwnershipMutations";
export {
  useJoinGroupByToken,
  useAcceptGroupInvite,
  useDeclineGroupInvite,
  useRevokeGroupInvite,
} from "./useGroupInviteMutations";
