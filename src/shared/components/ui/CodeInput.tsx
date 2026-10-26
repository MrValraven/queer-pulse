import {
  useEffect,
  useRef,
  type ClipboardEvent,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { useTranslation } from "../../i18n/useTranslation";
import {
  CODE_LENGTH,
  digitsOnly,
  typedText,
  writeDigits,
} from "./codeInput.helpers";
import styles from "./CodeInput.module.css";

export interface CodeInputProps {
  /** 0..length digits, always a contiguous prefix of the code. */
  value: string;
  onChange: (value: string) => void;
  /** Called once, when the value first reaches `length`. */
  onComplete: (code: string) => void;
  length?: number;
  isDisabled?: boolean;
  shouldAutoFocus?: boolean;
  /** Accessible name for the whole group of boxes, e.g. "Sign-in code". */
  label?: string;
  /** Injected by FormField: `id` lands on box 0, the aria props on every box. */
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean | "true" | "false";
}

/**
 * A one-time code as one box per digit. Typing moves forward, Backspace in an
 * empty box walks back, and a paste or OS autofill into any box fills the
 * whole code from the start.
 */
export function CodeInput({
  value,
  onChange,
  onComplete,
  length = CODE_LENGTH,
  isDisabled = false,
  shouldAutoFocus = false,
  label,
  id,
  "aria-describedby": describedBy,
  "aria-invalid": isInvalid,
  "aria-required": isRequired,
}: CodeInputProps) {
  const { t } = useTranslation();
  const boxRefs = useRef<(HTMLInputElement | null)[]>([]);
  // A programmatic focus fires onFocus before React re-renders with the new
  // value, so the focus handler reads the latest value from here.
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const focusBox = (index: number) =>
    boxRefs.current[Math.max(0, Math.min(index, length - 1))]?.focus();

  useEffect(() => {
    if (shouldAutoFocus) focusBox(value.length);
    // Mount only: autofocus once, then the user steers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After a check finishes (disabled turns back off), hand focus back to the
  // first empty box so the next attempt starts without a click.
  const wasDisabledRef = useRef(isDisabled);
  useEffect(() => {
    if (wasDisabledRef.current && !isDisabled && shouldAutoFocus) {
      boxRefs.current[Math.min(valueRef.current.length, length - 1)]?.focus();
    }
    wasDisabledRef.current = isDisabled;
  }, [isDisabled, shouldAutoFocus, length]);

  const commit = (next: string, nextIndex: number) => {
    valueRef.current = next;
    if (next !== value) onChange(next);
    focusBox(nextIndex);
    if (next.length === length && value.length < length) onComplete(next);
  };

  const handleChange = (index: number, raw: string) => {
    if (raw === "") {
      commit(value.slice(0, index) + value.slice(index + 1), index);
      return;
    }
    const incoming = digitsOnly(typedText(raw, value[index] ?? ""), length);
    if (incoming === "") return;
    // A whole code (OS autofill into any box) always fills from box 0.
    const start = incoming.length >= length ? 0 : index;
    const written = writeDigits(value, start, incoming, length);
    commit(written.value, written.nextIndex);
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = digitsOnly(event.clipboardData.getData("text"), length);
    if (pasted === "") return;
    const written = writeDigits(value, 0, pasted, length);
    commit(written.value, written.nextIndex);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent) => {
    if (event.key === "Backspace" && value[index] === undefined && index > 0) {
      event.preventDefault();
      commit(value.slice(0, index - 1) + value.slice(index), index - 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusBox(index + 1);
    }
  };

  // The value is a prefix, so a click on a box past its end hands focus to the
  // first empty box; anything else selects its digit so a keystroke replaces
  // it. Tab never lands past the end: only boxes up to the first empty one sit
  // in the tab order (roving tabindex below), so Tab leaves the group.
  const handleFocus = (index: number, box: HTMLInputElement) => {
    const current = valueRef.current;
    if (index > current.length) focusBox(current.length);
    else box.select();
  };

  return (
    <div
      role="group"
      aria-label={label}
      className={styles.group}
      style={{ "--code-length": length } as CSSProperties}
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(node) => {
            boxRefs.current[index] = node;
          }}
          id={index === 0 ? id : undefined}
          className={styles.box}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={length}
          tabIndex={index <= Math.min(value.length, length - 1) ? 0 : -1}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={t("shared:codeInput.digit", {
            index: index + 1,
            total: length,
          })}
          aria-describedby={describedBy}
          aria-invalid={isInvalid}
          aria-required={isRequired}
          disabled={isDisabled}
          value={value[index] ?? ""}
          onChange={(event) => handleChange(index, event.target.value)}
          onPaste={handlePaste}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onFocus={(event) => handleFocus(index, event.currentTarget)}
        />
      ))}
    </div>
  );
}

/** Opt into FormField's a11y wiring, mirroring `Select.formFieldControl`. */
CodeInput.formFieldControl = true;
