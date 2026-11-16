import { useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiChevronsLeft,
  FiChevronsRight,
  FiX,
} from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import { useTranslation } from "../../i18n/useTranslation";
import { Translation } from "../../i18n/Translation";
import { IconButton, Tooltip } from "../ui";
import { AdminAccountMenu } from "./AdminAccountMenu";
import { AdminRoleSwitcher } from "./AdminRoleSwitcher";
import { AdminNavGroup, AdminNavLink } from "./AdminNavGroup";
import { useAdminNavBadges } from "./useAdminNavBadges";
import { useAdminNavSections } from "./useAdminNavSections";
import { rememberNavScroll, useAdminNavScroll } from "./useAdminNavScroll";
import { useAdminSidebarNav } from "./useAdminSidebarNav";
import { ADMIN_NAV_OVERVIEW } from "./adminNav.data";
import styles from "./AdminShell.module.css";

export function AdminSidebar({
  isCollapsed = false,
  onToggleCollapse,
  onClose,
  onNavigate,
}: {
  /** Icon-only rail. Desktop only: the mobile drawer is always full width, so
   * AdminShell never passes this while the sidebar is off-canvas. */
  isCollapsed?: boolean;
  /** Absent on mobile, where there is nothing to collapse to. */
  onToggleCollapse?: () => void;
  /** Mobile drawer only: closes the drawer from a visible control inside it,
   * where the collapse control sits on desktop. */
  onClose?: () => void;
  /** Called when a navigation link is activated. The mobile off-canvas drawer
   * passes its close handler so tapping a link dismisses the drawer. Absent on
   * desktop, where the sidebar is a static rail and nothing needs closing. */
  onNavigate?: () => void;
} = {}) {
  const { t } = useTranslation();
  // Page search lives in the top bar's Cmd/Ctrl+K palette; the rail lists.
  const { sections, isFullConsole } = useAdminSidebarNav();

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
          // One tooltip placement in both widths, so the control is not
          // remounted by its own click and keeps focus as the rail folds.
          <IconButton
            tone="dark"
            className={styles.collapseBtn}
            onClick={onToggleCollapse}
            aria-label={collapseLabel}
            tooltip
            tooltipPlacement="right"
          >
            {isCollapsed ? (
              <FiChevronsRight aria-hidden />
            ) : (
              <FiChevronsLeft aria-hidden />
            )}
          </IconButton>
        )}
        {onClose && (
          <IconButton
            tone="dark"
            className={styles.collapseBtn}
            onClick={onClose}
            aria-label={t("nav:closeMenu")}
          >
            <FiX aria-hidden />
          </IconButton>
        )}
      </div>

      <AdminRoleSwitcher isCollapsed={isCollapsed} />

      <nav
        className={styles.nav}
        aria-label={t("shared:adminSidebar.navLabel")}
        ref={navRef}
        onScroll={(event) => rememberNavScroll(event.currentTarget.scrollTop)}
      >
        {/* The overview is admin-only on the backend (`admin/overview`), so a
            viewer who is here on a grant alone is not offered a link that
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
      </nav>

      {/* One row: the account menu takes the width, and Back to platform
          sits beside it as an icon named by its label and a tooltip. The icon
          rail stacks the two. */}
      <div className={styles.railFoot}>
        <AdminAccountMenu isCollapsed={isCollapsed} onNavigate={onNavigate} />
        <Tooltip label={backLabel} placement="right">
          <Link
            to={routes.feed}
            className={styles.backToPlatform}
            aria-label={backLabel}
            onClick={onNavigate}
          >
            <FiArrowLeft aria-hidden />
          </Link>
        </Tooltip>
      </div>
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
