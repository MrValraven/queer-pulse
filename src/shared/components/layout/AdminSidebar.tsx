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

export function AdminSidebar() {
  const { showToast } = useToast();
  const { t } = useTranslation();

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
      <Link to={routes.admin} className={styles.brand}>
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

      <nav className={styles.nav}>
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

      <Link to={routes.homepage} className={styles.backToPlatform}>
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
