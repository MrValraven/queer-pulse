// src/features/messages/InlineEditField.tsx
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./MessagesPage.module.css";

export interface InlineEditFieldProps {
  /** The message's current text — seeds the textarea. */
  initialValue: string;
  /** Called with the textarea's current value on Enter or the Save button. */
  onSubmit: (nextValue: string) => void;
  /** Called on Escape or the Cancel button; the caller decides whether the
   *  value actually changed before mutating anything. */
  onCancel: () => void;
}

/**
 * Replaces a bubble's content while a message is being edited: a controlled,
 * auto-growing textarea seeded with the message's current text, plus
 * Save/Cancel buttons. Enter saves, Shift+Enter inserts a newline, Escape
 * cancels. Autofocuses with the caret at the end of the seeded text so
 * editing continues naturally from where the message left off.
 */
export function InlineEditField({
  initialValue,
  onSubmit,
  onCancel,
}: InlineEditFieldProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit(value);
    } else if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
    }
  }

  return (
    <div className={styles.editField}>
      <textarea
        ref={textareaRef}
        className={styles.editTextarea}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
        aria-label={t("messages:actions.editing")}
      />
      <div className={styles.editFieldActions}>
        <Button variant="ghost" onClick={onCancel}>
          {t("messages:actions.editCancel")}
        </Button>
        <Button variant="primary" onClick={() => onSubmit(value)}>
          {t("messages:actions.editSave")}
        </Button>
      </div>
    </div>
  );
}
