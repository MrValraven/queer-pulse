import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ADMIN_STAFF_ROSTER_ROWS_DEMO } from "../adminStaffRoster.data";
import {
  getAdminStaffRosterRows,
  type AdminStaffRosterRowDTO,
} from "./adminStaffRoster.api";

export const ADMIN_STAFF_ROSTER_ROWS_KEY = "admin-staff-roster-rows";

/**
 * One row per staff person, with photo, status, join date and dated grants,
 * from the admin-only `GET /admin/members/staff-roster`. Grants and revokes
 * made from the member drawer refetch it in live mode and patch the cached
 * demo rows in demo mode (see `useAdminMembers.ts`). Demo rows never go stale
 * so those patches hold for the session.
 */
export function useAdminStaffRosterRows() {
  const { demoMode } = useDemoMode();
  return useQuery<AdminStaffRosterRowDTO[]>({
    queryKey: [ADMIN_STAFF_ROSTER_ROWS_KEY, demoMode],
    initialData: demoMode ? ADMIN_STAFF_ROSTER_ROWS_DEMO : undefined,
    ...(demoMode ? { staleTime: Infinity } : {}),
    queryFn: () =>
      demoMode ? ADMIN_STAFF_ROSTER_ROWS_DEMO : getAdminStaffRosterRows(),
  });
}
