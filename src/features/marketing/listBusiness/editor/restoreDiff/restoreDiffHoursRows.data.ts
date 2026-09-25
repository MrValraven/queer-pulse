import type { TFunction } from "../../../../../shared/i18n/types";
import {
  DAYS,
  type DayHours,
  type HoursException,
} from "../../listBusiness.data";
import { comparableDay } from "./listingDraftComparable";
import {
  DIFF_KEY_PREFIX,
  LIST_SEPARATOR,
  type RestoreDiffContext,
} from "./restoreDiffFields.data";
import { changedRow, SUMMARY_SEPARATOR } from "./restoreDiffRowParts.data";
import type { RestoreRowChange } from "./restoreDiff.types";

/**
 * Rows for the weekly hours and the dated exceptions. Both decide "changed"
 * through `comparableDay`, the same reading the fingerprint and the merge
 * gate use, so a row shows exactly when bringing the copy back changes what
 * a reader sees.
 */

const CLOSED_KEY = "marketing:listBusiness.step3.closed";

function isSameDay(
  first: DayHours | undefined,
  second: DayHours | undefined,
): boolean {
  return (
    JSON.stringify(comparableDay(first)) ===
    JSON.stringify(comparableDay(second))
  );
}

/** One day (or one dated exception) as a reader would say it. A window with
 *  a missing time says so, since restoring it brings back a gap the owner
 *  has to fill before the listing can be saved. */
export function hoursSummary(t: TFunction, day: DayHours | undefined): string {
  const { open, intervals } = comparableDay(day);
  if (!open) return t(CLOSED_KEY);
  const timeOrPlaceholder = (time: string) =>
    time || t(`${DIFF_KEY_PREFIX}.hours.timeNotSet`);
  const windows = intervals.map((interval) =>
    t(`${DIFF_KEY_PREFIX}.hours.interval`, {
      from: timeOrPlaceholder(interval.from),
      to: timeOrPlaceholder(interval.to),
    }),
  );
  return windows.length
    ? windows.join(LIST_SEPARATOR)
    : t(`${DIFF_KEY_PREFIX}.hours.openNoTimes`);
}

export function hoursRows(context: RestoreDiffContext): RestoreRowChange[] {
  const { current, saved, t } = context;
  return DAYS.flatMap((day) => {
    const before = current.hours[day.id];
    const after = saved.hours[day.id];
    if (isSameDay(before, after)) return [];
    return [
      changedRow(
        `hours.${day.id}`,
        t(day.labelKey),
        hoursSummary(t, before),
        hoursSummary(t, after),
      ),
    ];
  });
}

/** Exceptions keyed by date. A date entered twice (the editor flags it, but a
 *  stored copy may still hold one) pairs by occurrence, so keys stay unique. */
function exceptionsByDate(
  exceptions: readonly HoursException[] | undefined,
): Map<string, HoursException> {
  const byKey = new Map<string, HoursException>();
  const occurrences = new Map<string, number>();
  for (const exception of exceptions ?? []) {
    const occurrence = (occurrences.get(exception.date) ?? 0) + 1;
    occurrences.set(exception.date, occurrence);
    byKey.set(`${exception.date}#${occurrence}`, exception);
  }
  return byKey;
}

/** No date formatter reaches a pure module, so the ISO date stands as it is,
 *  which also sorts and scans cleanly in a list of dates. */
function exceptionLabel(t: TFunction, exception: HoursException): string {
  const note = exception.note.trim();
  return note
    ? t(`${DIFF_KEY_PREFIX}.row.exceptionWithNote`, {
        date: exception.date,
        note,
      })
    : exception.date;
}

/** Matched by date, in date order, as the fingerprint compares them. */
export function hoursExceptionRows(
  context: RestoreDiffContext,
): RestoreRowChange[] {
  const { t } = context;
  const beforeByKey = exceptionsByDate(context.current.hoursExceptions);
  const afterByKey = exceptionsByDate(context.saved.hoursExceptions);
  const keys = [...new Set([...beforeByKey.keys(), ...afterByKey.keys()])];
  return keys.sort().flatMap((key) => {
    const before = beforeByKey.get(key);
    const after = afterByKey.get(key);
    const isNoteChanged = Boolean(
      before && after && before.note !== after.note,
    );
    if (before && after && !isNoteChanged && isSameDay(before, after)) {
      return [];
    }
    // A note that changed on a date both sides hold is shown beside the
    // hours exactly as written (untrimmed), so even a spacing-only edit
    // reads as different. Otherwise the label already carries the note.
    const describe = (exception: HoursException | undefined) => {
      if (!exception) return null;
      const hours = hoursSummary(t, exception);
      return isNoteChanged
        ? `${hours}${SUMMARY_SEPARATOR}${exception.note}`
        : hours;
    };
    const label = exceptionLabel(t, (after ?? before)!);
    return [
      changedRow(
        `hoursExceptions.${key}`,
        label,
        describe(before),
        describe(after),
      ),
    ];
  });
}
