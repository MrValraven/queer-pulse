import { useLayoutEffect, useState, type RefObject } from "react";

/** One reorder: the order it moved to and the element focused just before. */
interface PendingReorder {
  layoutKey: unknown;
  focusedElement: Element | null;
}

/**
 * Keeps keyboard focus on the same control when a container reorders its
 * children, and moves focus for that reason only. Stable keys let React move
 * a card's instance instead of remounting it, but moving a DOM node detaches
 * it for a moment, and the browser drops focus to the document when the
 * focused control is inside the node that moved.
 *
 * Ordering: React renders, then commits, and the commit's mutation phase is
 * where the node moves and focus drops; layout effects run right after it.
 * Nothing in a function component runs between the move and the layout
 * effects, so the focused element is read during the render in which
 * `layoutKey` changes (the "adjust state while rendering" pattern). That
 * render and its commit run in the same task for a non-transition update, so
 * the element read there is the one focused when the node moves. The layout
 * effect right after that commit restores focus once, only when the element
 * is inside the container and focus now sits on the document, then clears
 * the record. Focus that had already left the container before the reorder
 * is left alone.
 *
 * `layoutKey` names the order: pass the value that decides it (the rail's
 * stacked flag).
 */
export function useKeepFocusAcrossReorder(
  containerRef: RefObject<HTMLElement | null>,
  layoutKey: unknown,
) {
  const [lastLayoutKey, setLastLayoutKey] = useState(layoutKey);
  const [pendingReorder, setPendingReorder] = useState<PendingReorder | null>(
    null,
  );

  if (lastLayoutKey !== layoutKey) {
    setLastLayoutKey(layoutKey);
    setPendingReorder({
      layoutKey,
      focusedElement:
        typeof document === "undefined" ? null : document.activeElement,
    });
  }

  useLayoutEffect(() => {
    if (pendingReorder === null) return;
    const { focusedElement } = pendingReorder;
    const container = containerRef.current;
    const activeElement = document.activeElement;
    const isFocusLost =
      activeElement === null || activeElement === document.body;
    if (
      isFocusLost &&
      focusedElement instanceof HTMLElement &&
      container?.contains(focusedElement)
    ) {
      focusedElement.focus({ preventScroll: true });
    }
    // Forget the element as soon as this reorder is handled. One extra render,
    // and only on a reorder; the effect then sees null and does nothing.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPendingReorder(null);
  }, [containerRef, pendingReorder]);
}
