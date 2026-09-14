import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

/**
 * The geometry the swap decision needs from one card, in viewport coordinates.
 * A `DOMRect` already satisfies it, so the hook hands
 * `getBoundingClientRect()` straight through and a test can pass plain objects
 * with no DOM and no drag at all.
 */
export interface DragCardRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Where the dragged card should step to for this pointer position, or `null`
 * to stay where it is.
 *
 * The row version of this (`useRowDragReorder`) compares `clientY` against a
 * neighbour's vertical midpoint, which only answers correctly in a single
 * column. The persona dashboard's `.sides` is a real multi-column grid
 * (`repeat(auto-fill, minmax(320px, 1fr))`, collapsing to one column under a
 * 760px container), so the card the pointer is over can sit BESIDE the dragged
 * card rather than above or below it, and a vertical midpoint test would
 * either miss it entirely or fire on the wrong row. Nearest-centre by 2D
 * distance answers in both layouts with one rule: in one column it degenerates
 * to the same up/down decision, and in several columns it follows the pointer
 * sideways as well.
 *
 * The step is always exactly ONE position toward the nearest card, never a
 * jump straight to it. Cards reflow the instant a swap lands, so a multi-step
 * jump would remeasure a grid that just moved under the finger and oscillate.
 * One neighbour step per move stays jitter-free, and a pointer held over a
 * distant card simply walks there over the next few moves.
 */
export function nextGridNeighbourIndex(
  cardRects: DragCardRect[],
  draggingIndex: number,
  pointerX: number,
  pointerY: number,
): number | null {
  if (draggingIndex < 0 || draggingIndex >= cardRects.length) return null;

  let nearestIndex = -1;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < cardRects.length; index++) {
    const rect = cardRects[index]!;
    const centreX = rect.left + rect.width / 2;
    const centreY = rect.top + rect.height / 2;
    const distance = Math.hypot(pointerX - centreX, pointerY - centreY);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  }

  if (nearestIndex < 0 || nearestIndex === draggingIndex) return null;
  return nearestIndex > draggingIndex ? draggingIndex + 1 : draggingIndex - 1;
}

/**
 * Pointer-driven drag-to-reorder for a `.sides`-style CARD GRID. The grip acts
 * as the handle: `onPointerDown` arms the drag, then each pointer move does a
 * single neighbour step toward whichever card's centre the pointer is nearest
 * (`nextGridNeighbourIndex` above, which carries the reasoning for both the 2D
 * test and the one-step-per-move rule).
 *
 * The move/end lifecycle is bound to `window`, NOT to the grip: relying on the
 * grip to receive `pointerup` is fragile once a card animates or the grid
 * reflows under the finger. A card that reorders mid-drag can lose the grip's
 * implicit pointer capture, so the release `pointerup` lands elsewhere, the
 * grip's handler never fires, and the drag gets STUCK with the card still
 * following the cursor after the button was let go. Listening on `window`
 * catches the release wherever it happens, so a drag can never get stuck. A
 * `buttons === 0` guard on move is a second belt: if an up is ever missed
 * entirely, the next move with no button down ends the drag.
 *
 * This is the pointer path only. The "Move earlier" / "Move later" buttons on
 * each card remain the keyboard and assistive-tech path (the grip stays
 * `aria-hidden`), so no drag affordance is required to reorder. `containerRef`
 * must wrap ONLY the draggable cards, in render order, since the swap math
 * reads `container.children` directly: a trailing "new persona" tile inside
 * the same element would count as a card and shift every index by one.
 */
export function useGridDragReorder(
  onReorder: (from: number, to: number) => void,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingIndexRef = useRef<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  // Keep the latest callback (it closes over the current cards) reachable from
  // the window listeners below without re-binding them every render.
  const onReorderRef = useRef(onReorder);
  useEffect(() => {
    onReorderRef.current = onReorder;
  });

  useEffect(() => {
    function move(event: PointerEvent) {
      const from = draggingIndexRef.current;
      const container = containerRef.current;
      if (from === null || !container) return;
      // Button released but we somehow missed the up entirely — end now so the
      // card can't keep following the cursor.
      if (event.buttons === 0) {
        end();
        return;
      }
      const cards = Array.from(container.children) as HTMLElement[];
      const cardRects = cards.map((card) => card.getBoundingClientRect());

      const to = nextGridNeighbourIndex(
        cardRects,
        from,
        event.clientX,
        event.clientY,
      );
      if (to === null) return;

      onReorderRef.current(from, to);
      draggingIndexRef.current = to;
      setDraggingIndex(to);
    }

    function end() {
      if (draggingIndexRef.current === null) return;
      draggingIndexRef.current = null;
      setDraggingIndex(null);
    }

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, []);

  function begin(index: number, event: ReactPointerEvent) {
    // Primary button / touch contact / pen only — never right-click.
    if (event.button !== 0) return;
    event.preventDefault();
    // Best-effort capture so touch keeps delivering moves even if the finger
    // strays off the grip; the window listeners above own the lifecycle either
    // way, so a lost capture can no longer strand the drag.
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Ignore — window listeners cover us if capture can't be set.
    }
    draggingIndexRef.current = index;
    setDraggingIndex(index);
  }

  return {
    containerRef,
    draggingIndex,
    gripHandlers: (index: number) => ({
      onPointerDown: (event: ReactPointerEvent) => begin(index, event),
    }),
  };
}
