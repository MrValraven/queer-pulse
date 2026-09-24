import type { RefObject } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  LISTING_DELETE_ACKNOWLEDGEMENTS,
  type ListingDeleteFlowVariant,
} from "./listingDeleteFlow.data";
import { ListingDeleteStepHeading } from "./ListingDeleteStepHeading";
import styles from "./ListingDeleteFlow.module.css";

/**
 * Step 2: three required ticks, one per consequence. Going Back and returning
 * keeps them ticked, because the flow owns the set.
 */
export function ListingDeleteAcknowledgeStep({
  variant,
  headingRef,
  stepCountId,
  acknowledgedIds,
  onToggle,
}: {
  variant: ListingDeleteFlowVariant;
  headingRef: RefObject<HTMLHeadingElement | null>;
  stepCountId: string;
  acknowledgedIds: ReadonlySet<string>;
  onToggle: (acknowledgementId: string, isChecked: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.step}>
      <ListingDeleteStepHeading
        headingRef={headingRef}
        stepCountId={stepCountId}
      >
        {t("marketing:listBusiness.deleteFlow.acknowledge.heading")}
      </ListingDeleteStepHeading>
      <fieldset className={styles.checkGroup}>
        <legend className={styles.lead}>
          {t("marketing:listBusiness.deleteFlow.acknowledge.intro")}
        </legend>
        {LISTING_DELETE_ACKNOWLEDGEMENTS[variant].map((acknowledgement) => (
          <label key={acknowledgement.id} className={styles.checkRow}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={acknowledgedIds.has(acknowledgement.id)}
              onChange={(event) =>
                onToggle(acknowledgement.id, event.target.checked)
              }
            />
            <span>{t(acknowledgement.labelKey)}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}
