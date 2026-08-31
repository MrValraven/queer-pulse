import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { describeError } from "../../../../shared/api/errorMessage";
import { useAdminRoadmapMutations } from "../../api/useAdminRoadmapMutations";
import type {
  AdminRoadmapItemDTO,
  RoadmapColumn,
} from "../../api/roadmapAdmin.types";
import { useItemDrawer } from "../state/itemDrawerHook";
import { useRoadmapShortcuts } from "../state/useRoadmapShortcuts";

export interface BoardDropTarget {
  column: RoadmapColumn;
  index: number;
}

export interface CardDragProps {
  draggable: true;
  onDragStart: (event: DragEvent<HTMLElement>) => void;
  onDragEnd: (event: DragEvent<HTMLElement>) => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
}

export interface ColumnDropProps {
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
}

/** The pointer-free half of reordering: one step up or down inside the card's
 *  own column, offered by the card kebab. Both flags are false when the step
 *  is unavailable (an end of the column, or a sort that isn't manual). */
export interface CardMoveProps {
  canMoveUp: boolean;
  canMoveDown: boolean;
  moveUp: () => void;
  moveDown: () => void;
}

/**
 * Board drag-and-drop (move between columns, reorder within) plus the
 * `j`/`k`/`e` focused-card keyboard model — both driven by one `columns`
 * map (each value already filtered/sorted, in render order) so drag math
 * and keyboard focus agree on exactly what's on screen. `sortOrder` on drop
 * is a simple midpoint between the two neighbors it lands between
 * (Trello-style fractional ordering); the mutation only ever writes the one
 * dragged item, and a move to `shipped` never sets `progress` here — the
 * server/demo reducer forces that itself.
 *
 * Card-level `onDragOver` sets a precise `{column, index}`; the column's own
 * `onDragOver` (which also fires, via bubbling, after a card's) only widens
 * that to "end of column" when the pointer isn't over any card — it never
 * overwrites an index a card handler just set for the same column.
 *
 * `getCardMoveProps` is the same reorder without a pointer (`CardMenu`'s
 * "Move up"/"Move down"), routed through the very same `commitMove`, so a
 * keyboard step and the equivalent drag write an identical `sortOrder`.
 * Offered only when `isManualOrder` — under a votes/priority/stale sort the
 * column is re-sorted on every render, so a rewritten `sortOrder` would move
 * the card nowhere visible and the position we announce would be a lie.
 */
export function useBoardDnd(
  columns: Record<RoadmapColumn, AdminRoadmapItemDTO[]>,
  isManualOrder: boolean,
) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const itemDrawer = useItemDrawer();
  const { updateItem } = useAdminRoadmapMutations();

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<BoardDropTarget | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [reorderAnnouncement, setReorderAnnouncement] = useState("");
  const announcementFrameRef = useRef(0);

  useEffect(
    () => () => window.cancelAnimationFrame(announcementFrameRef.current),
    [],
  );

  const flatOrder = useMemo(
    () =>
      (Object.keys(columns) as RoadmapColumn[]).flatMap(
        (column) => columns[column],
      ),
    [columns],
  );

  const moveFocus = useCallback(
    (delta: number) => {
      setFocusedId((current) => {
        if (flatOrder.length === 0) return null;
        const currentIndex = current
          ? flatOrder.findIndex((item) => item.id === current)
          : -1;
        const nextIndex =
          currentIndex === -1
            ? 0
            : Math.min(Math.max(currentIndex + delta, 0), flatOrder.length - 1);
        return flatOrder[nextIndex]?.id ?? null;
      });
    },
    [flatOrder],
  );

  useRoadmapShortcuts({
    onFocusNext: () => moveFocus(1),
    onFocusPrev: () => moveFocus(-1),
    onEditFocused: () => {
      if (focusedId) itemDrawer.open(focusedId);
    },
  });

  const commitMove = useCallback(
    (
      itemId: string,
      column: RoadmapColumn,
      index: number,
      onMoved?: () => void,
    ) => {
      const targetItems = columns[column].filter((item) => item.id !== itemId);
      // `index` was computed by `onDragOver` against `columns[column]`,
      // which still INCLUDES the dragged item — but `targetItems` above has
      // it removed. For a same-column move where the item started before
      // the drop point, removing it shifts every later index down by one,
      // so the target index needs the same correction or the item lands one
      // slot early (e.g. "drag to end" landing at the front, sortOrder 0).
      // Cross-column moves have `sourceIndex === -1`, so they're untouched.
      const sourceIndex = columns[column].findIndex(
        (item) => item.id === itemId,
      );
      const adjustedIndex =
        sourceIndex !== -1 && sourceIndex < index ? index - 1 : index;
      const before = targetItems[adjustedIndex - 1];
      const after = targetItems[adjustedIndex];
      const sortOrder =
        before && after
          ? (before.sortOrder + after.sortOrder) / 2
          : before
            ? before.sortOrder + 10
            : after
              ? after.sortOrder - 10
              : 0;

      updateItem(
        { id: itemId, body: { column, sortOrder } },
        {
          onSuccess: onMoved,
          onError: (error) =>
            showToast(
              describeError(
                t("admin:roadmap.board.menu.moveTo", {
                  column: t(`admin:roadmap.board.column.${column}`),
                }),
                error,
              ),
              "error",
            ),
        },
      );
    },
    [columns, updateItem, showToast, t],
  );

  /**
   * Writes the board's polite live region (rendered once by `BoardView`).
   * A keyboard reorder leaves focus on the menu item that was pressed and
   * changes nothing else the reader is looking at, so without this the move
   * is completely silent and the only way to check it is to re-read the whole
   * column.
   *
   * Cleared first and written back on the next frame so the two writes land
   * in separate commits and the text is GUARANTEED to change: stepping the
   * same card up twice in a row from an already-settled board produces two
   * different positions, but a step that lands back where a previous
   * announcement left it (up, down, up) repeats the string exactly, and a
   * live region handed identical text is never re-read.
   */
  const announceMove = useCallback(
    (name: string, position: number, total: number) => {
      window.cancelAnimationFrame(announcementFrameRef.current);
      setReorderAnnouncement("");
      announcementFrameRef.current = window.requestAnimationFrame(() => {
        setReorderAnnouncement(
          t("admin:roadmap.board.reorder.movedAnnouncement", {
            name,
            position,
            total,
          }),
        );
      });
    },
    [t],
  );

  /**
   * One keyboard step within a column, expressed as the drop index the same
   * drag would have produced: moving up lands above the card before it
   * (`targetIndex`), moving down lands below the card after it
   * (`currentIndex + 2`). `commitMove` then applies its own
   * dragged-item-removed correction and the midpoint math, so the `sortOrder`
   * written here is byte-for-byte the one a drag writes.
   */
  const moveCardWithinColumn = useCallback(
    (item: AdminRoadmapItemDTO, column: RoadmapColumn, step: -1 | 1) => {
      const columnItems = columns[column];
      const currentIndex = columnItems.findIndex(
        (candidate) => candidate.id === item.id,
      );
      if (currentIndex === -1) return;
      const targetIndex = currentIndex + step;
      if (targetIndex < 0 || targetIndex >= columnItems.length) return;

      commitMove(
        item.id,
        column,
        step === -1 ? targetIndex : currentIndex + 2,
        () => announceMove(item.name, targetIndex + 1, columnItems.length),
      );
    },
    [columns, commitMove, announceMove],
  );

  const getCardMoveProps = useCallback(
    (
      item: AdminRoadmapItemDTO,
      column: RoadmapColumn,
      index: number,
    ): CardMoveProps => ({
      canMoveUp: isManualOrder && index > 0,
      canMoveDown: isManualOrder && index < columns[column].length - 1,
      moveUp: () => moveCardWithinColumn(item, column, -1),
      moveDown: () => moveCardWithinColumn(item, column, 1),
    }),
    [columns, isManualOrder, moveCardWithinColumn],
  );

  const getCardDragProps = useCallback(
    (
      item: AdminRoadmapItemDTO,
      column: RoadmapColumn,
      index: number,
    ): CardDragProps => ({
      draggable: true,
      onDragStart: (event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", item.id);
        setDraggingId(item.id);
      },
      onDragEnd: () => {
        setDraggingId(null);
        setDropTarget(null);
      },
      onDragOver: (event) => {
        event.preventDefault();
        const rect = event.currentTarget.getBoundingClientRect();
        const isBelowMidpoint = event.clientY - rect.top > rect.height / 2;
        setDropTarget({ column, index: isBelowMidpoint ? index + 1 : index });
      },
    }),
    [],
  );

  const getColumnDropProps = useCallback(
    (column: RoadmapColumn): ColumnDropProps => ({
      onDragOver: (event) => {
        event.preventDefault();
        setDropTarget((current) =>
          current && current.column === column
            ? current
            : { column, index: columns[column].length },
        );
      },
      onDrop: (event) => {
        event.preventDefault();
        const itemId = event.dataTransfer.getData("text/plain") || draggingId;
        if (itemId && dropTarget)
          commitMove(itemId, dropTarget.column, dropTarget.index);
        setDraggingId(null);
        setDropTarget(null);
      },
    }),
    [draggingId, dropTarget, columns, commitMove],
  );

  return {
    focusedId,
    draggingId,
    dropTarget,
    reorderAnnouncement,
    getCardDragProps,
    getCardMoveProps,
    getColumnDropProps,
  };
}

export type UseBoardDndResult = ReturnType<typeof useBoardDnd>;
