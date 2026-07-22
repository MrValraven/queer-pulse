import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui";
import { useScrolled } from "../../hooks/useScrolled";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useTheme } from "../../../app/providers/themeContext";
import { useAuth } from "../../../app/providers/authContext";
import { useNavMode } from "../../../app/providers/navModeContext";
import { useDisplayMode } from "../../../app/providers/displayModeContext";
import { routes } from "../../../app/routeMap";
import { useUnreadCount } from "../../../features/notifications/api/useUnreadCount";
import { useUnreadMessages } from "../../../features/messages/api/useConversations";
import { useTranslation } from "../../i18n/useTranslation";
import { Translation } from "../../i18n/Translation";
import { MegaNav } from "./MegaNav";
import { Sidebar } from "./Sidebar";
import { AccountMenu } from "./AccountMenu";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { NAV_DRAWER_TRIGGER_ATTRIBUTE } from "./useNavDrawerFocus";
import { useNavDrawer } from "../../../app/providers/navDrawerContext";
import styles from "./Navbar.module.css";

function Brand({ to }: { to: string }) {
  return (
    <Link to={to} className={styles.brand}>
      <span className={styles.pulseDot} aria-hidden />
      <Translation
        i18nKey="shared:brand.wordmark"
        components={{ em: <span className={styles.brandItalic} /> }}
      />
    </Link>
  );
}

function NotificationsBell({ unreadCount }: { unreadCount?: number }) {
  // The bell lives site-wide, so it sources the badge itself from the shared
  // notifications query cache (demo → mock count, live → fetched feed) rather
  // than depending on each page to thread a count down. An explicit prop still
  // wins when a page passes one (e.g. the Notifications page's own live count).
  const liveCount = useUnreadCount();
  const { t } = useTranslation();
  const count = unreadCount ?? liveCount;
  return (
    <Link
      to={routes.notifications}
      className={styles.bell}
      aria-label={t("nav:notifications")}
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
      {count > 0 && <span className={styles.bellBadge}>{count}</span>}
    </Link>
  );
}

function MessagesLink() {
  // Sibling to the bell: sources its own unread badge from the shared
  // conversations query cache (demo → mock unread, live → fetched inbox), so no
  // page has to thread a count down. Mirrors NotificationsBell exactly.
  const count = useUnreadMessages();
  const { t } = useTranslation();
  return (
    <Link
      to={routes.messages}
      className={styles.bell}
      aria-label={t("nav:messages")}
    >
      <MessageIcon />
      {count > 0 && <span className={styles.bellBadge}>{count}</span>}
    </Link>
  );
}

/**
 * The single site-wide nav. Reflects the global auth state: signed-in members
 * see the notifications bell + profile menu; signed-out visitors see the
 * marketing sign-in / request-an-invite calls to action.
 */
export function Navbar({ unreadCount }: { unreadCount?: number } = {}) {
  const scrolled = useScrolled(8);
  const isMobile = useMediaQuery("(max-width: 860px)");
  const { theme, toggleTheme } = useTheme();
  const { loggedIn } = useAuth();
  const { navMode } = useNavMode();
  const { t } = useTranslation();
  const { drawerOpen, openDrawer, closeDrawer } = useNavDrawer();
  const { isInstalled } = useDisplayMode();

  // The drawer only renders below the mobile breakpoint (see the gate at the
  // bottom of this component), but the open state lives in a provider that
  // outlives it. Without this, resizing past 860px with the drawer open unmounts
  // it while `drawerOpen` stays true — so resizing back down reopens a drawer
  // the user never asked for, and leaves the scroll lock and the pushed history
  // entry live in between. Close it as the gate closes.
  useEffect(() => {
    if (!isMobile && drawerOpen) closeDrawer();
  }, [isMobile, drawerOpen, closeDrawer]);
  // Installed on mobile: the tab bar owns navigation, so the top bar drops to a
  // slim title strip. The hamburger goes with it — the "More" tab opens the
  // drawer now — but search and the notifications bell have no other home, so
  // they stay.
  const isAppBar = isInstalled && isMobile;

  // Desktop sidebar mode: swap the whole top bar for the left rail. Mobile always
  // keeps the top bar + drawer below, regardless of nav mode.
  if (navMode === "sidebar" && !isMobile) {
    return <Sidebar unreadCount={unreadCount} />;
  }

  return (
    <>
      <nav
        className={[
          styles.nav,
          scrolled && styles.scrolled,
          isAppBar && styles.appBar,
        ]
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
            aria-label={t("nav:toggleTheme")}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>

          {(!isMobile || isAppBar) && (
            // Opens the global ⌘K command palette (see CommandPalette / OPEN_SEARCH_EVENT).
            <button
              type="button"
              className={styles.bell}
              aria-label={t("nav:search")}
              onClick={() =>
                window.dispatchEvent(new CustomEvent("qp:open-search"))
              }
            >
              <SearchIcon />
            </button>
          )}

          {isAppBar &&
            (loggedIn ? (
              <NotificationsBell unreadCount={unreadCount} />
            ) : (
              <Link to={routes.signIn} className={styles.signIn}>
                {t("nav:signIn")}
              </Link>
            ))}

          {!isMobile &&
            (loggedIn ? (
              <>
                <MessagesLink />
                <NotificationsBell unreadCount={unreadCount} />
                <AccountMenu />
              </>
            ) : (
              <>
                <Link to={routes.signIn} className={styles.signIn}>
                  {t("nav:signIn")}
                </Link>
                <Button to={routes.requestInvite}>
                  {t("nav:requestInvite")}
                </Button>
              </>
            ))}

          {isMobile && !isAppBar && (
            <button
              type="button"
              className={styles.menuButton}
              onClick={openDrawer}
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
              aria-label={t("nav:openMenu")}
              {...{ [NAV_DRAWER_TRIGGER_ATTRIBUTE]: "" }}
            >
              <MenuIcon />
            </button>
          )}
        </div>
      </nav>

      {isMobile && <MobileNavDrawer />}
    </>
  );
}

function MessageIcon() {
  // Speech bubble matching the account menu's former Messages glyph
  // (react-icons FiMessageSquare), redrawn inline to sit with the bell/search
  // icons that Navbar keeps as hand-authored SVGs.
  return (
    <svg width={19} height={19} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
