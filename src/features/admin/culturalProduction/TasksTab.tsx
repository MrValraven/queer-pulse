import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { MeasuredHeightFrame } from "../../../shared/components/layout/MeasuredHeightFrame";
import { Collapse, SkeletonLine } from "../../../shared/components/ui";
import { ViewFade } from "../../../shared/components/ui/ViewFade";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { lisbonLeadDay } from "../leads/leadDates";
import { adminTableClasses } from "../ui";
import type { CulturalTaskListDTO } from "./api/culturalProduction.types";
import { useCulturalTasks } from "./api/useCulturalTasks";
import { CulturalLoadError } from "./CulturalLoadError";
import { TaskFormDialog } from "./TaskFormDialog";
import { TaskRow } from "./TaskRow";
import { TasksEmptyState } from "./TasksEmptyState";
import { TasksToolbar } from "./TasksToolbar";
import { TASK_LIST_SKELETON_ROWS, tasksEmptyViewOf } from "./tasksTab.data";
import {
  useCulturalProductionUrl,
  type CulturalProductionUrl,
} from "./useCulturalProductionUrl";
import styles from "./Tasks.module.css";

const TASKS_PREFIX = "admin:culturalProduction.tasks";
const ROW_EASE = [0.22, 0.68, 0.16, 1] as const;
const ROW_SECONDS = 0.22;

/** The column names over a wide list. Each row names its parts to
 *  assistive tech, so this line is for the eye only. */
function TasksTableHead() {
  const { t } = useTranslation();
  return (
    <div
      className={`${adminTableClasses.headRow} ${styles.tableHead}`}
      aria-hidden
    >
      <span>{t("admin:culturalProduction.tasks.drawer.label")}</span>
      <span>{t(`${TASKS_PREFIX}.statusFilterLabel`)}</span>
      <span>{t(`${TASKS_PREFIX}.assigneeFilterLabel`)}</span>
    </div>
  );
}

/** Row-shaped placeholders in the list's own frame while it loads. */
function TasksSkeleton() {
  return (
    <div className={styles.table} aria-hidden>
      <TasksTableHead />
      {TASK_LIST_SKELETON_ROWS.map((skeletonIndex) => (
        <div key={skeletonIndex} className={styles.skeletonRow}>
          <SkeletonLine height={56} style={{ borderRadius: 0 }} />
        </div>
      ))}
    </div>
  );
}

/** The rows. A row whose status moves it glides to its new place
 *  (`layout`), and a row that leaves the view fades out while the rows
 *  under it close the gap. Reduced motion places them at once. */
function TasksRows({
  list,
  onOpenTask,
}: {
  list: CulturalTaskListDTO;
  onOpenTask: (taskId: string) => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion: isReducedMotion } = useMotionPrefs();
  const today = lisbonLeadDay();
  const duration = isReducedMotion ? 0 : ROW_SECONDS;
  return (
    <>
      <div className={styles.table}>
        <TasksTableHead />
        <ul
          className={styles.rows}
          aria-label={t("admin:culturalProduction.tabs.tasks")}
        >
          <AnimatePresence initial={false}>
            {list.items.map((task) => (
              <m.li
                key={task.id}
                className={styles.rowItem}
                layout={isReducedMotion ? false : "position"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration, ease: ROW_EASE }}
              >
                <TaskRow task={task} today={today} onOpen={onOpenTask} />
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
      <Collapse isOpen={list.isTruncated}>
        <p className={styles.truncated}>{t(`${TASKS_PREFIX}.truncated`)}</p>
      </Collapse>
    </>
  );
}

/** One view of the list, by the state of its read. */
function TasksView({
  viewName,
  query,
  url,
  onOpenTask,
}: {
  viewName: string;
  query: ReturnType<typeof useCulturalTasks>;
  url: CulturalProductionUrl;
  onOpenTask: (taskId: string) => void;
}) {
  if (viewName === "loading") return <TasksSkeleton />;
  if (viewName === "error" || query.data === undefined) {
    return (
      <div className={styles.listState}>
        <CulturalLoadError
          error={query.error}
          isRetrying={query.isFetching}
          onRetry={() => void query.refetch()}
          titleKey={`${TASKS_PREFIX}.loadError.title`}
          retryKey={`${TASKS_PREFIX}.loadError.retryCta`}
        />
      </div>
    );
  }
  if (query.data.items.length === 0) {
    return (
      <TasksEmptyState
        view={tasksEmptyViewOf(url, query.data.counts)}
        url={url}
      />
    );
  }
  return <TasksRows list={query.data} onOpenTask={onOpenTask} />;
}

/**
 * The Tasks tab: the filters (kept in the URL) over the task list, one view
 * per state (loading, a failed read, an empty list, rows). A change of view
 * fades the old one out and the new one in while the frame eases once to
 * the new height; inside the rows view a status change moves its row in
 * place. "Add task" opens the add dialog.
 */
export function TasksTab({
  onOpenTask,
}: {
  onOpenTask: (taskId: string) => void;
}) {
  const url = useCulturalProductionUrl();
  const query = useCulturalTasks(url.taskFilters);
  const [isAdding, setIsAdding] = useState(false);
  const list = query.data;
  const isEmpty = list !== undefined && list.items.length === 0;
  const viewName = query.isPending
    ? "loading"
    : list === undefined
      ? "error"
      : isEmpty
        ? `empty:${tasksEmptyViewOf(url, list.counts)}`
        : "rows";
  const filterKey = JSON.stringify(url.taskFilters);

  return (
    <div className={styles.tab}>
      <TasksToolbar
        url={url}
        counts={list?.counts ?? null}
        shownCount={list?.items.length ?? null}
        onAdd={() => setIsAdding(true)}
      />
      <div className={styles.panel}>
        <MeasuredHeightFrame>
          <div className={styles.viewStage}>
            <AnimatePresence mode="popLayout" initial={false}>
              <ViewFade key={`${viewName}:${filterKey}`}>
                <TasksView
                  viewName={viewName}
                  query={query}
                  url={url}
                  onOpenTask={onOpenTask}
                />
              </ViewFade>
            </AnimatePresence>
          </div>
        </MeasuredHeightFrame>
      </div>
      <AnimatePresence>
        {isAdding && <TaskFormDialog onClose={() => setIsAdding(false)} />}
      </AnimatePresence>
    </div>
  );
}
