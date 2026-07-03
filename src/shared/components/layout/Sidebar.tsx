import { Link } from "react-router-dom";
import { NAV_MENUS, filterMenus } from "./navMenus";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarFooter } from "./SidebarFooter";
import { useIsLinkVisible } from "../../../app/authGate";
import { useNavMode } from "../../../app/providers/navModeContext";
import { useAuth } from "../../../app/providers/authContext";
import { useUnreadCount } from "../../../features/notifications/api/useUnreadCount";
import styles from "./Sidebar.module.css";

/**
 * The left-rail alternative to the top MegaNav, rendered from the same
 * `filterMenus(NAV_MENUS, …)` source so the two nav modes never drift. Fixed,
 * full-height, collapsible to an icon rail. Desktop only — Navbar keeps its
 * drawer on mobile. Switch modes from the account menu ("Navigation").
 */
export function Sidebar({ unreadCount }: { unreadCount?: number }) {
  const isVisible = useIsLinkVisible();
  const menus = filterMenus(NAV_MENUS, isVisible);
  const { railCollapsed, toggleRail } = useNavMode();
  const { loggedIn } = useAuth();
  // Same self-sourcing badge as the top-bar bell: an explicit prop wins, else
  // derive from the shared notifications query cache (demo mock / live feed).
  const liveCount = useUnreadCount();
  const count = unreadCount ?? liveCount;

  return (
    <aside
      className={[styles.rail, railCollapsed && styles.railCollapsed]
        .filter(Boolean)
        .join(" ")}
      aria-label="Primary"
    >
      <Link to={loggedIn ? "/feed" : "/"} className={styles.brand}>
        <span className={styles.brandDot} aria-hidden />
        {!railCollapsed && (
          <span className={styles.brandName}>
            Queer<em>Pulse</em>
          </span>
        )}
      </Link>

      <nav className={styles.groups} aria-label="Sections">
        {menus.map((menu) => (
          <SidebarGroup key={menu.key} menu={menu} collapsed={railCollapsed} />
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
