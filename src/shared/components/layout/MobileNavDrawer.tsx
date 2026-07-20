import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui";
import { useScrollLock } from "../../hooks";
import { useAuth } from "../../../app/providers/authContext";
import { useNavDrawer } from "../../../app/providers/navDrawerContext";
import { routes } from "../../../app/routeMap";
import { useTranslation } from "../../i18n/useTranslation";
import { MegaNavDrawer } from "./MegaNavDrawer";
import { ACCOUNT_ITEMS } from "./AccountMenu";
import { useNavDrawerFocus } from "./useNavDrawerFocus";
import styles from "./MobileNavDrawer.module.css";

/**
 * The mobile navigation drawer, extracted from Navbar so that both the
 * hamburger and the installed-mode "More" tab can open the same panel. Open
 * state (and Back-gesture handling) lives in NavDrawerProvider; focus capture,
 * the Tab trap and Escape live in useNavDrawerFocus.
 *
 * Every link inside navigates with `replace` and reports its close through
 * `closeDrawerForNavigation`, so the history entry the drawer pushed for the
 * Back gesture is overwritten by the destination rather than left behind as a
 * dead Back press. See NavDrawerProvider for the full rationale.
 */
export function MobileNavDrawer() {
  const { drawerOpen, closeDrawer, closeDrawerForNavigation } = useNavDrawer();
  const { loggedIn, signOut } = useAuth();
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);

  // Conditional, unlike the self-contained modals CLAUDE.md describes: those are
  // only mounted while open, so they can lock unconditionally. This drawer is
  // mounted for the whole session and early-returns null when closed, so an
  // unconditional lock would freeze page scroll permanently — and the hook
  // cannot move below the early return without breaking the rules of hooks.
  useScrollLock(drawerOpen);
  useNavDrawerFocus({ drawerOpen, panelRef, closeDrawer });

  if (!drawerOpen) return null;

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) closeDrawer();
      }}
    >
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={t("nav:menu")}
        tabIndex={-1}
      >
        <MegaNavDrawer onNavigate={closeDrawerForNavigation} />
        <Link
          to={routes.search}
          replace
          className={styles.link}
          onClick={closeDrawerForNavigation}
        >
          {t("nav:searchShort")}
        </Link>
        {loggedIn ? (
          <>
            {ACCOUNT_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                replace
                className={styles.link}
                onClick={closeDrawerForNavigation}
              >
                {t(item.labelKey)}
              </Link>
            ))}
            <Link
              to={routes.homepage}
              replace
              className={styles.link}
              onClick={() => {
                signOut();
                closeDrawerForNavigation();
              }}
            >
              {t("nav:signOut")}
            </Link>
          </>
        ) : (
          <>
            <Link
              to={routes.signIn}
              replace
              className={styles.link}
              onClick={closeDrawerForNavigation}
            >
              {t("nav:signIn")}
            </Link>
            <Button
              to={routes.requestInvite}
              replace
              className={styles.cta}
              onClick={closeDrawerForNavigation}
            >
              {t("nav:requestInvite")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
