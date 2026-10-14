import { useRef, type DragEvent, type RefObject } from "react";

/** One reorderable console row, shared by a shelf's picks and the active
 *  scenes: Move up and Move down that keep focus on the pressed button once
 *  the row lands, and a drag handle whose drop target is the row. */
export interface StudioAdminReorderRow {
  moveUpRef: RefObject<HTMLButtonElement | null>;
  moveDownRef: RefObject<HTMLButtonElement | null>;
  moveUp: () => void;
  moveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  /** Spread on the drag handle, a plain element: on an `m.*` element the
   *  drag props mean pointer panning. */
  handleProps: {
    draggable: boolean;
    onDragStart: (event: DragEvent<HTMLElement>) => void;
  };
  /** Spread on the row. */
  dropProps: {
    onDragOver: (event: DragEvent<HTMLElement>) => void;
    onDrop: (event: DragEvent<HTMLElement>) => void;
  };
}

export function useStudioAdminReorderRow({
  dragType,
  itemId,
  index,
  count,
  isBusy,
  isMovable = true,
  onMove,
  onDropAt,
}: {
  /** A media type of the console's own, so nothing else dropped is read. */
  dragType: string;
  itemId: string;
  index: number;
  count: number;
  isBusy: boolean;
  /** False for a row that never moves (an archived scene). */
  isMovable?: boolean;
  onMove: (targetIndex: number) => void;
  onDropAt: (draggedId: string) => void;
}): StudioAdminReorderRow {
  const moveUpRef = useRef<HTMLButtonElement>(null);
  const moveDownRef = useRef<HTMLButtonElement>(null);

  function pressMove(
    targetIndex: number,
    buttonRef: RefObject<HTMLButtonElement | null>,
  ) {
    if (!isMovable || isBusy || targetIndex < 0 || targetIndex >= count) return;
    onMove(targetIndex);
    // The row moves; the pressed button keeps focus once it lands.
    requestAnimationFrame(() => buttonRef.current?.focus());
  }

  return {
    moveUpRef,
    moveDownRef,
    moveUp: () => pressMove(index - 1, moveUpRef),
    moveDown: () => pressMove(index + 1, moveDownRef),
    isFirst: index === 0,
    isLast: index === count - 1,
    handleProps: {
      draggable: isMovable && !isBusy && count > 1,
      onDragStart: (event) => {
        event.dataTransfer.setData(dragType, itemId);
        event.dataTransfer.effectAllowed = "move";
      },
    },
    dropProps: {
      onDragOver: (event) => {
        if (isMovable && event.dataTransfer.types.includes(dragType))
          event.preventDefault();
      },
      onDrop: (event) => {
        const draggedId = event.dataTransfer.getData(dragType);
        if (!isMovable || !draggedId) return;
        event.preventDefault();
        onDropAt(draggedId);
      },
    },
  };
}

/** After a row leaves its list, moves focus to the same control on the next
 *  row, else the previous row, else the fallback (a section heading). */
export function focusNeighbourControl({
  list,
  index,
  findControl,
  fallback,
}: {
  list: HTMLElement | null;
  index: number;
  findControl: (row: Element) => HTMLElement | null;
  fallback: HTMLElement | null;
}) {
  const rows = Array.from(list?.children ?? []);
  const neighbours = [rows[index + 1], rows[index - 1]];
  const control = neighbours
    .map((row) => (row ? findControl(row) : null))
    .find((candidate) => candidate !== null);
  requestAnimationFrame(() => (control ?? fallback)?.focus());
}
