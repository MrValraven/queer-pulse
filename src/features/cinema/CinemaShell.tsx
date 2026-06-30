import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useScrolled } from "../../shared/hooks/useScrolled";
import styles from "./CinemaShell.module.css";
import { routes } from "../../app/routeMap";

const LINKS = [
  { label: "This week", to: "/cinema" },
  { label: "Browse", to: "/cinema/browse" },
  { label: "Membership", to: "/cinema/membership" },
];

/** Dark co-op cinema frame: floating dark nav + cinema footer. */
export function CinemaShell({ children }: { children: ReactNode }) {
  const scrolled = useScrolled(8);
  return (
    <div className={styles.root}>
      <nav
        className={[styles.nav, scrolled && styles.scrolled]
          .filter(Boolean)
          .join(" ")}
      >
        <Link to={routes.cinema} className={styles.brand}>
          <span className={styles.pulseDot} aria-hidden />
          Queer<em>Pulse</em>
          <span className={styles.brandTag}>Cinema</span>
        </Link>
        <div className={styles.links}>
          {LINKS.map((item) => (
            <NavLink
              key={item.to}
              end={item.to === "/cinema"}
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
          <Button to={routes.cinemaMembership}>Sustain · €7/mo</Button>
        </div>
      </nav>

      <main>{children}</main>

      <footer className={styles.footer}>
        <div className="wrap">
          <div className={styles.footGrid}>
            <div className={styles.footBrand}>
              <Link to="/" className={styles.brand}>
                <span className={styles.pulseDot} aria-hidden />
                Queer<em>Pulse</em>
              </Link>
              <p>
                A queer professional network rooted in Lisbon. Cinema is one of
                its rooms.
              </p>
            </div>
            <div className={styles.footCols}>
              <div className={styles.footCol}>
                <h4>Cinema</h4>
                <Link to={routes.cinema}>This week</Link>
                <Link to="/cinema/browse">Browse all</Link>
                <Link to="/cinema/browse">Collections</Link>
                <Link to={routes.cinemaMembership}>Membership</Link>
              </div>
              <div className={styles.footCol}>
                <h4>Filmmakers</h4>
                <Link to={routes.submitStory}>Submit</Link>
                <Link to={routes.cinemaMembership}>Revenue split</Link>
                <Link to={routes.governance}>Rights</Link>
              </div>
              <div className={styles.footCol}>
                <h4>About</h4>
                <Link to={routes.governance}>Public ledger</Link>
                <Link to={routes.accessibility}>Access</Link>
                <Link to="/">QueerPulse</Link>
              </div>
            </div>
          </div>
          <div className={styles.footBase}>
            <div>© 2026 QueerPulse Cinema Co-op CRL — Lisbon</div>
            <div>80% of every rent goes to the filmmaker.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
