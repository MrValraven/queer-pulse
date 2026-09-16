import type { RefObject } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./FirstContactComposer.module.css";

const MAX_LENGTH = 2000;
/** The counter stays invisible below this. Most drafts never get near the
 *  cap, and showing a live count from the first keystroke reads as pressure
 *  rather than help. */
const COUNTER_VISIBLE_FROM = Math.floor(MAX_LENGTH * 0.8);
/** Once visible, only announce the remaining count to screen readers below
 *  this, or every keystroke would talk over the person typing. */
const ANNOUNCE_REMAINING_BELOW = 200;

interface FirstContactComposerFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  disabled: boolean;
  fieldRef: RefObject<HTMLTextAreaElement | null>;
}

/**
 * The textarea + character counter every first-contact composer shares
 * (PRD-340): same 2000-char cap, same 80%-of-cap reveal threshold, same
 * polite `aria-live` remaining-count announcement, across all three doors.
 * Split out of `FirstContactComposer.tsx` to keep it under the 200-line cap.
 */
export function FirstContactComposerField({
  value,
  onChange,
  placeholder,
  ariaLabel,
  disabled,
  fieldRef,
}: FirstContactComposerFieldProps) {
  const { t } = useTranslation();
  const remaining = MAX_LENGTH - value.length;
  const isCounterVisible = value.length >= COUNTER_VISIBLE_FROM;

  return (
    <>
      <textarea
        ref={fieldRef}
        className={styles.field}
        rows={4}
        maxLength={MAX_LENGTH}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-label={ariaLabel}
      />
      {isCounterVisible && (
        <p className={styles.counter}>
          <span aria-hidden>
            {value.length}/{MAX_LENGTH}
          </span>
          <span className="visuallyHidden" aria-live="polite">
            {remaining < ANNOUNCE_REMAINING_BELOW
              ? t("messages:firstContact.charactersLeft", { remaining })
              : ""}
          </span>
        </p>
      )}
    </>
  );
}
