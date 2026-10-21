import { useEffect, useRef, type RefObject } from "react";
import type { StudioRowSelection } from "./useStudioRowSelection";

const POPUP_SELECTOR = "[role='menu'], [role='dialog'], [role='listbox']";
const BAR_CONTROL_SELECTOR = "button:not([aria-disabled='true'])";
/** Fields where Escape belongs to the field (clearing a search). */
const TEXT_ENTRY_SELECTOR =
  "input:not([type='checkbox']):not([type='radio']), textarea, [contenteditable='true']";

/** This list's rows, and no other list's on the page. */
function listRowSelector(listId: string) {
  return `[data-studio-track-row][data-selection-list="${CSS.escape(listId)}"]`;
}

/** Focuses the Tab stop of the row the member last picked, once the rows
 *  have swapped their checkboxes back for play buttons. When a bulk
 *  removal took that row away, its nearest remaining neighbour. */
function focusSelectionAnchor(selection: StudioRowSelection) {
  const anchorId = selection.getFocusAnchorId();
  if (anchorId === null) return;
  const anchorIndex = selection.getFocusAnchorIndex();
  const rowSelector = `${listRowSelector(selection.listId)}:not([data-exiting])`;
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const rows = Array.from(
        document.querySelectorAll<HTMLElement>(rowSelector),
      );
      const row =
        rows.find((element) => element.dataset.selectionId === anchorId) ??
        rows[Math.min(anchorIndex, rows.length - 1)];
      row?.querySelector<HTMLElement>("[data-studio-row-focus]")?.focus();
    }),
  );
}

/** Focus was somewhere selection mode is taking away: the bar, a row's
 *  checkbox, or nowhere. */
function isFocusLeftBehind(barElement: HTMLElement | null) {
  const active = document.activeElement;
  if (!active || active === document.body) return true;
  if (barElement?.contains(active)) return true;
  return (
    active instanceof HTMLInputElement &&
    active.type === "checkbox" &&
    active.closest("[data-studio-track-row]") !== null
  );
}

/** The selection bar's keyboard: F6 or Alt+Down moves focus into the bar,
 *  from one of the list's rows, F6 or Alt+Up from the bar goes back to the
 *  list, and Escape clears the selection (unless a menu, a dialog or a text
 *  field took it first). When selection mode ends, by Clear, Escape or an
 *  action, focus returns to the last row the member picked. */
export function useStudioSelectionBarKeys(
  selection: StudioRowSelection,
  barRef: RefObject<HTMLElement | null>,
) {
  const { isSelecting, clear, listId } = selection;
  // The latest selection for the restore, read after the commit.
  const selectionRef = useRef(selection);
  useEffect(() => {
    selectionRef.current = selection;
  });

  useEffect(() => {
    if (!isSelecting) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest(POPUP_SELECTOR)) return;
      const barElement = barRef.current;
      const isInBar = barElement?.contains(target) ?? false;
      const isInList = target?.closest(listRowSelector(listId)) != null;
      const isPlainF6 =
        event.key === "F6" &&
        !event.shiftKey &&
        !event.metaKey &&
        !event.ctrlKey;
      if (event.key === "Escape") {
        if (target?.closest(TEXT_ENTRY_SELECTOR)) return;
        if (document.querySelector("[role='dialog'][aria-modal='true']"))
          return;
        clear();
      } else if (
        isInList &&
        (isPlainF6 || (event.altKey && event.key === "ArrowDown"))
      ) {
        event.preventDefault();
        barElement?.querySelector<HTMLElement>(BAR_CONTROL_SELECTOR)?.focus();
      } else if (
        isInBar &&
        (isPlainF6 || (event.altKey && event.key === "ArrowUp"))
      ) {
        event.preventDefault();
        focusSelectionAnchor(selectionRef.current);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isSelecting, clear, listId, barRef]);

  const wasSelectingRef = useRef(isSelecting);
  useEffect(() => {
    const wasSelecting = wasSelectingRef.current;
    wasSelectingRef.current = isSelecting;
    if (!wasSelecting || isSelecting) return;
    if (isFocusLeftBehind(barRef.current))
      focusSelectionAnchor(selectionRef.current);
  }, [isSelecting, barRef]);
}
