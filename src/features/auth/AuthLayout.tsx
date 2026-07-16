import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BackToSettingsLink } from "../../shared/components/layout";
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
      <div className={`${styles.orb} ${styles.orbA}`} />
      <div className={`${styles.orb} ${styles.orbB}`} />
      <Link to={routes.homepage} className={styles.brand}>
        <span className={styles.pulseDot} aria-hidden />
        {"Queer"}
        <em>{"Pulse"}</em>
      </Link>
      <BackToSettingsLink />
      <div className={styles.enter}>
        <div
          className={[styles.card, wide && styles.cardWide]
            .filter(Boolean)
            .join(" ")}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
