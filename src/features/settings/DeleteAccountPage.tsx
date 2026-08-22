import { Link } from "react-router-dom";
import { FiLock, FiTrash2, FiUser } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { DeleteAccountSection } from "./DeleteAccountSection";
import styles from "./DeleteAccountPage.module.css";

export function DeleteAccountPage() {
  const { t } = useTranslation();
  return (
    <AppShell>
      <div className={styles.settingsPage}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <div className={styles.sidebarHead}>
              {t("settings:deleteAccount.sidebar.account")}
            </div>
            {/* Every row here is either a real destination or the current page.
                Two of them used to be <button>s with no onClick, so the most
                sensitive page in Settings had dead ends in its own nav. */}
            <Link to={routes.editProfile} className={styles.navItem}>
              <FiUser className={styles.navIcon} aria-hidden />
              {t("settings:deleteAccount.sidebar.editProfile")}
            </Link>
            <Link
              to={`${routes.settings}?pane=data`}
              className={styles.navItem}
            >
              <FiLock className={styles.navIcon} aria-hidden />
              {t("settings:deleteAccount.sidebar.privacy")}
            </Link>
            <div className={styles.sidebarHead}>
              {t("settings:deleteAccount.sidebar.dangerZone")}
            </div>
            <span
              className={`${styles.navItem} ${styles.navItemActive}`}
              aria-current="page"
            >
              <FiTrash2 className={styles.navIcon} aria-hidden />
              {t("settings:deleteAccount.sidebar.deactivateAccount")}
            </span>
          </div>
        </aside>

        <div className={styles.main}>
          <DeleteAccountSection />
        </div>
      </div>
    </AppShell>
  );
}
