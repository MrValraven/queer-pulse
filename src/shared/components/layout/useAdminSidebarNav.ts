import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useMyStaffRoles } from "../../../features/auth/api/useMyStaffRoles";
import { useTranslation } from "../../i18n/useTranslation";
import {
  firstAdminNavMatch,
  normalizeSearchText,
  searchAdminNav,
} from "./adminNavMatching";
import { useAdminNavFeatures } from "./useAdminNavFeatures";
import { ADMIN_NAV_OVERVIEW, visibleAdminNavSections } from "./adminNav.data";

/**
 * What the admin rail offers this viewer, and the rail's search over it: the
 * sections their role, grants and visible features open, plus the query state
 * and both ways out of a result.
 */
export function useAdminSidebarNav({
  isCollapsed,
  onNavigate,
}: {
  isCollapsed: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
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

  // Which page am I after? The rail is 57 destinations deep across nine
  // sections, so finding one by name beats remembering where it was filed.
  // Local state on purpose: a query belongs to this moment and ends with the
  // visit.
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  // The collapsed rail has no field to type in, so it always shows its
  // sections: narrowing a 68px icon column to matches nobody can read would
  // strand the query somewhere the admin cannot see or clear it. Widening the
  // rail again brings the results straight back.
  const isSearching =
    !isCollapsed && normalizeSearchText(searchQuery).length > 0;
  const searchGroups = useMemo(
    () =>
      searchAdminNav({
        sections,
        // Matched against the same rail the viewer is offered: the Overview
        // link only joins the results for someone who is shown it at all.
        overview: isFullConsole ? ADMIN_NAV_OVERVIEW : undefined,
        query: searchQuery,
        translate: t,
      }),
    [sections, isFullConsole, searchQuery, t],
  );

  // Both ways out of a result: clicking one, and Enter on the field taking the
  // first. Either way the query goes, so coming back to the rail shows its full
  // sections again.
  const leaveSearch = () => {
    setSearchQuery("");
    onNavigate?.();
  };
  const openFirstMatch = () => {
    const firstMatch = firstAdminNavMatch(searchGroups);
    if (!firstMatch) return;
    leaveSearch();
    void navigate(firstMatch.to);
  };

  return {
    sections,
    isFullConsole,
    searchQuery,
    setSearchQuery,
    isSearching,
    searchGroups,
    leaveSearch,
    openFirstMatch,
  };
}
