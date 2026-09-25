import { useEffect, type RefObject } from "react";

/** Attribute on every row element (written `data-skin-list-row=""` in the
 *  controls), so a focused control can find its row. */
export const SKIN_LIST_ROW_ATTRIBUTE = "data-skin-list-row";

/**
 * Alt with ArrowUp or ArrowDown in any single-line input of a row moves that
 * row one place, through `moveRef` (bound once, so it always reaches the
 * newest `move`). Textareas keep Alt+Arrow for the caret (their rows have
 * move buttons or a grip menu), unless one declares the shortcut in
 * `aria-keyshortcuts`, as the entry title and the wrapping line do.
 */
export function useSkinListMoveKeys(
  containerRef: RefObject<HTMLDivElement | null>,
  moveRef: RefObject<(from: number, to: number) => void>,
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    function handleKeyDown(event: KeyboardEvent) {
      const isMoveKey = event.key === "ArrowUp" || event.key === "ArrowDown";
      if (!isMoveKey || !event.altKey || event.ctrlKey || event.metaKey) return;
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
  }, [containerRef, moveRef]);
}
