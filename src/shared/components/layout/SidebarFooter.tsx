import { Link } from "react-router-dom";
import {
  FiSearch,
  FiSun,
  FiMoon,
  FiBell,
  FiUser,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";
import { AccountMenu } from "./AccountMenu";
import { Button } from "../ui";
import { useAuth } from "../../../app/providers/authContext";
import { useTheme } from "../../../app/providers/themeContext";
import { routes } from "../../../app/routeMap";
import styles from "./Sidebar.module.css";

/**
 * Pinned bottom of the left rail: utility buttons (search, theme, notifications),
 * the account menu (opening upward via placement="rail"), and the collapse/expand
 * toggle. When collapsed the account chip is replaced by an avatar-only profile
 * link, since AccountMenu's chip is too wide for the icon rail.
 */
export function SidebarFooter({
  collapsed,
  unreadCount,
  onToggleRail,
}: {
  collapsed: boolean;
  unreadCount: number;
  onToggleRail: () => void;
}) {
  const { loggedIn } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.footer}>
      <div className={styles.utils}>
        <button
          type="button"
          className={styles.utilBtn}
          aria-label="Search"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("qp:open-search"))
          }
        >
          <FiSearch aria-hidden />
        </button>
        <button
          type="button"
          className={styles.utilBtn}
          aria-label="Toggle colour theme"
          onClick={toggleTheme}
        >
          {theme === "dark" ? <FiSun aria-hidden /> : <FiMoon aria-hidden />}
        </button>
        {loggedIn && (
          <Link
            to={routes.notifications}
            className={styles.utilBtn}
            aria-label="Notifications"
          >
            <FiBell aria-hidden />
            {unreadCount > 0 && (
              <span className={styles.bellBadge}>{unreadCount}</span>
            )}
          </Link>
        )}
      </div>

      {loggedIn ? (
        collapsed ? (
          <Link
            to={routes.accountProfile}
            className={styles.utilBtn}
            aria-label="Profile"
          >
            <FiUser aria-hidden />
          </Link>
        ) : (
          <div className={styles.account}>
            <AccountMenu placement="rail" />
          </div>
        )
      ) : collapsed ? (
        <Link
          to={routes.signIn}
          className={styles.utilBtn}
          aria-label="Sign in"
        >
          <FiUser aria-hidden />
        </Link>
      ) : (
        <div className={styles.signedOut}>
          <Link to={routes.signIn} className={styles.signIn}>
            Sign in
          </Link>
          <Button to={routes.requestInvite}>Request an invite</Button>
        </div>
      )}

      <button
        type="button"
        className={styles.collapseBtn}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={onToggleRail}
      >
        {collapsed ? (
          <FiChevronsRight aria-hidden />
        ) : (
          <>
            <FiChevronsLeft aria-hidden />
            <span>Collapse</span>
          </>
        )}
      </button>
    </div>
  );
}
