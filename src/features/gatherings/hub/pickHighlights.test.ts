import { describe, expect, it } from "vitest";
import type { CalendarEvent } from "../data";
import {
  pickHighlights,
  timeBucketLabelKey,
  timeBucketOf,
} from "./pickHighlights";

/**
 * Highlights curation and the poster ribbon read the same buckets. Both used
 * to work from the START day alone, so an overnight party rolled past midnight
 * into a negative day difference: it fell out of Highlights and out of the
 * Featured card above them, and the ribbon labelled a gathering happening
 * right at that moment "Coming up".
 */

function gathering(overrides: Partial<CalendarEvent>): CalendarEvent {
  return {
    date: new Date(2026, 9, 17, 23, 0),
    org: "Community",
    orgColor: "var(--violet)",
    title: "A gathering",
    hood: "Anjos",
    to: "/gatherings/a-gathering",
    kind: "gathering",
    ...overrides,
  };
}

/** 01:00 on 18 October, an hour and a half into the overnight party below. */
const DURING_THE_PARTY = new Date(2026, 9, 18, 1, 0);

const OVERNIGHT_PARTY = gathering({
  title: "Overnight party",
  date: new Date(2026, 9, 17, 23, 0),
  endAt: new Date(2026, 9, 18, 4, 0),
});

describe("timeBucketOf", () => {
  it("names a gathering under way rather than calling it later", () => {
    expect(timeBucketOf(OVERNIGHT_PARTY, DURING_THE_PARTY)).toBe("now");
    expect(timeBucketLabelKey("now")).toBe("gatherings:hub.bucket.now");
  });

  it("names a festival on its second day under way too", () => {
    const festival = gathering({
      date: new Date(2026, 9, 17, 12, 0),
      endAt: new Date(2026, 9, 19, 22, 0),
    });
    expect(timeBucketOf(festival, new Date(2026, 9, 18, 15, 0))).toBe("now");
  });

  it("still buckets a gathering starting later today as tonight", () => {
    expect(timeBucketOf(OVERNIGHT_PARTY, new Date(2026, 9, 17, 10, 0))).toBe(
      "tonight",
    );
  });

  it("buckets a gathering with no stated end exactly as before", () => {
    const noEnd = gathering({ date: new Date(2026, 9, 17, 19, 0) });
    // Saturday 17 October, three days out: the weekend bucket.
    expect(timeBucketOf(noEnd, new Date(2026, 9, 14, 12, 0))).toBe("weekend");
    // The same gathering read on the day it happens.
    expect(timeBucketOf(noEnd, new Date(2026, 9, 17, 9, 0))).toBe("tonight");
    // Two weeks out: beyond the week window.
    expect(timeBucketOf(noEnd, new Date(2026, 9, 1, 12, 0))).toBe("later");
  });
});

describe("pickHighlights", () => {
  it("keeps a gathering that is still running after midnight", () => {
    const tomorrow = gathering({
      title: "Sunday brunch",
      date: new Date(2026, 9, 19, 11, 0),
    });
    const picked = pickHighlights(
      [OVERNIGHT_PARTY, tomorrow],
      DURING_THE_PARTY,
    );
    expect(picked.map((event) => event.title)).toContain("Overnight party");
  });

  it("leads with the gathering under way", () => {
    const tomorrow = gathering({
      title: "Sunday brunch",
      date: new Date(2026, 9, 19, 11, 0),
      attendeeCount: 40,
    });
    const [lead] = pickHighlights(
      [tomorrow, OVERNIGHT_PARTY],
      DURING_THE_PARTY,
      {
        count: 1,
      },
    );
    expect(lead?.title).toBe("Overnight party");
  });

  it("keeps a festival on the hub's front page on its second day", () => {
    const festival = gathering({
      title: "Three-day festival",
      date: new Date(2026, 9, 17, 12, 0),
      endAt: new Date(2026, 9, 19, 22, 0),
    });
    const picked = pickHighlights([festival], new Date(2026, 9, 18, 15, 0));
    expect(picked.map((event) => event.title)).toEqual(["Three-day festival"]);
  });

  it("drops a gathering whose stated end has passed", () => {
    const picked = pickHighlights(
      [OVERNIGHT_PARTY],
      new Date(2026, 9, 18, 6, 0),
    );
    expect(picked).toEqual([]);
  });

  it("curates a gathering with no stated end exactly as before", () => {
    const today = gathering({
      title: "Supper club",
      date: new Date(2026, 9, 17, 19, 0),
    });
    const yesterday = gathering({
      title: "Last night",
      date: new Date(2026, 9, 16, 19, 0),
    });
    const picked = pickHighlights(
      [today, yesterday],
      new Date(2026, 9, 17, 21, 0),
    );
    expect(picked.map((event) => event.title)).toEqual(["Supper club"]);
  });
});
