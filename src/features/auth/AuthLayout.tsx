import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BackToSettingsLink } from "../../shared/components/layout";
import {
  MAIN_CONTENT_ID,
  SkipToContentLink,
} from "../../shared/components/layout/SkipToContentLink";
import { routes } from "../../app/routeMap";
import styles from "./auth.module.css";

/** Centred auth card with floating brand mark and background orbs. */
export function AuthLayout({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={styles.root}>
      <SkipToContentLink />
      <div className={`${styles.orb} ${styles.orbA}`} />
      <div className={`${styles.orb} ${styles.orbB}`} />
      <Link to={routes.homepage} className={styles.brand}>
        <span className={styles.pulseDot} aria-hidden />
        <span>
          {"Queer"}
          <em>{"Pulse"}</em>
        </span>
      </Link>
      <BackToSettingsLink />
      {/* The auth pages sit outside PageShell/AppShell, so this is the only
          <main> on the page. It carries the shared landmark id + `tabIndex={-1}`
          the skip link and RouteAnnouncer both target. Deliberately WITHOUT
          `data-page-main`: this frame renders no floating Navbar, and that
          attribute's global chrome offsets (base.css, nav-mode.css,
          standalone.css) would push the centred card off centre. */}
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className={styles.enter}>
        <div
          className={[styles.card, wide && styles.cardWide]
            .filter(Boolean)
            .join(" ")}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
