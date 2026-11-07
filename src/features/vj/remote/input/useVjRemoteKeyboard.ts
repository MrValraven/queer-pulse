/**
 * Keyboard shortcuts for the remote: native `keydown` and `keyup` listeners on
 * `window` turn keys into `VjRemoteAction`s through `vjActionForKey` and hand
 * them to the shared dispatcher.
 *
 * Holds (Shift and the bottom row) are tracked by physical `code`, so the
 * matching `keyup` releases the pad even when Shift came up first. A held pad
 * also releases when the window loses focus, when the tab is hidden, when the
 * hook is disabled and on unmount, so a pad never sticks on.
 */
import { useEffect, useRef } from "react";
import { vjActionForKey } from "./vjKeymap";
import type { VjActionDispatch, VjRemoteAction } from "./vjRemoteAction";

export interface UseVjRemoteKeyboardOptions {
  isEnabled: boolean;
  dispatch: VjActionDispatch;
}

const VJ_EDITABLE_SELECTOR =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"])';

const VJ_OPEN_MODAL_SELECTOR = '[role="dialog"][aria-modal="true"]';

/** True when the key lands in a field the operator is typing into. */
export function isVjEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element && target.closest(VJ_EDITABLE_SELECTOR) !== null
  );
}

const VJ_ACTIVATABLE_SELECTOR =
  'button, a[href], summary, [role="button"], [role="switch"], [role="checkbox"], [role="radio"], [role="tab"], [role="option"]';

/**
 * True when Space or Enter lands on a focused control: the control's own
 * activation owns that key, so the remote shortcut stays quiet.
 */
function isVjActivationKeyOnControl(event: KeyboardEvent): boolean {
  if (event.code !== "Space" && event.code !== "Enter") return false;
  const { target } = event;
  return (
    target instanceof Element &&
    target.closest(VJ_ACTIVATABLE_SELECTOR) !== null
  );
}

function isVjModalOpen(): boolean {
  return document.querySelector(VJ_OPEN_MODAL_SELECTOR) !== null;
}

/**
 * The action a key asks for, read as a fresh press: auto-repeat is handled by
 * the caller, which still needs the action of a repeated Space to stop scroll.
 */
function actionOfKeyEvent(event: KeyboardEvent): VjRemoteAction | null {
  if (isVjActivationKeyOnControl(event)) return null;
  return vjActionForKey({
    code: event.code,
    isShift: event.shiftKey,
    isMeta: event.metaKey,
    isCtrl: event.ctrlKey,
    isAlt: event.altKey,
    isRepeat: false,
    isEditableTarget: isVjEditableTarget(event.target),
  });
}

export function useVjRemoteKeyboard(options: UseVjRemoteKeyboardOptions): void {
  const { isEnabled, dispatch } = options;
  const dispatchRef = useRef(dispatch);
  useEffect(() => {
    dispatchRef.current = dispatch;
  });

  useEffect(() => {
    if (!isEnabled) return;
    /** The pad slot actions held down right now, keyed by physical code. */
    const heldPadsByCode = new Map<string, VjRemoteAction>();

    const releaseHeldPad = (code: string): boolean => {
      const heldAction = heldPadsByCode.get(code);
      if (!heldAction) return false;
      heldPadsByCode.delete(code);
      dispatchRef.current(heldAction, "release");
      return true;
    };

    const releaseEveryHeldPad = () => {
      for (const code of [...heldPadsByCode.keys()]) releaseHeldPad(code);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isVjModalOpen()) return;
      if (event.repeat) {
        // Auto-repeat dispatches nothing, but a held shortcut (Space) must
        // keep the page from scrolling.
        if (actionOfKeyEvent(event)) event.preventDefault();
        return;
      }
      const action = actionOfKeyEvent(event);
      if (!action) return;
      event.preventDefault();
      if (action.kind === "padSlot") {
        if (heldPadsByCode.has(event.code)) return;
        heldPadsByCode.set(event.code, action);
      }
      dispatchRef.current(action, "press");
    };

    const onKeyUp = (event: KeyboardEvent) => {
      // Releases pass even under a modal or inside a field, so a pad held
      // before either opened still lets go.
      if (releaseHeldPad(event.code)) event.preventDefault();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") releaseEveryHeldPad();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", releaseEveryHeldPad);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", releaseEveryHeldPad);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      releaseEveryHeldPad();
    };
  }, [isEnabled]);
}
