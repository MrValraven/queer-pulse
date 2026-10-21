import type { DragEvent } from "react";

/** The id a dragged row carries, kept apart from anything else dropped. */
const ENTRY_DRAG_TYPE = "application/x-studio-playlist-entry";

export function startEntryDrag(
  event: DragEvent<HTMLSpanElement>,
  entryId: string,
) {
  event.dataTransfer.setData(ENTRY_DRAG_TYPE, entryId);
  event.dataTransfer.effectAllowed = "move";
  const rowElement = event.currentTarget.closest("li");
  if (rowElement) event.dataTransfer.setDragImage(rowElement, 16, 16);
}

/** The row a drop landed on, as its place among the list's rows. A row
 *  fading out after a removal is left out of the count. */
function dropIndexOf(event: DragEvent<HTMLElement>): number | null {
  const list = event.currentTarget;
  const row = (event.target as Element | null)?.closest("li");
  if (!row || row.parentElement !== list) return null;
  const rows = [...list.children].filter(
    (child) => child.tagName === "LI" && !child.hasAttribute("data-exiting"),
  );
  const index = rows.indexOf(row);
  return index === -1 ? null : index;
}

/** The list-level drop target for the owner and editors: an entry dropped
 *  on any row (available or not) moves to that row's place. */
export function listDropTarget(
  onDropAt: (draggedEntryId: string, targetIndex: number) => void,
) {
  return {
    onDragOver: (event: DragEvent<HTMLElement>) => {
      if (event.dataTransfer.types.includes(ENTRY_DRAG_TYPE))
        event.preventDefault();
    },
    onDrop: (event: DragEvent<HTMLElement>) => {
      const draggedEntryId = event.dataTransfer.getData(ENTRY_DRAG_TYPE);
      const targetIndex = dropIndexOf(event);
      if (!draggedEntryId || targetIndex === null) return;
      event.preventDefault();
      onDropAt(draggedEntryId, targetIndex);
    },
  };
}
