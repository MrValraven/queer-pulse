import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useMyStaffRoles } from "../../../features/auth/api/useMyStaffRoles";
import { useTranslation } from "../../i18n/useTranslation";
import { Translation } from "../../i18n/Translation";
import { AdminAccountMenu } from "./AdminAccountMenu";
import { AdminRoleSwitcher } from "./AdminRoleSwitcher";
import { AdminNavGroup, AdminNavLink } from "./AdminNavGroup";
import { useAdminNavBadges } from "./useAdminNavBadges";
import { useAdminNavSections } from "./useAdminNavSections";
import { rememberNavScroll, useAdminNavScroll } from "./useAdminNavScroll";
import { ADMIN_NAV_OVERVIEW, visibleAdminNavSections } from "./adminNav.data";
import styles from "./AdminShell.module.css";

export function AdminSidebar({
  onNavigate,
}: {
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
  const sections = useMemo(
    () => visibleAdminNavSections({ isFullConsole, staffRoles }),
    [isFullConsole, staffRoles],
  );

  const navRef = useRef<HTMLElement>(null);
  const badgeCounts = useAdminNavBadges();
  const { isSectionOpen, toggleSection, isActiveSectionOpen, pathname } =
    useAdminNavSections();
  useAdminNavScroll(navRef, { pathname, isActiveSectionOpen });

  return (
    <aside className={styles.sidebar}>
      <Link to={routes.admin} className={styles.brand} onClick={onNavigate}>
        <span className={styles.brandDot} aria-hidden />
        <span className={styles.brandName}>
          <Translation
            i18nKey="shared:brand.wordmark"
            components={{ em: <em /> }}
          />
        </span>
        <span className={styles.brandBadge}>
          {t("shared:adminSidebar.badge")}
        </span>
      </Link>

      <AdminRoleSwitcher />

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
            onNavigate={onNavigate}
          />
        )}

        {sections.map((section) => (
          <AdminNavGroup
            key={section.id}
            section={section}
            badgeCounts={badgeCounts}
            isOpen={isSectionOpen(section.id, section.defaultOpen)}
            onToggle={() => toggleSection(section.id, section.defaultOpen)}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <Link
        to={routes.homepage}
        className={styles.backToPlatform}
        onClick={onNavigate}
      >
        <FiArrowLeft aria-hidden />
        <span>{t("shared:adminSidebar.backToPlatform")}</span>
      </Link>

      <AdminAccountMenu onNavigate={onNavigate} />
    </aside>
  );
}
