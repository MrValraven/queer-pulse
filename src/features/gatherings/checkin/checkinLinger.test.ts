import { describe, expect, it } from "vitest";
import type { AttendeeRow } from "../api/events.adapters";
import { splitLingering } from "./checkinLinger";

const row = (slug: string, checkedInAt: Date | null): AttendeeRow => ({
  id: `att-${slug}`,
  slug,
  name: slug,
  initials: "AA",
  background: "var(--wash)",
  color: "var(--ink)",
  checkedInAt,
});

describe("splitLingering", () => {
  const arrivedAt = new Date("2026-10-10T21:04:00Z");
  const none = new Map<string, AttendeeRow>();

  it("keeps a lingering row in expected, stamped, and out of arrived", () => {
    const stamped = row("nuno", arrivedAt);
    const result = splitLingering(
      [stamped],
      [stamped],
      new Map([["nuno", stamped]]),
    );
    expect(result.expected).toEqual([stamped]);
    expect(result.arrived).toEqual([]);
  });

  it("puts a lingering row back in name order when the list already dropped it", () => {
    const stamped = { ...row("nuno", arrivedAt), name: "Nuno" };
    const ana = { ...row("ana", null), name: "Ana" };
    const tiago = { ...row("tiago", null), name: "Tiago" };
    const result = splitLingering(
      [ana, tiago],
      [],
      new Map([["nuno", stamped]]),
    );
    expect(result.expected.map((r) => r.slug)).toEqual([
      "ana",
      "nuno",
      "tiago",
    ]);
  });

  it("moves an arrived row once it stops lingering", () => {
    const stamped = row("nuno", arrivedAt);
    const result = splitLingering([stamped], [stamped], none);
    expect(result.expected).toEqual([]);
    expect(result.arrived).toEqual([stamped]);
  });

  it("drops an undone row from arrived at once", () => {
    const result = splitLingering([], [row("nuno", null)], none);
    expect(result.arrived).toEqual([]);
  });
});
