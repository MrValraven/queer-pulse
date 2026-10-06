import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiBell,
  FiChevronLeft,
  FiMenu,
  FiMessageSquare,
  FiMoon,
  FiSearch,
  FiSun,
} from "react-icons/fi";
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
import { useFormat } from "../../i18n/format";
import { RollingNumber } from "../ui/RollingNumber";
import { MegaNav } from "./MegaNav";
import { LandingNav } from "./LandingNav";
import { NavBrand } from "./NavBrand";
import { Sidebar } from "./Sidebar";
import { AccountMenu } from "./AccountMenu";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { AppBarSearchButton } from "./AppBarSearchButton";
import { AccountSheet } from "./AccountSheet";
import { useNavDrawer } from "../../../app/providers/navDrawerContext";
import { useAppBarScrollAway } from "./useAppBarScrollAway";
import { NAV_DRAWER_TRIGGER_ATTRIBUTE } from "./useNavDrawerFocus";
import { useIsLandingVisitor } from "./useIsLandingVisitor";
import styles from "./Navbar.module.css";

function BackChevronIcon() {
  return <FiChevronLeft size={22} aria-hidden />;
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
  const fmt = useFormat();
  const count = unreadCount ?? liveCount;
  const bellIcon = <FiBell size={20} aria-hidden />;
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
      aria-label={
        count > 0
          ? t("nav:notificationsUnread", { count })
          : t("nav:notifications")
      }
    >
      {bellIcon}
      {count > 0 && (
        <span className={styles.bellBadge} aria-hidden="true">
          <RollingNumber value={fmt.number(count)} numericValue={count} />
        </span>
      )}
    </Link>
  );
}

function MessagesLink() {
  // Sibling to the bell: sources its own unread badge from the shared
  // conversations query cache (demo → mock unread, live → fetched inbox), so no
  // page has to thread a count down. Mirrors NotificationsBell exactly.
  const count = useUnreadMessages();
  const { t } = useTranslation();
  const fmt = useFormat();
  // The badge is sighted-only (DES-191): the count rides along in the
  // accessible name too, so a blind member hears "Messages, 3 unread"
  // instead of just "Messages".
  return (
    <Link
      to={routes.messages}
      className={styles.bell}
      aria-label={
        count > 0 ? t("nav:messagesUnread", { count }) : t("nav:messages")
      }
    >
      <MessageIcon />
      {count > 0 && (
        <span className={styles.bellBadge}>
          <RollingNumber value={fmt.number(count)} numericValue={count} />
        </span>
      )}
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
 * Widest viewport, in px, that gets the compact desktop pill: the brand, a Menu
 * button that opens the browse drawer, and the usual right cluster. From one
 * pixel wider the full MegaNav trigger row fits beside the brand in EN and PT,
 * signed in and out (measured: the signed-in PT row is the widest and needs
 * about 993px). Local to the top bar on purpose: the shared `mobile`
 * breakpoint (860) still owns the app bar and the bottom tab bar. JS twin of
 * `@custom-media --nav-compact (max-width: 999px)` in
 * src/styles/tokens/breakpoints.css, which Navbar, MegaNav and AccountMenu
 * CSS read: change both together.
 */
const NAV_COMPACT_MAX_PX = 999;

/** The compact pill's way into navigation, where the MegaNav row does not fit.
    It opens the same browse drawer the bottom tab bar's "More" tab opens. */
function CompactMenuButton() {
  const { t } = useTranslation();
  const { activeSheet, openSheet } = useNavDrawer();
  return (
    <button
      type="button"
      className={styles.compactMenu}
      aria-haspopup="dialog"
      aria-expanded={activeSheet === "browse"}
      aria-label={t("nav:openMenu")}
      onClick={() => openSheet("browse")}
      {...{ [NAV_DRAWER_TRIGGER_ATTRIBUTE]: "" }}
    >
      <FiMenu aria-hidden />
      <span>{t("nav:menu")}</span>
    </button>
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
  const isBelowFullNav = useMediaQuery(mediaMax(NAV_COMPACT_MAX_PX));
  const isCompactNav = isBelowFullNav && !isMobile;
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
  // entry live in between. Close it as the gate closes. The compact pill mounts
  // the browse drawer only, so an open account sheet closes there too. The
  // effect itself sits below `isLandingNav`, which it needs.
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

  // The compact drawer is only mounted where the compact pill itself renders:
  // the sidebar mode and the landing bar return early below and never mount it.
  const isCompactDrawerMounted =
    isCompactNav && navMode !== "sidebar" && !isLandingNav;
  useEffect(() => {
    if (!activeSheet || isMobile) return;
    if (isCompactDrawerMounted && activeSheet === "browse") return;
    closeSheet();
  }, [isMobile, isCompactDrawerMounted, activeSheet, closeSheet]);

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
          {isCompactNav ? <CompactMenuButton /> : <MegaNav />}
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

          {/* Opens the global ⌘K command palette (see CommandPalette / OPEN_SEARCH_EVENT). Desktop only. The mobile app bar mounts AppBarSearchButton. */}
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
                <AppBarSearchButton />
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

      {/* One drawer slot for the app bar and the compact pill, so crossing
          860px with the drawer open keeps the same instance (and the opener
          it will return focus to) instead of remounting it. */}
      {(isMobile || isCompactDrawerMounted) && <MobileNavDrawer />}
      {isMobile && <AccountSheet />}
    </>
  );
}

function MessageIcon() {
  return <FiMessageSquare size={19} aria-hidden />;
}

function SearchIcon() {
  return <FiSearch size={19} aria-hidden />;
}

function MoonIcon() {
  return <FiMoon size={18} aria-hidden />;
}

function SunIcon() {
  return <FiSun size={18} aria-hidden />;
}
