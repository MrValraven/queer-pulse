import { useLayoutEffect, type RefObject } from "react";
import { useDirectoryVisitCard } from "./directoryVisitCardContext";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Marks "focus was inside the card, on something with no counterpart to
 *  restore" (the map, whose controls appear only once its style has loaded).
 *  The replacement card focuses its heading instead. */
const FOCUS_THE_HEADING = -1;

/** The card's focusable controls in DOM order, minus the map's. Both copies of
 *  the card render the same controls in the same order, so an index into this
 *  list names the same control in either copy. */
function focusableControlsOf(card: HTMLElement, mapSelector: string) {
  return Array.from(card.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => !element.closest(mapSelector),
  );
}

/**
 * Carries keyboard focus across the visit card's move between columns.
 *
 * Moving the card unmounts one copy and mounts another, and a focused element
 * that leaves the document drops focus to the body: a keyboard user on "Copy
 * address" would be sent back to the top of the page by a window resize. The
 * leaving copy records which of its controls had focus in a layout cleanup,
 * which React runs before it removes the card's DOM; the arriving copy focuses
 * the same control in its own layout effect, in the same commit, so nothing
 * is painted with focus lost.
 *
 * `headingRef` is the fallback target, and `mapSelector` excludes the map's
 * controls from the index (see `FOCUS_THE_HEADING`).
 */
export function useCarryVisitCardFocus(
  cardRef: RefObject<HTMLElement | null>,
  headingRef: RefObject<HTMLElement | null>,
  mapSelector: string,
) {
  const { carriedFocusRef } = useDirectoryVisitCard();

  useLayoutEffect(() => {
    // Captured at mount and read back in the cleanup, so the cleanup does not
    // depend on when React detaches the ref during the unmount.
    const card = cardRef.current;
    const carriedIndex = carriedFocusRef.current;
    if (card && carriedIndex !== null) {
      carriedFocusRef.current = null;
      const target =
        carriedIndex === FOCUS_THE_HEADING
          ? null
          : focusableControlsOf(card, mapSelector)[carriedIndex];
      (target ?? headingRef.current)?.focus();
    }
    return () => {
      const activeElement = document.activeElement;
      if (!card || !(activeElement instanceof HTMLElement)) return;
      if (!card.contains(activeElement)) return;
      const index = focusableControlsOf(card, mapSelector).indexOf(
        activeElement,
      );
      carriedFocusRef.current = index === -1 ? FOCUS_THE_HEADING : index;
    };
  }, [cardRef, headingRef, carriedFocusRef, mapSelector]);
}
