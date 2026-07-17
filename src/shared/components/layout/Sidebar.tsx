import { useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronsUp } from "react-icons/fi";
import { NAV_MENUS, filterMenus } from "./navMenus";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarFooter } from "./SidebarFooter";
import { useIsLinkVisible } from "../../../app/authGate";
import { useNavMode } from "../../../app/providers/navModeContext";
import { useAuth } from "../../../app/providers/authContext";
import { useUnreadCount } from "../../../features/notifications/api/useUnreadCount";
import { useTranslation } from "../../i18n/useTranslation";
import { Translation } from "../../i18n/Translation";
import styles from "./Sidebar.module.css";

/**
 * The left-rail alternative to the top MegaNav, rendered from the same
 * `filterMenus(NAV_MENUS, …)` source so the two nav modes never drift. Fixed,
 * full-height, collapsible to an icon rail. Desktop only — Navbar keeps its
 * drawer on mobile. Switch modes from the account menu ("Navigation").
 */
export function Sidebar({ unreadCount }: { unreadCount?: number }) {
  const { t } = useTranslation();
  const isVisible = useIsLinkVisible();
  const menus = filterMenus(NAV_MENUS, isVisible);
  const { railCollapsed, toggleRail } = useNavMode();
  const { loggedIn } = useAuth();
  // Same self-sourcing badge as the top-bar bell: an explicit prop wins, else
  // derive from the shared notifications query cache (demo mock / live feed).
  const liveCount = useUnreadCount();
  const count = unreadCount ?? liveCount;

  // Which accordion groups are expanded. Lifted here (rather than owned per
  // group) so the "Collapse all" control can close every dropdown at once.
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());
  const toggleGroup = (key: string) =>
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const collapseAll = () => setOpenKeys(new Set());

  return (
    <aside
      className={[styles.rail, railCollapsed && styles.railCollapsed]
        .filter(Boolean)
        .join(" ")}
      aria-label={t("shared:sidebar.ariaPrimary")}
    >
      <Link to={loggedIn ? "/feed" : "/"} className={styles.brand}>
        <span className={styles.brandDot} aria-hidden />
        {!railCollapsed && (
          <span className={styles.brandName}>
            <Translation
              i18nKey="shared:brand.wordmark"
              components={{ em: <em /> }}
            />
          </span>
        )}
      </Link>

      {!railCollapsed && openKeys.size > 0 && (
        <div className={styles.toolbar}>
          <button
            type="button"
            className={styles.collapseAll}
            onClick={collapseAll}
          >
            <FiChevronsUp aria-hidden className={styles.collapseAllIcon} />
            {t("shared:sidebar.collapseAll")}
          </button>
        </div>
      )}

      <nav
        className={styles.groups}
        aria-label={t("shared:sidebar.ariaSections")}
      >
        {menus.map((menu) => (
          <SidebarGroup
            key={menu.key}
            menu={menu}
            collapsed={railCollapsed}
            open={openKeys.has(menu.key)}
            onToggle={() => toggleGroup(menu.key)}
          />
        ))}
      </nav>

      <SidebarFooter
        collapsed={railCollapsed}
        unreadCount={count}
        onToggleRail={toggleRail}
      />
    </aside>
  );
}
