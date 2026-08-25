import { useMemo } from "react";
import type {
  AdminRoadmapItemDTO,
  RoadmapColumn,
} from "../../api/roadmapAdmin.types";
import { matchItem, sortItems } from "../state/roadmapFiltersTypes";
import { useRoadmapFilters } from "../state/roadmapFiltersHook";
import { BoardColumn } from "../board/BoardColumn";
import { useBoardDnd } from "../board/useBoardDnd";
import styles from "./BoardView.module.css";

const COLUMN_ORDER: RoadmapColumn[] = [
  "backlog",
  "planned",
  "building",
  "shipped",
];

function buildMaxSortOrderByColumn(
  items: AdminRoadmapItemDTO[],
): Record<RoadmapColumn, number> {
  const result: Record<RoadmapColumn, number> = {
    backlog: 0,
    planned: 0,
    building: 0,
    shipped: 0,
  };
  for (const item of items) {
    if (item.sortOrder > result[item.column])
      result[item.column] = item.sortOrder;
  }
  return result;
}

/**
 * The Board view — 4 columns (backlog/planned/building/shipped), each the
 * `items` prop filtered by the shared toolbar (`matchItem`) and sorted by
 * the active sort (`sortItems`). Board owns this filtering itself (it's one
 * of only two views — with Timeline — that reads the toolbar's filter
 * state at all) rather than the page doing it, so every view stays free to
 * define "what am I showing" on its own terms.
 *
 * `itemsById`/`maxSortOrderByColumn` are derived from the full (unfiltered)
 * `items` prop, not the per-column filtered lists, so a card's "waiting on"
 * dependency name and a kebab "move to" always resolve correctly even when
 * the dependency or the target column's other items are hidden by the
 * current filter.
 */
export function BoardView({ items }: { items: AdminRoadmapItemDTO[] }) {
  const { filters } = useRoadmapFilters();

  const itemsById = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );
  const maxSortOrderByColumn = useMemo(
    () => buildMaxSortOrderByColumn(items),
    [items],
  );

  const columns = useMemo(() => {
    const visible = items.filter((item) => matchItem(item, filters));
    const result = {} as Record<RoadmapColumn, AdminRoadmapItemDTO[]>;
    for (const column of COLUMN_ORDER) {
      result[column] = sortItems(
        visible.filter((item) => item.column === column),
        filters.sort,
      );
    }
    return result;
  }, [items, filters]);

  const dnd = useBoardDnd(columns);

  return (
    <div
      className={[styles.board, filters.dense && styles.boardDense]
        .filter(Boolean)
        .join(" ")}
    >
      {COLUMN_ORDER.map((column) => (
        <BoardColumn
          key={column}
          column={column}
          items={columns[column]}
          dense={filters.dense}
          itemsById={itemsById}
          maxSortOrderByColumn={maxSortOrderByColumn}
          dnd={dnd}
        />
      ))}
    </div>
  );
}
