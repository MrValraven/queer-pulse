import { Link, useLocation } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import { useAuth } from "../../../app/providers/authContext";
import { useNavDrawer } from "../../../app/providers/navDrawerContext";
import { useIsLinkVisible } from "../../../app/authGate";
import { linkToPath } from "../../../app/routeMap";
import { scrollBus } from "../../../app/scrollBus";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useTranslation } from "../../i18n/useTranslation";
import { Avatar } from "../ui";
import { MEMBER_TABS, PUBLIC_TABS, activeTabKey } from "./bottomTabs";
import { useAccountIdentity } from "./useAccountIdentity";
import { NAV_DRAWER_TRIGGER_ATTRIBUTE } from "./useNavDrawerFocus";
import styles from "./BottomTabBar.module.css";

/**
 * The primary mobile bottom navigation. Rendered under the mobile breakpoint
 * in a browser tab and an installed PWA alike — the Navbar's hamburger is a
 * secondary "More" entry point, not the default way to move around on a
 * phone.
 *
 * These are navigation links, not tabs, so the markup is <nav> + <a> +
 * aria-current — NOT role="tablist", which would promise arrow-key cycling and
 * panel association that don't exist here.
 */
export function BottomTabBar() {
  const isMobile = useMediaQuery("(max-width: 860px)");
  const { loggedIn } = useAuth();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { activeSheet, openSheet, closeSheet } = useNavDrawer();
  const isLinkVisible = useIsLinkVisible();
  const { initials, photo } = useAccountIdentity();

  if (!isMobile) return null;

  // Belt and braces: the sets are curated per auth state, and then filtered
  // through the shared gate so a member-only destination can never leak into
  // the signed-out bar if the curated list drifts from authGate's denylist.
  const tabs = (loggedIn ? MEMBER_TABS : PUBLIC_TABS).filter((tab) =>
    isLinkVisible(tab.href),
  );
  // While the drawer is open, "More" owns the highlight — nothing underneath it
  // should read as the current destination.
  const currentKey = activeSheet ? null : activeTabKey(pathname, tabs);

  return (
    <nav className={styles.bar} aria-label={t("nav:primary")}>
      {tabs.map((tab) => {
        const TabIcon = tab.icon;
        const isActive = tab.key === currentKey;
        return (
          <Link
            key={tab.key}
            to={linkToPath(tab.href)}
            onClick={(event) => {
              if (isActive) {
                event.preventDefault();
                scrollBus.requestScrollToTop();
              }
            }}
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
        className={[styles.tab, activeSheet === "browse" && styles.tabActive]
          .filter(Boolean)
          .join(" ")}
        onClick={activeSheet === "browse" ? closeSheet : () => openSheet("browse")}
        aria-haspopup="dialog"
        aria-expanded={activeSheet === "browse"}
        {...{ [NAV_DRAWER_TRIGGER_ATTRIBUTE]: "" }}
      >
        <FiMenu className={styles.icon} aria-hidden />
        <span className={styles.label}>{t("nav:more")}</span>
      </button>

      {loggedIn && (
        <button
          type="button"
          className={[styles.tab, activeSheet === "account" && styles.tabActive]
            .filter(Boolean)
            .join(" ")}
          onClick={
            activeSheet === "account" ? closeSheet : () => openSheet("account")
          }
          aria-haspopup="dialog"
          aria-expanded={activeSheet === "account"}
          aria-label={t("nav:account")}
          {...{ [NAV_DRAWER_TRIGGER_ATTRIBUTE]: "" }}
        >
          <Avatar
            initials={initials}
            src={photo ?? undefined}
            alt=""
            tint="coral"
            size={24}
            className={styles.tabAvatar}
          />
          <span className={styles.label}>{t("nav:you")}</span>
        </button>
      )}
    </nav>
  );
}
