import type { RefObject } from "react";
import { FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ListingDeleteStepHeading } from "./ListingDeleteStepHeading";
import styles from "./ListingDeleteFlow.module.css";

/**
 * Last step: type the listing's exact name. The flow keeps Delete disabled
 * until `isListingNameMatch` passes, and shows the server's failure here in
 * an alert so the person can retry without starting over.
 */
export function ListingDeleteConfirmNameStep({
  headingRef,
  stepCountId,
  listingName,
  typedName,
  onTypedNameChange,
  hasDeleteFailed,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  stepCountId: string;
  listingName: string;
  typedName: string;
  onTypedNameChange: (typedName: string) => void;
  hasDeleteFailed: boolean;
}) {
  const { t } = useTranslation();
  const displayName = listingName.trim();
  return (
    <div className={styles.step}>
      <ListingDeleteStepHeading
        headingRef={headingRef}
        stepCountId={stepCountId}
      >
        {t("marketing:listBusiness.deleteFlow.confirmName.heading")}
      </ListingDeleteStepHeading>
      <p className={styles.lead}>
        {t("marketing:listBusiness.deleteFlow.confirmName.intro")}
      </p>
      <p className={styles.nameToType}>{displayName}</p>
      <FormField
        label={t("marketing:listBusiness.deleteFlow.confirmName.label")}
        helper={t("marketing:listBusiness.deleteFlow.confirmName.helper")}
        /* FormField renders the error right under the input in its own
           role="alert" span, so the failure is announced where it happened. */
        error={
          hasDeleteFailed
            ? t("marketing:listBusiness.deleteFlow.error")
            : undefined
        }
      >
        <input
          value={typedName}
          onChange={(event) => onTypedNameChange(event.target.value)}
          placeholder={displayName}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
        />
      </FormField>
    </div>
  );
}
