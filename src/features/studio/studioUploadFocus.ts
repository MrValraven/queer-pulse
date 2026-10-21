import { useEffect, useRef, type RefObject } from "react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";

/** Room left above a summary scrolled to the top, on top of the page's own
 *  scroll-padding (which already clears the sticky creator header). */
const SUMMARY_BREATHING_ROOM = 16;

/** Moves focus to a field by id and scrolls it into view. Returns whether
 *  the field was on the page. The upload flow's error summary and publish
 *  checklist link to fields this way, and their links fall back to the
 *  plain `#id` jump when the field is not rendered yet.
 *
 *  Focus never scrolls by itself (`preventScroll`): the scroll waits a
 *  frame, so a summary Collapse that has just mounted is in the layout.
 *  With `summary`, the summary goes to the top of the screen when the field
 *  still fits under it, so the member sees what went wrong and where;
 *  otherwise the field is centred. */
export function focusFieldById(
  fieldId: string,
  summary?: { wrap: HTMLElement | null; content: HTMLElement | null },
): boolean {
  const field = document.getElementById(fieldId);
  if (!field) return false;
  field.focus({ preventScroll: true });
  requestAnimationFrame(() => {
    const wrap = summary?.wrap;
    if (wrap && fitsUnderSummary(field, wrap, summary.content)) {
      wrap.scrollIntoView?.({ block: "start" });
      return;
    }
    field.scrollIntoView?.({ block: "center" });
  });
  return true;
}

/** Whether the field stays on screen once the summary above it has opened
 *  in full and sits at the top. The summary's content already has its full
 *  height while its Collapse is still growing. */
function fitsUnderSummary(
  field: HTMLElement,
  wrap: HTMLElement,
  content: HTMLElement | null,
): boolean {
  const wrapBox = wrap.getBoundingClientRect();
  const growth = Math.max(0, (content?.offsetHeight ?? 0) - wrapBox.height);
  const fieldBottom = field.getBoundingClientRect().bottom + growth;
  const topClearance =
    parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) ||
    0;
  return (
    fieldBottom - wrapBox.top + topClearance + SUMMARY_BREATHING_ROOM <=
    window.innerHeight
  );
}

/**
 * A step change in the upload flow keeps the member oriented. When the
 * press that changed it left focus nowhere (its button unmounted with the
 * old step), focus lands on the new step's heading, and the stepper comes
 * into view, so a Continue at the foot of a long form never strands them
 * at the bottom of the next step. A move that already placed focus inside
 * the step (a publish check's link focusing its field) is left alone.
 */
export function useUploadStepFocus(
  stepId: string | undefined,
  stepperRef: RefObject<HTMLElement | null>,
  headingRef: RefObject<HTMLElement | null>,
  stepBodyRef: RefObject<HTMLElement | null>,
) {
  const { reducedMotion } = useMotionPrefs();
  const lastStepRef = useRef(stepId);
  useEffect(() => {
    if (lastStepRef.current === stepId) return;
    lastStepRef.current = stepId;
    const frame = requestAnimationFrame(() => {
      const active = document.activeElement;
      const hasDroppedFocus =
        !active || active === document.body || !active.isConnected;
      if (!hasDroppedFocus && stepBodyRef.current?.contains(active)) return;
      stepperRef.current?.scrollIntoView?.({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "nearest",
      });
      if (hasDroppedFocus) headingRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [stepId, reducedMotion, stepperRef, headingRef, stepBodyRef]);
}
