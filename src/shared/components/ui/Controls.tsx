import { type ReactNode } from "react";
import { FiCheck } from "react-icons/fi";
import styles from "./Controls.module.css";

/** One segment: a bare `value` string, or an object carrying a display label
 *  and/or a leading icon. */
export interface SegmentOption {
  value: string;
  /** Visible label. Defaults to `value` when omitted. */
  label?: ReactNode;
  /** Leading icon rendered before the label. */
  icon?: ReactNode;
}

function normalizeSegments(
  options: readonly (string | SegmentOption)[],
): SegmentOption[] {
  return options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );
}

/** Segmented pill control — one value selected at a time. Options may be plain
 *  strings, or objects with an icon + label (e.g. a List/Map view switcher). */
export function SegmentedControl({
  options,
  value,
  onChange,
  fullWidth = false,
  className,
  disabledOptions,
  label,
}: {
  options: readonly (string | SegmentOption)[];
  value: string;
  onChange: (value: string) => void;
  /** Stretch segments to fill the row (rounded-rect tray) instead of a content-width pill. */
  fullWidth?: boolean;
  className?: string;
  /** Options that render dimmed + non-interactive (native `disabled`). Omit for
   *  the common all-enabled case; existing callers are unaffected. */
  disabledOptions?: string[];
  /** Accessible name for the group — a bare `role="group"` is announced without
   *  a purpose. Omit only when a visible heading already names the control. */
  label?: string;
}) {
  const segments = normalizeSegments(options);
  return (
    <div
      className={[styles.seg, fullWidth && styles.segFull, className]
        .filter(Boolean)
        .join(" ")}
      role="group"
      aria-label={label}
    >
      {segments.map((segment) => {
        const isDisabled = disabledOptions?.includes(segment.value) ?? false;
        return (
          <button
            key={segment.value}
            type="button"
            aria-pressed={value === segment.value}
            disabled={isDisabled}
            className={[styles.segBtn, value === segment.value && styles.segOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => {
              if (!isDisabled) onChange(segment.value);
            }}
          >
            {segment.icon && (
              <span className={styles.segIcon} aria-hidden>
                {segment.icon}
              </span>
            )}
            {segment.label ?? segment.value}
          </button>
        );
      })}
    </div>
  );
}

/** Switch toggle (`role="switch"`). */
export function Toggle({
  checked,
  onChange,
  label,
  tone = "jade",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  /** On-state colour: jade (default) or coral. */
  tone?: "jade" | "coral";
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={[
        styles.toggle,
        checked && styles.toggleOn,
        tone === "coral" && styles.toggle_coral,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.toggleKnob} aria-hidden />
    </button>
  );
}

/** Selectable check-line — a checkbox row with a title + optional sub. */
export function CheckLine({
  checked,
  onChange,
  title,
  sub,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      className={[styles.checkLine, checked && styles.checkLineOn]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.checkBox} aria-hidden>
        {checked && <FiCheck />}
      </span>
      <span className={styles.checkTx}>
        <span className={styles.checkTitle}>{title}</span>
        {sub && <span className={styles.checkSub}>{sub}</span>}
      </span>
    </button>
  );
}
