import { useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import { useTranslation } from "../../i18n/useTranslation";
import { Translation } from "../../i18n/Translation";
import { Tooltip } from "../ui";
import { AdminAccountMenu } from "./AdminAccountMenu";
import { AdminRoleSwitcher } from "./AdminRoleSwitcher";
import { AdminNavGroup, AdminNavLink } from "./AdminNavGroup";
import { AdminNavSearch, AdminNavSearchResults } from "./AdminNavSearch";
import { useAdminNavBadges } from "./useAdminNavBadges";
import { useAdminNavSections } from "./useAdminNavSections";
import { rememberNavScroll, useAdminNavScroll } from "./useAdminNavScroll";
import { useAdminSidebarNav } from "./useAdminSidebarNav";
import { ADMIN_NAV_OVERVIEW } from "./adminNav.data";
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
  const {
    sections,
    isFullConsole,
    searchQuery,
    setSearchQuery,
    isSearching,
    searchGroups,
    leaveSearch,
    openFirstMatch,
  } = useAdminSidebarNav({ isCollapsed, onNavigate });

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
          to={routes.feed}
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
