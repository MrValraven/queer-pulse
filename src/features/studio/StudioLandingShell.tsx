import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { TOP_NAV, FOOTER_COLUMNS } from "./studioLanding.data";
import styles from "./StudioLandingPage.module.css";

/** Logged-out marketing chrome for the Studio landing: sticky topbar + footer. */
export function StudioLandingShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <Link to={routes.homepage} className={styles.brand}>
          <span className={styles.pulseDot} aria-hidden />
          Queer<span className={styles.q}>Pulse</span>
        </Link>
        <span className={styles.product}>Studio</span>
        <nav className={styles.topNav}>
          {TOP_NAV.map((l) => (
            <Link key={l.label} to={l.to}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className={styles.topRight}>
          <Button variant="ghost-dark" to={routes.signIn}>
            Sign in
          </Button>
          <Button variant="primary" to={routes.sustainer}>
            Sustain · €7/mo
          </Button>
        </div>
      </header>

      {children}

      <StudioLandingFooter />
    </div>
  );
}

function StudioLandingFooter() {
  return (
    <footer className={styles.foot}>
      <div className={styles.footInner}>
        <div className={styles.footBrand}>
          <Link to={routes.homepage} className={styles.brand}>
            <span className={styles.pulseDot} aria-hidden />
            Queer<span className={styles.q}>Pulse</span>
          </Link>
          <p>
            A queer professional network rooted in Lisbon. Studio is one of its
            rooms — alongside Cinema, Magazine, and Gatherings.
          </p>
        </div>
        <div className={styles.footCols}>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className={styles.footCol}>
              <h4>{col.title}</h4>
              {col.links.map((l) => (
                <Link key={l.label} to={l.to}>
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.footBase}>
        <span>© 2026 QueerPulse Studio Co-op CRL — Lisbon</span>
        <span>EN · PT</span>
      </div>
    </footer>
  );
}
