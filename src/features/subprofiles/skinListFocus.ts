/** Focus placement for the list controls' rows (`useSkinListRows`). */

import { useLayoutEffect, type RefObject } from "react";

const ROW_CONTROLS = "input, textarea, button";
const ROW_FIELDS = "input, textarea";

/** Where the caret goes in a focused field: its end, or an offset. */
export type SkinListCaret = "end" | number;

/** Where focus lands once the list re-renders: a control inside a row (by its
 *  position among the row's inputs and buttons, or the row's first field,
 *  optionally with the caret placed), or the add button once the list is
 *  empty. */
export type SkinListFocusRequest =
  | {
      rowIndex: number;
      controlIndex: number | "firstField";
      caret?: SkinListCaret;
    }
  | { isAddButton: true };

/** What a caller asks for: a row's first field (with the caret at its end or
 *  an offset, when given), or the add button. */
export type SkinListFocusTarget =
  { rowIndex: number; caret?: SkinListCaret } | { isAddButton: true };

function isUsable(element: HTMLElement | undefined): element is HTMLElement {
  return Boolean(element) && !element!.matches(":disabled");
}

function placeCaret(element: HTMLElement | null, caret: SkinListCaret) {
  if (
    !(element instanceof HTMLInputElement) &&
    !(element instanceof HTMLTextAreaElement)
  ) {
    return;
  }
  const position =
    caret === "end"
      ? element.value.length
      : Math.min(caret, element.value.length);
  element.setSelectionRange(position, position);
}

/** Focus the control at `controlIndex` in `row`, or its nearest usable
 *  neighbour when that one is disabled (a move button at the list's edge). */
export function focusRowControl(
  row: Element,
  controlIndex: number | "firstField",
  caret?: SkinListCaret,
) {
  if (controlIndex === "firstField") {
    const field = row.querySelector<HTMLElement>(ROW_FIELDS);
    field?.focus();
    if (caret !== undefined) placeCaret(field, caret);
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
export function focusedControlIndex(
  container: HTMLElement | null,
  rowIndex: number,
) {
  const row = container?.children[rowIndex];
  const active = document.activeElement;
  if (!row || !(active instanceof HTMLElement) || !row.contains(active)) {
    return null;
  }
  const index = Array.from(row.querySelectorAll(ROW_CONTROLS)).indexOf(active);
  return index >= 0 ? index : null;
}

/** Where row `index` sits once the row at `from` moves to `to`: the moved
 *  row lands on `to`, and the rows it passes shift one place to fill in. */
export function indexAfterMove(index: number, from: number, to: number) {
  if (index === from) return to;
  if (from < to && index > from && index <= to) return index - 1;
  if (from > to && index >= to && index < from) return index + 1;
  return index;
}

/**
 * Places focus after each render that follows a `focusRequestRef` request.
 * Moving a row re-inserts its DOM node, which drops focus; a new or removed
 * row also needs focus placed. A request lives for one commit: it is taken
 * on the first render after it was made, found row or not, so it can never
 * land later on a row the person has since left.
 */
export function useSkinListFocusRequest(
  focusRequestRef: RefObject<SkinListFocusRequest | null>,
  containerRef: RefObject<HTMLElement | null>,
  addButtonRef: RefObject<HTMLButtonElement | null>,
) {
  useLayoutEffect(() => {
    const request = focusRequestRef.current;
    if (!request) return;
    focusRequestRef.current = null;
    if ("isAddButton" in request) {
      addButtonRef.current?.focus();
      return;
    }
    const row = containerRef.current?.children[request.rowIndex];
    if (row) focusRowControl(row, request.controlIndex, request.caret);
  });
}
