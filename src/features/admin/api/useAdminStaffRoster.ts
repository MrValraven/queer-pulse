import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ADMIN_STAFF_ROSTER_DEMO } from "../adminStaffRoster.data";
import { getAdminStaffRoster } from "./adminStaffRoster.api";

export const ADMIN_STAFF_ROSTER_KEY = "admin-staff-roster";

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
