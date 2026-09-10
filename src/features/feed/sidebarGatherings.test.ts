import { describe, expect, it } from "vitest";
import type { CalendarEvent } from "../gatherings/data";
import { pickSidebarGatherings } from "./sidebarGatherings";

/**
 * The feed sidebar's "Upcoming" widget. It used to keep only gatherings whose
 * START was still ahead, so tonight's gathering vanished from the sidebar the
 * moment it began. The cut is now the END instant.
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

describe("pickSidebarGatherings", () => {
  it("keeps tonight's gathering after it has started", () => {
    const tonight = gathering({
      title: "Overnight party",
      date: new Date("2026-10-17T23:00:00Z"),
      endAt: new Date("2026-10-18T04:00:00Z"),
    });
    const rows = pickSidebarGatherings(
      [tonight],
      new Date("2026-10-18T01:00:00Z"),
    );
    expect(rows.map((row) => row.name)).toEqual(["Overnight party"]);
  });

  it("drops a gathering once its stated end has passed", () => {
    const finished = gathering({
      title: "Overnight party",
      endAt: new Date("2026-10-18T04:00:00Z"),
    });
    const rows = pickSidebarGatherings(
      [finished],
      new Date("2026-10-18T05:00:00Z"),
    );
    expect(rows).toEqual([]);
  });

  it("treats a gathering with no end exactly as before, ending at its start", () => {
    const noEnd = gathering({ title: "Supper club" });
    expect(
      pickSidebarGatherings([noEnd], new Date("2026-10-17T22:00:00Z")),
    ).toHaveLength(1);
    expect(
      pickSidebarGatherings([noEnd], new Date("2026-10-17T23:30:00Z")),
    ).toEqual([]);
  });

  it("orders soonest first and caps the list", () => {
    const rows = pickSidebarGatherings(
      [
        gathering({ title: "Third", date: new Date("2026-10-20T19:00:00Z") }),
        gathering({ title: "First", date: new Date("2026-10-18T19:00:00Z") }),
        gathering({ title: "Second", date: new Date("2026-10-19T19:00:00Z") }),
        gathering({ title: "Fourth", date: new Date("2026-10-21T19:00:00Z") }),
      ],
      new Date("2026-10-17T12:00:00Z"),
    );
    expect(rows.map((row) => row.name)).toEqual(["First", "Second", "Third"]);
  });
});
