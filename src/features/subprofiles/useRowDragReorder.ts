import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

/**
 * Pointer-driven drag-to-reorder for the section editor's `.itemrow` list.
 * The grip acts as the handle: `onPointerDown` captures the pointer, then each
 * `onPointerMove` does a single neighbour swap once the pointer crosses the
 * next/previous row's midpoint. One step per move keeps it jitter-free (no
 * oscillation from remeasuring a list that just reordered under the finger),
 * and pointer capture makes it work identically for mouse, touch, and pen.
 *
 * This is the pointer path only — the up/down arrow buttons remain the
 * keyboard/assistive-tech path (the grip stays `aria-hidden`), so no drag
 * affordance is required to reorder. `containerRef` must wrap ONLY the rows,
 * in render order, since the swap math reads `container.children` directly.
 */
export function useRowDragReorder(onReorder: (from: number, to: number) => void) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingIndexRef = useRef<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  function begin(index: number, event: ReactPointerEvent) {
    // Primary button / touch contact / pen only — never right-click.
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingIndexRef.current = index;
    setDraggingIndex(index);
  }

  function move(event: ReactPointerEvent) {
    const from = draggingIndexRef.current;
    const container = containerRef.current;
    if (from === null || !container) return;
    const rows = Array.from(container.children) as HTMLElement[];
    const y = event.clientY;

    let to: number | null = null;
    const next = rows[from + 1];
    if (next) {
      const rect = next.getBoundingClientRect();
      if (y > rect.top + rect.height / 2) to = from + 1;
    }
    if (to === null) {
      const prev = rows[from - 1];
      if (prev) {
        const rect = prev.getBoundingClientRect();
        if (y < rect.top + rect.height / 2) to = from - 1;
      }
    }
    if (to === null) return;

    onReorder(from, to);
    draggingIndexRef.current = to;
    setDraggingIndex(to);
  }

  function end(event: ReactPointerEvent) {
    if (draggingIndexRef.current === null) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    draggingIndexRef.current = null;
    setDraggingIndex(null);
  }

  return {
    containerRef,
    draggingIndex,
    gripHandlers: (index: number) => ({
      onPointerDown: (event: ReactPointerEvent) => begin(index, event),
      onPointerMove: move,
      onPointerUp: end,
      onPointerCancel: end,
    }),
  };
}
