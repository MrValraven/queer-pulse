import { useRef, type KeyboardEvent } from "react";

export interface UseRovingRadioGroupOptions {
  /** How many `role="radio"` children the group renders. */
  optionCount: number;
  /** Index of the checked radio, or -1 when nothing is checked yet. */
  checkedIndex: number;
  /** Called with the index the keyboard moved the selection to. */
  onSelect: (index: number) => void;
}

export interface RovingRadioProps<RadioElement extends HTMLElement> {
  ref: (node: RadioElement | null) => void;
  tabIndex: 0 | -1;
  onKeyDown: (event: KeyboardEvent<RadioElement>) => void;
}

export interface RovingRadioGroup<RadioElement extends HTMLElement> {
  /** Spread onto the `role="radio"` element at `index`. */
  getRadioProps: (index: number) => RovingRadioProps<RadioElement>;
}

/**
 * The WAI-ARIA APG radiogroup keyboard contract, for groups whose visual is
 * too particular to go through `RadioCardGroup` (star pickers, option rows
 * that carry their own data attributes, pairs of bespoke decision tiles).
 *
 * The caller keeps ownership of `role="radiogroup"`, its accessible name,
 * `role="radio"`, `aria-checked` and every class; this hook owns only the
 * keyboard model:
 *   - ROVING TABINDEX: only the checked radio (or the first one, when nothing
 *     is checked yet) is in the tab order, so the whole group is exactly one
 *     tab stop; the rest are `tabIndex={-1}`
 *   - Arrow Down/Right and Arrow Up/Left move focus AND selection, wrapping at
 *     both ends; Home/End jump to first/last; Space/Enter select the focused
 *     radio
 *
 * `RadioCardGroup` is built on this hook, so both paths stay one behaviour.
 */
export function useRovingRadioGroup<
  RadioElement extends HTMLElement = HTMLButtonElement,
>({
  optionCount,
  checkedIndex,
  onSelect,
}: UseRovingRadioGroupOptions): RovingRadioGroup<RadioElement> {
  const radioRefs = useRef<(RadioElement | null)[]>([]);

  // Roving-tabindex home: the checked radio, or the first one while nothing is
  // checked, so there is always exactly one tabbable element in the group.
  const tabStopIndex = checkedIndex >= 0 ? checkedIndex : 0;

  const focusAndSelect = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= optionCount) return;
    onSelect(nextIndex);
    radioRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (
    event: KeyboardEvent<RadioElement>,
    currentIndex: number,
  ) => {
    const lastIndex = optionCount - 1;
    if (lastIndex < 0) return;
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

  return {
    getRadioProps: (index: number) => ({
      ref: (node: RadioElement | null) => {
        radioRefs.current[index] = node;
      },
      tabIndex: index === tabStopIndex ? 0 : -1,
      onKeyDown: (event: KeyboardEvent<RadioElement>) =>
        handleKeyDown(event, index),
    }),
  };
}
