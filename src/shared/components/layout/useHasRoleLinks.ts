import { useHasStaffRole } from "../../../features/auth/api/useMyStaffRoles";
import type { TeamRole } from "../../../features/admin/adminRole";

/**
 * Whether the account surfaces render the `RoleLinks` block at all (see
 * `accountMenuShared.tsx`). Every moderator and admin gets it. A plain member
 * gets it only while they hold `vj_operator`, so a member who is staff on that
 * grant alone has a way into VJ, and every other member keeps the menu
 * without the staff divider. A member holding `cultural_producer` or
 * `music_manager_producer` gets it too, for the Cultural Production link.
 */
export function useHasRoleLinks(role: TeamRole): boolean {
  const canOperateVj = useHasStaffRole("vj_operator");
  // Both hooks run on every render; an `||` between the calls would skip one.
  const isCulturalProducer = useHasStaffRole("cultural_producer");
  const isMusicManagerProducer = useHasStaffRole("music_manager_producer");
  const canProduceCulture = isCulturalProducer || isMusicManagerProducer;
  return role !== "member" || canOperateVj || canProduceCulture;
}
