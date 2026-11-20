import { useId, useState } from "react";
import { FiBookOpen, FiFileText, FiFlag, FiZap } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { leadRowDay } from "../leads/leadRowDates";
import type { CulturalTaskListItemDTO } from "./api/culturalProduction.types";
import { CulturalAssigneeStack } from "./CulturalAssigneeStack";
import { CulturalRefusalLine } from "./CulturalRefusalLine";
import { TaskDueLabel } from "./TaskDueLabel";
import { TaskStatusControl } from "./TaskStatusControl";
import styles from "./Tasks.module.css";

const ROW_PREFIX = "admin:culturalProduction.tasks.row";

/** The quiet line under a row's title: the due line, the linked idea (or,
 *  with none or on a compact row, the guide), the event day a guide batch set, and an icon when
 *  the task has notes. */
function TaskRowMeta({
  task,
  today,
  id,
  isCompact,
}: {
  task: CulturalTaskListItemDTO;
  today: string;
  id: string;
  /** A compact row sits inside its idea's drawer, so it skips the idea. */
  isCompact: boolean;
}) {
  const { t, language } = useTranslation();
  return (
    <span id={id} className={styles.meta}>
      <TaskDueLabel task={task} today={today} />
      {task.idea !== null && !isCompact ? (
        <span className={styles.metaItem}>
          <FiZap className={styles.metaIcon} aria-hidden />
          <span className={styles.metaText}>
            {t(`${ROW_PREFIX}.fromIdea`, { title: task.idea.title })}
          </span>
        </span>
      ) : task.guide !== null ? (
        <span className={styles.metaItem}>
          <FiBookOpen className={styles.metaIcon} aria-hidden />
          <span className={styles.metaText}>
            {t(`${ROW_PREFIX}.fromGuide`, { title: task.guide.title })}
          </span>
        </span>
      ) : null}
      {task.eventOn !== null ? (
        <span className={styles.metaItem}>
          <FiFlag className={styles.metaIcon} aria-hidden />
          <span className={styles.metaText}>
            {t(`${ROW_PREFIX}.forEvent`, {
              date: leadRowDay(task.eventOn, today, language),
            })}
          </span>
        </span>
      ) : null}
      {task.hasNotes ? (
        <span className={styles.metaItem}>
          <FiFileText className={styles.metaIcon} aria-hidden />
          <span className="visuallyHidden">{t(`${ROW_PREFIX}.hasNotes`)}</span>
        </span>
      ) : null}
    </span>
  );
}

/**
 * One task. The title is the button that opens the task, and its hit area
 * stretches over the whole row; the status select sits above it, so a task
 * moves on without opening it. The open button is described by the meta
 * line. A wide list reads each row as one line of a table (task, status,
 * assignees); a narrow one, and the compact rows inside an idea's drawer,
 * stack it: the title and its meta, then the status beside the assignees.
 * A done task reads muted with its title struck through. A refused status
 * change names its cause under the meta line.
 */
export function TaskRow({
  task,
  today,
  onOpen,
  isCompact = false,
}: {
  task: CulturalTaskListItemDTO;
  today: string;
  onOpen: (taskId: string) => void;
  isCompact?: boolean;
}) {
  const { t } = useTranslation();
  const metaId = useId();
  const refusalId = useId();
  const [refusal, setRefusal] = useState<unknown>(null);

  return (
    <div
      className={styles.row}
      data-compact={isCompact || undefined}
      data-done={task.status === "done" || undefined}
    >
      <div className={styles.rowMain}>
        <button
          type="button"
          className={styles.rowOpen}
          aria-label={t(`${ROW_PREFIX}.openAria`, { title: task.title })}
          aria-describedby={metaId}
          onClick={() => onOpen(task.id)}
        >
          {task.title}
        </button>
        <TaskRowMeta
          task={task}
          today={today}
          id={metaId}
          isCompact={isCompact}
        />
        <CulturalRefusalLine error={refusal} id={refusalId} />
      </div>
      <div className={styles.rowStatus}>
        <TaskStatusControl
          task={task}
          refusalId={refusalId}
          hasRefusal={refusal !== null}
          onRefusal={setRefusal}
        />
      </div>
      <div className={styles.rowAssignees}>
        <CulturalAssigneeStack people={task.assignees} size="sm" />
      </div>
    </div>
  );
}
