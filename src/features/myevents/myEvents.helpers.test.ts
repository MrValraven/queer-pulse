import { describe, expect, it } from "vitest";
import type { TFunction } from "../../shared/i18n/types";
import { TODAY } from "./myEvents.data";
import {
  conflictFor,
  endDateOf,
  eventDays,
  inPill,
  isInMonth,
  isOnDay,
  isToday,
  shouldShowDayOf,
  soonLabel,
} from "./myEvents.helpers";
import type { MyEvent } from "./myEvents.types";

/**
 * A gathering can run past midnight (23:00 to 04:00) or across several days.
 * `MyEvent` used to keep only the end's clock time, so every predicate here
 * read the end against the START day: an overnight party's end landed nineteen
 * hours before its own beginning, which made "Happening now" unreachable,
 * inverted the interval `conflictFor` tests, and dropped a running gathering
 * out of the member's own upcoming list at midnight.
 *
 * These assertions pin the interval reasoning that replaced it, and pin the
 * no-end case to exactly the behaviour it had before.
 */

/** The `t` these helpers take renders chrome copy only. Echoing the key keeps
 *  the assertions about the branch taken rather than about the catalog. */
const t: TFunction = (key: string) => key;

/** `TODAY` is the dashboard's anchor (Mon 29 Jun 2026), so every fixture below
 *  is written relative to it rather than to the wall clock the suite runs on. */
function dayOffsetFromToday(offset: number): string {
  const day = new Date(TODAY);
  day.setDate(day.getDate() + offset);
  return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
}

function event(overrides: Partial<MyEvent> & { id: string }): MyEvent {
  return {
    category: "going",
    title: "A gathering",
    date: dayOffsetFromToday(0),
    start: "19:00",
    venue: "Mouraria",
    going: 4,
    ...overrides,
  };
}

describe("an overnight gathering", () => {
  const overnight = event({
    id: "overnight",
    date: "2026-06-29",
    start: "23:00",
    end: "04:00",
    endDate: "2026-06-30",
  });

  it("is happening now at 01:00 the following morning", () => {
    const oneInTheMorning = new Date(2026, 5, 30, 1, 0);
    expect(soonLabel(overnight, t, oneInTheMorning)).toBe(
      "myevents:soon.happeningNow",
    );
  });

  it("still counts as on today once the clock has passed midnight", () => {
    // Both of its days, so the join link, the ticket and the check-in survive
    // the moment the date rolls over.
    expect(isOnDay(overnight, "2026-06-29")).toBe(true);
    expect(isOnDay(overnight, "2026-06-30")).toBe(true);
    expect(isOnDay(overnight, "2026-07-01")).toBe(false);
  });

  it("keeps its join link and ticket on its opening day", () => {
    expect(isToday(overnight)).toBe(true);
  });
});

describe("a festival already under way", () => {
  const festival = event({
    id: "festival",
    date: dayOffsetFromToday(-1),
    start: "16:00",
    end: "23:00",
    endDate: dayOffsetFromToday(1),
  });

  it("stays in the Upcoming pill while it is still running", () => {
    expect(inPill(festival, "upcoming")).toBe(true);
    expect(inPill(festival, "going")).toBe(true);
  });

  it("leaves the Upcoming pill only once its closing day has passed", () => {
    const finished = { ...festival, endDate: dayOffsetFromToday(-1) };
    expect(inPill(finished, "upcoming")).toBe(false);
  });

  it("appears in every day cell it spans", () => {
    expect(eventDays(festival)).toEqual([
      dayOffsetFromToday(-1),
      dayOffsetFromToday(0),
      dayOffsetFromToday(1),
    ]);
  });

  it("is on today on its middle day", () => {
    expect(isToday(festival)).toBe(true);
  });
});

describe("conflictFor", () => {
  const overnight = event({
    id: "overnight",
    date: "2026-06-29",
    start: "23:00",
    end: "04:00",
    endDate: "2026-06-30",
  });

  it("detects a next-morning gathering that overlaps an overnight one", () => {
    const earlyBrunch = event({
      id: "brunch",
      date: "2026-06-30",
      start: "03:00",
      end: "06:00",
    });
    expect(conflictFor(overnight, [overnight, earlyBrunch])?.id).toBe("brunch");
    expect(conflictFor(earlyBrunch, [overnight, earlyBrunch])?.id).toBe(
      "overnight",
    );
  });

  it("leaves a next-morning gathering that starts after it alone", () => {
    const laterBrunch = event({
      id: "brunch",
      date: "2026-06-30",
      start: "11:00",
      end: "13:00",
    });
    expect(conflictFor(overnight, [overnight, laterBrunch])).toBeNull();
  });

  it("ignores anything the member has not committed to", () => {
    const saved = event({
      id: "saved",
      category: "saved",
      date: "2026-06-30",
      start: "03:00",
      end: "06:00",
    });
    expect(conflictFor(overnight, [overnight, saved])).toBeNull();
  });
});

describe("a gathering with no stated end", () => {
  const openEnded = event({
    id: "open-ended",
    date: dayOffsetFromToday(0),
    start: "19:00",
  });

  it("ends on the day it starts, matching gatheringHasEnded", () => {
    expect(endDateOf(openEnded)).toBe(dayOffsetFromToday(0));
    expect(eventDays(openEnded)).toEqual([dayOffsetFromToday(0)]);
  });

  it("occupies exactly its own day, as it always did", () => {
    expect(isToday(openEnded)).toBe(true);
    expect(isOnDay(openEnded, dayOffsetFromToday(1))).toBe(false);
  });

  it("holds its place in the Upcoming pill for the whole of that day", () => {
    expect(inPill(openEnded, "upcoming")).toBe(true);
    expect(
      inPill({ ...openEnded, date: dayOffsetFromToday(-1) }, "upcoming"),
    ).toBe(false);
  });

  it("never clashes with anything, since it occupies no interval", () => {
    const sameHour = event({
      id: "same-hour",
      date: dayOffsetFromToday(0),
      start: "19:00",
    });
    expect(conflictFor(openEnded, [openEnded, sameHour])).toBeNull();
  });

  it("reports how long until it starts rather than happening now", () => {
    const twoHoursBefore = new Date(TODAY);
    twoHoursBefore.setHours(17, 0, 0, 0);
    expect(soonLabel(openEnded, t, twoHoursBefore)).toBe(
      "myevents:soon.startsInHours",
    );
  });
});

describe("an end date without an end time", () => {
  it("is ignored, so a half-filled row cannot stretch a gathering", () => {
    const halfFilled = event({
      id: "half-filled",
      date: dayOffsetFromToday(0),
      start: "19:00",
      endDate: dayOffsetFromToday(3),
    });
    expect(endDateOf(halfFilled)).toBe(dayOffsetFromToday(0));
    expect(eventDays(halfFilled)).toEqual([dayOffsetFromToday(0)]);
  });
});

describe("the day-level prefilter in conflictFor", () => {
  /**
   * Zone offsets run from UTC-12 to UTC+14, so ONE instant carries wall-clock
   * day labels two calendar days apart at the extremes. These two gatherings
   * are both 10:00Z on 2 January. Their stored days read 1 January and 3
   * January, two apart, and a cushion of one day would skip the pair and tell
   * the member they are free.
   */
  const farEast = event({
    id: "far-east",
    date: "2026-01-03",
    start: "00:00",
    end: "02:00",
    timezone: "Pacific/Kiritimati",
  });
  const farWest = event({
    id: "far-west",
    date: "2026-01-01",
    start: "22:00",
    end: "23:59",
    timezone: "Etc/GMT+12",
  });

  it("still sees a clash whose stored days sit two apart", () => {
    expect(conflictFor(farEast, [farEast, farWest])?.id).toBe("far-west");
    expect(conflictFor(farWest, [farEast, farWest])?.id).toBe("far-east");
  });

  it("skips a pair that genuinely cannot touch", () => {
    const weekLater = event({
      id: "week-later",
      date: "2026-01-10",
      start: "00:00",
      end: "02:00",
      timezone: "Pacific/Kiritimati",
    });
    expect(conflictFor(farWest, [farWest, weekLater])).toBeNull();
  });
});

describe("isInMonth", () => {
  const acrossTheBoundary = event({
    id: "across-the-boundary",
    date: "2026-09-29",
    start: "16:00",
    end: "14:00",
    endDate: "2026-10-02",
  });

  it("puts a gathering in every month it runs through", () => {
    // September is month index 8, October index 9.
    expect(isInMonth(acrossTheBoundary, 2026, 8)).toBe(true);
    expect(isInMonth(acrossTheBoundary, 2026, 9)).toBe(true);
  });

  it("leaves out the months either side of it", () => {
    expect(isInMonth(acrossTheBoundary, 2026, 7)).toBe(false);
    expect(isInMonth(acrossTheBoundary, 2026, 10)).toBe(false);
    expect(isInMonth(acrossTheBoundary, 2025, 8)).toBe(false);
  });

  it("puts a single-day gathering in exactly one month", () => {
    const oneDay = event({ id: "one-day", date: "2026-09-29" });
    expect(isInMonth(oneDay, 2026, 8)).toBe(true);
    expect(isInMonth(oneDay, 2026, 9)).toBe(false);
  });
});

describe("shouldShowDayOf", () => {
  const overnight = event({
    id: "overnight",
    date: "2026-06-29",
    start: "23:00",
    end: "04:00",
    endDate: "2026-06-30",
  });

  it("holds the run sheet and the ticket while the party is still on", () => {
    expect(shouldShowDayOf(overnight, new Date(2026, 5, 30, 1, 0))).toBe(true);
  });

  it("drops them once the party has actually finished", () => {
    // The old day-level gate kept a ticket to something that ended at 04:00
    // on screen until 23:59 that night.
    expect(shouldShowDayOf(overnight, new Date(2026, 5, 30, 9, 0))).toBe(false);
  });

  it("shows them ahead of a gathering that has yet to open today", () => {
    const laterToday = event({
      id: "later-today",
      date: dayOffsetFromToday(0),
      start: "19:00",
      end: "21:00",
    });
    const lateAfternoon = new Date(TODAY);
    lateAfternoon.setHours(16, 30, 0, 0);
    expect(shouldShowDayOf(laterToday, lateAfternoon)).toBe(true);
  });

  it("holds all day for a gathering with no stated end, as it always did", () => {
    const openEnded = event({
      id: "open-ended",
      date: dayOffsetFromToday(0),
      start: "19:00",
    });
    const lateNight = new Date(TODAY);
    lateNight.setHours(23, 30, 0, 0);
    expect(shouldShowDayOf(openEnded, lateNight)).toBe(true);
  });

  it("shows nothing on a day the gathering does not run at all", () => {
    const nextWeek = event({
      id: "next-week",
      date: dayOffsetFromToday(7),
      start: "19:00",
      end: "21:00",
    });
    expect(shouldShowDayOf(nextWeek)).toBe(false);
  });
});
