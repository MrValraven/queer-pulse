import { useMemo } from "react";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useMyStaffRoles } from "../../../features/auth/api/useMyStaffRoles";
import { useAdminNavFeatures } from "./useAdminNavFeatures";
import { visibleAdminNavSections } from "./adminNav.data";

/**
 * What the admin rail offers this viewer: the sections their role, grants and
 * visible features open, and whether they see the full console (the Overview
 * link included). The rail, the command palette and the alerts popover all
 * list from this, so the three always agree.
 */
export function useAdminSidebarNav() {
  const { role } = useAuth();
  const { demoMode } = useDemoMode();
  const staffRoles = useMyStaffRoles();
  // A grant holder who is neither admin nor moderator sees only the sections
  // their grants open (OPS-03); every tier keeps the rail it had.
  const isFullConsole = demoMode || role === "admin" || role === "moderator";
  // A moderator sees the full rail minus the entries whose backend is
  // `@Roles(Admin)` alone (PRD-32's legal register), so the rail never offers a
  // link the route gate then bounces.
  const isAdmin = demoMode || role === "admin";
  // Unlaunched features (Pulse Live) hide their items from staff who cannot
  // see the feature yet, admins included, as the backend `@Feature` guard does.
  const visibleFeatures = useAdminNavFeatures();
  const sections = useMemo(
    () =>
      visibleAdminNavSections({
        isFullConsole,
        isAdmin,
        staffRoles,
        visibleFeatures,
      }),
    [isFullConsole, isAdmin, staffRoles, visibleFeatures],
  );

  return { sections, isFullConsole };
}
