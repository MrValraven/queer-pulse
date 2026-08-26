import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  ADMIN_STAFF_GRANTS_DEMO,
  ADMIN_STAFF_ROSTER_DEMO,
} from "../adminStaffRoster.data";
import {
  getAdminStaffRoleHolders,
  getAdminStaffRoster,
} from "./adminStaffRoster.api";

export const ADMIN_STAFF_ROSTER_KEY = "admin-staff-roster";
export const ADMIN_STAFF_GRANTS_KEY = "admin-staff-grants";

/**
 * Every moderator/admin on the platform, for the admin staff-roster page.
 * Same underlying data `useStaffMap` badges with — fetched here as the raw
 * rows since the page renders every one of them, not a single-slug lookup.
 */
export function useAdminStaffRoster() {
  const { demoMode } = useDemoMode();
  return useQuery({
    queryKey: [ADMIN_STAFF_ROSTER_KEY, demoMode],
    initialData: demoMode ? ADMIN_STAFF_ROSTER_DEMO : undefined,
    queryFn: () => (demoMode ? ADMIN_STAFF_ROSTER_DEMO : getAdminStaffRoster()),
  });
}

/**
 * Everyone holding an additive staff grant, for the same page. Separate from
 * the roster above because it answers a different question from a different
 * endpoint: the roster is the account tiers (`/platform/staff`), this is the
 * delegated domains (`/admin/members/staff-roles`), and a grant holder need
 * not be on the roster at all.
 */
export function useAdminStaffRoleHolders() {
  const { demoMode } = useDemoMode();
  return useQuery({
    queryKey: [ADMIN_STAFF_GRANTS_KEY, demoMode],
    initialData: demoMode ? ADMIN_STAFF_GRANTS_DEMO : undefined,
    queryFn: () =>
      demoMode ? ADMIN_STAFF_GRANTS_DEMO : getAdminStaffRoleHolders(),
  });
}
