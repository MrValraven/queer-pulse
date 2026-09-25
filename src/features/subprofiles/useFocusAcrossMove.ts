import { useCallback, useLayoutEffect, useRef } from "react";

type TextField = HTMLTextAreaElement | HTMLInputElement;

interface FocusSnapshot {
  element: HTMLElement;
  selection: {
    start: number;
    end: number;
    direction: "forward" | "backward" | "none";
  } | null;
}

const isTextField = (element: HTMLElement): element is TextField =>
  element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement;

/** The controls a row can hand focus to, and the row itself: `ReorderRow`
 *  carries `data-reorder-row`. */
const ROW_CONTROLS = "input, textarea, select, button";
const ROW_SELECTOR = "[data-reorder-row]";

const isUsable = (element: HTMLElement | undefined): element is HTMLElement =>
  element !== undefined && !element.matches(":disabled");

/** A move button that turned disabled at the list's edge hands focus to the
 *  nearest usable control in its row. Backwards first: from a disabled "Move
 *  down" that is "Move up", and a forward search could land on remove. */
function focusUsableNeighbour(element: HTMLElement) {
  const row = element.closest(ROW_SELECTOR);
  if (!row) return;
  const controls = Array.from(row.querySelectorAll<HTMLElement>(ROW_CONTROLS));
  const position = controls.indexOf(element);
  const neighbour =
    controls.slice(0, Math.max(position, 0)).reverse().find(isUsable) ??
    controls.slice(position + 1).find(isUsable);
  neighbour?.focus();
}

function selectionOf(element: HTMLElement): FocusSnapshot["selection"] {
  if (!isTextField(element)) return null;
  const { selectionStart, selectionEnd, selectionDirection } = element;
  if (selectionStart === null || selectionEnd === null) return null;
  return {
    start: selectionStart,
    end: selectionEnd,
    direction: selectionDirection ?? "none",
  };
}

/**
 * Keeps focus, caret and selection where they were across a reorder. React
 * moves a row by re-inserting its DOM node, which drops the focus inside it;
 * the field itself survives (its key rides along), so `remember` notes it
 * before the write and the next commit puts focus and caret back. Nothing
 * happens when focus survived the move or went somewhere on purpose, and the
 * note is dropped on that commit either way, so it can never fire later. A
 * control that turned disabled hands focus to a neighbour in its row.
 */
export function useFocusAcrossMove() {
  const snapshotRef = useRef<FocusSnapshot | null>(null);

  const remember = useCallback(() => {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || active === document.body) return;
    snapshotRef.current = { element: active, selection: selectionOf(active) };
  }, []);

  // No dependency list on purpose: served by whichever render commits next.
  useLayoutEffect(() => {
    const snapshot = snapshotRef.current;
    if (!snapshot) return;
    snapshotRef.current = null;
    const { element, selection } = snapshot;
    const active = document.activeElement;
    const isFocusLost = active === null || active === document.body;
    if (!element.isConnected) return;
    // A button disabled under focus can still be `activeElement` here, before
    // the browser drops its focus, so it counts as lost focus too.
    if (element.matches(":disabled") && (isFocusLost || active === element)) {
      focusUsableNeighbour(element);
      return;
    }
    if (!isFocusLost) return;
    element.focus();
    if (selection && isTextField(element)) {
      element.setSelectionRange(
        selection.start,
        selection.end,
        selection.direction,
      );
    }
  });

  return { remember };
}
