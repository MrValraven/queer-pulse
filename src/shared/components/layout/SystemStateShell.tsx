import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Translation } from "../../i18n/Translation";
import { BackToSettingsLink } from "./BackToSettingsLink";
import styles from "./SystemStateShell.module.css";

/** Background-orb colour pairing. Most state pages use `default` (coral +
 *  plum); a few tint differently to match their mood. */
type OrbTone = "default" | "jade" | "plum";

const ORB_A: Record<OrbTone, string> = {
  default: styles.orbADefault!,
  jade: styles.orbAJade!,
  plum: styles.orbAPlum!,
};
const ORB_B: Record<OrbTone, string> = {
  default: styles.orbBDefault!,
  jade: styles.orbBJade!,
  plum: styles.orbBPlum!,
};

/**
 * Shared shell for full-screen "state" pages (pending review, invite expired,
 * account banned/locked/suspended, offline, geo-restricted, PWA prompt). Owns
 * the cream background, decorative orbs, brand mark, centering, and the
 * entrance motion. Pass only the page's `.card` markup as children.
 *
 * `orbTone` recolours the decorative orbs; `mutedBrand` dims the brand mark
 * (used by sombre states like account-banned / offline).
 */
export function SystemStateShell({
  children,
  orbTone = "default",
  mutedBrand = false,
}: {
  children: ReactNode;
  orbTone?: OrbTone;
  mutedBrand?: boolean;
}) {
  return (
    <div className={styles.root}>
      <div className={`${styles.orb} ${styles.orbA} ${ORB_A[orbTone]}`} />
      <div className={`${styles.orb} ${styles.orbB} ${ORB_B[orbTone]}`} />
      <Link
        to="/"
        className={`${styles.brand} ${mutedBrand ? styles.brandMuted : ""}`}
      >
        <span
          className={`${styles.pulseDot} ${mutedBrand ? styles.pulseDotMuted : ""}`}
          aria-hidden
        />
        <Translation
          i18nKey="shared:brand.wordmark"
          components={{ em: <em /> }}
        />
      </Link>
      <BackToSettingsLink />
      <div className={styles.enter}>{children}</div>
    </div>
  );
}
