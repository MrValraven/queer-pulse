import { useEffect, useRef } from "react";
import { FormField } from "../../../../shared/components/ui";
import type { FocusFieldHandler } from "./activeField";
import { insertAtSelection } from "./insertAtSelection";
import styles from "./emailTemplateEditor.module.css";

interface EmailTextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFocusField: FocusFieldHandler;
  maxLength: number;
  hint?: string;
  isMultiline?: boolean;
  inputMode?: "text" | "url";
}

/**
 * A labelled input or textarea that registers itself as the placeholder
 * target when focused. The insert reads the element's live value and
 * selection, so it is correct even when a chip is clicked much later.
 */
export function EmailTextField({
  id,
  label,
  value,
  onChange,
  onFocusField,
  maxLength,
  hint,
  isMultiline = false,
  inputMode = "text",
}: EmailTextFieldProps) {
  const elementRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  function registerAsTarget() {
    onFocusField({
      insert: (token) => {
        const element = elementRef.current;
        if (!element) return;
        const next = insertAtSelection(
          element.value,
          element.selectionStart ?? element.value.length,
          element.selectionEnd ?? element.value.length,
          token,
        );
        onChangeRef.current(next.value);
        requestAnimationFrame(() => {
          element.focus();
          element.setSelectionRange(next.caret, next.caret);
        });
      },
    });
  }

  const sharedProps = {
    id,
    ref: elementRef,
    value,
    maxLength,
    className: isMultiline ? styles.textarea : styles.input,
    onFocus: registerAsTarget,
    onChange: (event: { target: { value: string } }) =>
      onChange(event.target.value),
  };

  return (
    <FormField label={label} helper={hint}>
      {isMultiline ? (
        <textarea {...sharedProps} rows={4} />
      ) : (
        <input {...sharedProps} type={inputMode === "url" ? "url" : "text"} />
      )}
    </FormField>
  );
}
