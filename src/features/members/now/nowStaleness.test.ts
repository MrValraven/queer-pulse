import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TFunction } from "../../../shared/i18n/types";
import { nudgeCopy } from "./nowStaleness";

const fakeT: TFunction = (key, options) => {
  if (key === "members:content.now.chip.staleNever") {
    return "No hellos yet, swap it?";
  }
  if (key === "members:content.now.chip.staleMonths") {
    return `No hellos in ${options?.months} months, swap it?`;
  }
  return key;
};

describe("nudgeCopy", () => {
  beforeEach(() => {
    vi.setSystemTime(new Date("2026-09-12T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("pins the 120-day threshold: no nudge at 60 days", () => {
    expect(
      nudgeCopy(
        { reason: "open:x", count: 0, lastHelloAt: "2026-07-14T00:00:00.000Z" },
        fakeT,
      ),
    ).toBeNull();
  });

  it("nudges with the months copy once the last hello is over 120 days old", () => {
    expect(
      nudgeCopy(
        { reason: "open:x", count: 0, lastHelloAt: "2026-05-02T09:05:00.000Z" },
        fakeT,
      ),
    ).toBe("No hellos in 4 months, swap it?");
  });

  it("nudges with the never copy when there is no history at all", () => {
    expect(
      nudgeCopy({ reason: "open:x", count: 0, lastHelloAt: null }, fakeT),
    ).toBe("No hellos yet, swap it?");
  });

  // The two cases above only bracket 120 (anything from 60 to 133 passes
  // both). These two pin the exact boundary: the rule is OLDER than 120, so
  // 120 itself still gets no nudge and 121 is the first day that does.
  it("does not nudge at exactly 120 days old", () => {
    expect(
      nudgeCopy(
        { reason: "open:x", count: 0, lastHelloAt: "2026-05-15T12:00:00.000Z" },
        fakeT,
      ),
    ).toBeNull();
  });

  it("nudges at 121 days old, one day past the threshold", () => {
    expect(
      nudgeCopy(
        { reason: "open:x", count: 0, lastHelloAt: "2026-05-14T12:00:00.000Z" },
        fakeT,
      ),
    ).toBe("No hellos in 4 months, swap it?");
  });
});
