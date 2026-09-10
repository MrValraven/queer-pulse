import { describe, expect, it } from "vitest";
import {
  gatheringEndInstant,
  gatheringHasEnded,
  gatheringIsUnderWay,
  type GatheringSpan,
} from "./data";

/**
 * The three schedule predicates every "is this still on?" question runs
 * through. They live in `data.ts` beside the view-models they answer for;
 * `data.test.ts` next door is the demo-slug guard and stays about that.
 *
 * The rule they encode: a gathering is upcoming until it ENDS, and one with no
 * stated end ends at its start. That second half is what keeps every demo mock
 * and every legacy row behaving exactly as it did before an end instant
 * existed on the card shape.
 */

const START = new Date("2026-10-17T23:00:00Z");
const END = new Date("2026-10-18T04:00:00Z");

function span(overrides: Partial<GatheringSpan> = {}): GatheringSpan {
  return { date: START, ...overrides };
}

describe("gatheringEndInstant", () => {
  it("is the stated end when the host set one", () => {
    expect(gatheringEndInstant(span({ endAt: END }))).toBe(END);
  });

  it("falls back to the start, inventing no duration", () => {
    expect(gatheringEndInstant(span())).toBe(START);
  });
});

describe("gatheringHasEnded", () => {
  it("keeps an overnight gathering that is still running", () => {
    const duringTheParty = new Date("2026-10-18T01:30:00Z");
    expect(gatheringHasEnded(span({ endAt: END }), duringTheParty)).toBe(false);
  });

  it("keeps a festival on its second day", () => {
    const festival = span({ endAt: new Date("2026-10-19T22:00:00Z") });
    const dayTwo = new Date("2026-10-18T14:00:00Z");
    expect(gatheringHasEnded(festival, dayTwo)).toBe(false);
  });

  it("drops it once the stated end has passed", () => {
    const afterTheParty = new Date("2026-10-18T04:30:00Z");
    expect(gatheringHasEnded(span({ endAt: END }), afterTheParty)).toBe(true);
  });

  it("treats a gathering with no end as ending at its start", () => {
    expect(gatheringHasEnded(span(), new Date("2026-10-17T23:00:01Z"))).toBe(
      true,
    );
    expect(gatheringHasEnded(span(), new Date("2026-10-17T22:59:59Z"))).toBe(
      false,
    );
  });
});

describe("gatheringIsUnderWay", () => {
  it("is true between the start and the stated end", () => {
    expect(
      gatheringIsUnderWay(
        span({ endAt: END }),
        new Date("2026-10-18T01:30:00Z"),
      ),
    ).toBe(true);
  });

  it("is false before it starts and after it ends", () => {
    const running = span({ endAt: END });
    expect(gatheringIsUnderWay(running, new Date("2026-10-17T22:00:00Z"))).toBe(
      false,
    );
    expect(gatheringIsUnderWay(running, new Date("2026-10-18T05:00:00Z"))).toBe(
      false,
    );
  });

  it("is never true for a gathering with no stated end", () => {
    expect(gatheringIsUnderWay(span(), START)).toBe(false);
    expect(gatheringIsUnderWay(span(), new Date("2026-10-17T23:30:00Z"))).toBe(
      false,
    );
  });
});
