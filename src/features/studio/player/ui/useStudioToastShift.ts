import { useLayoutEffect, type RefObject } from "react";

/** The toast stack's resting edge gap, when it cannot be read. */
const TOAST_EDGE_PX = 20;
/** Air between a shifted stack and the surface it steps around. */
const TOAST_CLEARANCE_PX = 8;

type ToastShift = { top: number; end: number };

/** Every open surface's shift; the stack moves by the largest on each axis,
 *  so Now playing and the queue panel can both be open at once. */
const activeShifts = new Map<symbol, ToastShift>();

function applyShifts() {
  let top = 0;
  let end = 0;
  for (const shift of activeShifts.values()) {
    top = Math.max(top, shift.top);
    end = Math.max(end, shift.end);
  }
  const rootStyle = document.documentElement.style;
  if (top > 0) rootStyle.setProperty("--toast-shift-top", `${top}px`);
  else rootStyle.removeProperty("--toast-shift-top");
  if (end > 0) rootStyle.setProperty("--toast-shift-end", `${end}px`);
  else rootStyle.removeProperty("--toast-shift-end");
}

/** The stack's resting edge gaps, as the browser resolved them: the top
 *  one already holds the notch inset, so the shift never counts it twice. */
function readRestingEdges(isRightToLeft: boolean) {
  const region = document.querySelector<HTMLElement>("[data-toast-region]");
  const style = region ? window.getComputedStyle(region) : null;
  const top = parseFloat(style?.top ?? "");
  const end = parseFloat((isRightToLeft ? style?.left : style?.right) ?? "");
  return {
    top: Number.isFinite(top) ? top : TOAST_EDGE_PX,
    end: Number.isFinite(end) ? end : TOAST_EDGE_PX,
  };
}

/** How far the stack has to move to clear `element`. "top" pushes it below
 *  the element's bottom edge (Now playing's head); "end" pushes it past the
 *  element's start edge (the queue side panel, at the inline end). Offsets
 *  measure where each surface comes to rest: both slide in with a
 *  transform, which the offsets leave out. Now playing's head sits at the
 *  top of its frame, and the panel is fixed to the viewport. */
function measureShift(element: HTMLElement, edge: "top" | "end"): ToastShift {
  const isRightToLeft = window.getComputedStyle(element).direction === "rtl";
  const resting = readRestingEdges(isRightToLeft);
  if (edge === "top") {
    const bottom = element.offsetTop + element.offsetHeight;
    return {
      top: Math.max(0, bottom + TOAST_CLEARANCE_PX - resting.top),
      end: 0,
    };
  }
  const distanceFromEnd = isRightToLeft
    ? element.offsetLeft + element.offsetWidth
    : window.innerWidth - element.offsetLeft;
  return {
    top: 0,
    end: Math.max(0, distanceFromEnd + TOAST_CLEARANCE_PX - resting.end),
  };
}

/** Moves the app's toast stack off a player surface while it is open, so a
 *  message never covers the controls in use (DES-28). The stack reads
 *  `--toast-shift-top` and `--toast-shift-end` from the root element; the
 *  shift follows the surface's size and ends as the surface starts to leave. */
export function useStudioToastShift(
  elementRef: RefObject<HTMLElement | null>,
  edge: "top" | "end",
  isActive: boolean,
) {
  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!isActive || !element) return;
    const shiftId = Symbol("toast-shift");
    const update = () => {
      activeShifts.set(shiftId, measureShift(element, edge));
      applyShifts();
    };
    update();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(element);
    window.addEventListener("resize", update);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
      activeShifts.delete(shiftId);
      applyShifts();
    };
  }, [elementRef, edge, isActive]);
}
