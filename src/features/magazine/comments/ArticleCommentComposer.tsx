import { useEffect, useRef, useState } from "react";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./ArticleComments.module.css";

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
  onSubmit: (body: string) => void;
  focusOnMount?: boolean;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const trimmed = value.trim();

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
        placeholder={t(placeholderKey)}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
      />
      <div className={styles.composerActions}>
        {onCancel && (
          <Button variant="ghost" type="button" onClick={onCancel}>
            {t("magazine:comments.composer.cancel")}
          </Button>
        )}
        <Button
          variant="primary"
          type="button"
          disabled={!trimmed}
          onClick={() => {
            if (trimmed) onSubmit(trimmed);
            setValue("");
          }}
        >
          {t(submitLabelKey)}
        </Button>
      </div>
    </div>
  );
}
