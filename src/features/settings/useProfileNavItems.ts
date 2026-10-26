import { useMemo } from "react";
import { useStudioAccess } from "../studio/api/useStudioAccess";
import { PROFILE_NAV, type ProfileNavItem } from "./editProfileNav.data";

/** The editor's nav items for this viewer: the Studio-only ones drop out
 *  without a grant. Demo mode counts as a grant (useStudioAccess). */
export function useProfileNavItems(): ProfileNavItem[] {
  const { hasAccess } = useStudioAccess();
  return useMemo(
    () => PROFILE_NAV.filter((item) => !item.requiresStudio || hasAccess),
    [hasAccess],
  );
}
