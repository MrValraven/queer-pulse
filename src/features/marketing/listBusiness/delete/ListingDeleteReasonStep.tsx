import type { RefObject } from "react";
import { FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ListingDeleteStepHeading } from "./ListingDeleteStepHeading";
import styles from "./ListingDeleteFlow.module.css";

/** The backend's `RemoveListingDto` caps the reason at 2000 characters, so the
 *  field stops there too and the counter shows how close the moderator is. */
const REASON_MAX_LENGTH = 2000;

/**
 * Moderator only: the reason the backend sends the owner as a direct message.
 * Required here, so an owner never receives an empty removal notice.
 */
export function ListingDeleteReasonStep({
  headingRef,
  stepCountId,
  reason,
  onReasonChange,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  stepCountId: string;
  reason: string;
  onReasonChange: (reason: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.step}>
      <ListingDeleteStepHeading
        headingRef={headingRef}
        stepCountId={stepCountId}
      >
        {t("marketing:listBusiness.deleteFlow.reason.heading")}
      </ListingDeleteStepHeading>
      <p className={styles.lead}>
        {t("marketing:listBusiness.deleteFlow.reason.intro")}
      </p>
      <FormField
        label={t("marketing:listBusiness.deleteFlow.reason.label")}
        required
        labelAside={
          <span className={styles.counter} aria-hidden>
            {reason.length}/{REASON_MAX_LENGTH}
          </span>
        }
      >
        <textarea
          value={reason}
          rows={4}
          maxLength={REASON_MAX_LENGTH}
          placeholder={t(
            "marketing:listBusiness.deleteFlow.reason.placeholder",
          )}
          onChange={(event) => onReasonChange(event.target.value)}
        />
      </FormField>
    </div>
  );
}
