import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";

/** Moderators and admins review Studio reports and disputes (spec 7.2).
 *  The demo opens every staff surface, as `useMyStaffRoles` does. */
export function useIsStudioStaff(): boolean {
  const { demoMode } = useDemoMode();
  const { role } = useAuth();
  return demoMode || role === "moderator" || role === "admin";
}
