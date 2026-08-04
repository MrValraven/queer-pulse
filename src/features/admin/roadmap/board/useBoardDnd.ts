import { useCallback, useMemo, useState, type DragEvent } from "react";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { describeError } from "../../../../shared/api/errorMessage";
import { useAdminRoadmapMutations } from "../../api/useAdminRoadmapMutations";
import type { AdminRoadmapItemDTO, RoadmapColumn } from "../../api/roadmapAdmin.types";
import { useItemDrawer } from "../state/useItemDrawer";
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
 */
export function useBoardDnd(columns: Record<RoadmapColumn, AdminRoadmapItemDTO[]>) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const itemDrawer = useItemDrawer();
  const { updateItem } = useAdminRoadmapMutations();

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<BoardDropTarget | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const flatOrder = useMemo(
    () =>
      (Object.keys(columns) as RoadmapColumn[]).flatMap((column) => columns[column]),
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
    (itemId: string, column: RoadmapColumn, index: number) => {
      const targetItems = columns[column].filter((item) => item.id !== itemId);
      // `index` was computed by `onDragOver` against `columns[column]`,
      // which still INCLUDES the dragged item — but `targetItems` above has
      // it removed. For a same-column move where the item started before
      // the drop point, removing it shifts every later index down by one,
      // so the target index needs the same correction or the item lands one
      // slot early (e.g. "drag to end" landing at the front, sortOrder 0).
      // Cross-column moves have `sourceIndex === -1`, so they're untouched.
      const sourceIndex = columns[column].findIndex((item) => item.id === itemId);
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

  const getCardDragProps = useCallback(
    (item: AdminRoadmapItemDTO, column: RoadmapColumn, index: number): CardDragProps => ({
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
        if (itemId && dropTarget) commitMove(itemId, dropTarget.column, dropTarget.index);
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
    getCardDragProps,
    getColumnDropProps,
  };
}

export type UseBoardDndResult = ReturnType<typeof useBoardDnd>;
