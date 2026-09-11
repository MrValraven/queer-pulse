/**
 * The pure half of the create wizard's schedule pair: what the four fields add
 * up to, and which fix to name when they add up to something the wizard will
 * not take.
 *
 * Its own module so the choice can be exercised from a plain object (no
 * wizard, no providers, no DOM) and so the step files keep exporting only
 * components.
 */

/** True when a `Date` was actually built from a complete, well-formed value. */
function isReadableInstant(instant: Date | null): instant is Date {
  return instant !== null && !Number.isNaN(instant.getTime());
}

/**
 * Just the schedule half of `GatheringForm`. Narrower on purpose: the end
 * pair's message can then be exercised from a plain object, with no wizard,
 * no providers and no DOM around it.
 */
export interface SchedulePairState {
  date: string;
  time: string;
  endDate: string;
  endTime: string;
  scheduleValid: boolean;
}

/**
 * The two instants the four schedule fields describe, or null on a side the
 * fields do not yet spell out.
 *
 * The `time || "19:00"` and `endDate || date` fallbacks are
 * `useGatheringForm`'s own, so what the host reads under the fields is the
 * schedule the wizard would actually submit. The span itself is measured from
 * these instants, because minutes-since-midnight wrap at 24 hours and a
 * three-day festival has nowhere to land in clock arithmetic.
 */
export function scheduleInstants(
  form: Pick<SchedulePairState, "date" | "time" | "endDate" | "endTime">,
): {
  startInstant: Date | null;
  endInstant: Date | null;
} {
  const start = form.date
    ? new Date(`${form.date}T${form.time || "19:00"}`)
    : null;
  const end =
    form.date && form.endTime
      ? new Date(`${form.endDate || form.date}T${form.endTime}`)
      : null;
  // An end with no end date of its own that lands at or before the start runs
  // past midnight, so it moves to the next day. THIS IS THE WIZARD'S ONE COPY
  // of that roll-forward (the gate, the preview card and the "Runs" line all
  // read these instants), and it must match `combineEndDateTime` in
  // api/events.adapters.ts, which builds the payload the same way.
  if (
    !form.endDate &&
    isReadableInstant(start) &&
    isReadableInstant(end) &&
    end.getTime() <= start.getTime()
  ) {
    end.setDate(end.getDate() + 1);
  }
  return {
    startInstant: isReadableInstant(start) ? start : null,
    endInstant: isReadableInstant(end) ? end : null,
  };
}

/**
 * The i18n key naming the fix for an end pair the wizard will not take, or null
 * when the pair has nothing to answer for.
 *
 * `form.scheduleValid` stays the gate, and the 14-day cap is never re-derived
 * here. This only picks WHICH fix to name, because "move the end later" and
 * "make it shorter" are opposite instructions.
 *
 * The `date` guard is load-bearing. `endTime` is PREFILLED at "22:00", so a
 * brand new wizard already has an end time, no start date, and therefore no
 * start instant for `evaluateSchedule` to measure from, which makes
 * `scheduleValid` false on mount. Guarding on the end time alone painted a
 * fresh step 2 in the danger colour and told the host their gathering ended
 * before it began, about a start date they had not picked yet. A missing start
 * date is the start field's own business, and it says so in its own hint.
 */
export function schedulePairErrorKey(form: SchedulePairState): string | null {
  if (!form.date || !form.endTime || form.scheduleValid) return null;
  const { startInstant, endInstant } = scheduleInstants(form);
  const isEndBeforeStart =
    !startInstant ||
    !endInstant ||
    endInstant.getTime() <= startInstant.getTime();
  return isEndBeforeStart
    ? "gatherings:create.step2.endsBeforeStart"
    : "gatherings:create.step2.spanTooLong";
}
