import type { Dispatch } from "react";
import { FiClock } from "react-icons/fi";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { DatePicker } from "../../../shared/components/ui/DatePicker";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Field } from "../CreateGatheringFields";
import { addMonthRowFieldId } from "./addMonth.data";
import { isEndNextDay } from "./addMonthDates";
import type {
  AddMonthAction,
  AddMonthRow,
  AddMonthRowIssue,
  AddMonthTimes,
} from "./addMonthState";
import styles from "./AddMonthRows.module.css";

/**
 * The time of one date: a line reading back the times it publishes with, and
 * "Change time for this date" folding open a start and end pair for this date
 * only. "Use the shared time" folds the pair away and the date follows the
 * shared times again.
 *
 * While the pair is closed the toggle carries the id of the time field an
 * issue names (the end field for an end time issue, the start field for any
 * other), so the page can focus it.
 */
export function AddMonthRowTime({
  row,
  sharedTimes,
  dispatch,
  issue,
}: {
  row: AddMonthRow;
  sharedTimes: AddMonthTimes;
  dispatch: Dispatch<AddMonthAction>;
  issue: AddMonthRowIssue | null;
}) {
  const { t } = useTranslation();
  const override = row.timeOverride;
  const hasOverride = override !== null;
  const times = override ?? sharedTimes;
  const startId = addMonthRowFieldId(row.date, "startTime");
  const endId = addMonthRowFieldId(row.date, "endTime");
  const pairId = `${startId}-pair`;
  const issueId = `${startId}-error`;
  const readLine =
    times.endTime === null
      ? t("gatherings:addMonth.row.time.sharedNoEnd", {
          start: times.startTime,
        })
      : t("gatherings:addMonth.row.time.shared", {
          start: times.startTime,
          end: times.endTime,
        });
  const fullLine = isEndNextDay(times.startTime, times.endTime)
    ? `${readLine}, ${t("gatherings:addMonth.row.time.nextDay")}`
    : readLine;
  const isEndInvalid = issue?.field === "endTime";
  const isStartInvalid = issue !== null && !isEndInvalid;
  // While the pair is closed the toggle stands in for the field the issue
  // names, so the page can focus it.
  const toggleId = hasOverride ? undefined : isEndInvalid ? endId : startId;
  const issueText =
    issue?.problem === "startPassed"
      ? t("gatherings:addMonth.row.startPassed")
      : null;

  function toggleOverride() {
    dispatch({
      type: "setRowTime",
      date: row.date,
      timeOverride: hasOverride ? null : { ...sharedTimes },
    });
  }

  function setOverride(patch: Partial<AddMonthTimes>) {
    dispatch({
      type: "setRowTime",
      date: row.date,
      timeOverride: { ...times, ...patch },
    });
  }

  return (
    <div className={styles.time}>
      <div className={styles.timeLine}>
        <FiClock className={styles.timeIcon} aria-hidden />
        <p className={styles.timeRead}>{fullLine}</p>
      </div>
      <div className={styles.timeToggle}>
        <Button
          id={toggleId}
          variant="quiet"
          size="sm"
          aria-expanded={hasOverride}
          aria-controls={pairId}
          aria-invalid={!hasOverride && issue !== null ? true : undefined}
          aria-describedby={!hasOverride && issueText ? issueId : undefined}
          onClick={toggleOverride}
        >
          {hasOverride
            ? t("gatherings:addMonth.row.time.useShared")
            : t("gatherings:addMonth.row.time.change")}
        </Button>
      </div>
      <div id={pairId}>
        <Collapse isOpen={hasOverride}>
          <div className={styles.timePair}>
            <Field
              label={t("gatherings:addMonth.row.time.startLabel")}
              labelId={`${startId}-label`}
            >
              <DatePicker
                mode="time"
                id={startId}
                labelledBy={`${startId}-label`}
                invalid={isStartInvalid}
                aria-describedby={issueText ? issueId : undefined}
                value={times.startTime}
                onChange={(value) => {
                  if (value !== null) setOverride({ startTime: value });
                }}
              />
            </Field>
            <Field
              label={t("gatherings:addMonth.row.time.endLabel")}
              labelId={`${endId}-label`}
              isOptional
            >
              <DatePicker
                mode="time"
                id={endId}
                labelledBy={`${endId}-label`}
                relativeTo={times.startTime}
                invalid={isEndInvalid}
                clearable
                value={times.endTime}
                onChange={(value) => setOverride({ endTime: value })}
              />
            </Field>
          </div>
        </Collapse>
      </div>
      <Collapse isOpen={issueText !== null}>
        <p id={issueId} className={styles.issue}>
          {issueText}
        </p>
      </Collapse>
    </div>
  );
}
