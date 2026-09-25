import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useFocusAcrossMove } from "./useFocusAcrossMove";
import { useRowDragReorder } from "./useRowDragReorder";

/** Attribute on every `ReorderRow`, so a focused control can find its row. */
export const REORDER_ROW_ATTRIBUTE = "data-reorder-row";

/** Declared through `aria-keyshortcuts` on each control that moves its row
 *  with Alt and an arrow key. Only controls declaring it take the shortcut,
 *  so selects and pickers keep their own arrow keys. Menu grips declare it
 *  too but handle the key themselves, so the list listener skips them. */
export const ROW_MOVE_KEY_SHORTCUTS = "Alt+ArrowUp Alt+ArrowDown";

/**
 * Reordering for the persona editor's controlled row lists (social links,
 * "Part of" links, an item's links), matching the skin-list rows: a grip drag
 * through `useRowDragReorder`, Alt with ArrowUp or ArrowDown in any control
 * that declares `ROW_MOVE_KEY_SHORTCUTS`, and focus kept on the moved row's
 * control. A drag or Alt+arrow swaps two neighbours; `moveRow` (the grip's
 * move menu, move buttons) takes the row to any slot, so `onMove` must lift
 * the row out and insert it at `to`. It must also build on the newest list,
 * since a fast drag can fire a second swap before the re-render.
 * `containerRef` must wrap only the rows, each a `ReorderRow` given
 * `moveCount`, so the rows glide on moves only.
 */
export function useReorderableRows(onMove: (from: number, to: number) => void) {
  const moveRowRef = useRef<(from: number, to: number) => void>(() => {});
  const drag = useRowDragReorder((from, to) => moveRowRef.current(from, to));
  const keepFocus = useFocusAcrossMove();
  // Bumped with every move and handed to each `ReorderRow`, so the rows
  // measure and glide on the render that carries a move and on no other.
  const [moveCount, setMoveCount] = useState(0);

  const moveRow = (from: number, to: number) => {
    const rowCount = drag.containerRef.current?.children.length ?? 0;
    if (from === to || from < 0 || to < 0 || to >= rowCount) return;
    keepFocus.remember();
    setMoveCount((count) => count + 1);
    onMove(from, to);
  };

  // Refresh before paint, so no pointermove or keydown after this render can
  // reach an older `moveRow`. The drag hook and the key listener bind once.
  useLayoutEffect(() => {
    moveRowRef.current = moveRow;
  });

  useEffect(() => {
    const container = drag.containerRef.current;
    if (!container) return;
    function handleKeyDown(event: KeyboardEvent) {
      const isMoveKey = event.key === "ArrowUp" || event.key === "ArrowDown";
      if (!isMoveKey || !event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target;
      // A grip is a menu button that moves its row on Alt+arrow itself, so
      // taking the key here as well would move the row twice.
      if (
        !(target instanceof HTMLElement) ||
        !target.getAttribute("aria-keyshortcuts")?.includes("Alt+ArrowUp") ||
        target.closest('[aria-haspopup="menu"]')
      ) {
        return;
      }
      const row = target.closest(`[${REORDER_ROW_ATTRIBUTE}]`);
      const rowIndex = row ? Array.from(container!.children).indexOf(row) : -1;
      if (rowIndex < 0) return;
      event.preventDefault();
      moveRowRef.current(
        rowIndex,
        rowIndex + (event.key === "ArrowUp" ? -1 : 1),
      );
    }
    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [drag.containerRef]);

  return {
    containerRef: drag.containerRef,
    draggingIndex: drag.draggingIndex,
    gripHandlers: drag.gripHandlers,
    /** For each row's `ReorderRow`. */
    moveCount,
    /** A focus-keeping move, for visible move buttons. */
    moveRow,
  };
}
