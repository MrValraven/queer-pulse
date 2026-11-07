import { useEffect, useState, type RefObject } from "react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";

/** Shift and scale the panel eases to on the way out, the mirror of the
 *  shared `qpMenuIn` entrance the date popover already plays. */
const EXIT_OFFSET_PX = 4;
const EXIT_SCALE = 0.98;
/** Added to the token duration before the timeout fallback forces the
 *  unmount, for a browser that never reports the animation as finished. */
const EXIT_FALLBACK_SLACK_MS = 120;
const FALLBACK_DURATION_MS = 150;
const FALLBACK_EASE = "cubic-bezier(0.22, 0.68, 0.16, 1)";

function readDurationMs(): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--dur-fast")
    .trim();
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value)) return FALLBACK_DURATION_MS;
  return raw.endsWith("ms") ? value : value * 1000;
}

function readEase(): string {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--ease")
    .trim();
  return raw === "" ? FALLBACK_EASE : raw;
}

/**
 * Keeps an anchored popover mounted while it fades out. `DatePickerPopover`
 * plays its `qpMenuIn` entrance from CSS, but a bare `{isOpen && …}` removes
 * it in one frame. This hook returns whether the popover should still be in
 * the tree: true while `isOpen`, and for one exit animation after it turns
 * false. The exit runs on the popover's own element through the Web
 * Animations API (opacity, `translateY(-4px)`, `scale(0.98)` over
 * `--dur-fast` on `--ease`), so the shared popover component needs no change.
 *
 * During the exit the panel is `inert`, so it can no longer be clicked,
 * typed into or tabbed to. Reopening mid-exit cancels the animation and
 * hands the panel back. Reduced motion (OS setting or the in-app toggle) and
 * environments without `Element.animate` unmount at once, and a timeout
 * unmounts a panel whose animation never reports finish.
 */
export function useExitingPopover(
  isOpen: boolean,
  popoverRef: RefObject<HTMLElement | null>,
  anchorRef: RefObject<HTMLElement | null>,
): boolean {
  const { reducedMotion } = useMotionPrefs();
  const [wasOpen, setWasOpen] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);

  // Derived during render, so the commit that closes the popover already
  // keeps it mounted instead of flashing it out for one frame.
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    const canAnimate =
      !reducedMotion && typeof Element.prototype.animate === "function";
    setIsExiting(!isOpen && canAnimate);
  }

  useEffect(() => {
    if (!isExiting) return;
    const popover = popoverRef.current;
    if (!popover) return;
    const anchor = anchorRef.current;
    const isFlipped =
      anchor !== null &&
      popover.getBoundingClientRect().top < anchor.getBoundingClientRect().top;
    const offset = isFlipped ? EXIT_OFFSET_PX : -EXIT_OFFSET_PX;
    const durationMs = readDurationMs();
    popover.inert = true;
    const animation = popover.animate(
      [
        { opacity: 1, transform: "none" },
        {
          opacity: 0,
          transform: `translateY(${offset}px) scale(${EXIT_SCALE})`,
        },
      ],
      { duration: durationMs, easing: readEase(), fill: "forwards" },
    );
    const finish = () => setIsExiting(false);
    animation.onfinish = finish;
    const fallbackTimer = window.setTimeout(
      finish,
      durationMs + EXIT_FALLBACK_SLACK_MS,
    );
    return () => {
      window.clearTimeout(fallbackTimer);
      animation.onfinish = null;
      animation.cancel();
      popover.inert = false;
    };
  }, [isExiting, popoverRef, anchorRef]);

  return isOpen || isExiting;
}
