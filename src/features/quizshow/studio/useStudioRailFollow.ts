import { useEffect, useRef, type RefObject } from "react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import {
  STUDIO_QUIZ_ROW_ATTRIBUTE,
  STUDIO_ROUND_HEADER_ATTRIBUTE,
} from "./quizshowStudioDom";
import type { QuizshowStudioSelection } from "./quizshowStudioSelection";
import { STUDIO_THUMBNAIL_ATTRIBUTE } from "./useStudioShortcuts";

/** The space kept between a scrolled-to item and the rail's edge, in px. */
const EDGE_GAP_PX = 12;

function selectorOf(selection: QuizshowStudioSelection): string {
  if (selection.kind === "quiz") return `[${STUDIO_QUIZ_ROW_ATTRIBUTE}]`;
  if (selection.kind === "round") {
    return `[${STUDIO_ROUND_HEADER_ATTRIBUTE}][data-round-index="${selection.roundIndex}"]`;
  }
  return `[${STUDIO_THUMBNAIL_ATTRIBUTE}][data-round-index="${selection.roundIndex}"][data-question-index="${selection.questionIndex}"]`;
}

/** How far the rail must scroll along one axis to show `start`..`end` inside `min`..`max`. */
function scrollDeltaOf(start: number, end: number, min: number, max: number) {
  if (start < min + EDGE_GAP_PX) return start - min - EDGE_GAP_PX;
  if (end > max - EDGE_GAP_PX) return end - max + EDGE_GAP_PX;
  return 0;
}

/**
 * Scrolls the rail itself, and nothing around it, until `element` shows:
 * `scrollIntoView` would also scroll the page on a phone, where the page
 * scrolls too. Works for the column (vertical) and the filmstrip (sideways).
 */
function scrollRailTo(
  rail: HTMLElement,
  element: HTMLElement,
  isSmooth: boolean,
) {
  const railBox = rail.getBoundingClientRect();
  const box = element.getBoundingClientRect();
  const top = scrollDeltaOf(box.top, box.bottom, railBox.top, railBox.bottom);
  const left = scrollDeltaOf(box.left, box.right, railBox.left, railBox.right);
  if (top === 0 && left === 0) return;
  rail.scrollTo({
    top: rail.scrollTop + top,
    left: rail.scrollLeft + left,
    behavior: isSmooth ? "smooth" : "auto",
  });
}

/**
 * Keeps the selected item in view as the selection moves (arrows, N, a
 * problem picked in the top bar), and carries focus along with it while focus
 * is in the rail, so the arrow keys walk the rail like a list. Call
 * `skipNextScroll()` before a selection that must not move the rail (a
 * right-click on a half-shown slide, whose menu would close on the scroll).
 */
export function useStudioRailFollow(
  railRef: RefObject<HTMLElement | null>,
  selection: QuizshowStudioSelection,
): { skipNextScroll: () => void } {
  const { reducedMotion } = useMotionPrefs();
  const isScrollSkippedRef = useRef(false);
  const target = selectorOf(selection);
  useEffect(() => {
    const rail = railRef.current;
    const element = rail?.querySelector<HTMLElement>(target);
    const isSkipped = isScrollSkippedRef.current;
    isScrollSkippedRef.current = false;
    if (!rail || !element) return;
    if (!isSkipped) scrollRailTo(rail, element, !reducedMotion);
    const active = document.activeElement;
    if (
      active instanceof HTMLElement &&
      rail.contains(active) &&
      active !== element &&
      !isSkipped
    ) {
      element.focus({ preventScroll: true });
    }
  }, [railRef, target, reducedMotion]);
  return {
    skipNextScroll: () => {
      isScrollSkippedRef.current = true;
    },
  };
}
