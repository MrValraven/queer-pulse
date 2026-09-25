import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";

/** Gap kept between the menu and any viewport edge. */
const EDGE_GAP = 8;
/** Gap between the grip and the menu hanging off it. */
const ANCHOR_GAP = 6;

export interface SkinListMenuPlacement {
  left: number;
  top: number;
  transformOrigin: string;
}

/** Clamps one coordinate into the viewport, keeping `EDGE_GAP` at both ends. */
function clampToViewport(value: number, max: number): number {
  return Math.min(
    Math.max(EDGE_GAP, value),
    Math.max(EDGE_GAP, max - EDGE_GAP),
  );
}

/**
 * Places a list grip's move menu (`SkinListMoveMenu`) and owns its
 * dismissals, as `usePersonaRowMenuPlacement` does for the persona row menu.
 * The grip leads its row, so the menu opens from the grip's left edge into
 * the row. It flips above the grip when there is no room below and is
 * clamped into the viewport with an 8px margin, so it stays whole on a 320px
 * phone. Mount-scoped: the menu exists only while open, so every open
 * measures fresh, before paint.
 *
 * `onDismiss` receives whether focus was inside the menu: an outside press
 * leaves focus where the press put it, while a scroll or resize with an item
 * focused hands focus back to the grip. Returns `null` until the first
 * measure, and the caller keeps that frame hidden.
 */
export function useSkinListMenuPlacement(
  triggerRef: RefObject<HTMLElement | null>,
  popoverRef: RefObject<HTMLElement | null>,
  onDismiss: (hadFocus: boolean) => void,
): SkinListMenuPlacement | null {
  const [placement, setPlacement] = useState<SkinListMenuPlacement | null>(
    null,
  );
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    const popover = popoverRef.current;
    if (!trigger || !popover) return;
    const anchor = trigger.getBoundingClientRect();
    // Layout size, which the entry animation's scale does not shrink.
    const width = popover.offsetWidth;
    const height = popover.offsetHeight;
    const hasRoomBelow =
      anchor.bottom + ANCHOR_GAP + height + EDGE_GAP <= window.innerHeight;
    const hasRoomAbove = anchor.top - ANCHOR_GAP - height - EDGE_GAP >= 0;
    const shouldOpenUp = !hasRoomBelow && hasRoomAbove;
    setPlacement({
      left: clampToViewport(anchor.left, window.innerWidth - width),
      top: clampToViewport(
        shouldOpenUp
          ? anchor.top - height - ANCHOR_GAP
          : anchor.bottom + ANCHOR_GAP,
        window.innerHeight - height,
      ),
      transformOrigin: `${shouldOpenUp ? "bottom" : "top"} left`,
    });
  }, [triggerRef, popoverRef]);

  // A press on the grip counts as inside: the grip closes the menu itself
  // and skips the click that ends the press, which would reopen it.
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      onDismissRef.current(false);
    }
    const dismissOnMove = () =>
      onDismissRef.current(
        Boolean(popoverRef.current?.contains(document.activeElement)),
      );
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
