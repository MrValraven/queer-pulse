import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui";
import { useScrolled } from "../../hooks/useScrolled";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useTheme } from "../../../app/providers/themeContext";
import { useAuth } from "../../../app/providers/authContext";
import { useNavMode } from "../../../app/providers/navModeContext";
import { routes } from "../../../app/routeMap";
import { MegaNav } from "./MegaNav";
import { MegaNavDrawer } from "./MegaNavDrawer";
import { Sidebar } from "./Sidebar";
import { AccountMenu, ACCOUNT_ITEMS } from "./AccountMenu";
import styles from "./Navbar.module.css";

function Brand({ to }: { to: string }) {
  return (
    <Link to={to} className={styles.brand}>
      <span className={styles.pulseDot} aria-hidden />
      Queer<span className={styles.brandItalic}>Pulse</span>
    </Link>
  );
}

function NotificationsBell({ unreadCount }: { unreadCount: number }) {
  return (
    <Link
      to={routes.notifications}
      className={styles.bell}
      aria-label="Notifications"
    >
      <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
          d="M10 2a6 6 0 0 1 6 6v3l1.5 2.5H2.5L4 11V8a6 6 0 0 1 6-6ZM8 16.5a2 2 0 0 0 4 0"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {unreadCount > 0 && (
        <span className={styles.bellBadge}>{unreadCount}</span>
      )}
    </Link>
  );
}

/**
 * The single site-wide nav. Reflects the global auth state: signed-in members
 * see the notifications bell + profile menu; signed-out visitors see the
 * marketing sign-in / request-an-invite calls to action.
 */
export function Navbar({ unreadCount = 0 }: { unreadCount?: number } = {}) {
  const scrolled = useScrolled(8);
  const isMobile = useMediaQuery("(max-width: 860px)");
  const { theme, toggleTheme } = useTheme();
  const { loggedIn, signOut } = useAuth();
  const { navMode } = useNavMode();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerPanelRef = useRef<HTMLDivElement>(null);

  const closeDrawer = () => setDrawerOpen(false);

  // Manage focus + keyboard for the mobile drawer (dialog) while it is open.
  useEffect(() => {
    if (!drawerOpen) return;

    const trigger = menuButtonRef.current;
    const panel = drawerPanelRef.current;
    // Move focus into the drawer on open.
    panel?.focus();

    const getFocusable = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setDrawerOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        panel?.focus();
        return;
      }
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // Restore focus to the trigger when the drawer closes.
      trigger?.focus();
    };
  }, [drawerOpen]);

  // Desktop sidebar mode: swap the whole top bar for the left rail. Mobile always
  // keeps the top bar + drawer below, regardless of nav mode.
  if (navMode === "sidebar" && !isMobile) {
    return <Sidebar unreadCount={unreadCount} />;
  }

  return (
    <>
      <nav
        className={[styles.nav, scrolled && styles.scrolled]
          .filter(Boolean)
          .join(" ")}
      >
        <Brand to={loggedIn ? "/feed" : "/"} />

        <div className={styles.links}>
          <MegaNav />
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

          {!isMobile && (
            // Opens the global ⌘K command palette (see CommandPalette / OPEN_SEARCH_EVENT).
            <button
              type="button"
              className={styles.bell}
              aria-label="Search (⌘K)"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("qp:open-search"))
              }
            >
              <SearchIcon />
            </button>
          )}

          {!isMobile &&
            (loggedIn ? (
              <>
                <NotificationsBell unreadCount={unreadCount} />
                <AccountMenu />
              </>
            ) : (
              <>
                <Link to={routes.signIn} className={styles.signIn}>
                  Sign in
                </Link>
                <Button to={routes.requestInvite}>Request an invite</Button>
              </>
            ))}

          {isMobile && (
            <button
              ref={menuButtonRef}
              type="button"
              className={styles.menuButton}
              onClick={() => setDrawerOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
              aria-label="Open menu"
            >
              <MenuIcon />
            </button>
          )}
        </div>
      </nav>

      {isMobile && drawerOpen && (
        <div
          className={styles.drawer}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          onClick={closeDrawer}
        >
          <div
            ref={drawerPanelRef}
            className={styles.drawerPanel}
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
          >
            <MegaNavDrawer onNavigate={closeDrawer} />
            <Link
              to={routes.search}
              className={styles.drawerSignIn}
              onClick={closeDrawer}
            >
              Search
            </Link>
            {loggedIn ? (
              <>
                {ACCOUNT_ITEMS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={styles.drawerSignIn}
                    onClick={closeDrawer}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to={routes.homepage}
                  className={styles.drawerSignIn}
                  onClick={() => {
                    signOut();
                    closeDrawer();
                  }}
                >
                  Sign out
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={routes.signIn}
                  className={styles.drawerSignIn}
                  onClick={closeDrawer}
                >
                  Sign in
                </Link>
                <Button
                  to={routes.requestInvite}
                  className={styles.drawerCta}
                  onClick={closeDrawer}
                >
                  Request an invite
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function SearchIcon() {
  return (
    <svg width={19} height={19} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx={11} cy={11} r={7} stroke="currentColor" strokeWidth={2} />
      <path
        d="m20 20-3.5-3.5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
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

function MenuIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <line
        x1={3}
        y1={6}
        x2={21}
        y2={6}
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <line
        x1={3}
        y1={12}
        x2={21}
        y2={12}
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <line
        x1={3}
        y1={18}
        x2={21}
        y2={18}
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </svg>
  );
}
