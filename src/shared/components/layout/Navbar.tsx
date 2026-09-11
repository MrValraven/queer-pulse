import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui";
import { canGoBack, currentHistoryIdx } from "./canGoBack";
import { tabOf } from "./tabRoots";
import { useScrolled } from "../../hooks/useScrolled";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { mediaMax } from "../../theme/breakpoints";
import { useTheme } from "../../../app/providers/themeContext";
import { useAuth } from "../../../app/providers/authContext";
import { useNavMode } from "../../../app/providers/navModeContext";
import { routes } from "../../../app/routeMap";
import { useUnreadCount } from "../../../features/notifications/api/useUnreadCount";
import { NotificationsBellMenu } from "../../../features/notifications/NotificationsBellMenu";
import { useUnreadMessages } from "../../../features/messages/api/useConversations";
import { useTranslation } from "../../i18n/useTranslation";
import { MegaNav } from "./MegaNav";
import { LandingNav } from "./LandingNav";
import { NavBrand } from "./NavBrand";
import { Sidebar } from "./Sidebar";
import { AccountMenu } from "./AccountMenu";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { AccountSheet } from "./AccountSheet";
import { useNavDrawer } from "../../../app/providers/navDrawerContext";
import { useAppBarScrollAway } from "./useAppBarScrollAway";
import { useIsLandingVisitor } from "./useIsLandingVisitor";
import styles from "./Navbar.module.css";

function BackChevronIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 5l-7 7 7 7"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NotificationsBell({
  unreadCount,
  opensPopover = false,
}: {
  unreadCount?: number;
  opensPopover?: boolean;
}) {
  // The bell lives site-wide, so it sources the badge itself from the shared
  // notifications query cache (demo → mock count, live → fetched feed) rather
  // than depending on each page to thread a count down. An explicit prop still
  // wins when a page passes one (e.g. the Notifications page's own live count).
  const liveCount = useUnreadCount();
  const { t } = useTranslation();
  const count = unreadCount ?? liveCount;
  const bellIcon = (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 2a6 6 0 0 1 6 6v3l1.5 2.5H2.5L4 11V8a6 6 0 0 1 6-6ZM8 16.5a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
  // Desktop opens the recent-notifications popover in place. The mobile app
  // bar keeps the link, because on a phone the full page is the roomier home
  // for the list.
  if (opensPopover) {
    return (
      <NotificationsBellMenu
        unreadCount={count}
        icon={bellIcon}
        triggerClassName={styles.bell}
        badgeClassName={styles.bellBadge}
      />
    );
  }
  return (
    <Link
      to={routes.notifications}
      className={styles.bell}
      aria-label={t("nav:notifications")}
    >
      {bellIcon}
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

/** The mobile sheets the bottom tab bar opens: "More" opens the drawer, "You"
    opens the account sheet. Nothing else mounts them, so they render even on a
    route that hides the app bar. */
function MobileSheets() {
  return (
    <>
      <MobileNavDrawer />
      <AccountSheet />
    </>
  );
}

/**
 * The single site-wide nav. Reflects the global auth state: signed-in members
 * see the notifications bell + profile menu; signed-out visitors see the
 * marketing sign-in / request-an-invite calls to action.
 */
export function Navbar({
  unreadCount,
  isAppBarHidden = false,
}: {
  unreadCount?: number;
  /** The route draws its own header (Messages, AppShell `chromeless`), so a
   *  phone gets no app bar there. Only honoured on mobile: AppChrome does not
   *  mount the Navbar at all for such a route above the breakpoint. */
  isAppBarHidden?: boolean;
} = {}) {
  const scrolled = useScrolled(8);
  const isMobile = useMediaQuery(mediaMax("mobile"));
  const { theme, toggleTheme } = useTheme();
  const { loggedIn } = useAuth();
  const { navMode } = useNavMode();
  const { t } = useTranslation();
  const { activeSheet, closeSheet } = useNavDrawer();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // The drawer only renders below the mobile breakpoint (see the gate at the
  // bottom of this component), but the open state lives in a provider that
  // outlives it. Without this, resizing past 860px with the drawer open unmounts
  // it while `activeSheet` stays non-null — so resizing back down reopens a drawer
  // the user never asked for, and leaves the scroll lock and the pushed history
  // entry live in between. Close it as the gate closes.
  useEffect(() => {
    if (!isMobile && activeSheet) closeSheet();
  }, [isMobile, activeSheet, closeSheet]);
  // On any mobile view (installed or browser tab): the bottom tab bar owns
  // navigation, so the top bar drops to a slim title strip. The hamburger goes
  // with it — the "More" tab opens the drawer now — but search and the
  // notifications bell have no other home, so they stay.
  const isAppBar = isMobile;

  // Contextual back affordance for the mobile app bar. In an installed
  // standalone PWA there's no browser back button, so a detail page's only way
  // back would otherwise be the invisible edge-swipe. Shows only when history
  // can go back AND we're not already on a primary tab root (where "back" would
  // leave the app). Reuses the exact guard the edge-swipe uses (`canGoBack` +
  // the router's history idx), so the two never disagree. `useLocation` above
  // makes this recompute on every navigation despite the persistent mount.
  const atTabRoot = tabOf(pathname) === pathname;
  const showBackButton =
    isAppBar && !atTabRoot && canGoBack(currentHistoryIdx());

  // The landing page gets its own bar for signed-out visitors: anchors into the
  // page's own sections instead of the mega panels, so the pitch keeps the
  // visitor's attention rather than sending them off to browse. A signed-in
  // member on `/` falls through to the ordinary nav, bell and account menu
  // included. The focused bar is a visitor affordance, not a property of the
  // route. It sits above the sidebar branch because the landing page is public and
  // the sidebar is a signed-in-only mode, so the two can never both apply.
  const isLandingNav = useIsLandingVisitor();

  // The app bar steps out of the way while the member reads down a page and
  // returns as soon as they scroll back up. Only the app bar: the desktop pill
  // floats clear of content, and the landing bar and a route drawing its own
  // header leave nothing here to hide.
  const { isAppBarScrolledAway, revealAppBar } = useAppBarScrollAway(
    isAppBar && !isAppBarHidden && !isLandingNav,
  );

  if (isLandingNav) {
    return <LandingNav />;
  }

  // Desktop sidebar mode: swap the whole top bar for the left rail. Mobile always
  // keeps the top bar + drawer below, regardless of nav mode.
  if (navMode === "sidebar" && !isMobile) {
    return <Sidebar unreadCount={unreadCount} />;
  }

  // A route with its own header (Messages) carries its own back chevron, and
  // the bell and messages icons would only point at where the member already
  // is or could reach from the tab bar. Drop the bar, keep the sheets.
  if (isAppBarHidden && isMobile) {
    return <MobileSheets />;
  }

  return (
    <>
      <nav
        className={[
          styles.nav,
          scrolled && styles.scrolled,
          isAppBar && styles.appBar,
          isAppBarScrolledAway && styles.appBarScrolledAway,
        ]
          .filter(Boolean)
          .join(" ")}
        // A keyboard Tab into a bar that scrolled away brings it back, so focus
        // never lands on a control sitting above the viewport.
        onFocus={revealAppBar}
      >
        <div className={styles.navLeft}>
          {showBackButton && (
            <button
              type="button"
              className={styles.backButton}
              onClick={() => {
                void navigate(-1);
              }}
              aria-label={t("nav:back")}
            >
              <BackChevronIcon />
            </button>
          )}
          {/* On the mobile app bar, the back chevron already sits top-left on
              detail pages AND the bottom tab bar owns "home" — so the wordmark
              is redundant there. Keep it only when there's no back button
              (tab roots, and deep-linked detail pages with no history), so the
              top-left is never empty. Desktop always shows it. */}
          {!showBackButton && (
            <NavBrand to={loggedIn ? routes.feed : routes.homepage} />
          )}
        </div>

        <div className={styles.links}>
          <MegaNav />
        </div>

        <div className={styles.right}>
          {/* Signed-out only. Once you're in, the theme switch moves into the
              account menu (desktop) / account sheet (mobile) next to Saved, so
              the top bar isn't carrying a setting the profile menu already owns. */}
          {!loggedIn && (
            <button
              type="button"
              className={styles.themeToggle}
              onClick={toggleTheme}
              aria-label={t("nav:toggleTheme")}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
          )}

          {/* Opens the global ⌘K command palette (see CommandPalette / OPEN_SEARCH_EVENT). Desktop only — mobile search lives in the More sheet. */}
          {!isMobile && (
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

          {/* Mobile app bar mirrors Instagram: messages + notifications
              top-right; the avatar "You" tab lives in the bottom bar. */}
          {isAppBar &&
            (loggedIn ? (
              <>
                <MessagesLink />
                <NotificationsBell unreadCount={unreadCount} />
              </>
            ) : (
              <Link to={routes.signIn} className={styles.signIn}>
                {t("nav:signIn")}
              </Link>
            ))}

          {!isMobile &&
            (loggedIn ? (
              <>
                <MessagesLink />
                <NotificationsBell unreadCount={unreadCount} opensPopover />
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
        </div>
      </nav>

      {isMobile && <MobileSheets />}
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
