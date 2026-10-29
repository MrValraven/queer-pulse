import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";

/**
 * Who is reading the Studio console. `hasStaffTier` is true for a moderator or
 * admin (and in demo), as `useAdminSidebarNav` decides; a holder of the
 * `music_manager_producer` grant without the tier gets false and sees only
 * the curation tabs.
 */
export function useStudioAdminViewer(): { hasStaffTier: boolean } {
  const { role } = useAuth();
  const { demoMode } = useDemoMode();
  return {
    hasStaffTier: demoMode || role === "admin" || role === "moderator",
  };
}
