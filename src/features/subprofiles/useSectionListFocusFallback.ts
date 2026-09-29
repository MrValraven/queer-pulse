import { useEffect, useRef, type FocusEvent, type RefObject } from "react";

const MODAL_SELECTOR = '[aria-modal="true"]';

/** How many frames to wait for a closing dialog to leave the page. A shared
 *  dialog's exit animation gives up after 400ms (`useModalExit`), about 24
 *  frames at 60Hz. */
const MAX_WAIT_FRAMES = 30;

function isInsideModal(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(MODAL_SELECTOR) !== null;
}

/** Focuses the list wrapper, focusable only for this one visit: the
 *  `tabindex` goes on here and comes off as focus leaves, so a mouse click
 *  on blank list space never lands on the wrapper. */
function focusWrapper(wrapper: HTMLElement) {
  wrapper.setAttribute("tabindex", "-1");
  wrapper.addEventListener("blur", () => wrapper.removeAttribute("tabindex"), {
    once: true,
  });
  wrapper.focus();
}

/**
 * Catches focus a section list's dialog could not hand back. The item drawer
 * and the gallery picker return focus to the button that opened them, but
 * that button can be gone by then: the gallery's Add button leaves once the
 * sixth photo lands, and restoring an older version re-seeds every row. Focus
 * would then fall to the page body and the next Tab would start over from the
 * top of the page.
 *
 * Arms when focus leaves the list for a modal dialog. The dialogs are portals
 * of the list, so their own focus events bubble through it too; only focus
 * that lands outside every dialog, back in the list, disarms. After a render
 * while armed (a save or a re-seed renders the list), it waits for every
 * dialog to leave the page, frame by frame, and then, if focus sits on the
 * body, focuses the list wrapper. React runs a closing dialog's own focus
 * restore before this effect, so a restore that works always wins. Spread the
 * returned handlers on the wrapper.
 */
export function useSectionListFocusFallback(
  wrapperRef: RefObject<HTMLElement | null>,
) {
  const isAwayInDialogRef = useRef(false);

  useEffect(() => {
    if (!isAwayInDialogRef.current) return;
    let frameId = 0;
    let framesLeft = MAX_WAIT_FRAMES;
    const settle = () => {
      if (!isAwayInDialogRef.current) return;
      if (document.querySelector(MODAL_SELECTOR)) {
        // Still open, or on its way out: look again next frame. Past the
        // limit the dialog is simply open; the next render looks again.
        framesLeft -= 1;
        if (framesLeft > 0) frameId = requestAnimationFrame(settle);
        return;
      }
      isAwayInDialogRef.current = false;
      const activeElement = document.activeElement;
      if (activeElement && activeElement !== document.body) return;
      if (wrapperRef.current) focusWrapper(wrapperRef.current);
    };
    settle();
    return () => cancelAnimationFrame(frameId);
  });

  function onBlur(event: FocusEvent<HTMLElement>) {
    if (isInsideModal(event.relatedTarget)) isAwayInDialogRef.current = true;
  }

  function onFocus(event: FocusEvent<HTMLElement>) {
    if (isInsideModal(event.target)) return;
    isAwayInDialogRef.current = false;
  }

  return { onBlur, onFocus };
}
