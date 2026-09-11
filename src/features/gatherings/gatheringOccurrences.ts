import type { RecurrenceCadence } from "./api/events.api";
import { MAX_RECURRENCE_OCCURRENCES } from "./createGathering.data";
import type { GatheringForm } from "./useGatheringForm";

/**
 * Every start instant a gathering will be published with, as the wizard's
 * series list shows them before the host publishes.
 *
 * MIRRORS THE BACKEND'S `resolveOccurrences` (queerpulse-backend
 * events.service.ts), which is what actually writes one event row per date:
 * weekly, biweekly or monthly steps from the first start; stop after `endCount`
 * occurrences or at the last start on or before `endUntil`; at most 52. A
 * list that agrees with the server shows exactly the dates that get created.
 *
 * The steps are LOCAL calendar arithmetic (`setDate` / `setMonth` on a local
 * date), so a weekly 19:00 stays at 19:00 on the host's clock across a
 * daylight-saving change. The backend steps on the wall clock of the
 * gathering's own zone, which is the browser's: the payload's `timezone` is
 * the zone this code runs in, so both sides land on the same instants. Monthly
 * keeps the backend's own overflow: a start on the 31st rolls into the
 * following month wherever a month is shorter.
 */

/** The form fields a series is built from. A `Pick` so the series list, the
 *  preview and tests can hand over a plain object. */
export type GatheringOccurrenceInput = Pick<
  GatheringForm,
  "date" | "time" | "repeats" | "cadence" | "endType" | "endCount" | "endUntil"
>;

/** The start time the payload builder falls back to (`combineDateTime`). */
const FALLBACK_START_TIME = "19:00";

/** The clock time the payload builder puts on a series' end date: the whole
 *  of that day counts. */
const SERIES_END_TIME = "23:59";

/**
 * A `"YYYY-MM-DD"` day plus an `"HH:MM"` clock as a LOCAL instant, or null when
 * either is not a real value.
 *
 * Built from explicit parts, because `new Date("YYYY-MM-DD")` parses as UTC
 * midnight and lands on the previous day in every zone behind UTC. A day
 * the calendar does not have (the 31st of February) is refused here, the same
 * way the payload builder's own parse refuses it.
 */
function localInstant(date: string, time: string): Date | null {
  const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const timeParts = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(time);
  if (!dateParts || !timeParts) return null;
  const year = Number(dateParts[1]!);
  const monthIndex = Number(dateParts[2]!) - 1;
  const day = Number(dateParts[3]!);
  const instant = new Date(
    year,
    monthIndex,
    day,
    Number(timeParts[1]!),
    Number(timeParts[2]!),
  );
  if (
    Number.isNaN(instant.getTime()) ||
    instant.getFullYear() !== year ||
    instant.getMonth() !== monthIndex ||
    instant.getDate() !== day
  ) {
    return null;
  }
  return instant;
}

/** The start `index` cadence steps after `base`, exactly as the backend's
 *  `addCadence` steps it. Index 0 is `base` itself. */
function addCadence(
  base: Date,
  cadence: RecurrenceCadence,
  index: number,
): Date {
  const next = new Date(base.getTime());
  if (cadence === "weekly") next.setDate(next.getDate() + 7 * index);
  else if (cadence === "biweekly") next.setDate(next.getDate() + 14 * index);
  else next.setMonth(next.getMonth() + index);
  return next;
}

/**
 * The gathering's occurrences, earliest first.
 *
 * - No real start date yet: an empty list, since there is nothing to show.
 * - Repeats off: the one start.
 * - Repeats on with an end condition the server would refuse (no count, or an
 *   end date not after the start): the one start, since the first date is the
 *   only one the host has certainly defined. `recurrenceValid` is what tells
 *   them the rule needs fixing.
 */
export function gatheringOccurrences(form: GatheringOccurrenceInput): Date[] {
  const startAt = localInstant(form.date, form.time || FALLBACK_START_TIME);
  if (!startAt) return [];
  if (!form.repeats) return [startAt];

  let maxCount = MAX_RECURRENCE_OCCURRENCES;
  let untilTime: number | null = null;
  if (form.endType === "count") {
    const endCount = Number.parseInt(form.endCount, 10);
    if (!Number.isFinite(endCount) || endCount < 1) return [startAt];
    maxCount = Math.min(endCount, MAX_RECURRENCE_OCCURRENCES);
  } else {
    const until = localInstant(form.endUntil, SERIES_END_TIME);
    if (!until || until.getTime() <= startAt.getTime()) return [startAt];
    untilTime = until.getTime();
  }

  const occurrences: Date[] = [];
  for (let index = 0; index < maxCount; index++) {
    const occurrenceStart = addCadence(startAt, form.cadence, index);
    if (untilTime !== null && occurrenceStart.getTime() > untilTime) break;
    occurrences.push(occurrenceStart);
  }
  return occurrences;
}
