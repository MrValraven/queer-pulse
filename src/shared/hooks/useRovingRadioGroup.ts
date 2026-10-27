import { useRef, type KeyboardEvent } from "react";

export interface UseRovingRadioGroupOptions {
  /** How many `role="radio"` children the group renders. */
  optionCount: number;
  /** Index of the checked radio, or -1 when nothing is checked yet. */
  checkedIndex: number;
  /** Called with the index the keyboard moved the selection to. */
  onSelect: (index: number) => void;
  /** Optional: true for an index the keyboard must pass over. Arrow, Home
   *  and End movement skip it (still wrapping) and Space/Enter on it does
   *  nothing. Left out, every option is reachable. */
  isOptionDisabled?: (index: number) => boolean;
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
 *   - DISABLED OPTIONS (only when `isOptionDisabled` is passed): movement
 *     skips them and Space/Enter on one is ignored. They stay focusable, so
 *     the caller keeps them in the DOM with `aria-disabled` and a reason a
 *     screen reader can still reach
 *
 * `RadioCardGroup` is built on this hook, so both paths stay one behaviour.
 */
export function useRovingRadioGroup<
  RadioElement extends HTMLElement = HTMLButtonElement,
>({
  optionCount,
  checkedIndex,
  onSelect,
  isOptionDisabled,
}: UseRovingRadioGroupOptions): RovingRadioGroup<RadioElement> {
  const radioRefs = useRef<(RadioElement | null)[]>([]);

  const isDisabledAt = (index: number) => isOptionDisabled?.(index) ?? false;

  // From `startIndex`, steps by `step` (wrapping) until it lands on an enabled
  // index. Returns -1 when every option is disabled. With no
  // `isOptionDisabled` the first step always lands, so this is the plain
  // wrap-around move.
  const findEnabledIndex = (startIndex: number, step: 1 | -1) => {
    for (let attempt = 0; attempt < optionCount; attempt += 1) {
      const candidateIndex =
        (((startIndex + step * attempt) % optionCount) + optionCount) %
        optionCount;
      if (!isDisabledAt(candidateIndex)) return candidateIndex;
    }
    return -1;
  };

  // Roving-tabindex home: the checked radio (even a disabled one, so it reads
  // as checked), or the first enabled one while nothing is checked, so there
  // is always exactly one tabbable element in the group.
  const firstEnabledIndex = optionCount > 0 ? findEnabledIndex(0, 1) : -1;
  const tabStopIndex =
    checkedIndex >= 0 ? checkedIndex : Math.max(firstEnabledIndex, 0);

  const focusAndSelect = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= optionCount) return;
    if (isDisabledAt(nextIndex)) return;
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
        focusAndSelect(
          findEnabledIndex(
            currentIndex === lastIndex ? 0 : currentIndex + 1,
            1,
          ),
        );
        break;
      case "ArrowUp":
      case "ArrowLeft":
        event.preventDefault();
        focusAndSelect(
          findEnabledIndex(
            currentIndex === 0 ? lastIndex : currentIndex - 1,
            -1,
          ),
        );
        break;
      case "Home":
        event.preventDefault();
        focusAndSelect(findEnabledIndex(0, 1));
        break;
      case "End":
        event.preventDefault();
        focusAndSelect(findEnabledIndex(lastIndex, -1));
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
