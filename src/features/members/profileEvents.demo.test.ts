import { afterEach, describe, expect, it } from "vitest";
import {
  calendarEvents,
  gatheringDetails,
  type CalendarEvent,
  type GatheringDetail,
} from "../gatherings/data";
import { demoProfileEvents } from "./profileEvents.demo";

const DAY_MS = 24 * 60 * 60 * 1000;
const SYNTHETIC_HOST = "caps-host";

/** A real detail entry to copy from, so a synthetic one is complete. */
function templateDetail(): GatheringDetail {
  const detail = gatheringDetails["supper-club-12"];
  if (!detail) throw new Error("demo registry lost supper-club-12");
  return detail;
}

const addedSlugs: string[] = [];

/** Adds one board row and its detail entry, hosted by `SYNTHETIC_HOST`. */
function addHostedRow(slug: string, date: Date) {
  const row: CalendarEvent = {
    date,
    org: "Community",
    orgColor: "var(--accent)",
    title: `Synthetic ${slug}`,
    hood: "Anjos",
    slug,
    to: `/gatherings/${slug}`,
    kind: "gathering",
  };
  calendarEvents.push(row);
  gatheringDetails[slug] = {
    ...templateDetail(),
    slug,
    hostSlug: SYNTHETIC_HOST,
  };
  addedSlugs.push(slug);
}

afterEach(() => {
  for (const slug of addedSlugs) {
    const index = calendarEvents.findIndex((event) => event.slug === slug);
    if (index !== -1) calendarEvents.splice(index, 1);
    delete gatheringDetails[slug];
  }
  addedSlugs.length = 0;
});

describe("demoProfileEvents", () => {
  it("lists the board rows tomas hosts, all as the host", () => {
    const result = demoProfileEvents("tomas", new Date());
    expect(result.upcoming.length).toBeGreaterThan(0);
    expect(result.upcoming.map((item) => item.event.slug)).toContain(
      "supper-club-12",
    );
    expect(result.upcoming.every((item) => item.role === "host")).toBe(true);
  });

  it("gives a member who hosts nothing two empty lists", () => {
    expect(demoProfileEvents("tiago", new Date())).toEqual({
      upcoming: [],
      past: [],
    });
  });

  it("gives an empty slug two empty lists", () => {
    expect(demoProfileEvents("", new Date())).toEqual({
      upcoming: [],
      past: [],
    });
  });

  it("caps upcoming at 12 soonest first and past at 6 latest first", () => {
    const now = new Date();
    // Added out of order, so the sort is what puts them in line.
    const upcomingOffsets = [9, 2, 15, 4, 11, 1, 7, 13, 3, 10, 5, 14, 6, 8, 12];
    for (const offset of upcomingOffsets) {
      addHostedRow(
        `ahead-${offset}`,
        new Date(now.getTime() + offset * DAY_MS),
      );
    }
    const pastOffsets = [5, 2, 8, 3, 9, 4, 7, 6];
    for (const offset of pastOffsets) {
      addHostedRow(
        `behind-${offset}`,
        new Date(now.getTime() - offset * DAY_MS),
      );
    }

    const result = demoProfileEvents(SYNTHETIC_HOST, now);

    expect(result.upcoming.map((item) => item.event.slug)).toEqual(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
        (offset) => `ahead-${offset}`,
      ),
    );
    expect(result.past.map((item) => item.event.slug)).toEqual(
      [2, 3, 4, 5, 6, 7].map((offset) => `behind-${offset}`),
    );
  });
});
