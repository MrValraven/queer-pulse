import { FiCheck } from "react-icons/fi";
import styles from "./PostJobPage.module.css";

/** A labelled toggle switch row (used for hide-pay, barter, etc.). */
export function SwitchRow({
  on,
  onToggle,
  name,
  description,
}: {
  on: boolean;
  onToggle: () => void;
  name: string;
  description: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className={styles.switchRow}
      onClick={onToggle}
    >
      <span
        className={[styles.switch, on && styles.switchOn]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
      />
      <span>
        <span className={styles.switchName}>{name}</span>
        <span className={styles.switchDesc}>{description}</span>
      </span>
    </button>
  );
}

/** A multi-select grid of check options (benefits, inclusivity signals). */
export function CheckGrid({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className={styles.checkGrid}>
      {options.map((opt) => {
        const on = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            role="checkbox"
            aria-checked={on}
            className={[styles.checkOpt, on && styles.checkOptSel]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onToggle(opt)}
          >
            <span className={styles.checkBox} aria-hidden>
              <FiCheck />
            </span>
            <span>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
