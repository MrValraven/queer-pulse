import { useEffect, type RefObject } from "react";

/** The one Tab stop in a row: the lead cell (play, or the checkbox while
 *  selecting), or the title link on a hidden or blocked row. */
export const ROW_FOCUS_ATTRIBUTE = "data-studio-row-focus";
/** Marks a row root so the arrow keys can find its neighbours. */
export const ROW_ATTRIBUTE = "data-studio-track-row";

export const FOCUSABLE_SELECTOR =
  "a[href], button, input, select, textarea, [tabindex]:not([tabindex='-1'])";
/** Popups that render inside a row keep their own keys and Tab order. */
export const POPUP_SELECTOR =
  "[role='menu'], [role='dialog'], [role='listbox']";

/** Every control in a row but its Tab stop leaves the Tab order, so a list
 *  of 400 rows costs 400 Tab presses instead of 2,000. The row's own
 *  controls set tabIndex through props; this reaches the shared ones (the
 *  heart, Add to playlist, the menu trigger, a caller's extra actions). */
export function sweepRowTabOrder(rowElement: HTMLElement) {
  const controls = rowElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  for (const element of controls) {
    if (element.closest(POPUP_SELECTOR)) continue;
    if (element.hasAttribute(ROW_FOCUS_ATTRIBUTE)) continue;
    if (element.getAttribute("tabindex") !== "-1")
      element.setAttribute("tabindex", "-1");
  }
}

interface ListSweep {
  observer: MutationObserver;
  rowCount: number;
}

/** One observer per list, shared by its rows. */
const listSweeps = new WeakMap<Element, ListSweep>();

function sweepMutatedRows(records: MutationRecord[]) {
  const rows = new Set<HTMLElement>();
  for (const record of records) {
    const element =
      record.target instanceof Element
        ? record.target
        : record.target.parentElement;
    const row = element?.closest(`[${ROW_ATTRIBUTE}]`);
    if (row instanceof HTMLElement) rows.add(row);
  }
  rows.forEach(sweepRowTabOrder);
}

/** Registers the row's list with the shared observer; the last row to
 *  leave disconnects it. */
export function useStudioTrackListSweep(rowRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const listElement = rowRef.current?.parentElement;
    if (!listElement) return;
    let sweep = listSweeps.get(listElement);
    if (!sweep) {
      const observer = new MutationObserver(sweepMutatedRows);
      observer.observe(listElement, { childList: true, subtree: true });
      sweep = { observer, rowCount: 0 };
      listSweeps.set(listElement, sweep);
    }
    const registered = sweep;
    registered.rowCount += 1;
    return () => {
      registered.rowCount -= 1;
      if (registered.rowCount > 0) return;
      registered.observer.disconnect();
      listSweeps.delete(listElement);
    };
  }, [rowRef]);
}
