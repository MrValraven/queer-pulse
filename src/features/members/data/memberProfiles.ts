/**
 * Back-compat shim. The canonical member registry now lives in `./members`.
 * Prefer importing `MEMBERS`, `getMember`, `memberName`, `memberAvatar`, and the
 * `Member` type from `./members` directly.
 */
export {
  MEMBERS as memberProfiles,
  defaultProfileSlug,
  currentUserSlug,
  currentUser,
  getMember,
  fullName,
  memberName,
  memberAvatar,
} from "./members";
export type {
  Member as MemberProfile,
  MemberSlug,
  ShapingItem,
  WorkItem,
  BoardItem,
} from "./members";
