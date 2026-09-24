import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { nextGridNeighbourIndex } from "./useGridDragReorder";

/** How far a press must travel before it turns into a drag. Below this it
 *  stays a tap, so a click on a chip still opens it for editing. */
const DRAG_THRESHOLD_PX = 6;

interface PendingPress {
  index: number;
  startX: number;
  startY: number;
  pointerId: number;
  element: HTMLElement;
}

/**
 * Pointer drag-to-reorder for the wrapping chip field. It reuses
 * `nextGridNeighbourIndex` from `useGridDragReorder` (nearest centre in 2D,
 * one neighbour step per move), since chips wrap onto several lines exactly
 * like the persona card grid.
 *
 * It differs from that hook in three ways the chip field needs. The whole
 * chip is the handle, so a press only becomes a drag after
 * `DRAG_THRESHOLD_PX` of travel, which keeps a plain tap as the "edit" click.
 * The click that follows a real drag is swallowed (`onClickCapture` on the
 * list), so dropping a chip never opens it. Chips carry `touch-action: pan-y`
 * in CSS: a finger that starts vertically scrolls the page as usual (the
 * browser cancels the pointer), and one that starts sideways drags the chip.
 *
 * Chips are found by `[data-chip]` inside `listRef`, so the add input that
 * shares the flex line is never counted as a drop target.
 */
export function useSkinChipDrag(
  onStep: (from: number, to: number) => void,
  onDrop: (startIndex: number, endIndex: number) => void,
) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const pressRef = useRef<PendingPress | null>(null);
  const draggingIndexRef = useRef<number | null>(null);
  const startIndexRef = useRef(0);
  const shouldSwallowClickRef = useRef(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  // Latest callbacks, reachable from the window listeners bound once below.
  // Refreshed in a layout effect, before the browser can deliver the next
  // pointermove, so a fast drag never swaps against a stale list.
  const callbacksRef = useRef({ onStep, onDrop });
  useLayoutEffect(() => {
    callbacksRef.current = { onStep, onDrop };
  });

  useEffect(() => {
    function stepToward(event: PointerEvent) {
      const from = draggingIndexRef.current;
      const list = listRef.current;
      if (from === null || !list) return;
      const chips = Array.from(
        list.querySelectorAll<HTMLElement>("[data-chip]"),
      );
      const to = nextGridNeighbourIndex(
        chips.map((chip) => chip.getBoundingClientRect()),
        from,
        event.clientX,
        event.clientY,
      );
      if (to === null) return;
      callbacksRef.current.onStep(from, to);
      draggingIndexRef.current = to;
      setDraggingIndex(to);
    }

    function move(event: PointerEvent) {
      const press = pressRef.current;
      if (!press || event.pointerId !== press.pointerId) return;
      if (event.buttons === 0) return end();
      if (draggingIndexRef.current === null) {
        const travel = Math.hypot(
          event.clientX - press.startX,
          event.clientY - press.startY,
        );
        if (travel < DRAG_THRESHOLD_PX) return;
        try {
          press.element.setPointerCapture(press.pointerId);
        } catch {
          // The window listeners own the lifecycle either way.
        }
        startIndexRef.current = press.index;
        draggingIndexRef.current = press.index;
        setDraggingIndex(press.index);
      }
      stepToward(event);
    }

    function end() {
      pressRef.current = null;
      const finalIndex = draggingIndexRef.current;
      if (finalIndex === null) return;
      draggingIndexRef.current = null;
      setDraggingIndex(null);
      // The drop's own click follows in this same task. A release off the
      // list sends that click elsewhere, so the flag also clears on the next
      // tick and can never eat a later keyboard "click".
      shouldSwallowClickRef.current = true;
      window.setTimeout(() => {
        shouldSwallowClickRef.current = false;
      }, 0);
      callbacksRef.current.onDrop(startIndexRef.current, finalIndex);
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

  function press(index: number, event: ReactPointerEvent<HTMLElement>) {
    shouldSwallowClickRef.current = false;
    if (event.button !== 0) return;
    // The remove button and the edit input keep their own pointer behaviour.
    const target = event.target as HTMLElement;
    if (target.closest("[data-chip-remove], input")) return;
    pressRef.current = {
      index,
      startX: event.clientX,
      startY: event.clientY,
      pointerId: event.pointerId,
      element: event.currentTarget,
    };
  }

  function swallowClickAfterDrag(event: ReactMouseEvent) {
    if (!shouldSwallowClickRef.current) return;
    shouldSwallowClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  return {
    listRef,
    draggingIndex,
    chipPressHandlers: (index: number) => ({
      onPointerDown: (event: ReactPointerEvent<HTMLElement>) =>
        press(index, event),
    }),
    swallowClickAfterDrag,
  };
}
