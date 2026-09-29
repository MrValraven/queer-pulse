/**
 * Focus follows the pitch in the triage overlay, so each new title is read
 * out as it arrives. The Modal puts focus on the heading when it opens; this
 * hook covers every move after that (a step with the arrows, an answered
 * pitch sliding out, the queue running empty). Focus sitting in a dialog
 * stacked on top, such as the pass note, is left where it is.
 */

import { useEffect, useRef, type RefObject } from "react";

export interface UsePitchTriageFocusParams {
  /** The heading to focus: the current pitch's title, or the done title. */
  headingRef: RefObject<HTMLHeadingElement | null>;
  /** Changes whenever a different heading should take focus. */
  focusKey: string | null;
  /** Off in list mode, where the editor's place in the checklist matters more. */
  isEnabled: boolean;
}

export function usePitchTriageFocus({
  headingRef,
  focusKey,
  isEnabled,
}: UsePitchTriageFocusParams): void {
  const previousFocusKeyRef = useRef(focusKey);

  useEffect(() => {
    if (previousFocusKeyRef.current === focusKey) return;
    previousFocusKeyRef.current = focusKey;
    if (!isEnabled) return;
    const heading = headingRef.current;
    const dialog = heading?.closest('[role="dialog"]');
    const activeElement = document.activeElement;
    const isFocusWithTriage =
      activeElement === null ||
      activeElement === document.body ||
      (dialog?.contains(activeElement) ?? false);
    if (heading && isFocusWithTriage) heading.focus();
  }, [focusKey, isEnabled, headingRef]);
}
