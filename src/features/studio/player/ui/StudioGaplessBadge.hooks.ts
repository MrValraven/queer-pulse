import { useEffect, useLayoutEffect, type RefObject } from "react";
import { useOutsideDismiss } from "../../../../shared/hooks/useOutsideDismiss";
import { fitStudioPopover } from "./studioPopoverFit";

/** The nearest ancestor that clips sideways (the side panel's scrolling
 *  body, the Now playing frame), or null for the viewport. */
function clippingAncestorOf(element: HTMLElement): HTMLElement | null {
  let ancestor = element.parentElement;
  while (ancestor && ancestor !== document.body) {
    if (getComputedStyle(ancestor).overflowX !== "visible") return ancestor;
    ancestor = ancestor.parentElement;
  }
  return null;
}

/** Keeps the open bubble inside whatever clips it: measured on open and on
 *  resize, written as a sideways shift the module reads. */
export function useStudioGaplessBubbleFit(
  isOpen: boolean,
  bubbleRef: RefObject<HTMLElement | null>,
  triggerRef: RefObject<HTMLElement | null>,
  placement: "up" | "down",
) {
  useLayoutEffect(() => {
    if (!isOpen) return;
    const place = () => {
      const bubble = bubbleRef.current;
      const trigger = triggerRef.current;
      if (!bubble || !trigger) return;
      bubble.style.setProperty("--gapless-shift-x", "0px");
      const bubbleRect = bubble.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      const clipping = clippingAncestorOf(bubble);
      const boundsLeft = clipping?.getBoundingClientRect().left ?? 0;
      const boundsWidth =
        clipping?.clientWidth ?? document.documentElement.clientWidth;
      const fit = fitStudioPopover({
        panelLeft: bubbleRect.left - boundsLeft,
        panelWidth: bubbleRect.width,
        triggerTop: triggerRect.top,
        triggerBottom: triggerRect.bottom,
        viewportWidth: boundsWidth,
        viewportHeight: window.innerHeight,
        placement,
      });
      bubble.style.setProperty("--gapless-shift-x", `${fit.shiftX}px`);
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [isOpen, bubbleRef, triggerRef, placement]);
}

/** Closes the bubble on a press outside it and on Escape. Escape is caught
 *  on the document in the capture phase and stops there, so an enclosing
 *  dialog (Now playing) stays open; focus goes back to the trigger when it
 *  was inside the badge or nowhere. */
export function useStudioGaplessDismiss(
  isOpen: boolean,
  rootRef: RefObject<HTMLElement | null>,
  triggerRef: RefObject<HTMLElement | null>,
  close: () => void,
) {
  useOutsideDismiss(isOpen, rootRef, close);
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      const focused = document.activeElement;
      const shouldReturnFocus =
        !focused ||
        focused === document.body ||
        Boolean(rootRef.current?.contains(focused));
      close();
      if (shouldReturnFocus) triggerRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [isOpen, rootRef, triggerRef, close]);
}
