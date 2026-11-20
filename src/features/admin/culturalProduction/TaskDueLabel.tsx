import { useTranslation } from "../../../shared/i18n/useTranslation";
import { lisbonLeadDay } from "../leads/leadDates";
import { leadRowDay } from "../leads/leadRowDates";
import type { CulturalTaskListItemDTO } from "./api/culturalProduction.types";
import { CULTURAL_TASK_STATUS_KEY } from "./culturalProductionLabels.data";
import { taskDueStateOf } from "./taskDueState";
import { TASK_DUE_STATE_ICON } from "./tasksTab.data";
import styles from "./Tasks.module.css";

const DUE_PREFIX = "admin:culturalProduction.tasks.row";

type TaskDueFields = Pick<
  CulturalTaskListItemDTO,
  "status" | "dueOn" | "completedAt"
>;

/** The words of a row's due line. A done task reads the day it was marked
 *  done (in Lisbon), or the bare status when the day is missing. */
function useDueText(task: TaskDueFields, today: string): string {
  const { t, language } = useTranslation();
  const dayOf = (day: string) => leadRowDay(day, today, language);
  const state = taskDueStateOf(task, today);
  if (state === "done") {
    const completedAt =
      task.completedAt === null ? Number.NaN : Date.parse(task.completedAt);
    return Number.isNaN(completedAt)
      ? t(CULTURAL_TASK_STATUS_KEY.done)
      : t(`${DUE_PREFIX}.done`, {
          date: dayOf(lisbonLeadDay(new Date(completedAt))),
        });
  }
  if (state === "none") return t(`${DUE_PREFIX}.noDue`);
  if (state === "today") return t(`${DUE_PREFIX}.dueToday`);
  const dueOn = task.dueOn ?? today;
  return state === "overdue"
    ? t(`${DUE_PREFIX}.overdue`, { date: dayOf(dueOn) })
    : t(`${DUE_PREFIX}.due`, { date: dayOf(dueOn) });
}

/**
 * Where a task's due day stands, read against `today` (`lisbonLeadDay()`,
 * so the row and the server badge agree): overdue with an alert icon and
 * due today with a clock, both in the leads list's amber ink, a later day
 * muted, no
 * day as a quiet "No due date", and a done task as the day it was done.
 */
export function TaskDueLabel({
  task,
  today,
}: {
  task: TaskDueFields;
  today: string;
}) {
  const state = taskDueStateOf(task, today);
  const text = useDueText(task, today);
  const Icon = TASK_DUE_STATE_ICON[state];
  return (
    <span className={styles.due} data-state={state}>
      {Icon ? <Icon className={styles.metaIcon} aria-hidden /> : null}
      <span className={styles.metaText}>{text}</span>
    </span>
  );
}
