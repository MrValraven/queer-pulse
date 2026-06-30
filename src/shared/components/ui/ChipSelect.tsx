import { useState, type ReactNode } from "react";
import { FiCheck } from "react-icons/fi";
import styles from "./ChipSelect.module.css";

export interface ChipOption {
  value: string;
  label?: ReactNode;
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

interface FilterChipsProps {
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
}: FilterChipsProps) {
  return (
    <div
      className={[styles.row, className].filter(Boolean).join(" ")}
      role="group"
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

interface ChipSelectProps {
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
}: ChipSelectProps) {
  return (
    <div
      className={[styles.row, className].filter(Boolean).join(" ")}
      role="group"
    >
      {normalize(options).map((o) => {
        const on = selected.has(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            className={chipClass(on, tone, tint)}
            onClick={() => onToggle(o.value)}
          >
            {tick && on && <FiCheck aria-hidden />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Set-backed selection state for `<ChipSelect>`. */
export function useChipSet(initial: readonly string[] = []) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(initial));
  const toggle = (value: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  return { selected, toggle, setSelected };
}
