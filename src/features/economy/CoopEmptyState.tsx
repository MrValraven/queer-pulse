import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./HousingCoopPage.module.css";

/**
 * Honest empty state for the "forming now" grid: production starts with zero
 * co-ops, and that's a real state worth naming warmly rather than hiding
 * behind an indefinite skeleton. Plum-panel pattern, matching `CoopStartCta`.
 *
 * `onStart` is optional because the "post that you're starting" flow has no
 * endpoint yet. Without it the panel drops the button and tells the reader the
 * flow is still on the way.
 */
export function CoopEmptyState({ onStart }: { onStart?: () => void }) {
  const { t } = useTranslation();
  return (
    <div className={styles.coopEmpty}>
      <div className={styles.coopEmptyTitle}>
        {t("economy:housingCoop.empty.title")}{" "}
        <em>{t("economy:housingCoop.empty.titleEm")}</em>
      </div>
      <p className={styles.coopEmptyBody}>
        {onStart
          ? t("economy:housingCoop.empty.body")
          : t("economy:housingCoop.empty.bodyComingSoon")}
      </p>
      {onStart && (
        <Button variant="jade" onClick={onStart}>
          {t("economy:housingCoop.empty.cta")}
        </Button>
      )}
    </div>
  );
}
