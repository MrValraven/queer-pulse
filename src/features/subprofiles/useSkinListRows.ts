import { useEffect, useLayoutEffect, useRef } from "react";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { usePositionalRowKeys } from "./usePositionalRowKeys";
import { useRowDragReorder } from "./useRowDragReorder";

/** Attribute on every row element (written `data-skin-list-row=""` in the
 *  controls), so a focused control can find its row. */
export const SKIN_LIST_ROW_ATTRIBUTE = "data-skin-list-row";

const ROW_CONTROLS = "input, textarea, button";
const ROW_FIELDS = "input, textarea";

/** Where focus lands once the list re-renders: a control inside a row (by its
 *  position among the row's inputs and buttons, or the row's first field), or
 *  the add button once the list is empty. */
type FocusRequest =
  | { rowIndex: number; controlIndex: number | "firstField" }
  | { isAddButton: true };

function isUsable(element: HTMLElement | undefined): element is HTMLElement {
  return Boolean(element) && !element!.matches(":disabled");
}

/** Focus the control at `controlIndex` in `row`, or its nearest usable
 *  neighbour when that one is disabled (a move button at the list's edge). */
function focusRowControl(row: Element, controlIndex: number | "firstField") {
  if (controlIndex === "firstField") {
    row.querySelector<HTMLElement>(ROW_FIELDS)?.focus();
    return;
  }
  const controls = Array.from(row.querySelectorAll<HTMLElement>(ROW_CONTROLS));
  const target = isUsable(controls[controlIndex])
    ? controls[controlIndex]
    : (controls.slice(controlIndex).find(isUsable) ??
      controls.slice(0, controlIndex).reverse().find(isUsable));
  target?.focus();
}

/** The position of the focused control inside row `rowIndex` of the list,
 *  or null when focus is anywhere else. */
function focusedControlIndex(container: HTMLElement | null, rowIndex: number) {
  const row = container?.children[rowIndex];
  const active = document.activeElement;
  if (!row || !(active instanceof HTMLElement) || !row.contains(active)) {
    return null;
  }
  const index = Array.from(row.querySelectorAll(ROW_CONTROLS)).indexOf(active);
  return index >= 0 ? index : null;
}

/**
 * Shared state for the chaptered editor's list controls (pairs, entries,
 * paragraphs): reads the array at `path`, keeps stable row keys beside it,
 * and offers add / update / move / remove with focus kept where the person
 * was working. Drag uses `useRowDragReorder` through a grip, and Alt with
 * ArrowUp or ArrowDown in any single-line input of a row moves that row.
 * `containerRef` must wrap only the rows, each carrying
 * `SKIN_LIST_ROW_ATTRIBUTE`.
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
  const focusRequestRef = useRef<FocusRequest | null>(null);
  // The newest list, advanced synchronously by each write, so a second swap
  // fired by a fast pointermove before the re-render builds on the first.
  const latestItemsRef = useRef(items);
  const moveRef = useRef<(from: number, to: number) => void>(() => {});
  const addButtonRef = useRef<HTMLButtonElement | null>(null);

  const commit = (next: Item[]) => {
    latestItemsRef.current = next;
    editor.setValue(path, next);
  };
  const drag = useRowDragReorder((from, to) => moveRef.current(from, to));

  const move = (from: number, to: number) => {
    const current = latestItemsRef.current;
    if (to < 0 || to >= current.length || from === to) return;
    const controlIndex = focusedControlIndex(drag.containerRef.current, from);
    if (controlIndex !== null) {
      focusRequestRef.current = { rowIndex: to, controlIndex };
    }
    const next = [...current];
    [next[from], next[to]] = [next[to]!, next[from]!];
    rowKeys.swap(from, to);
    commit(next);
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
    commit([...current, createItem()]);
  };

  const update = (index: number, item: Item) =>
    commit(
      latestItemsRef.current.map((entry, itemIndex) =>
        itemIndex === index ? item : entry,
      ),
    );

  // Refresh before paint, so no pointermove or keydown after this render can
  // reach an older `move` or list. The drag hook and the key listener below
  // both bind once and call through `moveRef`.
  useLayoutEffect(() => {
    latestItemsRef.current = items;
    moveRef.current = move;
  });

  useEffect(() => {
    const container = drag.containerRef.current;
    if (!container) return;
    function handleKeyDown(event: KeyboardEvent) {
      const isMoveKey = event.key === "ArrowUp" || event.key === "ArrowDown";
      if (!isMoveKey || !event.altKey || event.ctrlKey || event.metaKey) return;
      // Textareas keep Alt+Arrow for the caret (their rows have move
      // buttons), unless one declares the shortcut, as the entry title does.
      const target = event.target;
      const isMoveTarget =
        target instanceof HTMLInputElement ||
        (target instanceof HTMLTextAreaElement &&
          Boolean(
            target.getAttribute("aria-keyshortcuts")?.includes("Alt+ArrowUp"),
          ));
      if (!isMoveTarget) return;
      const row = target.closest(`[${SKIN_LIST_ROW_ATTRIBUTE}]`);
      const rowIndex = row ? Array.from(container!.children).indexOf(row) : -1;
      if (rowIndex < 0) return;
      event.preventDefault();
      moveRef.current(rowIndex, rowIndex + (event.key === "ArrowUp" ? -1 : 1));
    }
    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [drag.containerRef]);

  // Moving a row re-inserts its DOM node, which drops focus; a new or removed
  // row also needs focus placed. Runs after every render and waits until the
  // requested row exists.
  useLayoutEffect(() => {
    const request = focusRequestRef.current;
    if (!request) return;
    if ("isAddButton" in request) {
      focusRequestRef.current = null;
      addButtonRef.current?.focus();
      return;
    }
    const row = drag.containerRef.current?.children[request.rowIndex];
    if (!row) return;
    focusRequestRef.current = null;
    focusRowControl(row, request.controlIndex);
  });

  return {
    items,
    rowKeys: rowKeys.keys,
    containerRef: drag.containerRef,
    draggingIndex: drag.draggingIndex,
    gripHandlers: drag.gripHandlers,
    addButtonRef,
    add,
    update,
    move,
    remove,
  };
}
