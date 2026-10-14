import { useId, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  SCHEDULE_PROBLEM_KEY,
  defaultScheduleValues,
  instantFromValues,
  localParts,
  scheduleInputBounds,
  scheduleProblemOf,
  scheduleReadback,
  type ScheduleFormValues,
} from "./studioSchedule";
import s from "./creator.module.css";
import styles from "./StudioSchedule.module.css";

/** A date and a time in the member's zone, read back as a sentence, and
 *  one button. Nothing sends while the time sits outside the server's
 *  window; the reason shows under the fields. */
export function StudioScheduleForm({
  initialPublishAt = null,
  submitLabelKey,
  isWorking,
  isBlocked = false,
  blockedDescriptionId,
  now,
  onSubmit,
  onCancel,
}: {
  initialPublishAt?: string | null;
  submitLabelKey: string;
  isWorking: boolean;
  /** The publish checklist still has gaps: the button stays focusable and
   *  points at the checklist. */
  isBlocked?: boolean;
  blockedDescriptionId?: string;
  /** A seam for tests; the real clock otherwise. */
  now?: Date;
  onSubmit: (publishAt: string) => void;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const dateId = useId();
  const timeId = useId();
  const zoneHintId = useId();
  const problemId = useId();
  const [values, setValues] = useState<ScheduleFormValues>(() =>
    initialPublishAt
      ? localParts(new Date(initialPublishAt))
      : defaultScheduleValues(now),
  );
  const [shouldShowProblem, setShouldShowProblem] = useState(false);
  const clock = now ?? new Date();
  const instant = instantFromValues(values);
  const problem = scheduleProblemOf(instant, clock);
  const bounds = scheduleInputBounds(clock);
  const readback =
    instant && !problem ? scheduleReadback(instant, formatters) : null;
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isProblemShown = shouldShowProblem && problem !== null;
  // A date too far is the date's fault; an empty field or a time too soon
  // can be fixed in either field.
  const isDateInvalid = isProblemShown;
  const isTimeInvalid =
    isProblemShown && (problem === "incomplete" || problem === "tooSoon");
  const describedByOf = (isInvalid: boolean) =>
    [zoneHintId, isInvalid ? problemId : null].filter(Boolean).join(" ");

  function update(patch: Partial<ScheduleFormValues>) {
    setValues((previous) => ({ ...previous, ...patch }));
  }

  function submit() {
    if (isWorking || isBlocked) return;
    // Checked against the clock at the press: a time picked an hour ago
    // may have slipped inside the 15 minutes since.
    if (scheduleProblemOf(instant, now ?? new Date()) || !instant) {
      setShouldShowProblem(true);
      return;
    }
    onSubmit(instant.toISOString());
  }

  return (
    <div className={styles.form}>
      <div className={styles.fields}>
        <div className={s.field}>
          <label htmlFor={dateId}>{t("studio:schedule.form.dateLabel")}</label>
          <input
            id={dateId}
            type="date"
            value={values.date}
            min={bounds.min}
            max={bounds.max}
            required
            aria-invalid={isDateInvalid || undefined}
            aria-describedby={describedByOf(isDateInvalid)}
            onChange={(event) => update({ date: event.target.value })}
          />
        </div>
        <div className={s.field}>
          <label htmlFor={timeId}>{t("studio:schedule.form.timeLabel")}</label>
          <input
            id={timeId}
            type="time"
            value={values.time}
            required
            aria-invalid={isTimeInvalid || undefined}
            aria-describedby={describedByOf(isTimeInvalid)}
            onChange={(event) => update({ time: event.target.value })}
          />
        </div>
      </div>
      <p id={zoneHintId} className={styles.hint}>
        {t("studio:schedule.form.zoneHint", { zone })}
      </p>
      <p
        className={[styles.readback, isProblemShown && styles.readbackEmpty]
          .filter(Boolean)
          .join(" ")}
        aria-live="polite"
      >
        {readback ? t("studio:schedule.form.readback", readback) : ""}
      </p>
      <p id={problemId} className={s.fieldError} role="alert">
        {isProblemShown && problem ? t(SCHEDULE_PROBLEM_KEY[problem]) : ""}
      </p>
      <div className={styles.actions}>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            {t("studio:schedule.form.keepDateCta")}
          </Button>
        )}
        <Button
          onClick={submit}
          aria-disabled={isWorking || isBlocked || undefined}
          aria-describedby={isBlocked ? blockedDescriptionId : undefined}
        >
          {isWorking ? t("studio:schedule.form.scheduling") : t(submitLabelKey)}
        </Button>
      </div>
    </div>
  );
}
