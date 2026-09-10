import { useCallback, useRef, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { FiMoon, FiSun } from "react-icons/fi";
import { Button } from "../ui";
import { routes } from "../../../app/routeMap";
import { useScrolled } from "../../hooks/useScrolled";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { mediaMax } from "../../theme/breakpoints";
import { useTheme } from "../../../app/providers/themeContext";
import { useTranslation } from "../../i18n/useTranslation";
import { prefersReducedMotionNow } from "../../hooks/usePrefersReducedMotion";
import { NavBrand } from "./NavBrand";
import {
  useActiveLandingSection,
  useLandingSections,
} from "./useLandingSections";
import navStyles from "./Navbar.module.css";
import styles from "./LandingNav.module.css";

/** Breathing room between the nav's lower edge and the section it scrolls to. */
const SECTION_GAP = 20;

/**
 * The top bar a signed-out visitor gets on the landing page, in place of the
 * site-wide `Navbar`. The landing page is a single argument read top to bottom,
 * so its nav points INTO that argument: anchors to the sections already on the
 * page, rather than the mega panels that invite a visitor to leave it.
 * Everything else on the bar is the one thing we want them to do: sign in, or
 * ask for an invite.
 *
 * `Navbar` owns the swap (it returns this component for `/` when signed out), so
 * `AppChrome` still mounts exactly one persistent top bar and nothing about the
 * fixed chrome, the realtime socket or the shell frame changes here. A signed-in
 * member visiting `/` falls through to the ordinary meganav with their bell,
 * messages and account menu intact.
 *
 * The pill shell, brand and sign-in link are `Navbar.module.css`'s own classes
 * rather than copies: this IS that bar wearing a shorter middle, and the
 * stylesheet's `[data-theme="dark"]` rules are keyed on those same class names.
 */
export function LandingNav() {
  const scrolled = useScrolled(8);
  const isMobile = useMediaQuery(mediaMax("mobile"));
  // Brand + toggle + "Sign in" + the invite pill need roughly 460px of bar, and
  // the labels are in rem so a reader with a larger browser font needs more
  // still. Below that the invite button is what gives, never the sign-in link:
  // BottomTabBar deliberately carries no sign-in tab because "signing in is the
  // app bar's job" (see bottomTabs.ts), so dropping it here would leave a
  // signed-out phone with no way into an account from the chrome at all. The
  // invite call to action loses nothing by going: it is the hero's own primary
  // button, a screen below, and it returns again in the closing section.
  const isNarrowPhone = useMediaQuery(mediaMax("sm"));
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const sections = useLandingSections();
  const activeId = useActiveLandingSection(sections);
  const navRef = useRef<HTMLElement | null>(null);

  const scrollToSection = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, id: string) => {
      const target = document.getElementById(id);
      // No target means the section unmounted between render and click; leave
      // the plain `#id` href to the browser rather than swallowing the event.
      if (!target) return;
      event.preventDefault();
      // Measured off the live pill rather than read from `--nav-band`, so the
      // offset stays right in every one of the bar's shapes (floating pill,
      // mobile app bar) without a second copy of that arithmetic.
      const navBottom = navRef.current?.getBoundingClientRect().bottom ?? 0;
      const top =
        target.getBoundingClientRect().top +
        window.scrollY -
        navBottom -
        SECTION_GAP;
      window.scrollTo({
        top: Math.max(top, 0),
        behavior: prefersReducedMotionNow() ? "auto" : "smooth",
      });
      // Move focus with the viewport, or a keyboard user scrolls the page and
      // keeps tabbing through the nav. Same technique `SkipToContentLink` uses
      // on <main>: a programmatic-only tab stop, set once and harmless to
      // re-set. `preventScroll` leaves the smooth scroll above in charge.
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      // Reflect the position in the URL without a router navigation: a real
      // one would re-run ScrollManager, which would fight the scroll just
      // started here.
      window.history.replaceState(window.history.state, "", `#${id}`);
    },
    [],
  );

  return (
    <nav
      ref={navRef}
      aria-label={t("nav:landing.label")}
      className={[
        navStyles.nav,
        scrolled && navStyles.scrolled,
        isMobile && navStyles.appBar,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <NavBrand to={routes.homepage} />

      {/* Desktop only. On a phone the page itself is the navigation, and the
          row would not survive the slim app-bar strip anyway. */}
      {!isMobile && sections.length > 0 && (
        <ul className={styles.sections}>
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={[
                  styles.sectionLink,
                  activeId === section.id && styles.sectionLinkActive,
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-current={activeId === section.id ? "true" : undefined}
                onClick={(event) => scrollToSection(event, section.id)}
              >
                {t(section.labelKey)}
              </a>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={t("nav:toggleTheme")}
        >
          {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
        <Link to={routes.signIn} className={navStyles.signIn}>
          {t("nav:signIn")}
        </Link>
        {!isNarrowPhone && (
          <Button to={routes.requestInvite} size={isMobile ? "sm" : "md"}>
            {t("nav:requestInvite")}
          </Button>
        )}
      </div>
    </nav>
  );
}
