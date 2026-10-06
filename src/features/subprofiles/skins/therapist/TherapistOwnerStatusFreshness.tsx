import { useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { formatRelative } from "../../../../shared/lib/date";
import { isTherapistStatusFresh } from "./therapistStatusFreshness";
import styles from "./TherapistOwnerBar.module.css";

interface TherapistOwnerStatusFreshnessProps {
  /** When the status last changed or was confirmed (ISO); null when never. */
  updatedAt: string | null;
  isSaving: boolean;
  /** Re-saves the status as it stands, which stamps it as confirmed. */
  onConfirm: () => void;
}

/**
 * Under the owner's capacity switch: how long ago the status was last
 * confirmed, and a way to confirm it unchanged (PRD-435). Members see a
 * status older than `STATUS_CONFIRMED_WITHIN_DAYS` as not confirmed
 * recently, so once it gets there the line gains an alert icon and says so,
 * and Confirm becomes the panel's coral action.
 */
export function TherapistOwnerStatusFreshness({
  updatedAt,
  isSaving,
  onConfirm,
}: TherapistOwnerStatusFreshnessProps) {
  const { t } = useTranslation();
  const formatters = useFormat();
  // Read once per mount; a fresh confirmation lands after it, so still reads
  // as fresh.
  const [now] = useState(() => Date.now());
  const isFresh = isTherapistStatusFresh(
    { availabilityUpdatedAt: updatedAt },
    now,
  );
  const updatedText = updatedAt
    ? t("subprofiles:therapist.owner.statusUpdated", {
        when: formatRelative(updatedAt, formatters),
      })
    : t("subprofiles:therapist.owner.statusNotConfirmed");

  return (
    <div className={styles.freshness}>
      <p
        className={`${styles.freshnessText} ${isFresh ? "" : styles.freshnessStale}`}
        aria-live="polite"
      >
        {!isFresh && (
          <FiAlertCircle aria-hidden className={styles.freshnessIcon} />
        )}
        {updatedText}
        {!isFresh && (
          <span className={styles.freshnessHint}>
            {t("subprofiles:therapist.owner.statusStaleHint")}
          </span>
        )}
      </p>
      <Button
        className={styles.confirmButton}
        type="button"
        variant={isFresh ? "ghost-dark" : "primary"}
        size="sm"
        aria-disabled={isSaving || undefined}
        onClick={() => {
          if (!isSaving) onConfirm();
        }}
      >
        {t("subprofiles:therapist.owner.confirmStatus")}
      </Button>
    </div>
  );
}
