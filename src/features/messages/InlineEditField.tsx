// src/features/messages/InlineEditField.tsx
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MentionTextarea } from "../../shared/mentions/MentionTextarea";
import {
  MESSAGE_BODY_MAX_LENGTH,
  getMessageBodyLength,
  isMessageBodyOverLimit,
  shouldShowMessageLengthCounter,
} from "./messageBodyLimit";
import styles from "./InlineEditField.module.css";

export interface InlineEditFieldProps {
  /** The message's current text. Seeds the textarea. */
  initialValue: string;
  /** Called with the textarea's current value on Enter (fine pointer only)
   *  or the Save button. Never called while the trimmed value is empty or
   *  over `MESSAGE_BODY_MAX_LENGTH` (see `canSave` below). */
  onSubmit: (nextValue: string) => void;
  /** Called on Escape or the Cancel button; the caller decides whether the
   *  value actually changed before mutating anything. */
  onCancel: () => void;
}

/**
 * Replaces a bubble's content while a message is being edited: a controlled,
 * auto-growing textarea seeded with the message's current text, plus
 * Save/Cancel buttons.
 *
 * Enter-to-save is device-aware, mirroring `Composer.tsx`'s
 * `handleComposerKeyDown` exactly (same `(pointer: coarse)` check): on a
 * fine pointer (mouse/trackpad) Enter saves and Shift+Enter inserts a
 * newline; on a coarse pointer (touch) Enter always inserts a newline, since
 * thumb-typers already learned that from the composer and a same-key save
 * here would edit a message out from under them mid-sentence (DES-208).
 * Escape always cancels, on every device.
 *
 * An empty edit keeps the field open (DES-208): Save stays disabled and a
 * hint explains why, the same pattern chat apps commonly use so a blank
 * Enter can't quietly auto-delete a message's text as a side effect of
 * editing it. Deleting the whole message stays a deliberate, separate action,
 * one tap away via the overlay's own Delete action.
 *
 * Also surfaces the server's length limit (DES-202's inline-editor half):
 * a counter appears once the edit is within `MESSAGE_BODY_COUNTER_THRESHOLD`
 * characters of `MESSAGE_BODY_MAX_LENGTH` (see `messageBodyLimit.ts`), turns
 * into the over-limit color past it, and Save disables. A screen-reader-only
 * live region announces only the crossing into or out of over-limit, keeping
 * every other keystroke silent.
 */
export function InlineEditField({
  initialValue,
  onSubmit,
  onCancel,
}: InlineEditFieldProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const counterId = useId();
  // Tracks the previous over-limit reading so the live region below only
  // gets new text when that boolean flips, never on every keystroke.
  const wasOverLimitRef = useRef(false);
  const [limitAnnouncement, setLimitAnnouncement] = useState("");

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }, []);

  const trimmedLength = getMessageBodyLength(value);
  const isEmpty = trimmedLength === 0;
  const isOverLimit = isMessageBodyOverLimit(value);
  const showCounter = shouldShowMessageLengthCounter(value);
  const canSave = !isEmpty && !isOverLimit;

  useEffect(() => {
    if (isOverLimit === wasOverLimitRef.current) return;
    wasOverLimitRef.current = isOverLimit;
    setLimitAnnouncement(
      isOverLimit
        ? t("messages:actions.editOverLimitAnnouncement", {
            max: MESSAGE_BODY_MAX_LENGTH,
          })
        : t("messages:actions.editWithinLimitAnnouncement"),
    );
  }, [isOverLimit, t]);

  function attemptSubmit() {
    if (!canSave) return;
    onSubmit(value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter or Escape during CJK composition belongs to the IME.
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    // Same device check as `Composer.tsx`'s `handleComposerKeyDown`. Do not
    // diverge from it, or thumb-typers relearn a different rule per field.
    const isCoarsePointer =
      typeof window !== "undefined" &&
      window.matchMedia?.("(pointer: coarse)").matches;
    if (event.key === "Enter" && !event.shiftKey && !isCoarsePointer) {
      event.preventDefault();
      attemptSubmit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
    }
  }

  return (
    <div className={styles.editField}>
      <MentionTextarea
        textareaRef={textareaRef}
        className={styles.editTextarea}
        value={value}
        rows={2}
        aria-label={t("messages:actions.editing")}
        aria-describedby={showCounter || isEmpty ? counterId : undefined}
        aria-invalid={isOverLimit || undefined}
        placement="above"
        onChange={setValue}
        onKeyDown={handleKeyDown}
      />
      {/* Announces only the over-limit crossing, in either direction,
          keeping the per-keystroke count out of the noise a screen reader
          would otherwise get on a long paste or a long edit session. */}
      <div className={styles.srOnly} role="status" aria-atomic="true">
        {limitAnnouncement}
      </div>
      <div className={styles.editFieldFooter}>
        {showCounter ? (
          <span
            id={counterId}
            className={
              isOverLimit
                ? `${styles.editCounter} ${styles.editCounterOverLimit}`
                : styles.editCounter
            }
          >
            {t("messages:actions.editCounter", {
              count: trimmedLength,
              max: MESSAGE_BODY_MAX_LENGTH,
            })}
          </span>
        ) : isEmpty ? (
          <span id={counterId} className={styles.editHint}>
            {t("messages:actions.editEmptyHint")}
          </span>
        ) : (
          <span />
        )}
        <div className={styles.editFieldActions}>
          <Button variant="ghost" onClick={onCancel}>
            {t("messages:actions.editCancel")}
          </Button>
          {/* `aria-disabled` (repo convention, see `RequestInviteForm.tsx`)
              keeps the control focusable and clickable while blocked, and
              `attemptSubmit` itself no-ops, so a keyboard user still reaches
              Save, stays in the tab order, and sees the counter/hint that
              already explains why. */}
          <Button
            variant="primary"
            onClick={attemptSubmit}
            aria-disabled={!canSave || undefined}
          >
            {t("messages:actions.editSave")}
          </Button>
        </div>
      </div>
    </div>
  );
}
