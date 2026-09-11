import { useId } from "react";
import { DatePicker, formatSpanDuration } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Field, FieldRow } from "../CreateGatheringFields";
import { GATE_ANCHOR, MAX_GATHERING_SPAN_DAYS } from "../createGathering.data";
import type { GatheringForm } from "../useGatheringForm";
import { schedulePairErrorKey, scheduleInstants } from "./schedulePair";
import styles from "./WhenWhereChapter.module.css";

const MILLISECONDS_PER_MINUTE = 60_000;

/**
 * Start date, start time, end date, end time, and the one line underneath that
 * reads the pair back. Moved from `DatePlaceStep.tsx` with its rules intact,
 * restyled for Create Gathering v2.
 *
 * Four controls under two visible words. "Starts" and "Ends" head a PAIR each,
 * so they are plain headings with a `role="group"` pointing at them, and every
 * control carries its own hidden label. A single `<label>` over two fields
 * would leave one of them unnamed.
 */
export function ScheduleFields({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fieldId = useId();
  const { startInstant, endInstant } = scheduleInstants(form);

  const errorKey = schedulePairErrorKey(form);
  const isEndInvalid = errorKey !== null;
  const errorMessage = errorKey
    ? t(errorKey, { days: MAX_GATHERING_SPAN_DAYS })
    : null;

  // Only shown for a schedule the wizard would accept: a span read off a
  // backwards or over-long pair is a number nobody can act on, and the message
  // above says the actionable thing instead. "Runs 3 days" already carries the
  // roll-over, so the next-day note is kept for the single-night case only.
  const spanNote =
    startInstant && endInstant && form.scheduleValid
      ? [
          t("gatherings:create.step2.duration", {
            duration: formatSpanDuration(
              (endInstant.getTime() - startInstant.getTime()) /
                MILLISECONDS_PER_MINUTE,
              t,
            ),
          }),
          form.spanDays === 1 ? t("gatherings:create.step2.endsNextDay") : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : null;

  const startsLabelId = `${fieldId}-starts-label`;
  const endsLabelId = `${fieldId}-ends-label`;
  const dateHintId = `${startsLabelId}-hint`;
  const errorId = `${endsLabelId}-error`;
  const spanId = `${fieldId}-span`;
  // One description per end control: the fix when there is one, the readout
  // otherwise. The two are exclusive, because a span is only read back for a
  // schedule the wizard accepts.
  const endDescribedBy = errorMessage ? errorId : spanNote ? spanId : undefined;

  return (
    <>
      {/* The date anchor wraps the whole start pair, so "Date and start time"
          flashes the heading, both controls and the hint together. */}
      <Field
        label={t("gatherings:create.step2.dateLabel")}
        labelId={startsLabelId}
        anchorId={GATE_ANCHOR.date}
        hint={
          form.dateValid ? undefined : t("gatherings:create.step2.dateRequired")
        }
      >
        <div role="group" aria-labelledby={startsLabelId}>
          <FieldRow>
            <div>
              <span
                id={`${fieldId}-startDate-label`}
                className="visuallyHidden"
              >
                {t("gatherings:create.step2.startDateLabel")}
              </span>
              <DatePicker
                mode="date"
                id={`${fieldId}-date`}
                labelledBy={`${fieldId}-startDate-label`}
                min={new Date().toISOString().slice(0, 10)}
                invalid={!form.dateValid}
                aria-required={true}
                aria-describedby={form.dateValid ? undefined : dateHintId}
                value={form.date || null}
                onChange={(value) => form.setDate(value ?? "")}
              />
            </div>
            <div>
              <span
                id={`${fieldId}-startTime-label`}
                className="visuallyHidden"
              >
                {t("gatherings:create.step2.startTimeLabel")}
              </span>
              <DatePicker
                mode="time"
                id={`${fieldId}-time`}
                labelledBy={`${fieldId}-startTime-label`}
                value={form.time || null}
                onChange={(value) => form.setTime(value ?? "")}
              />
            </div>
          </FieldRow>
        </div>
      </Field>
      <Field
        label={t("gatherings:create.step2.endTimeLabel")}
        labelId={endsLabelId}
        isOptional
        error={errorMessage}
      >
        <div role="group" aria-labelledby={endsLabelId}>
          <FieldRow>
            <div>
              <span id={`${fieldId}-endDate-label`} className="visuallyHidden">
                {t("gatherings:create.step2.endDateLabel")}
              </span>
              {/* A `min` of the start date, so the picker cannot offer a day
                  the gathering has not begun on yet. */}
              <DatePicker
                mode="date"
                id={`${fieldId}-endDate`}
                labelledBy={`${fieldId}-endDate-label`}
                min={form.date || undefined}
                invalid={isEndInvalid}
                aria-describedby={endDescribedBy}
                value={form.endDate || null}
                onChange={(value) => form.setEndDate(value ?? "")}
              />
            </div>
            <div>
              <span id={`${fieldId}-endTime-label`} className="visuallyHidden">
                {t("gatherings:create.step2.endTimeFieldLabel")}
              </span>
              {/* `relativeTo` turns the end list into "+1h, +2h, +2h 30m…":
                  the length is what a host is choosing, and reading it off two
                  absolute clock times is arithmetic they should not have to do.
                  No `min`: a gathering that runs past midnight is normal, and
                  the end DATE beside this field is where that is said. */}
              <DatePicker
                mode="time"
                id={`${fieldId}-endTime`}
                labelledBy={`${fieldId}-endTime-label`}
                relativeTo={form.time || null}
                invalid={isEndInvalid}
                aria-describedby={endDescribedBy}
                value={form.endTime || null}
                onChange={(value) => form.setEndTime(value ?? "")}
              />
            </div>
          </FieldRow>
          {spanNote && (
            <p id={spanId} className={styles.runs}>
              {spanNote}
            </p>
          )}
        </div>
      </Field>
    </>
  );
}
