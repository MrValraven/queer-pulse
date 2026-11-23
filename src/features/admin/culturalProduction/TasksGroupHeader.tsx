import { m } from "motion/react";
import { FiCheckCircle, FiChevronDown, FiCircle } from "react-icons/fi";
import { TbProgress } from "react-icons/tb";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CulturalTaskStatus } from "./api/culturalProduction.types";
import { CULTURAL_TASK_STATUS_KEY } from "./culturalProductionLabels.data";
import styles from "./Tasks.module.css";

const GROUP_PREFIX = "admin:culturalProduction.tasks.group";
const CHEVRON_EASE = [0.22, 0.68, 0.16, 1] as const;
const CHEVRON_SECONDS = 0.2;

/** The status mark of each group, in the status menu's ink: a hollow ring
 *  to do, a ring part way round while doing, a checked ring once done. */
const STATUS_GLYPH_CLASS: Record<CulturalTaskStatus, string | undefined> = {
  todo: styles.glyphTodo,
  doing: styles.glyphDoing,
  done: styles.glyphDone,
};

/** A status's mark. Decorative: the name beside it carries the meaning. */
function TaskStatusGlyph({ status }: { status: CulturalTaskStatus }) {
  const className = `${styles.groupGlyph} ${STATUS_GLYPH_CLASS[status] ?? ""}`;
  if (status === "done") {
    return <FiCheckCircle className={className} aria-hidden />;
  }
  if (status === "doing") {
    return <TbProgress className={className} aria-hidden />;
  }
  return <FiCircle className={className} aria-hidden />;
}

/**
 * The heading over one status group of the task list: the status mark, its
 * name and how many rows it holds, as a toggle that folds the group's rows
 * away and brings them back. The chevron turns with it; reduced motion
 * turns it at once. The count is plain text, so it reads the new number the
 * moment a task joins or leaves the group, even while the header glides.
 */
export function TasksGroupHeader({
  status,
  count,
  isCollapsed,
  onToggle,
}: {
  status: CulturalTaskStatus;
  count: number;
  isCollapsed: boolean;
  onToggle: (status: CulturalTaskStatus) => void;
}) {
  const { t } = useTranslation();
  const numberFormat = useFormat();
  const { reducedMotion: isReducedMotion } = useMotionPrefs();
  const statusName = t(CULTURAL_TASK_STATUS_KEY[status]);
  return (
    <h2
      className={styles.groupHeading}
      data-collapsed={isCollapsed || undefined}
    >
      <button
        type="button"
        className={styles.groupToggle}
        aria-expanded={!isCollapsed}
        aria-label={t(`${GROUP_PREFIX}.toggleAria`, {
          status: statusName,
          count,
        })}
        onClick={() => onToggle(status)}
      >
        <m.span
          className={styles.groupChevron}
          aria-hidden
          initial={false}
          animate={{ rotate: isCollapsed ? -90 : 0 }}
          transition={{
            duration: isReducedMotion ? 0 : CHEVRON_SECONDS,
            ease: CHEVRON_EASE,
          }}
        >
          <FiChevronDown />
        </m.span>
        <TaskStatusGlyph status={status} />
        <span className={styles.groupName}>{statusName}</span>
        <span className={styles.groupCount} aria-hidden>
          {numberFormat.number(count)}
        </span>
      </button>
    </h2>
  );
}
