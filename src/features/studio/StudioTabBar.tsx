import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_TABS } from "./studioTabBar.data";
import { useStudioTabsSignal } from "./useStudioTabsSignal";
import styles from "./StudioTabBar.module.css";

/**
 * Studio's phone navigation: a fixed bottom tab bar at <=880px, where the
 * left rail hides. Its height reaches `--bottom-inset` through
 * useStudioTabsSignal, so the player bar and the other bottom-anchored UI sit
 * above it. The spacer keeps the end of the page clear of the bar.
 *
 * The bar portals to <body>: RouteTransition and SwipeBackShell transform the
 * routed page, and a transformed ancestor re-anchors `position: fixed` to
 * itself, so the bar would ride the page slide off screen. The spacer stays
 * in flow where it is.
 */
export function StudioTabBar() {
  const { t } = useTranslation();
  useStudioTabsSignal();

  return (
    <>
      <div className={styles.spacer} aria-hidden />
      {createPortal(
        <nav aria-label={t("studio:shell.tabs.label")} className={styles.bar}>
          {STUDIO_TABS.map((tab) => (
            <NavLink
              key={tab.key}
              to={tab.to}
              end={tab.end}
              className={styles.tab}
            >
              {({ isActive }) => {
                const TabIcon = isActive ? tab.activeIcon : tab.icon;
                return (
                  <>
                    <TabIcon className={styles.icon} aria-hidden />
                    <span className={styles.label}>{t(tab.labelKey)}</span>
                  </>
                );
              }}
            </NavLink>
          ))}
        </nav>,
        document.body,
      )}
    </>
  );
}
