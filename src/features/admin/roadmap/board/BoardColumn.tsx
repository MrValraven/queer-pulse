import { Fragment } from "react";
import { FiPlus } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type {
  AdminRoadmapItemDTO,
  RoadmapColumn,
} from "../../api/roadmapAdmin.types";
import { useItemDrawer } from "../state/itemDrawerHook";
import { RoadmapCard } from "./RoadmapCard";
import type { UseBoardDndResult } from "./useBoardDnd";
import styles from "./BoardColumn.module.css";

/** Cards in "Building now" beyond this many trip the WIP-over warning. */
const WIP_LIMIT = 4;

interface BoardColumnProps {
  column: RoadmapColumn;
  items: AdminRoadmapItemDTO[];
  dense: boolean;
  itemsById: Map<string, AdminRoadmapItemDTO>;
  maxSortOrderByColumn: Record<RoadmapColumn, number>;
  dnd: UseBoardDndResult;
}

/**
 * One Board column — header (title/subtitle/count/add), the WIP-over
 * warning ("Building now" only), the card stack (with a drop indicator at
 * the current drag insertion point), and the empty state. A drag-drop
 * target via `dnd.getColumnDropProps` — see `useBoardDnd.ts` for how card-
 * and column-level `onDragOver` cooperate on one shared `dropTarget`.
 */
export function BoardColumn({
  column,
  items,
  dense,
  itemsById,
  maxSortOrderByColumn,
  dnd,
}: BoardColumnProps) {
  const { t } = useTranslation();
  const itemDrawer = useItemDrawer();
  const columnLabel = t(`admin:roadmap.board.column.${column}`);
  const isOverLimit = column === "building" && items.length > WIP_LIMIT;
  const isDropHere = dnd.dropTarget?.column === column;
  const dropProps = dnd.getColumnDropProps(column);

  return (
    <section
      className={styles.column}
      data-drop-active={isDropHere || undefined}
      {...dropProps}
    >
      <header className={styles.columnHead}>
        <div>
          <h3 className={styles.columnTitle}>
            {columnLabel}
            <span className={styles.columnCount}>{items.length}</span>
          </h3>
          <p className={styles.columnSubtitle}>
            {t(`admin:roadmap.board.column.subtitle.${column}`)}
          </p>
        </div>
        <button
          type="button"
          className={styles.addButton}
          aria-label={t("admin:roadmap.board.addToColumnAriaLabel", {
            column: columnLabel,
          })}
          onClick={() => itemDrawer.open("new")}
        >
          <FiPlus aria-hidden />
        </button>
      </header>

      {isOverLimit && (
        <p className={styles.wipWarning} role="status">
          {t("admin:roadmap.board.wipOverMessage", { limit: WIP_LIMIT })}
        </p>
      )}

      <div className={styles.cardStack}>
        {items.length === 0 && !isDropHere && (
          <p className={styles.empty}>{t("admin:roadmap.board.emptyColumn")}</p>
        )}
        {items.map((item, index) => (
          <Fragment key={item.id}>
            {isDropHere && dnd.dropTarget?.index === index && (
              <div className={styles.dropIndicator} aria-hidden />
            )}
            <RoadmapCard
              item={item}
              dense={dense}
              focused={dnd.focusedId === item.id}
              isDragging={dnd.draggingId === item.id}
              itemsById={itemsById}
              maxSortOrderByColumn={maxSortOrderByColumn}
              dragProps={dnd.getCardDragProps(item, column, index)}
              moveProps={dnd.getCardMoveProps(item, column, index)}
            />
          </Fragment>
        ))}
        {isDropHere && dnd.dropTarget?.index === items.length && (
          <div className={styles.dropIndicator} aria-hidden />
        )}
      </div>
    </section>
  );
}
