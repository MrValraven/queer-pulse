import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

/**
 * Pointer-driven drag-to-reorder for a `.itemrow`-style list. The grip acts as
 * the handle: `onPointerDown` arms the drag, then each pointer move does a
 * single neighbour swap once the pointer crosses the next/previous row's
 * midpoint. One step per move keeps it jitter-free (no oscillation from
 * remeasuring a list that just reordered under the finger).
 *
 * The move/end lifecycle is bound to `window`, NOT to the grip: relying on the
 * grip to receive `pointerup` is fragile once a row animates. When the section
 * editor's rows became motion `m.div`s with `layout`, motion's per-frame layout
 * re-projection during a drag would drop the grip's implicit pointer capture,
 * so the release `pointerup` landed elsewhere, the grip's handler never fired,
 * and the drag got STUCK — the row kept following the cursor after the button
 * was let go. Listening on `window` catches the release wherever it happens, so
 * a drag can never get stuck. A `buttons === 0` guard on move is a second belt:
 * if an up is ever missed entirely, the next move with no button ends the drag.
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
  // Keep the latest callback (it closes over the current rows) reachable from
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
      // row can't keep following the cursor.
      if (event.buttons === 0) {
        end();
        return;
      }
      const rows = Array.from(container.children) as HTMLElement[];
      const pointerY = event.clientY;

      let to: number | null = null;
      const next = rows[from + 1];
      if (next) {
        const rect = next.getBoundingClientRect();
        if (pointerY > rect.top + rect.height / 2) to = from + 1;
      }
      if (to === null) {
        const previous = rows[from - 1];
        if (previous) {
          const rect = previous.getBoundingClientRect();
          if (pointerY < rect.top + rect.height / 2) to = from - 1;
        }
      }
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
