import { Link } from "react-router-dom";
import { Translation } from "../../i18n/Translation";
import styles from "./Navbar.module.css";

/**
 * The QueerPulse wordmark that opens every top bar. Shared by `Navbar` and
 * `LandingNav` so the two never drift, and, more importantly, so the
 * `data-launch-target` hooks below exist exactly once on screen whichever bar
 * is rendered.
 *
 * Those two hooks are the destination of the installed-app boot sequence's
 * exit: its pulse flies into this dot and its wordmark shrinks into this text
 * (`features/system/appLaunch.utils.ts` queries them by attribute). They are
 * stable attributes rather than these hashed CSS-module class names precisely
 * so that code can find them without importing this stylesheet.
 */
export function NavBrand({ to }: { to: string }) {
  return (
    <Link to={to} className={styles.brand}>
      <span
        className={styles.pulseDot}
        data-launch-target="brand-dot"
        aria-hidden
      />
      <span data-launch-target="brand-wordmark">
        <Translation
          i18nKey="shared:brand.wordmark"
          components={{ em: <span className={styles.brandItalic} /> }}
        />
      </span>
    </Link>
  );
}
