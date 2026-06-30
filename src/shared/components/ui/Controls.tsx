import { type ReactNode } from "react";
import { FiCheck } from "react-icons/fi";
import styles from "./Controls.module.css";

/** Segmented pill control — one value selected at a time. */
export function SegmentedControl({
  options,
  value,
  onChange,
  fullWidth = false,
  className,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  /** Stretch segments to fill the row (rounded-rect tray) instead of a content-width pill. */
  fullWidth?: boolean;
  className?: string;
}) {
  return (
    <div
      className={[styles.seg, fullWidth && styles.segFull, className]
        .filter(Boolean)
        .join(" ")}
      role="group"
    >
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          className={[styles.segBtn, value === o && styles.segOn]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onChange(o)}
        >
          {o}
        </button>
      ))}
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
