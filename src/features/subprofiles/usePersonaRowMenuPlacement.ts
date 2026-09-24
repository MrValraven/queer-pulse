import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";

/** Gap kept between the menu and any viewport edge. */
const EDGE_GAP = 8;
/** Gap between the Actions button and the menu hanging off it. */
const ANCHOR_GAP = 6;

export interface PersonaRowMenuPlacement {
  left: number;
  top: number;
  transformOrigin: string;
}

/**
 * Positions `PersonaRowActionsPopover` against its trigger and owns its
 * dismissals. Same shape as the magazine desk's `usePieceRowMenuPlacement`:
 * mount-scoped (the popover only exists while open, so every open measures
 * fresh), measured before paint, right-aligned to the trigger, flipped above
 * it when there is no room below, then clamped into the viewport with an 8px
 * margin so it stays whole on a 320px phone.
 *
 * `onDismiss` receives whether focus was inside the menu at the time. An
 * outside press moves focus wherever the press landed, so the menu leaves it
 * alone; a scroll or resize while an item holds focus would otherwise strand
 * focus on `<body>` when the menu unmounts, so the caller hands it back to the
 * trigger instead.
 *
 * Returns `null` until the first measure lands; the caller keeps that frame
 * unpainted rather than flashing the menu at the viewport corner.
 */
export function usePersonaRowMenuPlacement(
  triggerRef: RefObject<HTMLElement | null>,
  popoverRef: RefObject<HTMLElement | null>,
  onDismiss: (hadFocus: boolean) => void,
): PersonaRowMenuPlacement | null {
  const [placement, setPlacement] = useState<PersonaRowMenuPlacement | null>(
    null,
  );
  // Read through a ref so the listeners below subscribe once per open.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    const popover = popoverRef.current;
    if (!trigger || !popover) return;
    const anchor = trigger.getBoundingClientRect();
    // Layout size, which the entry animation's scale does not shrink the way
    // it shrinks `getBoundingClientRect` on the first frame.
    const width = popover.offsetWidth;
    const height = popover.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const hasRoomBelow =
      anchor.bottom + ANCHOR_GAP + height + EDGE_GAP <= viewportHeight;
    const hasRoomAbove = anchor.top - ANCHOR_GAP - height - EDGE_GAP >= 0;
    const shouldOpenUp = !hasRoomBelow && hasRoomAbove;
    setPlacement({
      left: clampToViewport(anchor.right - width, viewportWidth - width),
      top: clampToViewport(
        shouldOpenUp
          ? anchor.top - height - ANCHOR_GAP
          : anchor.bottom + ANCHOR_GAP,
        viewportHeight - height,
      ),
      transformOrigin: `${shouldOpenUp ? "bottom" : "top"} right`,
    });
  }, [triggerRef, popoverRef]);

  // The pointerdown test spans the trigger AND the portalled menu: a press on
  // the trigger counted as outside would close the menu here and let the
  // trigger's own click reopen it, so the trigger could never close it.
  useEffect(() => {
    function hasFocusInside(): boolean {
      return Boolean(popoverRef.current?.contains(document.activeElement));
    }
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      onDismissRef.current(false);
    }
    // Scroll and resize both invalidate the measured anchor, and a menu left
    // floating away from its own row is worse than one that closes.
    const dismissOnMove = () => onDismissRef.current(hasFocusInside());
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("scroll", dismissOnMove, true);
    window.addEventListener("resize", dismissOnMove);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("scroll", dismissOnMove, true);
      window.removeEventListener("resize", dismissOnMove);
    };
  }, [triggerRef, popoverRef]);

  return placement;
}

/** Clamps one coordinate into the viewport, keeping `EDGE_GAP` at both ends. */
function clampToViewport(value: number, max: number): number {
  return Math.min(
    Math.max(EDGE_GAP, value),
    Math.max(EDGE_GAP, max - EDGE_GAP),
  );
}
