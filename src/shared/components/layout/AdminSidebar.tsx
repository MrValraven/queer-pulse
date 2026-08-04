import { useLayoutEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiSettings, FiArrowLeft } from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import { useToast } from "../feedback/useToast";
import { useTranslation } from "../../i18n/useTranslation";
import { Translation } from "../../i18n/Translation";
import { AdminRoleSwitcher } from "./AdminRoleSwitcher";
import { ADMIN_NAV, ADMIN_PROFILE, type AdminNavBadge } from "./adminNav.data";
import { useModReports } from "../../../features/admin/api/useModReports";
import { useJoinRequests } from "../../../features/admin/api/useJoinRequests";
import { usePartnerApplications } from "../../../features/marketing/api/usePartnerApplications";
import styles from "./AdminShell.module.css";

/** Because every admin page renders its own <AdminShell>, switching admin routes
 * unmounts and remounts this sidebar — which would reset the nav's internal
 * scroll to the top on every navigation. We stash the last scroll offset in a
 * module-level variable (survives the remount) and restore it before paint so
 * the sidebar stays exactly where the user left it. */
let lastNavScrollTop = 0;

export function AdminSidebar({
  onNavigate,
}: {
  /** Called when a navigation link is activated — the mobile off-canvas drawer
   * passes its close handler so tapping a link dismisses the drawer. Absent on
   * desktop, where the sidebar is a static rail and nothing needs closing. */
  onNavigate?: () => void;
} = {}) {
  const { showToast } = useToast();
  const { t } = useTranslation();

  // Restore the nav's scroll offset synchronously on mount so navigating
  // between admin pages doesn't jump the sidebar back to the top.
  const navRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (nav) nav.scrollTop = lastNavScrollTop;
  }, []);

  // Live pending counts for the nav pills. Each query key matches the one its
  // page uses, so react-query serves these from cache — no extra network.
  const modReports = useModReports();
  const joinRequests = useJoinRequests("pending");
  const partnerApplications = usePartnerApplications();
  const badgeCounts: Record<AdminNavBadge, number> = {
    moderation: modReports.data?.counts.open ?? 0,
    members: joinRequests.data?.length ?? 0,
    partnerships:
      partnerApplications.data?.filter((a) => a.status === "pending").length ??
      0,
  };

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
        ref={navRef}
        onScroll={(event) => {
          lastNavScrollTop = event.currentTarget.scrollTop;
        }}
      >
        <div className={styles.navHead}>
          {t("shared:adminSidebar.oversight")}
        </div>
        {ADMIN_NAV.map(({ labelKey, to, icon: Icon, end, badge, tone }) => {
          const count = badge ? badgeCounts[badge] : 0;
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                [styles.navItem, isActive && styles.navItemActive]
                  .filter(Boolean)
                  .join(" ")
              }
            >
              <Icon aria-hidden />
              <span className={styles.navLabel}>{t(labelKey)}</span>
              {count > 0 && (
                <span
                  className={[
                    styles.navCount,
                    tone === "alert"
                      ? styles.navCountAlert
                      : styles.navCountWarn,
                  ].join(" ")}
                >
                  {count}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <Link
        to={routes.homepage}
        className={styles.backToPlatform}
        onClick={onNavigate}
      >
        <FiArrowLeft aria-hidden />
        <span>{t("shared:adminSidebar.backToPlatform")}</span>
      </Link>

      <button
        type="button"
        className={styles.me}
        onClick={() => showToast(t("shared:adminSidebar.toastProfile"), "info")}
      >
        <span className={styles.meAv}>{ADMIN_PROFILE.initials}</span>
        <span className={styles.meTx}>
          <span className={styles.meName}>{ADMIN_PROFILE.name}</span>
          <span className={styles.meRole}>{ADMIN_PROFILE.role}</span>
        </span>
        <FiSettings className={styles.meGear} aria-hidden />
      </button>
    </aside>
  );
}
