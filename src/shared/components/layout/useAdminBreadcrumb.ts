import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ADMIN_NAV, type AdminNavItem } from "./adminNav.data";
import { matchesPath, navItemPathOf } from "./useAdminNavSections";

export interface AdminBreadcrumbMatch {
  /** The rail destination that owns the current page, or undefined for a page
   *  the rail does not list. */
  item?: AdminNavItem;
  /** True when the page is the destination itself; false on a page nested
   *  beneath it (a detail, an editor, a sub-page). */
  isExact: boolean;
  /** True on the Overview itself, where the root crumb links to nothing. */
  isHome: boolean;
}

/** Whether `pathname` belongs to this rail item. An `end` item (the Overview)
 *  claims its own path only, so it never swallows every admin page. */
function ownsPath(pathname: string, item: AdminNavItem): boolean {
  return item.end
    ? pathname === navItemPathOf(item.to)
    : matchesPath(pathname, item.to);
}

/**
 * The rail destination behind the current admin page, for the top bar's
 * "Admin · <page>" breadcrumb. The longest matching path wins, the same rule
 * the rail uses to open the section that holds the page, so the crumb and the
 * highlighted link always name the same destination.
 */
export function useAdminBreadcrumb(): AdminBreadcrumbMatch {
  const { pathname } = useLocation();
  return useMemo(() => {
    let best: AdminNavItem | undefined;
    let bestLength = 0;
    for (const item of ADMIN_NAV) {
      const itemPathLength = navItemPathOf(item.to).length;
      if (ownsPath(pathname, item) && itemPathLength > bestLength) {
        best = item;
        bestLength = itemPathLength;
      }
    }
    const homePath = navItemPathOf(ADMIN_NAV[0]?.to ?? "");
    return {
      item: best,
      isExact: !!best && pathname === navItemPathOf(best.to),
      isHome: pathname === homePath,
    };
  }, [pathname]);
}
