import { useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useMyStaffRoles } from "../../../features/auth/api/useMyStaffRoles";
import { useTranslation } from "../../i18n/useTranslation";
import { Translation } from "../../i18n/Translation";
import { Tooltip } from "../ui";
import { AdminAccountMenu } from "./AdminAccountMenu";
import { AdminRoleSwitcher } from "./AdminRoleSwitcher";
import { AdminNavGroup, AdminNavLink } from "./AdminNavGroup";
import { AdminNavSearch, AdminNavSearchResults } from "./AdminNavSearch";
import {
  firstAdminNavMatch,
  normalizeSearchText,
  searchAdminNav,
} from "./adminNavMatching";
import { useAdminNavBadges } from "./useAdminNavBadges";
import { useAdminNavSections } from "./useAdminNavSections";
import { rememberNavScroll, useAdminNavScroll } from "./useAdminNavScroll";
import { ADMIN_NAV_OVERVIEW, visibleAdminNavSections } from "./adminNav.data";
import styles from "./AdminShell.module.css";

export function AdminSidebar({
  isCollapsed = false,
  onToggleCollapse,
  onNavigate,
}: {
  /** Icon-only rail. Desktop only — the mobile drawer is always full width, so
   * AdminShell never passes this while the sidebar is off-canvas. */
  isCollapsed?: boolean;
  /** Absent on mobile, where there is nothing to collapse to. */
  onToggleCollapse?: () => void;
  /** Called when a navigation link is activated — the mobile off-canvas drawer
   * passes its close handler so tapping a link dismisses the drawer. Absent on
   * desktop, where the sidebar is a static rail and nothing needs closing. */
  onNavigate?: () => void;
} = {}) {
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
  const sections = useMemo(
    () => visibleAdminNavSections({ isFullConsole, isAdmin, staffRoles }),
    [isFullConsole, isAdmin, staffRoles],
  );

  // Which page am I after? The rail is 57 destinations deep across nine
  // sections, so finding one by name beats remembering where it was filed.
  // Local state on purpose: a query is about this moment, never a preference to
  // carry into the next visit.
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
  // first. Either way the query goes, so coming back to the rail shows sections
  // rather than a stale narrowing.
  const leaveSearch = () => {
    setSearchQuery("");
    onNavigate?.();
  };
  const openFirstMatch = () => {
    const first = firstAdminNavMatch(searchGroups);
    if (!first) return;
    leaveSearch();
    void navigate(first.to);
  };

  const navRef = useRef<HTMLElement>(null);
  const badgeCounts = useAdminNavBadges();
  const { isSectionOpen, toggleSection, isActiveSectionOpen, pathname } =
    useAdminNavSections();
  useAdminNavScroll(navRef, { pathname, isActiveSectionOpen });

  const homeLabel = t("shared:adminSidebar.homeAria");
  const backLabel = t("shared:adminSidebar.backToPlatform");
  const collapseLabel = isCollapsed
    ? t("shared:adminSidebar.expandRail")
    : t("shared:adminSidebar.collapseRail");

  return (
    <aside
      className={[styles.sidebar, isCollapsed && styles.sidebarCollapsed]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.brandRow}>
        <MaybeTooltip label={homeLabel} isOn={isCollapsed}>
          <Link
            to={routes.admin}
            className={styles.brand}
            onClick={onNavigate}
            aria-label={isCollapsed ? homeLabel : undefined}
          >
            <span className={styles.brandDot} aria-hidden />
            {!isCollapsed && (
              <>
                <span className={styles.brandName}>
                  <Translation
                    i18nKey="shared:brand.wordmark"
                    components={{ em: <em /> }}
                  />
                </span>
                <span className={styles.brandBadge}>
                  {t("shared:adminSidebar.badge")}
                </span>
              </>
            )}
          </Link>
        </MaybeTooltip>

        {onToggleCollapse && (
          <MaybeTooltip label={collapseLabel} isOn={isCollapsed}>
            <button
              type="button"
              className={styles.collapseBtn}
              onClick={onToggleCollapse}
              aria-label={collapseLabel}
              title={isCollapsed ? undefined : collapseLabel}
            >
              {isCollapsed ? (
                <FiChevronsRight aria-hidden />
              ) : (
                <FiChevronsLeft aria-hidden />
              )}
            </button>
          </MaybeTooltip>
        )}
      </div>

      <AdminRoleSwitcher isCollapsed={isCollapsed} />

      <AdminNavSearch
        value={searchQuery}
        onChange={setSearchQuery}
        onSubmit={openFirstMatch}
        isCollapsed={isCollapsed}
        onExpand={onToggleCollapse}
      />

      <nav
        className={styles.nav}
        aria-label={t("shared:adminSidebar.navLabel")}
        ref={navRef}
        onScroll={(event) => rememberNavScroll(event.currentTarget.scrollTop)}
      >
        {isSearching ? (
          <AdminNavSearchResults
            groups={searchGroups}
            badgeCounts={badgeCounts}
            onNavigate={leaveSearch}
          />
        ) : (
          <>
            {/* The overview is admin-only on the backend (`admin/overview`), so
                a viewer who is here on a grant alone is not offered a link that
                would bounce them straight back out. */}
            {isFullConsole && (
              <AdminNavLink
                item={ADMIN_NAV_OVERVIEW}
                count={0}
                isCollapsed={isCollapsed}
                onNavigate={onNavigate}
              />
            )}

            {sections.map((section) => (
              <AdminNavGroup
                key={section.id}
                section={section}
                badgeCounts={badgeCounts}
                isOpen={isSectionOpen(section.id, section.defaultOpen)}
                isCollapsed={isCollapsed}
                onToggle={() => toggleSection(section.id, section.defaultOpen)}
                onNavigate={onNavigate}
              />
            ))}
          </>
        )}
      </nav>

      <MaybeTooltip label={backLabel} isOn={isCollapsed}>
        <Link
          to={routes.homepage}
          className={[
            styles.backToPlatform,
            isCollapsed && styles.backToPlatformIcon,
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={onNavigate}
        >
          <FiArrowLeft aria-hidden />
          <span className={isCollapsed ? "visuallyHidden" : undefined}>
            {backLabel}
          </span>
        </Link>
      </MaybeTooltip>

      <AdminAccountMenu isCollapsed={isCollapsed} onNavigate={onNavigate} />
    </aside>
  );
}

/** The rail's icon-only controls keep their name in a tooltip; the wide rail
 * already shows it, so the wrapper drops out entirely. */
function MaybeTooltip({
  label,
  isOn,
  children,
}: {
  label: string;
  isOn: boolean;
  children: ReactNode;
}) {
  if (!isOn) return <>{children}</>;
  return (
    <Tooltip label={label} placement="right">
      {children}
    </Tooltip>
  );
}
