import { useEffect, useRef, type RefObject, type TransitionEvent } from "react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";

/** Slack added to the stylesheet's transition time before the timeout
 *  fallback unmounts a menu whose `transitionend` never arrived. */
const EXIT_SLACK_MS = 80;

/** The longest transition the element declares, in milliseconds. Zero when
 *  none is declared (reduced motion in the stylesheet, or no stylesheet). */
function readTransitionMs(element: HTMLElement): number {
  const durations = window.getComputedStyle(element).transitionDuration;
  return durations.split(",").reduce((longest, duration) => {
    const trimmed = duration.trim();
    const amount = Number.parseFloat(trimmed);
    if (Number.isNaN(amount)) return longest;
    return Math.max(longest, trimmed.endsWith("ms") ? amount : amount * 1000);
  }, 0);
}

/**
 * The exit half of the `DeskMenu` fade. Once `isOpen` turns false the menu
 * stays mounted while its opacity and translate transition back, then
 * `onExited` unmounts it: on the opacity `transitionend`, or on a timeout
 * sized from the stylesheet when that event never comes (a hidden tab, a
 * cancelled transition). Reduced motion, either the in-app flag or the
 * stylesheet's own opt-out, unmounts at once.
 */
export function useDeskMenuExit(
  menuRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  onExited: () => void,
): { handleTransitionEnd: (event: TransitionEvent<HTMLElement>) => void } {
  const { reducedMotion } = useMotionPrefs();
  const onExitedRef = useRef(onExited);
  const fallbackTimeoutRef = useRef(0);
  useEffect(() => {
    onExitedRef.current = onExited;
  });

  useEffect(() => {
    if (isOpen) return undefined;
    const menu = menuRef.current;
    const transitionMs = menu && !reducedMotion ? readTransitionMs(menu) : 0;
    if (transitionMs === 0) {
      onExitedRef.current();
      return undefined;
    }
    fallbackTimeoutRef.current = window.setTimeout(
      () => onExitedRef.current(),
      transitionMs + EXIT_SLACK_MS,
    );
    return () => window.clearTimeout(fallbackTimeoutRef.current);
  }, [isOpen, menuRef, reducedMotion]);

  function handleTransitionEnd(event: TransitionEvent<HTMLElement>): void {
    if (isOpen || event.target !== event.currentTarget) return;
    if (event.propertyName !== "opacity") return;
    window.clearTimeout(fallbackTimeoutRef.current);
    onExitedRef.current();
  }

  return { handleTransitionEnd };
}
