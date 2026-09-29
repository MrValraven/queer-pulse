import { useId } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  useJobFieldSelectProps,
  type JobFieldValue,
} from "./useJobFieldSelectProps";
import styles from "./PostJobPage.module.css";

interface JobFieldSelectsProps extends JobFieldValue {
  onChange: (next: JobFieldValue) => void;
  isFieldInvalid?: boolean;
  fieldLabelKey: string;
  professionLabelKey: string;
}

/**
 * The post wizard's field and profession pickers in the wizard's own label
 * style. Options and the clear-stale-profession rule come from
 * `useJobFieldSelectProps`, which the edit page shares inside its FormFields.
 * Renders two sibling `.field` blocks so the caller decides the row layout.
 */
export function JobFieldSelects({
  fieldId,
  professionId,
  onChange,
  isFieldInvalid = false,
  fieldLabelKey,
  professionLabelKey,
}: JobFieldSelectsProps) {
  const { t } = useTranslation();
  const baseId = useId();
  const fieldSelectId = `${baseId}-field`;
  const fieldErrorId = `${baseId}-field-error`;
  const professionSelectId = `${baseId}-profession`;
  const { fieldSelectProps, professionSelectProps } = useJobFieldSelectProps({
    fieldId,
    professionId,
    onChange,
  });

  return (
    <>
      <div
        className={[styles.field, isFieldInvalid && styles.fieldErr]
          .filter(Boolean)
          .join(" ")}
      >
        <label className={styles.label} htmlFor={fieldSelectId}>
          {t(fieldLabelKey)} <span className={styles.req}>*</span>
        </label>
        <Select
          {...fieldSelectProps}
          id={fieldSelectId}
          invalid={isFieldInvalid}
          aria-describedby={isFieldInvalid ? fieldErrorId : undefined}
        />
        <div id={fieldErrorId} className={styles.error}>
          <FiAlertCircle size={13} aria-hidden />{" "}
          {t("economy:postJob.step1.fieldError")}
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={professionSelectId}>
          {t(professionLabelKey)}
          <span className={styles.opt}>
            {t("economy:postJob.field.optional")}
          </span>
        </label>
        <Select {...professionSelectProps} id={professionSelectId} />
      </div>
    </>
  );
}
