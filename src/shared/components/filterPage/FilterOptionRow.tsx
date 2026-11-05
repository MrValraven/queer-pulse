import type { ReactNode } from "react";
import { RollingNumber } from "../ui/RollingNumber";
import { useFormat } from "../../i18n/format";
import styles from "./FilterPage.module.css";

interface FilterOptionRowProps {
  /** A checkbox for a multi-pick group, a radio for a pick-one group. */
  type: "checkbox" | "radio";
  /** The radio group's shared name. Every radio row in one section must
   *  pass the same `name`. */
  name?: string;
  /** The input's value, for a radio group read as a form. */
  value?: string;
  label: ReactNode;
  isChecked: boolean;
  /** A dead end (nobody left under this option): the row dims and the input
   *  is disabled. Never disable a checked row, or the member cannot undo it. */
  isDisabled?: boolean;
  /** The option's availability count, drawn as a quiet number at the row's
   *  end. Leave it undefined when there is no count: a missing count must
   *  never be drawn as a zero. */
  count?: number;
  /** The count describes the previous filter run while a new one loads, so
   *  it dims for the moment. */
  isCountStale?: boolean;
  /** The full phrase for assistive tech, such as "Mentoring, 7 members".
   *  The visible label and count are then decorative. Defaults to the
   *  visible label. */
  ariaLabel?: string;
  onChange: () => void;
}

/** One option row inside a `FilterSection`: a checkbox or radio, its label,
 *  and an optional availability count. A page maps its options to these
 *  rows as the section's body. */
export function FilterOptionRow({
  type,
  name,
  value,
  label,
  isChecked,
  isDisabled = false,
  count,
  isCountStale = false,
  ariaLabel,
  onChange,
}: FilterOptionRowProps) {
  const fmt = useFormat();
  return (
    <label
      className={[
        styles.filterRow,
        isDisabled && styles.filterRowEmpty,
        isCountStale && styles.filterRowStale,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        type={type}
        name={name}
        value={value}
        checked={isChecked}
        disabled={isDisabled}
        aria-label={ariaLabel}
        onChange={onChange}
      />
      {label}
      {count !== undefined && (
        <span
          className={[styles.ct, isCountStale && styles.ctStale]
            .filter(Boolean)
            .join(" ")}
          aria-hidden
        >
          <RollingNumber value={fmt.number(count)} numericValue={count} />
        </span>
      )}
    </label>
  );
}
