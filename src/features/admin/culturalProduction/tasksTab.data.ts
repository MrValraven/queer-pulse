import type { IconType } from "react-icons";
import { FiAlertCircle, FiCalendar, FiCheck, FiClock } from "react-icons/fi";
import { mediaMax } from "../../../shared/theme/breakpoints";
import type {
  CulturalAssignedToFilter,
  CulturalTaskListDTO,
} from "./api/culturalProduction.types";
import {
  DEFAULT_CULTURAL_TASK_STATUS_VIEW,
  type CulturalTaskStatusView,
} from "./culturalProductionUrl.data";
import type { CulturalProductionUrl } from "./useCulturalProductionUrl";
import type { TaskDueState } from "./taskDueState";

const TASKS_PREFIX = "admin:culturalProduction.tasks";

/** Row-shaped placeholders while the task list loads. */
export const TASK_LIST_SKELETON_ROWS = [0, 1, 2, 3] as const;

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
