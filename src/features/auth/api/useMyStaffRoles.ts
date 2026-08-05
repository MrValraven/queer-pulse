import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { STAFF_ROLE_IDS, type StaffRoleId } from "../../admin/staffRoles.registry";

/**
 * The current member's staff-role grants. Live mode reads the real grants off
 * `useAuth().staffRoles` (sourced from `/auth/me`). Demo mode grants ALL staff
 * roles so the sandbox can explore every gated surface — mirroring how demo
 * defaults the account tier to `admin` (see `AuthProvider`'s `DEMO_USER`).
 */
export function useMyStaffRoles(): StaffRoleId[] {
  const { demoMode } = useDemoMode();
  const { staffRoles, role } = useAuth();
  if (demoMode) return [...STAFF_ROLE_IDS];
  const held = (staffRoles ?? []).filter((value): value is StaffRoleId =>
    STAFF_ROLE_IDS.includes(value as StaffRoleId),
  );
  // Admins are a superset (matches the backend's StaffRolesGuard).
  return role === "admin" ? [...STAFF_ROLE_IDS] : held;
}

/** Whether the current member holds a given staff role (see `useMyStaffRoles`). */
export function useHasStaffRole(role: StaffRoleId): boolean {
  return useMyStaffRoles().includes(role);
}
