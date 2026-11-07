import { useHasStaffRole } from "../../../features/auth/api/useMyStaffRoles";
import type { TeamRole } from "../../../features/admin/adminRole";

/**
 * Whether the account surfaces render the `RoleLinks` block at all (see
 * `accountMenuShared.tsx`). Every moderator and admin gets it. A plain member
 * gets it only while they hold `vj_operator`, so a member who is staff on that
 * grant alone has a way into VJ, and every other member keeps the menu
 * without the staff divider.
 */
export function useHasRoleLinks(role: TeamRole): boolean {
  const canOperateVj = useHasStaffRole("vj_operator");
  return role !== "member" || canOperateVj;
}
