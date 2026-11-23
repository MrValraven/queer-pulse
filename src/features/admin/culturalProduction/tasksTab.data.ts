import type { IconType } from "react-icons";
import { FiAlertCircle, FiCalendar, FiCheck, FiClock } from "react-icons/fi";
import { mediaMax } from "../../../shared/theme/breakpoints";
import type {
  CulturalAssignedToFilter,
  CulturalTaskListDTO,
  CulturalTaskListItemDTO,
  CulturalTaskStatus,
} from "./api/culturalProduction.types";
import {
  DEFAULT_CULTURAL_TASK_STATUS_VIEW,
  type CulturalTaskStatusView,
} from "./culturalProductionUrl.data";
import type { CulturalProductionUrl } from "./useCulturalProductionUrl";
import type { TaskDueState } from "./taskDueState";

const TASKS_PREFIX = "admin:culturalProduction.tasks";

/** Row-shaped placeholders while the task list loads. */
export const TASK_LIST_SKELETON_ROWS = [0, 1, 2, 3, 4] as const;

/** The column names over a wide list, in the order the columns show. */
export const TASK_COLUMN_KEYS = [
  `${TASKS_PREFIX}.columns.task`,
  `${TASKS_PREFIX}.columns.due`,
  `${TASKS_PREFIX}.columns.status`,
  `${TASKS_PREFIX}.columns.assignees`,
] as const;

/** The status groups each view splits its rows into, in the order they
 *  show: Open reads what is moving first, then what waits; All adds the
 *  done ones last. A single-status view has no groups. */
export const TASK_GROUP_STATUSES: Record<
  CulturalTaskStatusView,
  readonly CulturalTaskStatus[] | null
> = {
  open: ["doing", "todo"],
  all: ["doing", "todo", "done"],
  todo: null,
  doing: null,
  done: null,
};

/** One status group of the list and its rows, in the list's own order. */
export interface TaskListGroup {
  status: CulturalTaskStatus;
  tasks: CulturalTaskListItemDTO[];
}

/** The groups a view shows, each holding at least one row, or null when
 *  the view spans a single status and the rows read as one run. */
export function taskGroupsOf(
  statusView: CulturalTaskStatusView,
  tasks: readonly CulturalTaskListItemDTO[],
): TaskListGroup[] | null {
  const statuses = TASK_GROUP_STATUSES[statusView];
  if (statuses === null) return null;
  return statuses
    .map((status) => ({
      status,
      tasks: tasks.filter((task) => task.status === status),
    }))
    .filter((group) => group.tasks.length > 0);
}

/** Below this width the Assigned to view is a compact select. */
export const TASK_ASSIGNEE_PHONE_QUERY = mediaMax("md");

/** The Assigned to segment that lifts the `assignedTo` filter. */
export const TASK_ASSIGNEE_EVERYONE = "everyone";

/** The Assigned to segments, in the order they show. */
export const TASK_ASSIGNEE_OPTIONS: readonly {
  value: CulturalAssignedToFilter | typeof TASK_ASSIGNEE_EVERYONE;
  labelKey: string;
}[] = [
  {
    value: TASK_ASSIGNEE_EVERYONE,
    labelKey: `${TASKS_PREFIX}.assignee.everyone`,
  },
  { value: "me", labelKey: `${TASKS_PREFIX}.assignee.me` },
  { value: "unassigned", labelKey: `${TASKS_PREFIX}.assignee.unassigned` },
];

/** The status chips, in the order they show. The three statuses carry
 *  their count from the list answer; Open and All carry none. */
export const TASK_STATUS_VIEW_OPTIONS: readonly CulturalTaskStatusView[] = [
  "open",
  "todo",
  "doing",
  "done",
  "all",
];

/** The label of the two chips that are no single status. */
export const TASK_STATUS_VIEW_KEY: Record<"open" | "all", string> = {
  open: `${TASKS_PREFIX}.statusView.open`,
  all: `${TASKS_PREFIX}.statusView.all`,
};

/** The icon before a row's due line, by where the day stands. A task with
 *  no due day shows none. */
export const TASK_DUE_STATE_ICON: Record<TaskDueState, IconType | null> = {
  overdue: FiAlertCircle,
  today: FiClock,
  upcoming: FiCalendar,
  none: null,
  done: FiCheck,
};

/** The empty views of the task list. */
export type TasksEmptyView =
  "none" | "mine" | "unassigned" | "filtered" | "filteredNoAction";

/** Which empty view an empty list shows: the viewer's own (Assigned to me,
 *  no other filter), the unassigned one, no tasks at all, or filters that
 *  match nothing. The bare Open view over a list that only holds done tasks
 *  reads as filtered, with no action: the All chip above already shows
 *  them. */
export function tasksEmptyViewOf(
  url: Pick<CulturalProductionUrl, "taskFilters" | "taskStatusView">,
  counts: CulturalTaskListDTO["counts"],
): TasksEmptyView {
  const { assignedTo } = url.taskFilters;
  const isDefaultStatus =
    url.taskStatusView === DEFAULT_CULTURAL_TASK_STATUS_VIEW;
  if (isDefaultStatus && assignedTo === "me") return "mine";
  if (isDefaultStatus && assignedTo === "unassigned") return "unassigned";
  if (assignedTo !== null || !isDefaultStatus) return "filtered";
  const total = counts.todo + counts.doing + counts.done;
  return total === 0 ? "none" : "filteredNoAction";
}
