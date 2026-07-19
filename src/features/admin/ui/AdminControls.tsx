import { type ReactNode } from "react";
import { FiCheck } from "react-icons/fi";
import styles from "./adminUi.module.css";

export interface AdminSegOption {
  value: string;
  /** Already-resolved display label — call sites pass `t(labelKey)`. */
  label: string;
}

/**
 * Segmented pill control — one value selected at a time. `options` carry a
 * stable canonical `value` (never translated — it's what call sites persist
 * or compare against) alongside a pre-resolved `label` for display, so a
 * language switch never corrupts stored state (spec: label-key indirection).
 */
export function AdminSeg({
  options,
  value,
  onChange,
}: {
  options: AdminSegOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={styles.seg} role="group">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          className={[styles.segBtn, value === o.value && styles.segOn]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Switch toggle. `disabled` is for a setting the platform has no backing
 *  data for yet — greyed out and inert, rather than silently rendering as
 *  "off" and claiming a state nobody actually knows. */
export function AdminToggle({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      aria-label={label}
      disabled={disabled}
      className={[
        styles.toggle,
        checked && styles.toggleOn,
        disabled && styles.toggleDisabled,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => {
        if (!disabled) onChange(!checked);
      }}
    >
      <span className={styles.toggleKnob} aria-hidden />
    </button>
  );
}

/** Selectable check-line — a checkbox row with a title + sub. */
export function AdminCheckLine({
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
