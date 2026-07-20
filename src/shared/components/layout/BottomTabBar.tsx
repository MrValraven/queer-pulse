import { Link, useLocation } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import { useAuth } from "../../../app/providers/authContext";
import { useDisplayMode } from "../../../app/providers/displayModeContext";
import { useNavDrawer } from "../../../app/providers/navDrawerContext";
import { useIsLinkVisible } from "../../../app/authGate";
import { linkToPath } from "../../../app/routeMap";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useTranslation } from "../../i18n/useTranslation";
import { MEMBER_TABS, PUBLIC_TABS, activeTabKey } from "./bottomTabs";
import { NAV_DRAWER_TRIGGER_ATTRIBUTE } from "./useNavDrawerFocus";
import styles from "./BottomTabBar.module.css";

/**
 * The installed-app bottom navigation. Rendered only when QueerPulse is running
 * as an installed PWA under the mobile breakpoint — in a browser tab the
 * Navbar's hamburger stays in charge, because a bottom bar stacked above the
 * browser's own toolbar reads as cramped and unowned.
 *
 * These are navigation links, not tabs, so the markup is <nav> + <a> +
 * aria-current — NOT role="tablist", which would promise arrow-key cycling and
 * panel association that don't exist here.
 */
export function BottomTabBar() {
  const { isInstalled } = useDisplayMode();
  const isMobile = useMediaQuery("(max-width: 860px)");
  const { loggedIn } = useAuth();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { drawerOpen, openDrawer, closeDrawer } = useNavDrawer();
  const isLinkVisible = useIsLinkVisible();

  if (!isInstalled || !isMobile) return null;

  // Belt and braces: the sets are curated per auth state, and then filtered
  // through the shared gate so a member-only destination can never leak into
  // the signed-out bar if the curated list drifts from authGate's denylist.
  const tabs = (loggedIn ? MEMBER_TABS : PUBLIC_TABS).filter((tab) =>
    isLinkVisible(tab.href),
  );
  // While the drawer is open, "More" owns the highlight — nothing underneath it
  // should read as the current destination.
  const currentKey = drawerOpen ? null : activeTabKey(pathname, tabs);

  return (
    <nav className={styles.bar} aria-label={t("nav:primary")}>
      {tabs.map((tab) => {
        const TabIcon = tab.icon;
        const isActive = tab.key === currentKey;
        return (
          <Link
            key={tab.key}
            to={linkToPath(tab.href)}
            className={[styles.tab, isActive && styles.tabActive]
              .filter(Boolean)
              .join(" ")}
            aria-current={isActive ? "page" : undefined}
          >
            <TabIcon className={styles.icon} aria-hidden />
            <span className={styles.label}>{t(tab.labelKey)}</span>
          </Link>
        );
      })}

      <button
        type="button"
        className={[styles.tab, drawerOpen && styles.tabActive]
          .filter(Boolean)
          .join(" ")}
        onClick={drawerOpen ? closeDrawer : openDrawer}
        aria-haspopup="dialog"
        aria-expanded={drawerOpen}
        {...{ [NAV_DRAWER_TRIGGER_ATTRIBUTE]: "" }}
      >
        <FiMenu className={styles.icon} aria-hidden />
        <span className={styles.label}>{t("nav:more")}</span>
      </button>
    </nav>
  );
}
