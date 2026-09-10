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
 *                 `additionalInsideRef` counts a second subtree as "inside",
 *                 for surfaces whose panel is portalled out of `ref` (the
 *                 date pickers portal theirs to `document.body` to escape
 *                 ancestor stacking contexts). Without it every press inside
 *                 such a panel reads as an outside press and closes it on the
 *                 way to picking a value.
 *
 * Escape stays opt-in on purpose, and every surface still owes its keyboard
 * users a way out: pass `onEscape` here, or handle Escape locally the way
 * `Select`/`VenuePicker`/`ProfileSettingsMenu` do on their own subtree. Two
 * reasons it cannot simply default on. First, this listener sits on
 * `document`, and so does the modal Escape handler in
 * `components/ui/useDismiss.ts`, which has no `defaultPrevented` guard: a
 * defaulted-on Escape would close a `Select` popover AND the form modal
 * around it on one press, throwing away whatever was typed. Second, only the
 * caller knows where focus should land afterwards, and `onDismiss` is usually
 * a bare `setOpen(false)` that would drop the trigger focus restore.
 */
export function useOutsideDismiss(
  active: boolean,
  ref: RefObject<HTMLElement | null>,
  onDismiss: () => void,
  options?: {
    onEscape?: () => void;
    additionalInsideRef?: RefObject<HTMLElement | null>;
  },
): void {
  const savedOnDismiss = useRef(onDismiss);
  const savedOnEscape = useRef(options?.onEscape);
  useEffect(() => {
    savedOnDismiss.current = onDismiss;
    savedOnEscape.current = options?.onEscape;
  });

  const hasEscapeHandler = Boolean(options?.onEscape);

  const additionalInsideRef = options?.additionalInsideRef;

  useEffect(() => {
    if (!active) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!ref.current || ref.current.contains(target)) return;
      if (additionalInsideRef?.current?.contains(target)) return;
      savedOnDismiss.current();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [active, ref, additionalInsideRef]);

  useEffect(() => {
    if (!active || !hasEscapeHandler) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") savedOnEscape.current?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active, hasEscapeHandler]);
}
