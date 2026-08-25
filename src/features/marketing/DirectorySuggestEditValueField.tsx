import { useId } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SuggestEditFieldShape } from "./directorySuggestEditFields.data";
import styles from "./DirectorySuggestEditModal.module.css";

/**
 * "What should it say instead?": the optional half of a suggestion.
 *
 * Shaped by the bucket the member picked, so a phone number gets a phone input
 * and a description gets room to breathe, and capped at the same length the
 * real listing column allows. Never rendered for the `other` bucket, which has
 * no column a value could be written to.
 *
 * `rejection` is the server's own explanation of why a value was refused,
 * shown against the input that caused it rather than thrown away behind a
 * generic failure toast.
 */
export function DirectorySuggestEditValueField({
  shape,
  value,
  rejection,
  onChange,
}: {
  shape: SuggestEditFieldShape;
  value: string;
  rejection: string | null;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const inputId = useId();
  const rejectionId = useId();

  return (
    <>
      <label className={styles.field} htmlFor={inputId}>
        {t(shape.labelKey)}{" "}
        <span className={styles.optional}>
          {t("marketing:directory.detail.suggestEdit.value.optional")}
        </span>
      </label>
      {shape.isMultiline ? (
        <textarea
          id={inputId}
          className={styles.valueTextarea}
          rows={2}
          maxLength={shape.maxLength}
          value={value}
          aria-invalid={rejection ? true : undefined}
          aria-describedby={rejection ? rejectionId : undefined}
          placeholder={t(shape.placeholderKey)}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={inputId}
          type={shape.inputType}
          className={styles.valueInput}
          maxLength={shape.maxLength}
          value={value}
          aria-invalid={rejection ? true : undefined}
          aria-describedby={rejection ? rejectionId : undefined}
          placeholder={t(shape.placeholderKey)}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      <p className={styles.valueHint}>
        {t("marketing:directory.detail.suggestEdit.value.hint")}
      </p>
      {rejection && (
        <p id={rejectionId} role="alert" className={styles.valueRejection}>
          {t("marketing:directory.detail.suggestEdit.value.rejected", {
            reason: rejection,
          })}
        </p>
      )}
    </>
  );
}
