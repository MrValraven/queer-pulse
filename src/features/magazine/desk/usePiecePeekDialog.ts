/**
 * Focus and keyboard for the piece peek panel. The panel has two lives: beside
 * the table on a desktop, where it is a non-modal dialog and the table stays
 * usable, and full screen on a phone, where it is a modal sheet. Both close on
 * Escape and hand focus back to whatever opened them; on a desktop that Escape
 * counts only while focus is in the panel or on the page body. Only the sheet
 * traps Tab, locks the page scroll and joins the shared modal stack.
 */

import { useEffect, useId, useRef, type RefObject } from "react";
import { useScrollLock } from "../../../shared/hooks";
import {
  hasOpenModal,
  isTopmostModal,
  popModal,
  pushModal,
} from "../../../shared/components/ui/modalStack";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface UsePiecePeekDialogParams {
  isOpen: boolean;
  /** True for the phone sheet: trap Tab, lock scroll, join the modal stack. */
  isModal: boolean;
  panelRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  /** Where focus goes on close. Defaults to the element focused at open. */
  returnFocusRef?: RefObject<HTMLElement | null>;
}

function focusableElementsIn(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => element.offsetParent !== null);
}

/** Keeps Tab inside the sheet: wraps from the last control to the first and
 *  back. Returns true when it moved focus itself. */
function trapTab(event: KeyboardEvent, panel: HTMLElement): boolean {
  const focusableElements = focusableElementsIn(panel);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  if (!firstElement || !lastElement) {
    panel.focus();
    return true;
  }
  const activeElement = document.activeElement;
  // The panel itself holds focus right after it opens; it sits before its
  // first control, so Tab from it counts as coming from outside.
  const isOutside = activeElement === panel || !panel.contains(activeElement);
  if (event.shiftKey && (activeElement === firstElement || isOutside)) {
    lastElement.focus();
    return true;
  }
  if (!event.shiftKey && (activeElement === lastElement || isOutside)) {
    firstElement.focus();
    return true;
  }
  return false;
}

/** On the desk, Escape is the panel's only while focus is in it or has
 *  dropped to the page body. Escape in the table's search box or a bulk bar
 *  belongs to that control. */
function isFocusInPanelOrBody(panel: HTMLElement | null): boolean {
  const activeElement = document.activeElement;
  return (
    activeElement === null ||
    activeElement === document.body ||
    (panel?.contains(activeElement) ?? false)
  );
}

export function usePiecePeekDialog({
  isOpen,
  isModal,
  panelRef,
  onClose,
  returnFocusRef,
}: UsePiecePeekDialogParams): void {
  const modalId = useId();
  const openerRef = useRef<HTMLElement | null>(null);
  // Latest-callback ref, so a parent passing an inline `onClose` does not
  // re-run the listener effect (and re-focus the panel) on every render.
  const onCloseRef = useRef(onClose);
  // Same for `returnFocusRef`: a fresh ref object on each desk render would
  // otherwise re-run the open effect and pull focus out of the reply box.
  // Read at close on purpose, since j/k may have pointed it at another row.
  const latestReturnFocusRef = useRef(returnFocusRef);
  useEffect(() => {
    onCloseRef.current = onClose;
    latestReturnFocusRef.current = returnFocusRef;
  });

  useScrollLock(isOpen && isModal);

  // Open: remember the opener, then move focus into the panel so a keyboard
  // user lands where the new content is. Close: send focus back, but only
  // when it was inside the panel (or dropped to the body as the panel went
  // inert). A click on the table that closed it keeps its own focus.
  useEffect(() => {
    const panel = panelRef.current;
    if (!isOpen) return undefined;
    const activeElement = document.activeElement;
    if (
      activeElement instanceof HTMLElement &&
      !panel?.contains(activeElement)
    ) {
      openerRef.current = activeElement;
    }
    panel?.focus({ preventScroll: true });
    return () => {
      const returnTarget =
        latestReturnFocusRef.current?.current ?? openerRef.current;
      if (isFocusInPanelOrBody(panel) && returnTarget?.isConnected) {
        returnTarget.focus({ preventScroll: true });
      }
    };
  }, [isOpen, panelRef]);

  useEffect(() => {
    if (!isOpen || !isModal) return undefined;
    pushModal(modalId);
    return () => popModal(modalId);
  }, [isOpen, isModal, modalId]);

  useEffect(() => {
    if (!isOpen) return undefined;
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.defaultPrevented) return;
      if (event.key === "Escape") {
        // A dialog opened on top (the chase modal, a confirm) takes its own
        // Escape first. The sheet is on the stack itself, so it asks whether
        // it is the top one; the side panel asks whether any dialog is open.
        const isCoveredByDialog = isModal
          ? !isTopmostModal(modalId)
          : hasOpenModal();
        if (isCoveredByDialog) return;
        if (!isModal && !isFocusInPanelOrBody(panelRef.current)) return;
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      const panel = panelRef.current;
      if (event.key !== "Tab" || !isModal || !panel) return;
      if (!isTopmostModal(modalId)) return;
      if (trapTab(event, panel)) event.preventDefault();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isModal, modalId, panelRef]);
}
