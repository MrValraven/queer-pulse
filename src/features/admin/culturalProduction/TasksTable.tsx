import { AnimatePresence } from "motion/react";
import { Collapse, SkeletonLine } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { lisbonLeadDay } from "../leads/leadDates";
import { adminTableClasses } from "../ui";
import type {
  CulturalTaskListDTO,
  CulturalTaskListItemDTO,
  CulturalTaskStatus,
} from "./api/culturalProduction.types";
import type { CulturalTaskStatusView } from "./culturalProductionUrl.data";
import { TaskListItem } from "./TaskListItem";
import { TaskRow } from "./TaskRow";
import { TasksGroupHeader } from "./TasksGroupHeader";
import {
  TASK_COLUMN_KEYS,
  TASK_LIST_SKELETON_ROWS,
  taskGroupsOf,
} from "./tasksTab.data";
import styles from "./Tasks.module.css";

const TASKS_PREFIX = "admin:culturalProduction.tasks";

/** The column names over a wide list (task, due, status, assignees). Each
 *  row names its parts to assistive tech, so this line is for the eye
 *  only. */
export function TasksTableHead() {
  const { t } = useTranslation();
  return (
    <div
      className={`${adminTableClasses.headRow} ${styles.tableHead}`}
      aria-hidden
    >
      {TASK_COLUMN_KEYS.map((columnKey) => (
        <span key={columnKey} className={styles.headCell}>
          {t(columnKey)}
        </span>
      ))}
    </div>
  );
}

/** Row-shaped placeholders in the list's own frame while the first answer
 *  loads: cards on a narrow list, rows split by hairlines under the column
 *  head on a wide one. Each holds a title bar over a meta bar, a due bar, a
 *  status pill and an avatar, placed by the same grid areas as a real row. */
export function TasksSkeleton() {
  return (
    <div className={styles.table} aria-hidden>
      <TasksTableHead />
      {TASK_LIST_SKELETON_ROWS.map((skeletonIndex) => (
        <div
          key={skeletonIndex}
          className={`${styles.skeletonRow} ${styles.skeletonShape}`}
        >
          <div className={styles.skeletonMain}>
            <SkeletonLine width="55%" height={14} />
            <SkeletonLine width="35%" height={10} />
          </div>
          <div className={styles.skeletonDue}>
            <SkeletonLine width="70%" height={12} />
          </div>
          <div className={styles.skeletonStatus}>
            <SkeletonLine
              width={88}
              height={24}
              style={{ borderRadius: "var(--radius-8)" }}
            />
          </div>
          <div className={styles.skeletonAssignees}>
            <SkeletonLine
              width={28}
              height={28}
              style={{ borderRadius: "var(--radius-pill)" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * The rows, in one flat list so a row never leaves its parent: a view that
 * spans more than one status (Open, All) sets a heading before each status
 * group, and a folded group keeps only its heading. A task whose status
 * moves it to another group glides there, a row that leaves the view folds
 * away while the rows under it rise, and rows that arrive with new filters
 * grow in. While the rows on screen answer the previous filters
 * (`isShowingPrevious`), the list reads busy and dims a moment later, so a
 * quick answer never flashes.
 */
export function TasksRows({
  list,
  statusView,
  collapsedStatuses,
  isShowingPrevious,
  onToggleGroup,
  onOpenTask,
}: {
  list: CulturalTaskListDTO;
  /** The status view the rows answer, which names the groups. */
  statusView: CulturalTaskStatusView;
  collapsedStatuses: ReadonlySet<CulturalTaskStatus>;
  isShowingPrevious: boolean;
  onToggleGroup: (status: CulturalTaskStatus) => void;
  onOpenTask: (taskId: string) => void;
}) {
  const { t } = useTranslation();
  const today = lisbonLeadDay();
  const groups = taskGroupsOf(statusView, list.items);
  const rowOf = (task: CulturalTaskListItemDTO) => (
    <TaskListItem key={task.id} className={styles.rowItem}>
      <TaskRow task={task} today={today} onOpen={onOpenTask} />
    </TaskListItem>
  );
  const entries =
    groups === null
      ? list.items.map(rowOf)
      : groups.flatMap((group) => {
          const isCollapsed = collapsedStatuses.has(group.status);
          return [
            <TaskListItem
              key={`group-${group.status}`}
              className={styles.groupItem}
            >
              <TasksGroupHeader
                status={group.status}
                count={group.tasks.length}
                isCollapsed={isCollapsed}
                onToggle={onToggleGroup}
              />
            </TaskListItem>,
            ...(isCollapsed ? [] : group.tasks.map(rowOf)),
          ];
        });

  return (
    <>
      <div className={styles.table}>
        <TasksTableHead />
        <ul
          className={styles.rows}
          aria-label={t("admin:culturalProduction.tabs.tasks")}
          aria-busy={isShowingPrevious || undefined}
          data-stale={isShowingPrevious || undefined}
        >
          <AnimatePresence initial={false}>{entries}</AnimatePresence>
        </ul>
      </div>
      <Collapse isOpen={list.isTruncated}>
        <p className={styles.truncated}>{t(`${TASKS_PREFIX}.truncated`)}</p>
      </Collapse>
    </>
  );
}
