import { useRef, type KeyboardEvent, type ReactNode } from "react";
import styles from "./RadioCardGroup.module.css";

export interface RadioCardOption<OptionId extends string> {
  /** Stable option id — the value passed back through `onChange`. */
  id: OptionId;
  /** Whatever should render inside this option's card (icon + title + desc,
   *  a leading tag/badge, a price symbol + label, …). The caller owns the
   *  look; the primitive only owns radiogroup semantics + keyboard nav. */
  render: ReactNode;
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
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedIndex = options.findIndex((option) => option.id === value);
  // Roving-tabindex home: the selected option, or the first option when
  // nothing is selected yet — so the group is always exactly one tab stop.
  const tabStopIndex = selectedIndex >= 0 ? selectedIndex : 0;

  const focusAndSelect = (nextIndex: number) => {
    const nextOption = options[nextIndex];
    if (!nextOption) return;
    onChange(nextOption.id);
    buttonRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    const lastIndex = options.length - 1;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        event.preventDefault();
        focusAndSelect(currentIndex === lastIndex ? 0 : currentIndex + 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        event.preventDefault();
        focusAndSelect(currentIndex === 0 ? lastIndex : currentIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        focusAndSelect(0);
        break;
      case "End":
        event.preventDefault();
        focusAndSelect(lastIndex);
        break;
      case " ":
      case "Enter":
        event.preventDefault();
        focusAndSelect(currentIndex);
        break;
      default:
        break;
    }
  };

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
        return (
          <button
            key={option.id}
            ref={(node) => {
              buttonRefs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={index === tabStopIndex ? 0 : -1}
            data-checked={checked || undefined}
            className={[
              styles.option,
              optionClassName,
              checked && checkedClassName,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(option.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {option.render}
          </button>
        );
      })}
    </div>
  );
}
