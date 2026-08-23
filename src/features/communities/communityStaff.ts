import type { CommunityRole } from "./membership.types";

/**
 * Whether a roster role speaks FOR the community rather than just belonging to
 * it: owner, co-owner and moderator. The one predicate behind every
 * staff-gated affordance this feature owns (the announcement toggle, the
 * resource-shelf editor), so those three surfaces can never disagree about who
 * counts as staff.
 *
 * `co_owner` is matched by string rather than through `CommunityRole`, which
 * has not been widened for it yet: the backend's `RosterRole` enum carries the
 * value (migration `1793920000000-AddCommunityCoOwnerRole`), so it can already
 * arrive over the wire and must not silently read as an ordinary member. The
 * comparison is safe for any narrower union the type later grows into.
 */
export function isCommunityStaff(role: CommunityRole | null | undefined) {
  if (!role) return false;
  const roleValue: string = role;
  return (
    roleValue === "owner" || roleValue === "co_owner" || roleValue === "mod"
  );
}
