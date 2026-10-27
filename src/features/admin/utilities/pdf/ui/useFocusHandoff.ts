import {
  useCallback,
  useEffect,
  useRef,
  type MouseEvent,
  type RefObject,
} from "react";

interface PendingHandoff {
  source: HTMLButtonElement;
  target: RefObject<HTMLButtonElement | null>;
}

/**
 * Some buttons switch themselves off when pressed: Select all once every page
 * is selected, Undo at the start of the history. A disabled button drops
 * keyboard focus to the page body, so the press hands focus to its partner
 * (Clear selection, Redo) once the new state has rendered.
 *
 * Call the returned function from the button's click handler with the partner
 * ref. Focus only moves when the pressed button held focus and is now off.
 */
export function useFocusHandoff() {
  const pendingRef = useRef<PendingHandoff | null>(null);

  // Runs after every commit: the press's state change arrives as new props.
  useEffect(() => {
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    const target = pending.target.current;
    if (pending.source.disabled && target && !target.disabled) {
      target.focus();
    }
  });

  return useCallback(
    (
      event: MouseEvent<HTMLButtonElement>,
      target: RefObject<HTMLButtonElement | null>,
    ) => {
      const source = event.currentTarget;
      pendingRef.current =
        source === document.activeElement ? { source, target } : null;
    },
    [],
  );
}
