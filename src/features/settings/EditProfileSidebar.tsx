import { Fragment } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PROFILE_NAV } from "./editProfileNav.data";
import { useProfileScrollSpy } from "./useProfileScrollSpy";
import styles from "./EditProfilePage.module.css";

export function EditProfileSidebar() {
  const { t } = useTranslation();
  const { active, goTo } = useProfileScrollSpy();

  return (
    <aside className={styles.nav}>
      <div className={styles.navInner}>
        {PROFILE_NAV.map((item, i) => {
          const firstInGroup =
            i === 0 || PROFILE_NAV[i - 1]!.groupKey !== item.groupKey;
          return (
            <Fragment key={item.id}>
              {firstInGroup && (
                <div className={styles.navSection}>{t(item.groupKey)}</div>
              )}
              <button
                type="button"
                className={[
                  styles.navItem,
                  active === item.id && styles.navItemActive,
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-current={active === item.id ? "true" : undefined}
                onClick={() => goTo(item.id)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {t(item.labelKey)}
              </button>
            </Fragment>
          );
        })}
        <div className={styles.navSection}>
          {t("settings:editProfile.nav.more")}
        </div>
        <Link to={routes.pronounsGuide} className={styles.navItem}>
          <svg className={styles.navIcon} viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="6.5" />
            <path d="M8 5v0M8 8v4" />
          </svg>
          {t("settings:editProfile.nav.pronounsGuideLink")}
        </Link>
      </div>
    </aside>
  );
}
