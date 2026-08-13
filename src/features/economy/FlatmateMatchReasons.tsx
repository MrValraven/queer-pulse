import { FiZap } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Profile } from "./flatmates.data";
import styles from "./FlatmatesPage.module.css";

/** The "why you matched" strip on a flatmate card. Shows the top compatibility
 * factors behind the score, translated by their stable `factor` key. The
 * backend has already GDPR-redacted the reasons — a safe-space reason a viewer
 * isn't permitted to see arrives as the generic "shared safe-space values", so
 * nothing here can leak another member's special-category specifics. */
export function FlatmateMatchReasons({ profile }: { profile: Profile }) {
  const { t } = useTranslation();
  const reasons = profile.matchReasons ?? [];
  if (reasons.length === 0) return null;

  // Keep it compact — the strongest three factors tell the story.
  const topReasons = reasons.slice(0, 3);

  return (
    <div className={styles.matchReasons}>
      <span className={styles.matchReasonsLabel}>
        <FiZap className={styles.matchReasonsIcon} aria-hidden />
        {t("economy:flatmates.card.whyMatched")}
      </span>
      <div className={styles.tags}>
        {topReasons.map((reason) => (
          <span key={reason.factor} className={styles.matchReasonTag}>
            {t(`economy:flatmates.reason.${reason.factor}`)}
          </span>
        ))}
      </div>
    </div>
  );
}
