import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MAX_GATHERING_SPAN_DAYS } from "./createGathering.data";
import { useGatheringForm } from "./useGatheringForm";

/**
 * The wizard's schedule state, now that a gathering may span more than one day.
 *
 * Two things are being pinned here. The first is the auto-adjust contract: the
 * end date fills itself in, follows the start date when that moves, and rolls
 * past midnight when the clock says the night wraps, while never shrinking on
 * its own. A host who typed "Friday to Sunday" and then nudged the start time
 * by fifteen minutes must still have a three-day festival afterwards.
 *
 * The second is `scheduleValid`, which mirrors the backend's
 * `assertScheduleValid`. Every case it rejects is a 400 the host would
 * otherwise meet on the last step of the wizard with nothing to act on.
 *
 * Dates are built relative to today because `dateValid` requires a start that
 * is still in the future, and a hardcoded 2026 date would start failing on its
 * own one day. The one exception is the span-cap case, which needs a fixed
 * window to keep a minute-wide boundary exact; it says so where it stands.
 */

/** A local calendar day as the `"YYYY-MM-DD"` string the hook stores. Local,
 *  because the hook reads these strings as local calendar days. */
function formatLocalDay(day: Date): string {
  const year = String(day.getFullYear()).padStart(4, "0");
  const month = String(day.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(day.getDate()).padStart(2, "0");
  return `${year}-${month}-${dayOfMonth}`;
}

/** A local `"YYYY-MM-DD"` a whole number of days from today. */
function futureDate(daysFromToday: number): string {
  const day = new Date();
  day.setHours(12, 0, 0, 0);
  day.setDate(day.getDate() + daysFromToday);
  return formatLocalDay(day);
}

/** A local `"YYYY-MM-DD"` a whole number of days from another one. */
function shiftDate(value: string, days: number): string {
  const parts = value.split("-").map(Number);
  return formatLocalDay(new Date(parts[0]!, parts[1]! - 1, parts[2]! + days));
}

describe("useGatheringForm end date", () => {
  it("fills the end date with the start date for an evening that ends the same night", () => {
    const { result } = renderHook(() => useGatheringForm());

    // The wizard's own defaults: 19:00 to 22:00.
    expect(result.current.time).toBe("19:00");
    expect(result.current.endTime).toBe("22:00");

    act(() => result.current.setDate(futureDate(10)));

    expect(result.current.endDate).toBe(futureDate(10));
    expect(result.current.spanDays).toBe(0);
    expect(result.current.scheduleValid).toBe(true);
  });

  it("rolls the end date to the next day for a 23:00 to 04:00 night", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    act(() => result.current.setTime("23:00"));
    act(() => result.current.setEndTime("04:00"));

    expect(result.current.endDate).toBe(futureDate(11));
    expect(result.current.spanDays).toBe(1);
    expect(result.current.scheduleValid).toBe(true);
  });

  it("rolls the end date forward on an end-time edit alone", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    // The start time is left at its 19:00 default, so the roll-over is the end
    // time's own doing. The 23:00-start case above rolls during `setTime`,
    // which leaves this path untested otherwise.
    act(() => result.current.setEndTime("02:00"));

    expect(result.current.endDate).toBe(futureDate(11));
    expect(result.current.scheduleValid).toBe(true);
  });

  it("moves an already-set end date by the same number of days as the start", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    // A Friday-to-Sunday festival: two whole days of span.
    act(() => result.current.setEndDate(futureDate(12)));
    expect(result.current.spanDays).toBe(2);

    act(() => result.current.setDate(futureDate(13)));

    expect(result.current.endDate).toBe(futureDate(15));
    expect(result.current.spanDays).toBe(2);
  });

  it("leaves a hand-picked end date alone when the start time still ends before it", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    act(() => result.current.setEndDate(futureDate(12)));

    act(() => result.current.setTime("21:00"));

    expect(result.current.endDate).toBe(futureDate(12));
    expect(result.current.scheduleValid).toBe(true);
  });

  it("never shrinks the end date on its own", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    act(() => result.current.setEndDate(futureDate(12)));

    // An end time earlier in the clock than the start time would roll a
    // single-day gathering forward. It must not pull a three-day one back.
    act(() => result.current.setEndTime("04:00"));

    expect(result.current.endDate).toBe(futureDate(12));
  });
});

describe("useGatheringForm scheduleValid", () => {
  it("rejects an end instant exactly equal to the start instant", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    act(() => result.current.setEndTime("19:00"));
    // The end time alone rolled the date forward, which is a valid schedule.
    expect(result.current.scheduleValid).toBe(true);

    // Pulling the end date back onto the start day makes the two instants
    // identical, which the backend rejects.
    act(() => result.current.setEndDate(futureDate(10)));

    expect(result.current.scheduleValid).toBe(false);
  });

  it("rejects an end instant before the start instant", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    act(() => result.current.setEndDate(futureDate(9)));

    expect(result.current.scheduleValid).toBe(false);
  });

  it("caps the span on elapsed time exactly the way the backend does", () => {
    // The boundary is a minute wide, so it is pinned on fixed dates in June
    // rather than on `futureDate`: no zone changes its offset in June, and a
    // daylight-saving change inside the span would move the last valid minute
    // by an hour. `scheduleValid` never consults the clock (that is
    // `dateValid`'s job), so a date in the past is a perfectly good input here.
    const startDate = "2026-06-12";
    const endDate = shiftDate(startDate, MAX_GATHERING_SPAN_DAYS);
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(startDate));
    act(() => result.current.setEndDate(endDate));

    // Fourteen days on the calendar AND fourteen days on the clock: 19:00 to
    // 19:00, which is exactly the cap.
    act(() => result.current.setEndTime("19:00"));
    expect(result.current.spanDays).toBe(MAX_GATHERING_SPAN_DAYS);
    expect(result.current.scheduleValid).toBe(true);

    // Still fourteen calendar days, and one minute too long. Counting days
    // would wave this through and leave the host with an unexplained 400.
    act(() => result.current.setEndTime("19:01"));
    expect(result.current.spanDays).toBe(MAX_GATHERING_SPAN_DAYS);
    expect(result.current.scheduleValid).toBe(false);
  });

  it("rejects a fifteenth calendar day", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(2)));
    act(() =>
      result.current.setEndDate(futureDate(2 + MAX_GATHERING_SPAN_DAYS + 1)),
    );

    expect(result.current.spanDays).toBe(MAX_GATHERING_SPAN_DAYS + 1);
    expect(result.current.scheduleValid).toBe(false);
  });

  it("accepts a gathering with no end time at all", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    act(() => result.current.setEndTime(""));

    expect(result.current.scheduleValid).toBe(true);
  });
});

/**
 * The family and format half of the wizard.
 *
 * What is pinned here is the promise the type step makes: picking a format
 * sets sensible defaults and asks one or two questions specific to it. That
 * promise only holds if the defaults know when to stop. A host who typed a
 * capacity, or who turned the headcount off, has said something, and no
 * later format change may quietly overrule them. The other half is that an
 * answer never outlives the question: a "what to bring" from a potluck must
 * not travel to a screening, where nothing on screen would ever show it again.
 */
describe("useGatheringForm family and format", () => {
  it("applies the family's capacity default while the field is untouched", () => {
    const { result } = renderHook(() => useGatheringForm());
    expect(result.current.cap).toBe("14");

    act(() => result.current.selectFormat("care", "support-circle"));
    expect(result.current.cap).toBe("10");

    act(() => result.current.selectFormat("party", "club-night"));
    expect(result.current.cap).toBe("40");
  });

  it("never moves a capacity the host has typed into", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setCapTouched("6"));
    act(() => result.current.selectFormat("party", "club-night"));

    expect(result.current.cap).toBe("6");
    expect(result.current.capacityDefault).toBeNull();
  });

  it("hides the attendee count for care, and shows it everywhere else", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.selectFormat("care", "peer-group"));
    expect(result.current.showAttendeeCount).toBe(false);

    act(() => result.current.selectFormat("eat", "potluck"));
    expect(result.current.showAttendeeCount).toBe(true);
  });

  it("leaves the attendee count alone once the host has set it", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setShowAttendeeCount(false));
    act(() => result.current.selectFormat("party", "house-party"));

    expect(result.current.showAttendeeCount).toBe(false);
  });

  it("drops detail answers the new family does not ask for", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.selectFormat("eat", "potluck"));
    act(() => result.current.setFormatDetail("bring", "a dish"));
    expect(result.current.submittedFormatDetails).toEqual({ bring: "a dish" });

    act(() => result.current.selectFormat("watch", "screening"));
    expect(result.current.formatDetails).toEqual({});
    expect(result.current.submittedFormatDetails).toBeNull();
  });

  it("clears a detail answer the host emptied rather than storing a hole", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.selectFormat("eat", "potluck"));
    act(() => result.current.setFormatDetail("bring", "a dish"));
    act(() => result.current.setFormatDetail("bring", ""));

    expect(result.current.submittedFormatDetails).toBeNull();
  });

  it("counts a curated format as chosen, and an unnamed own format as not", () => {
    const { result } = renderHook(() => useGatheringForm());
    expect(result.current.isFormatChosen).toBe(false);

    act(() => result.current.selectFormat("make", "zine-making"));
    expect(result.current.isFormatChosen).toBe(true);

    act(() => result.current.selectFormat("make", "other"));
    expect(result.current.isFormatChosen).toBe(false);

    act(() => result.current.setOtherText("Risograph afternoon"));
    expect(result.current.isFormatChosen).toBe(true);
  });

  it("clears the format when the host switches family in the family row", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.selectFormat("move", "swim"));
    act(() => result.current.selectFamily("learn"));

    expect(result.current.family).toBe("learn");
    expect(result.current.format).toBe("");
    expect(result.current.isFormatChosen).toBe(false);
  });
});
