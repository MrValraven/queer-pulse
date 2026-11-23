import { useId } from "react";
import { FiPlus } from "react-icons/fi";
import {
  Button,
  FilterChips,
  SegmentedControl,
  Select,
} from "../../../shared/components/ui";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useMediaQuery } from "../../../shared/hooks";
import { useFormat } from "../../../shared/i18n/format";
import { Translation } from "../../../shared/i18n/Translation";
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

/** How many tasks are in view, its figure rolling as it changes. The
 *  line stays mounted (empty while the list has no rows), so a polite
 *  live region announces each new count. */
function TasksCount({ shownCount }: { shownCount: number | null }) {
  const numberFormat = useFormat();
  return (
    <span className={styles.count} aria-live="polite">
      {shownCount === null || shownCount === 0 ? null : (
        <Translation
          i18nKey={`${TASKS_PREFIX}.count`}
          values={{ count: shownCount }}
          slots={{
            count: (
              <RollingNumber
                value={numberFormat.number(shownCount)}
                numericValue={shownCount}
              />
            ),
          }}
        />
      )}
    </span>
  );
}

/**
 * The task filters, laid out by the shared admin toolbar: the Assigned to
 * view (Everyone, Assigned to me, Unassigned; a compact select on a
 * phone, where the three segments run out of width) and the status chips
 * (Open, each status with its count, All), both kept in the URL. The two
 * filters wrap as whole units in one cell, while the count of tasks in view
 * and "Add task" hold the end of the first line; on a phone they share the
 * last line.
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
      end={
        <>
          <TasksCount shownCount={shownCount} />
          <Button size="sm" onClick={onAdd}>
            <FiPlus aria-hidden />
            {t(`${TASKS_PREFIX}.addCta`)}
          </Button>
        </>
      }
    >
      <div className={styles.filters}>
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
      </div>
    </AdminToolbar>
  );
}
