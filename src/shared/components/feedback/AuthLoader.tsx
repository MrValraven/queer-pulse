import { useTranslation } from "../../i18n/useTranslation";
import { Translation } from "../../i18n/Translation";
import styles from "./AuthLoader.module.css";

/**
 * Branded Suspense fallback for the auth/onboarding route chunks — replaces the
 * generic spinner with the QueerPulse wordmark and its coral pulse dot, so the
 * first thing a member sees while signing in already feels like the product.
 * Centered on cream (never white); the dot's pulse is suppressed under
 * reduced-motion, leaving a static wordmark + label.
 */
export function AuthLoader() {
  const { t } = useTranslation();
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <div className={styles.brand}>
        <span className={styles.dot} aria-hidden />
        <Translation
          i18nKey="shared:brand.wordmark"
          components={{ em: <span className={styles.brandItalic} /> }}
        />
      </div>
      <p className={styles.caption}>{t("shared:loading.label")}</p>
    </div>
  );
}
