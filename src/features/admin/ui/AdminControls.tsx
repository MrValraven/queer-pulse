import { type ReactNode } from "react";
import { FiCheck } from "react-icons/fi";
import styles from "./adminUi.module.css";

/** Segmented pill control — one value selected at a time. */
export function AdminSeg({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={styles.seg} role="group">
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

/** Switch toggle. */
export function AdminToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={[styles.toggle, checked && styles.toggleOn]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onChange(!checked)}
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
