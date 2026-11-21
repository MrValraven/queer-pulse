import { useEffect, useRef } from "react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import {
  EDIT_FIELD_FOCUSABLE_SELECTOR,
  editCommunityFieldId,
  type EditCommunityFocusField,
} from "./editCommunityFocusField";

/**
 * Scrolls the edit modal to the named field and focuses its first control.
 *
 * The work waits one animation frame. `Modal` gives the dialog its initial
 * focus in its own effect, and a child's effects run before its parent's, so
 * this frame always lands after that first focus and wins over it. With no
 * field named the hook does nothing, and the modal keeps its default focus.
 */
export function useFocusEditFieldOnOpen(
  focusField: EditCommunityFocusField | undefined,
): void {
  const { reducedMotion } = useMotionPrefs();
  // Read once at open: a motion setting changed while the modal is up has no
  // scroll left to affect, and re-running the effect would steal focus again.
  const isReducedMotionAtOpen = useRef(reducedMotion);

  useEffect(() => {
    if (!focusField) return;
    const frameId = requestAnimationFrame(() => {
      const fieldElement = document.getElementById(
        editCommunityFieldId(focusField),
      );
      if (!fieldElement) return;
      fieldElement.scrollIntoView({
        block: "center",
        behavior: isReducedMotionAtOpen.current ? "auto" : "smooth",
      });
      fieldElement
        .querySelector<HTMLElement>(EDIT_FIELD_FOCUSABLE_SELECTOR)
        ?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frameId);
  }, [focusField]);
}
