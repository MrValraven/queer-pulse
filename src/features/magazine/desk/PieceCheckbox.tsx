import { useEffect, useRef } from "react";
import { FiCheck, FiMinus } from "react-icons/fi";
import { cx } from "../../../shared/lib/cx";
import styles from "./PieceCheckbox.module.css";

export interface PieceCheckboxProps {
  checked: boolean;
  /** Some but not all rows chosen (the select-all box only). */
  isIndeterminate?: boolean;
  /** The accessible name; the box has no visible label of its own. */
  label: string;
  onChange: () => void;
  className?: string;
}

/**
 * A native checkbox drawn in the desk's style, used by each pipeline row and
 * by the table's select-all. The input keeps its role, state, Space key and
 * name; only its box is repainted, with a Feather check (or a dash, when some
 * rows are chosen) laid over it.
 */
export function PieceCheckbox({
  checked,
  isIndeterminate = false,
  label,
  onChange,
  className,
}: PieceCheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // `indeterminate` exists only as a DOM property, with no HTML attribute.
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = isIndeterminate;
  }, [isIndeterminate]);

  return (
    <span className={cx(styles.wrap, className)}>
      <input
        ref={inputRef}
        type="checkbox"
        className={styles.input}
        checked={checked}
        aria-label={label}
        onChange={onChange}
      />
      {/* The input sits invisibly over this box, a few pixels larger than
          it, so the hit area reaches 24px while the box draws at 18px. */}
      <span aria-hidden="true" className={styles.box}>
        {isIndeterminate && !checked ? (
          <FiMinus className={styles.mark} />
        ) : (
          <FiCheck className={styles.mark} />
        )}
      </span>
    </span>
  );
}
