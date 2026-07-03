import { Link, NavLink } from "react-router-dom";
import { Button } from "../ui";
import { useScrolled } from "../../hooks/useScrolled";
import { useTheme } from "../../../app/providers/themeContext";
import { useUnreadCount } from "../../../features/notifications/api/useUnreadCount";
import { AccountMenu } from "./AccountMenu";
import styles from "./AppNav.module.css";

const APP_LINKS = [
  { label: "Home", to: "/feed" },
  { label: "Members", to: "/members" },
  { label: "Communities", to: "/communities" },
  { label: "Messages", to: "/messages" },
];

/** Logged-in navigation: brand, app links, notifications bell, profile + messages. */
export function AppNav({ unreadCount }: { unreadCount?: number }) {
  const scrolled = useScrolled(8);
  const { theme, toggleTheme } = useTheme();
  // Self-sourcing badge: explicit prop wins, else derive from the shared
  // notifications query cache (demo mock count / live fetched feed).
  const liveCount = useUnreadCount();
  const count = unreadCount ?? liveCount;

  return (
    <nav
      className={[styles.nav, scrolled && styles.scrolled]
        .filter(Boolean)
        .join(" ")}
    >
      <Link to="/feed" className={styles.brand}>
        <span className={styles.pulseDot} aria-hidden />
        Queer<span className={styles.brandItalic}>Pulse</span>
      </Link>

      <div className={styles.links}>
        {APP_LINKS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [styles.link, isActive && styles.linkActive]
                .filter(Boolean)
                .join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className={styles.right}>
        <button
          type="button"
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label="Toggle colour theme"
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>

        <Link
          to="/notifications"
          className={styles.bell}
          aria-label="Notifications"
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden
          >
            <path
              d="M10 2a6 6 0 0 1 6 6v3l1.5 2.5H2.5L4 11V8a6 6 0 0 1 6-6ZM8 16.5a2 2 0 0 0 4 0"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {count > 0 && <span className={styles.bellBadge}>{count}</span>}
        </Link>

        <AccountMenu />
        <Button to="/messages">Messages</Button>
      </div>
    </nav>
  );
}

function MoonIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx={12} cy={12} r={4} stroke="currentColor" strokeWidth={2} />
      <path
        d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}
