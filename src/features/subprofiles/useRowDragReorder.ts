import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  createRowDragController,
  type RowDragController,
} from "./rowDragController";

export {
  ROW_DRAG_START_EVENT,
  type RowDragStartDetail,
} from "./rowDragGestureGuards";

/**
 * Pointer-driven drag-to-reorder for a `.itemrow`-style list, with the grip as
 * the handle.
 *
 * A press on the grip only waits. It becomes a drag once the pointer travels
 * more than 4px with a mouse, or 10px with a finger or pen, whose honest taps
 * drift further; a press released before that is a tap, changes nothing, and
 * the grip's own `click` fires as usual (so a grip can also be a button). As
 * a press becomes a drag, the grip receives a bubbling `rowdragstart`
 * (`ROW_DRAG_START_EVENT`, detail `{ index }`), so it can close a move menu
 * the press may have left open. The
 * one click that follows a real drag's release is swallowed, so a drag never
 * counts as a press of the grip. A mouse press keeps the old `preventDefault`
 * (no text selection, a focused field stays focused, the click still fires);
 * touch and pen keep their native tap, and the grips' `touch-action: none`
 * stops the page panning under a finger.
 *
 * While dragging, the held row (`container.children[draggingIndex]`) follows
 * the pointer through the CSS `translate` property, which composes with the
 * `transform` motion owns for its layout glides. Swaps are one neighbour step
 * at a time, taken when the held row's centre crosses a neighbour's midpoint
 * as LAID OUT (motion's transform and our translate taken back off), so a
 * neighbour still gliding away never pulls the row straight back. After each
 * swap re-renders, the offset is recomputed for the row's new slot before
 * paint, so it never visibly jumps. While held, the row's own CSS transitions
 * skip `translate` (see `holdTranslateStill`), so no swap paints a frame of
 * its old offset. The held row stops a little past the list's first and last
 * slots. Near the top or bottom edge of the list's scroll surface (its
 * nearest scrolling ancestor, else the window, inset by any fixed nav or
 * sticky bar) the page scrolls itself, until the list's own end in that
 * direction is in view. On release the row glides home over 180ms (instant
 * under reduced motion); a cancel or unmount clears it at once.
 *
 * The move/end lifecycle is bound to `window`: motion's per-frame layout
 * re-projection can drop the grip's pointer capture, and a release landing
 * elsewhere once left a drag STUCK to the cursor. Listening on `window`
 * catches the release wherever it happens, and a `buttons === 0` guard on
 * move ends a drag whose release was missed entirely.
 *
 * This is the pointer path only; the up/down arrow buttons remain the
 * keyboard and assistive-tech path. `containerRef` must wrap ONLY the rows,
 * in render order, since the swap math reads `container.children` directly.
 */
export function useRowDragReorder(
  onReorder: (from: number, to: number) => void,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const controllerRef = useRef<RowDragController | null>(null);
  // Keep the latest callback (it closes over the current rows) reachable from
  // the window listeners below without re-binding them every render.
  const onReorderRef = useRef(onReorder);
  useLayoutEffect(() => {
    onReorderRef.current = onReorder;
  });

  useEffect(() => {
    const controller = createRowDragController({
      readContainer: () => containerRef.current,
      reorder: (from, to) => onReorderRef.current(from, to),
      setDraggingIndex,
    });
    controllerRef.current = controller;
    window.addEventListener("pointermove", controller.handlePointerMove);
    window.addEventListener("pointerup", controller.handlePointerUp);
    window.addEventListener("pointercancel", controller.handlePointerCancel);
    return () => {
      window.removeEventListener("pointermove", controller.handlePointerMove);
      window.removeEventListener("pointerup", controller.handlePointerUp);
      window.removeEventListener(
        "pointercancel",
        controller.handlePointerCancel,
      );
      controller.dispose();
      controllerRef.current = null;
    };
  }, []);

  // A swap just re-rendered the rows: re-place the held row in its new slot
  // before paint, and let the next swap through.
  useLayoutEffect(() => {
    if (draggingIndex !== null) {
      controllerRef.current?.syncAfterCommit(draggingIndex);
    }
  }, [draggingIndex]);

  return {
    containerRef,
    draggingIndex,
    gripHandlers: (index: number) => ({
      onPointerDown: (event: ReactPointerEvent) =>
        controllerRef.current?.press(index, event),
    }),
  };
}
