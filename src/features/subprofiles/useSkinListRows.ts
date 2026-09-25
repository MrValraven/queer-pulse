import { useLayoutEffect, useRef, useState } from "react";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { usePositionalRowKeys } from "./usePositionalRowKeys";
import { useRowDragReorder } from "./useRowDragReorder";
import { useSkinListMoveKeys } from "./useSkinListMoveKeys";
import type { SkinListGripReorder } from "./SkinListGrip";
import {
  focusedControlIndex,
  indexAfterMove,
  useSkinListFocusRequest,
  type SkinListFocusRequest,
  type SkinListFocusTarget,
} from "./skinListFocus";

export { SKIN_LIST_ROW_ATTRIBUTE } from "./useSkinListMoveKeys";

/**
 * Shared state for the chaptered editor's list controls (lines, pairs,
 * entries): reads the array at `path`, keeps stable row keys beside it, and
 * offers add / insert / update / move / remove with focus kept where the
 * person was working. `requestFocus` overrides where focus lands after the
 * next render (a keyboard edit that removes a row, say). Rows move by drag
 * through a grip (`useRowDragReorder`), by the grip's move menu
 * (`reorderFor`), and with Alt and ArrowUp or ArrowDown in a row's
 * single-line input (`useSkinListMoveKeys`). `containerRef` must wrap only
 * the rows, each carrying `SKIN_LIST_ROW_ATTRIBUTE`.
 *
 * `shouldRowsGlide` is true while the newest change was a move: rows glide
 * into their new slots only then, so a row added or removed never fades in
 * over neighbours still gliding from their old places.
 */
export function useSkinListRows<Item>({
  editor,
  path,
  createItem,
}: {
  editor: SubprofileSkinBlocksEditor;
  path: string;
  createItem: () => Item;
}) {
  const raw = editor.getValue(path);
  const items: Item[] = Array.isArray(raw) ? (raw as Item[]) : [];
  const rowKeys = usePositionalRowKeys(items.length);
  const [shouldRowsGlide, setShouldRowsGlide] = useState(false);
  const focusRequestRef = useRef<SkinListFocusRequest | null>(null);
  // The newest list, advanced synchronously by each write, so a second swap
  // fired by a fast pointermove before the re-render builds on the first.
  const latestItemsRef = useRef(items);
  const moveRef = useRef<(from: number, to: number) => void>(() => {});
  const addButtonRef = useRef<HTMLButtonElement | null>(null);

  const commit = (next: Item[], isMove = false) => {
    latestItemsRef.current = next;
    setShouldRowsGlide(isMove);
    editor.setValue(path, next);
  };
  const drag = useRowDragReorder((from, to) => moveRef.current(from, to));

  /** Move the row at `from` to `to`; the rows between shift one place. */
  const moveTo = (from: number, to: number) => {
    const current = latestItemsRef.current;
    const isInRange = (index: number) => index >= 0 && index < current.length;
    if (!isInRange(from) || !isInRange(to) || from === to) return;
    // A request still waiting for its render means the DOM shows the list
    // before the last move, so the landing row comes from the request.
    const pending = focusRequestRef.current;
    if (pending && "rowIndex" in pending) {
      focusRequestRef.current = {
        ...pending,
        rowIndex: indexAfterMove(pending.rowIndex, from, to),
      };
    } else if (!pending) {
      const controlIndex = focusedControlIndex(drag.containerRef.current, from);
      if (controlIndex !== null) {
        focusRequestRef.current = { rowIndex: to, controlIndex };
      }
    }
    const next = [...current];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved!);
    const step = to > from ? 1 : -1;
    for (let index = from; index !== to; index += step) {
      rowKeys.swap(index, index + step);
    }
    commit(next, true);
  };

  const remove = (index: number) => {
    const current = latestItemsRef.current;
    const controlIndex = focusedControlIndex(drag.containerRef.current, index);
    const remaining = current.length - 1;
    if (controlIndex !== null) {
      focusRequestRef.current =
        remaining > 0
          ? { rowIndex: Math.min(index, remaining - 1), controlIndex }
          : { isAddButton: true };
    }
    rowKeys.removeAt(index);
    commit(current.filter((_, itemIndex) => itemIndex !== index));
  };

  const add = () => {
    const current = latestItemsRef.current;
    focusRequestRef.current = {
      rowIndex: current.length,
      controlIndex: "firstField",
    };
    rowKeys.insertAt(current.length);
    commit([...current, createItem()]);
  };

  /** Put `newItems` at `index`, and focus the last of them with the caret at
   *  the end of its first field. */
  const insert = (index: number, newItems: Item[]) => {
    if (newItems.length === 0) return;
    const current = latestItemsRef.current;
    const position = Math.max(0, Math.min(index, current.length));
    focusRequestRef.current = {
      rowIndex: position + newItems.length - 1,
      controlIndex: "firstField",
      caret: "end",
    };
    rowKeys.insertAt(position, newItems.length);
    commit([
      ...current.slice(0, position),
      ...newItems,
      ...current.slice(position),
    ]);
  };

  const requestFocus = (target: SkinListFocusTarget) => {
    focusRequestRef.current =
      "isAddButton" in target
        ? target
        : { ...target, controlIndex: "firstField" };
  };

  const isInsertedRow = (index: number) => {
    const key = rowKeys.keys[index];
    return key !== undefined && rowKeys.insertedKeys.has(key);
  };

  const update = (index: number, item: Item) =>
    commit(
      latestItemsRef.current.map((entry, itemIndex) =>
        itemIndex === index ? item : entry,
      ),
    );

  /** The grip's `reorder` prop for row `index`, whose move menu names the
   *  row by `rowLabel` and its number. */
  const reorderFor = (
    index: number,
    rowLabel: string,
  ): SkinListGripReorder => ({
    rowLabel,
    rowNumber: index + 1,
    rowCount: items.length,
    onMove: (toIndex) => moveTo(index, toIndex),
  });

  // Refresh before paint, so no pointermove or keydown after this render can
  // reach an older `move` or list. The drag hook and the key listener both
  // bind once and call through `moveRef`.
  useLayoutEffect(() => {
    latestItemsRef.current = items;
    moveRef.current = moveTo;
  });
  useSkinListMoveKeys(drag.containerRef, moveRef);
  // Lands each `focusRequestRef` request once the list has re-rendered.
  useSkinListFocusRequest(focusRequestRef, drag.containerRef, addButtonRef);

  return {
    items,
    rowKeys: rowKeys.keys,
    containerRef: drag.containerRef,
    draggingIndex: drag.draggingIndex,
    gripHandlers: drag.gripHandlers,
    shouldRowsGlide,
    addButtonRef,
    add,
    insert,
    update,
    move: moveTo,
    moveTo,
    remove,
    requestFocus,
    isInsertedRow,
    reorderFor,
  };
}
