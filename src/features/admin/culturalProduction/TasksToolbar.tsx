import { useId } from "react";
import { FiPlus } from "react-icons/fi";
import {
  Button,
  FilterChips,
  SegmentedControl,
  Select,
} from "../../../shared/components/ui";
import { useMediaQuery } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminToolbar, adminToolbarClasses } from "../ui";
import {
  isCulturalAssignedToFilter,
  type CulturalTaskListDTO,
} from "./api/culturalProduction.types";
import { CULTURAL_TASK_STATUS_KEY } from "./culturalProductionLabels.data";
import type { CulturalProductionUrl } from "./useCulturalProductionUrl";
import {
  TASK_ASSIGNEE_EVERYONE,
  TASK_ASSIGNEE_OPTIONS,
  TASK_ASSIGNEE_PHONE_QUERY,
  TASK_STATUS_VIEW_KEY,
  TASK_STATUS_VIEW_OPTIONS,
} from "./tasksTab.data";
import styles from "./Tasks.module.css";

const TASKS_PREFIX = "admin:culturalProduction.tasks";

/** The status chips: Open and All by name, each status with its count
 *  under the Assigned to view once the list has answered. */
function useStatusChipOptions(counts: CulturalTaskListDTO["counts"] | null) {
  const { t } = useTranslation();
  return TASK_STATUS_VIEW_OPTIONS.map((view) => {
    if (view === "open" || view === "all") {
      return {
        value: view,
        label: t(TASK_STATUS_VIEW_KEY[view]),
        isUnavailable: false,
      };
    }
    const status = t(CULTURAL_TASK_STATUS_KEY[view]);
    return {
      value: view,
      label:
        counts === null
          ? status
          : t(`${TASKS_PREFIX}.statusView.withCount`, {
              status,
              count: counts[view],
            }),
      isUnavailable: false,
    };
  });
}

/**
 * The task filters, laid out by the shared admin toolbar: the Assigned to
 * view (Everyone, Assigned to me, Unassigned; a compact select on a
 * phone, where the three segments run out of width) and the status chips (Open,
 * each status with its count, All), both kept in the URL. The count of
 * tasks in view follows them, and "Add task" sits at the end.
 */
export function TasksToolbar({
  url,
  counts,
  shownCount,
  onAdd,
}: {
  url: CulturalProductionUrl;
  counts: CulturalTaskListDTO["counts"] | null;
  /** The rows on screen, or null while the list has no answer. */
  shownCount: number | null;
  onAdd: () => void;
}) {
  const { t } = useTranslation();
  const assigneeLabelId = useId();
  const statusLabelId = useId();
  const statusOptions = useStatusChipOptions(counts);
  const isPhone = useMediaQuery(TASK_ASSIGNEE_PHONE_QUERY);
  const assigneeOptions = TASK_ASSIGNEE_OPTIONS.map(({ value, labelKey }) => ({
    value,
    label: t(labelKey),
  }));
  const assigneeValue = url.taskFilters.assignedTo ?? TASK_ASSIGNEE_EVERYONE;
  const chooseAssignee = (chosen: string | null) =>
    url.setAssignedTo(isCulturalAssignedToFilter(chosen) ? chosen : null);

  return (
    <AdminToolbar
      className={styles.toolbar}
      label={t(`${TASKS_PREFIX}.toolbarLabel`)}
      count={
        shownCount === null || shownCount === 0
          ? undefined
          : t(`${TASKS_PREFIX}.count`, { count: shownCount })
      }
      end={
        <Button size="sm" onClick={onAdd}>
          <FiPlus aria-hidden />
          {t(`${TASKS_PREFIX}.addCta`)}
        </Button>
      }
    >
      <div className={styles.filter}>
        <span id={assigneeLabelId} className={styles.filterLabel}>
          {t(`${TASKS_PREFIX}.assigneeFilterLabel`)}
        </span>
        {isPhone ? (
          <Select
            size="sm"
            className={`${adminToolbarClasses.select} ${styles.phoneTarget}`}
            labelledBy={assigneeLabelId}
            options={assigneeOptions}
            value={assigneeValue}
            onChange={chooseAssignee}
          />
        ) : (
          <SegmentedControl
            labelledBy={assigneeLabelId}
            options={assigneeOptions}
            value={assigneeValue}
            onChange={chooseAssignee}
          />
        )}
      </div>
      <div className={styles.filter}>
        <span id={statusLabelId} className={styles.filterLabel}>
          {t(`${TASKS_PREFIX}.statusFilterLabel`)}
        </span>
        <FilterChips
          className={adminToolbarClasses.chips}
          labelledBy={statusLabelId}
          options={statusOptions}
          value={url.taskStatusView}
          onChange={(chosen) => {
            const view = TASK_STATUS_VIEW_OPTIONS.find(
              (option) => option === chosen,
            );
            if (view !== undefined) url.setTaskStatusView(view);
          }}
        />
      </div>
    </AdminToolbar>
  );
}
