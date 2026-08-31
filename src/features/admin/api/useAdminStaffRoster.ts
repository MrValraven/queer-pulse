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
 * Every moderator and admin on the platform, plus every member holding a
 * badge-earning grant, for the admin staff-roster page. Same underlying data
 * `useStaffMap` badges with, fetched here as the raw rows since the page
 * renders every one of them rather than a single-slug lookup.
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
 * Everyone holding an additive staff grant, for the same page. Still separate
 * from the roster above, because it answers a wider question from an admin-only
 * endpoint: the roster carries only the grants that earn a public badge, while
 * this carries EVERY grant a person holds, including the ones deliberately left
 * unbadged (`magazine_writer`, `partnerships`), which the console still has to
 * administer.
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
