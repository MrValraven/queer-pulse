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
 * @param options  `onEscape` also closes on the Escape key and hands the caller
 *                 the chance to restore focus to the trigger. Menus that were
 *                 hand-rolling both listeners together can now use one hook.
 */
export function useOutsideDismiss(
  active: boolean,
  ref: RefObject<HTMLElement | null>,
  onDismiss: () => void,
  options?: { onEscape?: () => void },
): void {
  const savedOnDismiss = useRef(onDismiss);
  const savedOnEscape = useRef(options?.onEscape);
  useEffect(() => {
    savedOnDismiss.current = onDismiss;
    savedOnEscape.current = options?.onEscape;
  });

  const hasEscapeHandler = Boolean(options?.onEscape);

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

  useEffect(() => {
    if (!active || !hasEscapeHandler) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") savedOnEscape.current?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active, hasEscapeHandler]);
}
