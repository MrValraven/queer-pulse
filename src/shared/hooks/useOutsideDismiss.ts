import { useEffect, useRef, type RefObject } from "react";

/**
 * Dismiss a floating surface (menu, popover, dropdown panel) on a pointer press
 * outside it, using the `pointerdown`-outside contract that ~15 hand-rolled
 * menus in this app each re-implement inline (AccountMenu, SubprofileMoreMenu,
 * HousingNeighbourhoodPicker…). `pointerdown` — not `click` — so the surface
 * closes on press-start, matching native `<select>`/menu feel and firing before
 * a click lands on whatever is underneath.
 *
 * The callback is read through a ref so callers don't have to memoize it: the
 * document listener subscribes once per open/close, never on every render.
 *
 * @param active   Whether the surface is open. No listener is attached when false.
 * @param ref      The surface's outermost element; a press inside it is ignored.
 * @param onDismiss Called on an outside press. May be a fresh closure each render.
 */
export function useOutsideDismiss(
  active: boolean,
  ref: RefObject<HTMLElement | null>,
  onDismiss: () => void,
): void {
  const savedOnDismiss = useRef(onDismiss);
  useEffect(() => {
    savedOnDismiss.current = onDismiss;
  });

  useEffect(() => {
    if (!active) return;
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        savedOnDismiss.current();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [active, ref]);
}
