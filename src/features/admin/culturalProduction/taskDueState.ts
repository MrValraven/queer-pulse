import type { CulturalTaskListItemDTO } from "./api/culturalProduction.types";

/** Where a task's due day stands against today (in Lisbon). A done task
 *  reads done whatever its day. */
export type TaskDueState = "done" | "overdue" | "today" | "upcoming" | "none";

/** The due state of a task on `today` (`YYYY-MM-DD`, read with
 *  `lisbonLeadDay()` so the row and the server badge agree). */
export function taskDueStateOf(
  task: Pick<CulturalTaskListItemDTO, "status" | "dueOn">,
  today: string,
): TaskDueState {
  if (task.status === "done") return "done";
  if (task.dueOn === null) return "none";
  if (task.dueOn < today) return "overdue";
  if (task.dueOn === today) return "today";
  return "upcoming";
}

const STEP_WHEN_PREFIX = "admin:culturalProduction.guides.stepWhen";

/** The line that says when a checklist step falls against the event day:
 *  days before, the day itself, days after, or no day. `count` fills the
 *  plural lines. */
export function stepWhenOf(daysBefore: number | null): {
  key: string;
  count?: number;
} {
  if (daysBefore === null) return { key: `${STEP_WHEN_PREFIX}.anyTime` };
  if (daysBefore === 0) return { key: `${STEP_WHEN_PREFIX}.dayOf` };
  if (daysBefore > 0)
    return { key: `${STEP_WHEN_PREFIX}.before`, count: daysBefore };
  return { key: `${STEP_WHEN_PREFIX}.after`, count: -daysBefore };
}
