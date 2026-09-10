import { describe, expect, it } from "vitest";
import type { CalendarEvent } from "../gatherings/data";
import { pickNextGatherings } from "./pickNextGatherings";

/**
 * The /arriving "Your first step" section. It used to keep only gatherings
 * whose START was still ahead, so a gathering running right now dropped off
 * the page while it was happening. The cut is now the END instant.
 *
 * The demo-registry fallback is asserted alongside, because that branch is the
 * one thing here that must survive unchanged: the frozen prototype fixture is
 * entirely in the past, and the section still has to paint in demo mode.
 */

function gathering(overrides: Partial<CalendarEvent>): CalendarEvent {
  return {
    date: new Date("2026-10-17T23:00:00Z"),
    org: "Community",
    orgColor: "var(--violet)",
    title: "A gathering",
    hood: "Anjos",
    to: "/gatherings/a-gathering",
    kind: "gathering",
    ...overrides,
  };
}

const OVERNIGHT_PARTY = gathering({
  title: "Overnight party",
  date: new Date("2026-10-17T23:00:00Z"),
  endAt: new Date("2026-10-18T04:00:00Z"),
});

/** 01:00 on 18 October, an hour into the party above. */
const DURING_THE_PARTY = new Date("2026-10-18T01:00:00Z");

describe("pickNextGatherings", () => {
  it("keeps a gathering that is still running", () => {
    const shown = pickNextGatherings(
      [OVERNIGHT_PARTY],
      false,
      DURING_THE_PARTY,
    );
    expect(shown.map((event) => event.title)).toEqual(["Overnight party"]);
  });

  it("keeps a festival on its second day", () => {
    const festival = gathering({
      title: "Three-day festival",
      date: new Date("2026-10-17T12:00:00Z"),
      endAt: new Date("2026-10-19T22:00:00Z"),
    });
    expect(
      pickNextGatherings([festival], false, new Date("2026-10-18T15:00:00Z")),
    ).toHaveLength(1);
  });

  it("drops it once its stated end has passed", () => {
    expect(
      pickNextGatherings(
        [OVERNIGHT_PARTY],
        false,
        new Date("2026-10-18T05:00:00Z"),
      ),
    ).toEqual([]);
  });

  it("treats a gathering with no end exactly as before, ending at its start", () => {
    const noEnd = gathering({ title: "Supper club" });
    expect(
      pickNextGatherings([noEnd], false, new Date("2026-10-17T22:00:00Z")),
    ).toHaveLength(1);
    expect(
      pickNextGatherings([noEnd], false, new Date("2026-10-17T23:30:00Z")),
    ).toEqual([]);
  });

  it("shows the two soonest, in order", () => {
    const shown = pickNextGatherings(
      [
        gathering({ title: "Third", date: new Date("2026-10-20T19:00:00Z") }),
        gathering({ title: "First", date: new Date("2026-10-18T19:00:00Z") }),
        gathering({ title: "Second", date: new Date("2026-10-19T19:00:00Z") }),
      ],
      false,
      DURING_THE_PARTY,
    );
    expect(shown.map((event) => event.title)).toEqual(["First", "Second"]);
  });

  it("still paints the frozen demo registry when every date is behind us", () => {
    const past = [
      gathering({ title: "Older", date: new Date("2026-06-01T19:00:00Z") }),
      gathering({ title: "Newer", date: new Date("2026-06-08T19:00:00Z") }),
      gathering({ title: "Newest", date: new Date("2026-06-15T19:00:00Z") }),
    ];
    expect(
      pickNextGatherings(past, true, DURING_THE_PARTY).map(
        (event) => event.title,
      ),
    ).toEqual(["Older", "Newer"]);
  });

  it("leaves live mode empty when everything has ended", () => {
    const past = [gathering({ date: new Date("2026-06-01T19:00:00Z") })];
    expect(pickNextGatherings(past, false, DURING_THE_PARTY)).toEqual([]);
  });
});
