import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui";
import { useScrolled } from "../../hooks/useScrolled";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useTheme } from "../../../app/providers/ThemeProvider";
import { linkToPath } from "../../../app/routeMap";
import { MegaNav } from "./MegaNav";
import { MegaNavDrawer } from "./MegaNavDrawer";
import styles from "./Navbar.module.css";

function Brand() {
  return (
    <Link to="/" className={styles.brand}>
      <span className={styles.pulseDot} aria-hidden />
      Queer<span className={styles.brandItalic}>Pulse</span>
    </Link>
  );
}

export function Navbar() {
  const scrolled = useScrolled(8);
  const isMobile = useMediaQuery("(max-width: 860px)");
  const { theme, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <nav
        className={[styles.nav, scrolled && styles.scrolled]
          .filter(Boolean)
          .join(" ")}
      >
        <Brand />

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
            <Link to="/sign-in" className={styles.signIn}>
              Sign in
            </Link>
          )}
          <Button to={linkToPath("QueerPulse Invite.html")}>
            Request an invite
          </Button>

          {isMobile && (
            <button
              type="button"
              className={styles.menuButton}
              onClick={() => setDrawerOpen(true)}
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
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className={styles.drawerPanel}
            onClick={(event) => event.stopPropagation()}
          >
            <MegaNavDrawer onNavigate={() => setDrawerOpen(false)} />
            <Link
              to="/sign-in"
              className={styles.drawerSignIn}
              onClick={() => setDrawerOpen(false)}
            >
              Sign in
            </Link>
            <Button
              to={linkToPath("QueerPulse Invite.html")}
              className={styles.drawerCta}
              onClick={() => setDrawerOpen(false)}
            >
              Request an invite
            </Button>
          </div>
        </div>
      )}
    </>
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
