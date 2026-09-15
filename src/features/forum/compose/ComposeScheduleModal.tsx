import { useState } from "react";
import {
  Button,
  DatePicker,
  FormField,
  Modal,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./ComposeScheduleModal.module.css";

export interface ComposeScheduleModalProps {
  /**
   * Seeds the field, as the local `"yyyy-mm-ddThh:mm"` shape `DatePicker`'s
   * `datetime` mode reads and writes. Defaults to tomorrow morning, which is
   * the answer most people are reaching for.
   */
  initialValue?: string | null;
  /** Back to the composer. Also what the scrim, the X and Escape do. */
  onBack: () => void;
  /** Hands back the chosen `"yyyy-mm-ddThh:mm"` local moment. */
  onSchedule: (whenLocalIso: string) => void;
}

/** How far ahead scheduling reaches. A year is the honest ceiling: past it a
 *  draft is a note to self rather than a post waiting to go out. */
const MAX_MONTHS_AHEAD = 12;

/**
 * Pick a day and a time for a post to publish itself.
 *
 * Two things are refused, each with the reason said under the field rather
 * than after a failed submit: a moment that has already passed, and anything
 * more than a year out.
 */
export function ComposeScheduleModal({
  initialValue,
  onBack,
  onSchedule,
}: ComposeScheduleModalProps) {
  const { t } = useTranslation();
  const [whenValue, setWhenValue] = useState<string | null>(
    initialValue ?? defaultScheduleValue(),
  );

  const now = new Date();
  const latest = addMonths(now, MAX_MONTHS_AHEAD);
  const errorKey = scheduleErrorKey(whenValue, now, latest);
  const canSchedule = whenValue !== null && errorKey === null;

  return (
    <Modal
      title={t("forum:composePage.schedule.title")}
      sub={t("forum:composePage.schedule.sub")}
      onClose={onBack}
      footer={
        <>
          <span className={styles.footSpacer} />
          <Button variant="ghost" onClick={onBack}>
            {t("forum:composePage.overlay.back")}
          </Button>
          <Button
            disabled={!canSchedule}
            onClick={() => {
              if (whenValue && canSchedule) onSchedule(whenValue);
            }}
          >
            {t("forum:composePage.schedule.confirm")}
          </Button>
        </>
      }
    >
      <div className={styles.field}>
        <FormField
          label={t("forum:composePage.schedule.fieldLabel")}
          helper={t("forum:composePage.schedule.helper")}
          error={errorKey ? t(errorKey) : undefined}
        >
          <DatePicker
            mode="datetime"
            value={whenValue}
            onChange={setWhenValue}
            label={t("forum:composePage.schedule.fieldLabel")}
            min={toLocalDateValue(now)}
            max={toLocalDateValue(latest)}
          />
        </FormField>
      </div>
    </Modal>
  );
}

/** Which reason to state under the field, or null when the moment is fine. */
function scheduleErrorKey(
  value: string | null,
  now: Date,
  latest: Date,
): string | null {
  if (value === null) return null;
  const chosen = parseLocalDateTimeValue(value);
  if (!chosen) return "forum:composePage.schedule.errorMissing";
  if (chosen.getTime() <= now.getTime())
    return "forum:composePage.schedule.errorPast";
  if (chosen.getTime() > latest.getTime())
    return "forum:composePage.schedule.errorTooFar";
  return null;
}

/** Tomorrow at 09:00 local, the prototype's own default. */
function defaultScheduleValue(): string {
  const tomorrowMorning = new Date();
  tomorrowMorning.setDate(tomorrowMorning.getDate() + 1);
  tomorrowMorning.setHours(9, 0, 0, 0);
  return toLocalDateTimeValue(tomorrowMorning);
}

function addMonths(from: Date, months: number): Date {
  const shifted = new Date(from.getTime());
  shifted.setMonth(shifted.getMonth() + months);
  return shifted;
}

const padTwoDigits = (value: number) => String(value).padStart(2, "0");

/**
 * The LOCAL `"yyyy-mm-ddThh:mm"` shape `DatePicker` reads and writes.
 * `toISOString()` is deliberately not used: it converts to UTC, so a member in
 * Lisbon picking 09:00 in summer would be handed 08:00 back.
 */
function toLocalDateTimeValue(date: Date): string {
  const datePart = toLocalDateValue(date);
  return `${datePart}T${padTwoDigits(date.getHours())}:${padTwoDigits(date.getMinutes())}`;
}

function toLocalDateValue(date: Date): string {
  return `${date.getFullYear()}-${padTwoDigits(date.getMonth() + 1)}-${padTwoDigits(date.getDate())}`;
}

/** Read `"yyyy-mm-ddThh:mm"` back as a local `Date`, or null when the field is
 *  still half-filled. */
function parseLocalDateTimeValue(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match;
  const parsed = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    0,
    0,
  );
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
