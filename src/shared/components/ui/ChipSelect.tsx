import { type ReactNode } from "react";
import { FiCheck } from "react-icons/fi";
import styles from "./ChipSelect.module.css";

export interface ChipOption {
  value: string;
  label?: ReactNode;
  /** Availability count shown as a trailing badge (`ChipSelect` only). `0`
   *  renders the chip dimmed and unpickable — unless it is already selected,
   *  which must always stay clickable or a member could trap themselves in a
   *  filter they cannot undo. */
  count?: number;
  /** Accessible name for the chip. Required alongside `count`: the badge is
   *  `aria-hidden`, so without this a screen reader hears the bare label and
   *  loses the number entirely (and with the badge exposed it would hear
   *  "Design 12", which reads as a quantity of Designs). */
  ariaLabel?: string;
}

/** Active-chip colour: plum fill (default) or jade tint. */
export type ChipTone = "plum" | "jade";
/** Surface the chips sit on: light cream pages (default) or dark/plum surfaces. */
export type ChipTint = "light" | "dark";

function normalize(options: readonly (string | ChipOption)[]): ChipOption[] {
  return options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : { label: o.value, ...o },
  );
}

function chipClass(on: boolean, tone: ChipTone, tint: ChipTint) {
  return [
    styles.chip,
    tint === "dark" && styles.dark,
    tone === "jade" && styles.tone_jade,
    on && styles.chipOn,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Naming the `role="group"`. A group with no accessible name is announced as a
 * bare "group", so a screen-reader user hears the chips but not what they
 * filter. Prefer `labelledBy` pointing at the heading/label already on screen
 * over `label`, which duplicates that text into the accessibility tree.
 */
interface ChipGroupLabelling {
  /** Accessible name for the chip group, when nothing visible labels it. */
  label?: string;
  /** `id` of the visible heading/label that names this group. Wins over `label`. */
  labelledBy?: string;
}

interface FilterChipsProps extends ChipGroupLabelling {
  options: readonly (string | ChipOption)[];
  value: string;
  onChange: (value: string) => void;
  tone?: ChipTone;
  tint?: ChipTint;
  className?: string;
}

/**
 * Single-select chip row (one active value at a time) — the interactive
 * filter/segment pattern reimplemented across cinema, communities, marketing,
 * resources… `aria-pressed` reflects the active chip. No tick (single-select).
 */
export function FilterChips({
  options,
  value,
  onChange,
  tone = "plum",
  tint = "light",
  className,
  label,
  labelledBy,
}: FilterChipsProps) {
  return (
    <div
      className={[styles.row, className].filter(Boolean).join(" ")}
      role="group"
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
    >
      {normalize(options).map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          className={chipClass(value === o.value, tone, tint)}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

interface ChipSelectProps extends ChipGroupLabelling {
  options: readonly (string | ChipOption)[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  /** Show a leading tick on selected chips (default true). Set false to match tick-less designs. */
  tick?: boolean;
  tone?: ChipTone;
  tint?: ChipTint;
  className?: string;
}

/**
 * Multi-select chip row backed by a `Set`. Selected chips show a tick by
 * default. Pair with `useChipSet` for the state.
 */
export function ChipSelect({
  options,
  selected,
  onToggle,
  tick = true,
  tone = "plum",
  tint = "light",
  className,
  label,
  labelledBy,
}: ChipSelectProps) {
  return (
    <div
      className={[styles.row, className].filter(Boolean).join(" ")}
      role="group"
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
    >
      {normalize(options).map((o) => {
        const on = selected.has(o.value);
        // Nobody left to find under this chip. Disabled rather than merely
        // dimmed, so the affordance matches the outcome — but never while it
        // is selected, or unticking it would be impossible.
        const isUnavailable = o.count === 0 && !on;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            aria-label={o.ariaLabel}
            disabled={isUnavailable}
            className={[
              chipClass(on, tone, tint),
              isUnavailable && styles.chipEmpty,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onToggle(o.value)}
          >
            {tick && on && <FiCheck aria-hidden />}
            {o.label}
            {o.count !== undefined && (
              <span className={styles.chipCount} aria-hidden>
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
