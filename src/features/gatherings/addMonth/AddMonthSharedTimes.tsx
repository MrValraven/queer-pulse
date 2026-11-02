import { useId } from "react";
import { FiClock, FiGlobe } from "react-icons/fi";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { DatePicker } from "../../../shared/components/ui/DatePicker";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Field, FieldRow } from "../CreateGatheringFields";
import { isEndNextDay } from "./addMonthDates";
import type { AddMonthTimes } from "./addMonthState";
import styles from "./AddMonthCalendar.module.css";

/** The zone this device reads clocks in, or an empty string when unknown. */
function deviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "";
  }
}

/**
 * The start and optional end every date shares unless its own card says
 * otherwise. Times are wall clock in the starting event's zone, and an end at
 * or before the start reads as the next day.
 */
export function AddMonthSharedTimes({
  times,
  timezone,
  onChange,
}: {
  times: AddMonthTimes;
  /** The starting event's IANA zone. */
  timezone: string;
  onChange: (times: AddMonthTimes) => void;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const headingId = `${fieldId}-heading`;
  const startLabelId = `${fieldId}-start-label`;
  const endLabelId = `${fieldId}-end-label`;
  const isZoneDifferent = timezone !== "" && timezone !== deviceTimeZone();

  return (
    <div className={styles.block} role="group" aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.subheading}>
        {t("gatherings:addMonth.times.heading")}
      </h3>
      <FieldRow>
        <Field
          label={t("gatherings:addMonth.times.startLabel")}
          labelId={startLabelId}
        >
          {/* The start is required, so a cleared or half-typed field keeps
              the last complete time in the page state. */}
          <DatePicker
            mode="time"
            id={`${fieldId}-start`}
            labelledBy={startLabelId}
            aria-required={true}
            value={times.startTime}
            onChange={(value) => {
              if (value !== null) onChange({ ...times, startTime: value });
            }}
          />
        </Field>
        <Field
          label={t("gatherings:addMonth.times.endLabel")}
          labelId={endLabelId}
          isOptional
        >
          <DatePicker
            mode="time"
            id={`${fieldId}-end`}
            labelledBy={endLabelId}
            relativeTo={times.startTime}
            clearable
            value={times.endTime}
            onChange={(value) => onChange({ ...times, endTime: value })}
          />
        </Field>
      </FieldRow>
      <div aria-live="polite">
        <Collapse isOpen={isEndNextDay(times.startTime, times.endTime)}>
          <p className={styles.note}>
            <FiClock aria-hidden />
            {t("gatherings:addMonth.times.endsNextDay")}
          </p>
        </Collapse>
      </div>
      <Collapse isOpen={isZoneDifferent}>
        <p className={styles.note}>
          <FiGlobe aria-hidden />
          {t("gatherings:addMonth.times.zoneNote", { timezone })}
        </p>
      </Collapse>
    </div>
  );
}
