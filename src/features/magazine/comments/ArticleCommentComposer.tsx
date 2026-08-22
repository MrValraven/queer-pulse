import { useEffect, useRef, useState } from "react";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./ArticleComments.module.css";

/**
 * The write surface for a reader comment (top-level, reply, or edit).
 *
 * FE-CNT-10: `onSubmit` may return a promise, and the composer only clears
 * once that promise RESOLVES. It used to clear synchronously on click, so a
 * failed post threw away what the member had written even though the global
 * mutation toast told them it failed. On rejection the text stays and the
 * button re-enables, so the same words can be sent again.
 */
export function ArticleCommentComposer({
  initialValue = "",
  placeholderKey,
  submitLabelKey,
  onCancel,
  onSubmit,
  focusOnMount,
}: {
  initialValue?: string;
  placeholderKey: string;
  submitLabelKey: string;
  onCancel?: () => void;
  /** Return the mutation's promise to keep the text on failure. */
  onSubmit: (body: string) => void | Promise<unknown>;
  focusOnMount?: boolean;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const trimmed = value.trim();

  async function handleSubmit() {
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(trimmed);
      setValue("");
    } catch {
      // Keep the text exactly as typed. The failure itself is already
      // surfaced by the global mutation error toast.
    } finally {
      setIsSubmitting(false);
    }
  }

  // Move focus into the textarea when this composer mounts in response to an
  // explicit user action (clicking Reply/Edit) — replaces the flagged
  // `autoFocus` prop while keeping the same keyboard-first flow.
  useEffect(() => {
    if (focusOnMount) textareaRef.current?.focus();
  }, [focusOnMount]);

  return (
    <div className={styles.composer}>
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        // The placeholder disappears the moment they type, taking the field's
        // only accessible name with it (FE-CNT-10).
        aria-label={t(placeholderKey)}
        placeholder={t(placeholderKey)}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={3}
      />
      <div className={styles.composerActions}>
        {onCancel && (
          <Button
            variant="ghost"
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t("magazine:comments.composer.cancel")}
          </Button>
        )}
        <Button
          variant="primary"
          type="button"
          disabled={!trimmed || isSubmitting}
          onClick={() => void handleSubmit()}
        >
          {t(submitLabelKey)}
        </Button>
      </div>
    </div>
  );
}
