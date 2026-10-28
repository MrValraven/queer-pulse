import { useCallback, useRef, type FocusEvent, type RefObject } from "react";
import type { ToastItem } from "./toastDeck";

/**
 * Where keyboard focus goes when Escape takes a toast down.
 *
 * The stack remembers the element that held focus just before focus first
 * entered it, and forgets it once focus leaves the stack. On Escape, focus
 * moves to the first button of the next toast in the deck (the older one
 * behind, or the newer one in front when this was the last), and with no
 * toast left it returns to that remembered element. An element that has
 * since left the page is skipped, and focus falls where the browser puts it.
 */
export function useToastFocusReturn(
  containerRef: RefObject<HTMLDivElement | null>,
) {
  const focusOriginRef = useRef<HTMLElement | null>(null);

  const focusHandlers = {
    onFocus: (event: FocusEvent<HTMLDivElement>) => {
      const previousTarget = event.relatedTarget;
      if (
        previousTarget instanceof Node &&
        event.currentTarget.contains(previousTarget)
      )
        return;
      focusOriginRef.current =
        previousTarget instanceof HTMLElement ? previousTarget : null;
    },
    onBlur: (event: FocusEvent<HTMLDivElement>) => {
      const nextTarget = event.relatedTarget;
      if (
        nextTarget instanceof Node &&
        event.currentTarget.contains(nextTarget)
      )
        return;
      focusOriginRef.current = null;
    },
  };

  const handFocusOn = useCallback(
    (leavingId: number, toasts: readonly ToastItem[]) => {
      const showingNewestFirst = toasts
        .filter((toast) => !toast.isLeaving)
        .sort((first, second) => second.id - first.id);
      const position = showingNewestFirst.findIndex(
        (toast) => toast.id === leavingId,
      );
      const neighbour =
        showingNewestFirst[position + 1] ?? showingNewestFirst[position - 1];
      const neighbourButton =
        neighbour && neighbour.id !== leavingId
          ? containerRef.current?.querySelector<HTMLElement>(
              `[data-toast-id="${neighbour.id}"] button`,
            )
          : null;
      if (neighbourButton) {
        neighbourButton.focus();
        return;
      }
      const focusOrigin = focusOriginRef.current;
      focusOriginRef.current = null;
      if (focusOrigin?.isConnected) focusOrigin.focus();
    },
    [containerRef],
  );

  return { focusHandlers, handFocusOn };
}
