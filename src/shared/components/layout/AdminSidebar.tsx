import { Link, NavLink } from "react-router-dom";
import { FiSettings, FiArrowLeft } from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import { useToast } from "../feedback/useToast";
import { useTranslation } from "../../i18n/useTranslation";
import { Translation } from "../../i18n/Translation";
import { AdminRoleSwitcher } from "./AdminRoleSwitcher";
import { ADMIN_NAV, ADMIN_PROFILE } from "./adminNav.data";
import styles from "./AdminShell.module.css";

export function AdminSidebar() {
  const { showToast } = useToast();
  const { t } = useTranslation();

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
        {ADMIN_NAV.map(({ labelKey, to, icon: Icon, end, count, tone }) => (
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
            {count != null && (
              <span
                className={[
                  styles.navCount,
                  tone === "alert" ? styles.navCountAlert : styles.navCountWarn,
                ].join(" ")}
              >
                {count}
              </span>
            )}
          </NavLink>
        ))}
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
