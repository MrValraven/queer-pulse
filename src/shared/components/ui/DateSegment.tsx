/**
 * One editable part of a `DateField` (day, month, year, hour, minute, or
 * meridiem) — a focusable `role="spinbutton"` `<div>`, matching React Aria's
 * segmented date-field model rather than a native `<input>`. All keyboard
 * behavior (arrows, digits, backspace) lives in `DateField`, which owns the
 * cross-segment state; this component is a thin, controlled presentational
 * layer with an always-present accessible name.
 */

import { forwardRef, type KeyboardEvent } from "react";
import styles from "./DateField.module.css";

export interface DateSegmentProps {
  /** Accessible name, e.g. "Day" / "Dia". */
  label: string;
  /** Displayed text once the segment has a value (zero-padded, or "AM"/"PM"). */
  text: string | null;
  /** The segment's numeric value for `aria-valuenow` (`null` while empty). */
  value: number | null;
  min: number;
  max: number;
  /** Localized placeholder token shown until the segment has a value. */
  placeholder: string;
  disabled?: boolean;
  /** Mirrors `DateField`'s injected `aria-describedby` (FormField helper/error text). */
  ariaDescribedBy?: string;
  /** Unified visual + ARIA invalid state, already resolved by `DateField`. */
  invalid?: boolean;
  /** Mirrors `DateField`'s injected `aria-required` (FormField's required wiring). */
  required?: boolean;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}

export const DateSegment = forwardRef<HTMLDivElement, DateSegmentProps>(function DateSegment(
  {
    label,
    text,
    value,
    min,
    max,
    placeholder,
    disabled = false,
    ariaDescribedBy,
    invalid = false,
    required = false,
    onKeyDown,
  },
  ref,
) {
  const isEmpty = value === null;
  return (
    <div
      ref={ref}
      role="spinbutton"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={isEmpty ? undefined : value}
      aria-valuetext={isEmpty ? placeholder : (text ?? placeholder)}
      aria-disabled={disabled || undefined}
      aria-describedby={ariaDescribedBy}
      aria-invalid={invalid || undefined}
      aria-required={required || undefined}
      inputMode="numeric"
      className={[styles.segment, isEmpty && styles.segmentEmpty].filter(Boolean).join(" ")}
      onKeyDown={onKeyDown}
    >
      {isEmpty ? placeholder : text}
    </div>
  );
});
