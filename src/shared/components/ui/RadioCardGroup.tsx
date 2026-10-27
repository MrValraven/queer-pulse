import type { ReactNode } from "react";
import { useRovingRadioGroup } from "../../hooks/useRovingRadioGroup";
import styles from "./RadioCardGroup.module.css";

export interface RadioCardOption<OptionId extends string> {
  /** Stable option id — the value passed back through `onChange`. */
  id: OptionId;
  /** Whatever should render inside this option's card (icon + title + desc,
   *  a leading tag/badge, a price symbol + label, …). The caller owns the
   *  look; the primitive only owns radiogroup semantics + keyboard nav. */
  render: ReactNode;
  /** Optional: the option shows but cannot be picked. It renders
   *  `aria-disabled="true"` and `data-disabled`, ignores clicks and is
   *  skipped by arrow, Home and End movement. It stays a focusable button
   *  without the native `disabled` attribute, so a screen reader can still
   *  reach it and read why (put the reason in `render`). A disabled option
   *  that is the current `value` still shows as checked. */
  isDisabled?: boolean;
}

export interface RadioCardGroupProps<OptionId extends string> {
  /** The currently selected id (or "" when nothing is selected yet). */
  value: OptionId | "";
  /** Called with the newly selected id on click, Space/Enter, or arrow move. */
  onChange: (id: OptionId) => void;
  options: RadioCardOption<OptionId>[];
  /** Accessible name for the `role="radiogroup"` container. Ignored when
   *  `ariaLabelledBy` is also passed (still required as a fallback / for
   *  callers with no visible label element of their own). */
  ariaLabel: string;
  /** id of a visible label element the caller already renders (e.g. a
   *  heading or a `.label` div) — associates it via `aria-labelledby`
   *  instead of the caller re-stating the same text as a bare `ariaLabel`
   *  string. Takes precedence over `ariaLabel` when set. */
  ariaLabelledBy?: string;
  /** id of a visible description element (e.g. a hint paragraph under the
   *  group's label) to associate via `aria-describedby`. */
  ariaDescribedBy?: string;
  /** Class for the container (pass the existing layout class, e.g. a grid). */
  className?: string;
  /** Base class for every option button (its "off"/resting look). */
  optionClassName?: string;
  /** Class merged onto the selected option (its "on" look). */
  checkedClassName?: string;
  /** Optional inline grid-template-columns override (`repeat(n, 1fr)`). */
  columns?: number;
  /** Forwarded to the container — used for scroll anchors. */
  id?: string;
}

/**
 * Shared, accessible single-select card group following the WAI-ARIA
 * radiogroup pattern:
 *   - container `role="radiogroup"` + `aria-label`
 *   - options `role="radio"` + `aria-checked`
 *   - ROVING TABINDEX: only the selected option (or the first, when none is
 *     selected) is in the tab order; the rest are `tabIndex={-1}`
 *   - Arrow Up/Down/Left/Right move focus AND select the next/previous option,
 *     wrapping at both ends; Home/End jump to first/last; Space/Enter select
 *   - an option with `isDisabled` keeps its place and stays focusable, but
 *     clicks, Space/Enter and arrow movement all pass over it
 *
 * The visual is entirely caller-supplied (via `option.render` plus the
 * pass-through `className` / `optionClassName` / `checkedClassName`), so one
 * primitive reproduces every wizard group's existing look while giving all of
 * them real keyboard + assistive-tech behaviour. Also exposes `data-checked`
 * on the selected option for styling hooks.
 */
export function RadioCardGroup<OptionId extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  className,
  optionClassName,
  checkedClassName,
  columns,
  id,
}: RadioCardGroupProps<OptionId>) {
  const selectedIndex = options.findIndex((option) => option.id === value);
  // Roving tabindex, arrow/Home/End movement and Space/Enter selection all
  // come from the shared hook, so this primitive and the handful of groups
  // whose visuals it cannot carry stay one keyboard behaviour.
  const { getRadioProps } = useRovingRadioGroup<HTMLButtonElement>({
    optionCount: options.length,
    checkedIndex: selectedIndex,
    onSelect: (index) => {
      const nextOption = options[index];
      if (nextOption) onChange(nextOption.id);
    },
    isOptionDisabled: (index) => options[index]?.isDisabled === true,
  });

  return (
    <div
      id={id}
      role="radiogroup"
      aria-label={ariaLabelledBy ? undefined : ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      className={[styles.group, className].filter(Boolean).join(" ")}
      style={
        columns ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : undefined
      }
    >
      {options.map((option, index) => {
        const checked = option.id === value;
        const isOptionDisabled = option.isDisabled === true;
        return (
          <button
            key={option.id}
            {...getRadioProps(index)}
            type="button"
            role="radio"
            aria-checked={checked}
            data-checked={checked || undefined}
            aria-disabled={isOptionDisabled || undefined}
            data-disabled={isOptionDisabled || undefined}
            className={[
              styles.option,
              optionClassName,
              checked && checkedClassName,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => {
              if (!isOptionDisabled) onChange(option.id);
            }}
          >
            {option.render}
          </button>
        );
      })}
    </div>
  );
}
