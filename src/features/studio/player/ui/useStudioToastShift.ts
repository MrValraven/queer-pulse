import { useLayoutEffect, type RefObject } from "react";

/** The toast stack's resting edge gap, when it cannot be read. */
const TOAST_EDGE_PX = 20;
/** Air between a shifted stack and the surface it steps around. */
const TOAST_CLEARANCE_PX = 8;

type ToastShift = { top: number; end: number };

type ActiveShift = { shift: ToastShift; isCovering: boolean };

type ToastShiftOptions = {
  /** The surface fills the screen over every other one (the full-screen Now
   *  playing), so while it is open only its own shift counts. */
  isCovering?: boolean;
  /** A further element below the measured one whose bottom edge a "top"
   *  shift also clears, looked up inside the measured element's offset
   *  parent (Now playing's tab row on wide screens). */
  lowerEdgeSelector?: string | null;
  /** An "end" shift also lowers the stack until its top lines up with the
   *  element's top edge (the notifications popover under the top bar). */
  isTopAligned?: boolean;
};

/** Every open surface's shift; the stack moves by the largest on each axis,
 *  so Now playing and the queue panel can both be open at once. A covering
 *  surface hides the others, so while one is open the rest stop counting:
 *  the side panel's end shift would park the stack on the overlay's tabs. */
const activeShifts = new Map<symbol, ActiveShift>();

function applyShifts() {
  let top = 0;
  let end = 0;
  const entries = [...activeShifts.values()];
  const hasCovering = entries.some((entry) => entry.isCovering);
  for (const entry of entries) {
    if (hasCovering && !entry.isCovering) continue;
    top = Math.max(top, entry.shift.top);
    end = Math.max(end, entry.shift.end);
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

/** The element's top inside `container`, added up along its offset parents,
 *  so a row nested a few positioned boxes down still measures from the
 *  frame's top. */
function offsetTopWithin(element: HTMLElement, container: Element | null) {
  let top = 0;
  let current: HTMLElement | null = element;
  while (current && current !== container) {
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }
  return top;
}

/** The lower element a "top" shift also clears, when the selector finds
 *  one inside the measured element's offset parent. */
function findLowerEdgeElement(
  element: HTMLElement,
  lowerEdgeSelector: string | null | undefined,
) {
  if (!lowerEdgeSelector) return null;
  const container = element.offsetParent ?? element.parentElement;
  return container?.querySelector<HTMLElement>(lowerEdgeSelector) ?? null;
}

/** How far the stack has to move to clear `element`. "top" pushes it below
 *  the element's bottom edge (Now playing's head), or below `lowerEdge`
 *  when that ends lower (the tab row on wide screens); "end" pushes it past
 *  the element's start edge (the queue side panel, at the inline end), and
 *  with `isTopAligned` also lowers it to the element's top edge.
 *  Offsets measure where each surface comes to rest: both slide in with a
 *  transform, which the offsets leave out. Now playing's head sits at the
 *  top of its frame, and the panel is fixed to the viewport. */
function measureShift(
  element: HTMLElement,
  edge: "top" | "end",
  lowerEdge: HTMLElement | null,
  isTopAligned: boolean,
): ToastShift {
  const isRightToLeft = window.getComputedStyle(element).direction === "rtl";
  const resting = readRestingEdges(isRightToLeft);
  if (edge === "top") {
    const lowerBottom = lowerEdge
      ? offsetTopWithin(lowerEdge, element.offsetParent) +
        lowerEdge.offsetHeight
      : 0;
    const bottom = Math.max(
      element.offsetTop + element.offsetHeight,
      lowerBottom,
    );
    return {
      top: Math.max(0, bottom + TOAST_CLEARANCE_PX - resting.top),
      end: 0,
    };
  }
  const distanceFromEnd = isRightToLeft
    ? element.offsetLeft + element.offsetWidth
    : window.innerWidth - element.offsetLeft;
  return {
    top: isTopAligned ? Math.max(0, element.offsetTop - resting.top) : 0,
    end: Math.max(0, distanceFromEnd + TOAST_CLEARANCE_PX - resting.end),
  };
}

/** Moves the app's toast stack off a player surface while it is open, so a
 *  message never covers the controls in use (DES-28). The stack reads
 *  `--toast-shift-top` and `--toast-shift-end` from the root element; the
 *  shift follows the surface's size and ends as the surface starts to leave.
 *  A change of `lowerEdgeSelector` measures again, so a caller swaps it in
 *  the same render that mounts the element it names. */
export function useStudioToastShift(
  elementRef: RefObject<HTMLElement | null>,
  edge: "top" | "end",
  isActive: boolean,
  options: ToastShiftOptions = {},
) {
  const {
    isCovering = false,
    lowerEdgeSelector = null,
    isTopAligned = false,
  } = options;
  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!isActive || !element) return;
    const shiftId = Symbol("toast-shift");
    const lowerEdge = findLowerEdgeElement(element, lowerEdgeSelector);
    const update = () => {
      activeShifts.set(shiftId, {
        shift: measureShift(element, edge, lowerEdge, isTopAligned),
        isCovering,
      });
      applyShifts();
    };
    update();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(element);
    if (lowerEdge) observer?.observe(lowerEdge);
    window.addEventListener("resize", update);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
      activeShifts.delete(shiftId);
      applyShifts();
    };
  }, [elementRef, edge, isActive, isCovering, lowerEdgeSelector, isTopAligned]);
}
