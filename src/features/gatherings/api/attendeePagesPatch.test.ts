import type { InfiniteData } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { AttendeeRow } from "./events.adapters";
import { patchPagesArrival } from "./attendeePagesPatch";
import type { AttendeePage } from "./useAttendeePages";

const row = (slug: string, name: string, checkedInAt: Date | null = null) =>
  ({
    id: `att-${slug}`,
    slug,
    name,
    initials: "AA",
    background: "",
    color: "",
    checkedInAt,
  }) as AttendeeRow;

const pages = (rows: AttendeeRow[]): InfiniteData<AttendeePage> => ({
  pages: [{ rows, total: rows.length, page: 1, pageSize: 20 }],
  pageParams: [1],
});

describe("patchPagesArrival", () => {
  const arrivedAt = new Date("2026-10-10T21:04:00Z");

  it("stamps the row in the expected group so it can linger", () => {
    const data = pages([row("nuno", "Nuno"), row("tiago", "Tiago")]);
    const next = patchPagesArrival(
      data,
      "expected",
      row("nuno", "Nuno"),
      arrivedAt,
    );
    expect(next?.pages[0]?.rows[0]?.checkedInAt).toEqual(arrivedAt);
  });

  it("prepends the row to an unsearched arrived group", () => {
    const data = pages([row("ana", "Ana", new Date("2026-10-10T21:00:00Z"))]);
    const next = patchPagesArrival(
      data,
      "arrived",
      row("nuno", "Nuno"),
      arrivedAt,
    );
    expect(next?.pages[0]?.rows.map((attendee) => attendee.slug)).toEqual([
      "nuno",
      "ana",
    ]);
    expect(next?.pages[0]?.total).toBe(2);
  });

  it("inserts into a searched arrived group when the name matches", () => {
    const data = pages([]);
    const next = patchPagesArrival(
      data,
      "arrived",
      row("nuno", "Nuno"),
      arrivedAt,
      "nun",
    );
    expect(next?.pages[0]?.rows.map((attendee) => attendee.slug)).toEqual([
      "nuno",
    ]);
    expect(next?.pages[0]?.total).toBe(1);
  });

  it("skips a searched group whose term the name does not match", () => {
    const data = pages([]);
    const next = patchPagesArrival(
      data,
      "arrived",
      row("nuno", "Nuno"),
      arrivedAt,
      "tia",
    );
    expect(next?.pages[0]?.rows).toEqual([]);
    expect(next?.pages[0]?.total).toBe(0);
  });

  it("puts an undone row back into a searched expected group in name order", () => {
    const data = pages([row("tiago", "Tiago")]);
    const next = patchPagesArrival(
      data,
      "expected",
      row("nuno", "Nuno", arrivedAt),
      null,
    );
    expect(next?.pages[0]?.rows.map((attendee) => attendee.slug)).toEqual([
      "nuno",
      "tiago",
    ]);
  });

  it("puts an undone row back into expected in name order", () => {
    const data = pages([row("ana", "Ana"), row("tiago", "Tiago")]);
    const next = patchPagesArrival(
      data,
      "expected",
      row("nuno", "Nuno", arrivedAt),
      null,
    );
    expect(next?.pages[0]?.rows.map((attendee) => attendee.slug)).toEqual([
      "ana",
      "nuno",
      "tiago",
    ]);
  });

  it("returns undefined for an empty cache", () => {
    expect(
      patchPagesArrival(undefined, "arrived", row("nuno", "Nuno"), arrivedAt),
    ).toBeUndefined();
  });
});
