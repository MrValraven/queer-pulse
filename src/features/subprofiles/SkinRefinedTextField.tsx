import type { KeyboardEvent, RefObject } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import { SkinRefinedField } from "./SkinRefinedField";
import { useRefinedPlaceholder } from "./refinedFieldSurface";
import styles from "./SkinRefinedScalar.module.css";

interface SkinRefinedTextFieldProps {
  control: SkinBlockControl;
  isLabelHidden: boolean;
  value: string;
  /** The blur check's message while it is shown. */
  warning: string | undefined;
  /** The auto-grow fallback's textarea (SkinTextFieldControl owns it). */
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onBlur: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onEdit: (next: string) => void;
}

/**
 * How a `text` or `textarea` control draws. SkinTextFieldControl keeps the behaviour (the blur check, Enter blocked
 * and pasted line breaks turned into spaces on an `isWrapping` field, the
 * auto-grow fallback) and hands it here; this renders the frame: label, the
 * hint above the field, an "e.g." example, and the warning under the field,
 * where `aria-describedby` reaches it while it shows. An `isWrapping` field
 * rests at the single-line input's 48px and wraps a long value onto more
 * lines; a paragraph rests at three rows. Both grow with their content.
 */
export function SkinRefinedTextField({
  control,
  isLabelHidden,
  value,
  warning,
  textareaRef,
  onBlur,
  onKeyDown,
  onEdit,
}: SkinRefinedTextFieldProps) {
  const { t } = useTranslation();
  const placeholder = useRefinedPlaceholder(control.placeholderKey);
  const isParagraph = control.kind === "textarea";
  const isWrapping = !isParagraph && Boolean(control.isWrapping);
  const isWarningShown = Boolean(warning);

  return (
    <SkinRefinedField
      label={t(control.labelKey)}
      isLabelHidden={isLabelHidden}
      helper={control.helperKey ? t(control.helperKey) : undefined}
      helperTone={control.helperTone}
      isNarrow={control.size === "narrow"}
      className={styles.textFrame}
      footer={
        isWarningShown ? (
          <span className={styles.warning}>
            <FiAlertCircle aria-hidden className={styles.warningIcon} />
            {warning}
          </span>
        ) : undefined
      }
    >
      {(field) => {
        const sharedProps = {
          id: field.controlId,
          value,
          placeholder,
          "aria-describedby":
            [field.describedBy, isWarningShown ? field.footerId : undefined]
              .filter(Boolean)
              .join(" ") || undefined,
          "aria-invalid": isWarningShown || undefined,
          onBlur,
        };
        return isParagraph || isWrapping ? (
          <textarea
            {...sharedProps}
            ref={textareaRef}
            rows={isWrapping ? 1 : 3}
            className={[
              field.textareaClassName,
              styles.textControl,
              styles.growing,
              isParagraph ? styles.paragraph : null,
            ]
              .filter(Boolean)
              .join(" ")}
            onKeyDown={isWrapping ? onKeyDown : undefined}
            onChange={(event) => onEdit(event.target.value)}
          />
        ) : (
          <input
            {...sharedProps}
            className={`${field.inputClassName} ${styles.textControl}`}
            onChange={(event) => onEdit(event.target.value)}
          />
        );
      }}
    </SkinRefinedField>
  );
}
