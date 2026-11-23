import { useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { MeasuredHeightFrame } from "../../../shared/components/layout/MeasuredHeightFrame";
import { ViewFade } from "../../../shared/components/ui/ViewFade";
import type { CulturalTaskStatus } from "./api/culturalProduction.types";
import { useCulturalTasks } from "./api/useCulturalTasks";
import { CulturalLoadError } from "./CulturalLoadError";
import { TaskFormDialog } from "./TaskFormDialog";
import { TasksEmptyState } from "./TasksEmptyState";
import { TasksRows, TasksSkeleton } from "./TasksTable";
import { TasksToolbar } from "./TasksToolbar";
import { tasksEmptyViewOf, type TasksEmptyView } from "./tasksTab.data";
import { useCulturalProductionUrl } from "./useCulturalProductionUrl";
import { useEntranceViewKey } from "./useEntranceViewKey";
import styles from "./Tasks.module.css";

const TASKS_PREFIX = "admin:culturalProduction.tasks";

/** The kind of view the list shows, by the state of its read. The view's
 *  key holds only this (and which empty state), so new filters keep the
 *  rows view mounted and its rows move in place. */
type TasksViewKind = "loading" | "error" | "empty" | "rows";

function tasksViewKindOf(
  query: ReturnType<typeof useCulturalTasks>,
): TasksViewKind {
  if (query.isPending) return "loading";
  if (query.data === undefined) return "error";
  return query.data.items.length === 0 ? "empty" : "rows";
}

/** `value`, or while `isHeld` the last value it had while free. The list
 *  holds what it shows (its view, its groups) while the rows on screen
 *  still answer the previous filters, so the view swaps exactly when its
 *  content does. */
function useHeldWhile<Value>(value: Value, isHeld: boolean): Value {
  const [heldValue, setHeldValue] = useState(value);
  if (!isHeld && !Object.is(heldValue, value)) setHeldValue(value);
  return isHeld ? heldValue : value;
}

/** A status set with one status flipped in or out. */
function toggledStatuses(
  statuses: ReadonlySet<CulturalTaskStatus>,
  status: CulturalTaskStatus,
): ReadonlySet<CulturalTaskStatus> {
  const nextStatuses = new Set(statuses);
  if (nextStatuses.has(status)) nextStatuses.delete(status);
  else nextStatuses.add(status);
  return nextStatuses;
}

/**
 * The Tasks tab: the filters (kept in the URL) over the task list, one view
 * per state (the first load, a failed read, an empty list, rows). Only the
 * very first read shows the loading rows: on new filters the rows on screen
 * stay, read busy, and change in place once the answer lands, row by row.
 * A change of view (rows to an empty list and back) fades the old one out
 * and the new one in while the frame eases once to the new height; inside
 * the rows view the rows move their own height, so the frame follows them.
 * Folded status groups stay folded across filters. "Add task" opens the
 * add dialog.
 */
export function TasksTab({
  onOpenTask,
}: {
  onOpenTask: (taskId: string) => void;
}) {
  const url = useCulturalProductionUrl();
  const query = useCulturalTasks(url.taskFilters);
  const [isAdding, setIsAdding] = useState(false);
  const [collapsedStatuses, setCollapsedStatuses] = useState<
    ReadonlySet<CulturalTaskStatus>
  >(() => new Set());
  const isShowingPrevious = query.isPlaceholderData;
  const list = query.data;
  const viewKind = useHeldWhile(tasksViewKindOf(query), isShowingPrevious);
  const emptyView = useHeldWhile<TasksEmptyView | null>(
    list === undefined ? null : tasksEmptyViewOf(url, list.counts),
    isShowingPrevious,
  );
  const shownStatusView = useHeldWhile(url.taskStatusView, isShowingPrevious);
  // Data that lands while the tab itself is still fading in swaps the
  // loading rows in place, so the tab reveals once.
  const viewKey = useEntranceViewKey(
    viewKind === "empty" ? `empty:${emptyView}` : viewKind,
  );

  let view: ReactNode;
  if (viewKind === "loading") {
    view = <TasksSkeleton />;
  } else if (viewKind === "error" || list === undefined) {
    view = (
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
  } else if (viewKind === "empty" && emptyView !== null) {
    view = <TasksEmptyState view={emptyView} url={url} />;
  } else {
    view = (
      <TasksRows
        list={list}
        statusView={shownStatusView}
        collapsedStatuses={collapsedStatuses}
        isShowingPrevious={isShowingPrevious}
        onToggleGroup={(status) =>
          setCollapsedStatuses((statuses) => toggledStatuses(statuses, status))
        }
        onOpenTask={onOpenTask}
      />
    );
  }

  return (
    <div className={styles.tab}>
      <TasksToolbar
        url={url}
        counts={list?.counts ?? null}
        shownCount={list?.items.length ?? null}
        onAdd={() => setIsAdding(true)}
      />
      <div className={styles.panel}>
        <MeasuredHeightFrame shouldAnimateHeight={viewKind !== "rows"}>
          <div className={styles.viewStage}>
            <AnimatePresence mode="popLayout" initial={false}>
              <ViewFade key={viewKey}>{view}</ViewFade>
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
