import { describe, expect, it } from "vitest";
import { createFormatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import {
  compareReach,
  comparisonDirection,
  medianNoteText,
  medianStanding,
  reachComparisonText,
} from "./featureUsageReach.helpers";
import {
  REACH_BARS_BASELINE_Y,
  bucketWeekly,
  buildReachBarsGeometry,
} from "./featureUsageReachBars.helpers";

const EN_TEMPLATES: Record<string, string> = {
  "admin:featureUsage.reachCompare.none": "No reach in either period",
  "admin:featureUsage.reachCompare.new": "New this period",
  "admin:featureUsage.reachCompare.withPercent":
    "{difference} ({percent}) vs {previous}",
  "admin:featureUsage.reachCompare.absolute": "{difference} vs {previous}",
  "admin:featureUsage.reachCompare.same": "Same as before, {previous}",
  "admin:featureUsage.median.above": "{multiple} times the median feature",
  "admin:featureUsage.median.about": "About the median feature",
  "admin:featureUsage.median.below": "{percent} of the median feature",
};

const translate: TFunction = (key, options = {}) =>
  (EN_TEMPLATES[key] ?? key).replace(/\{(\w+)\}/g, (match, token: string) =>
    String(options[token] ?? match),
  );

const formatters = createFormatters("en");

describe("compareReach", () => {
  it("reads no reach in either period as none", () => {
    expect(compareReach(0, 0)).toEqual({ kind: "none" });
  });

  it("reads reach after an empty previous period as new", () => {
    expect(compareReach(12, 0)).toEqual({ kind: "new" });
  });

  it("reads an unchanged reach as same", () => {
    expect(compareReach(40, 40)).toEqual({ kind: "same", previous: 40 });
  });

  it("shows the plain difference when the previous reach is under 10", () => {
    expect(compareReach(33, 7)).toEqual({
      kind: "absolute",
      direction: "up",
      difference: 26,
      previous: 7,
    });
    expect(compareReach(2, 9)).toEqual({
      kind: "absolute",
      direction: "down",
      difference: -7,
      previous: 9,
    });
  });

  it("adds a percent once the previous reach is 10 or more", () => {
    expect(compareReach(33, 10)).toEqual({
      kind: "withPercent",
      direction: "up",
      difference: 23,
      percent: 2.3,
      previous: 10,
    });
    expect(compareReach(0, 20)).toEqual({
      kind: "withPercent",
      direction: "down",
      difference: -20,
      percent: -1,
      previous: 20,
    });
  });

  it("reads a change under 3% of a previous reach of 10 or more as flat", () => {
    expect(compareReach(102, 100)).toEqual({
      kind: "withPercent",
      direction: "flat",
      difference: 2,
      percent: 0.02,
      previous: 100,
    });
    expect(comparisonDirection(compareReach(98, 100))).toBe("flat");
    expect(comparisonDirection(compareReach(103, 100))).toBe("up");
    expect(comparisonDirection(compareReach(97, 100))).toBe("down");
  });

  it("keeps a small base out of the flat rule", () => {
    expect(comparisonDirection(compareReach(9, 8))).toBe("up");
  });

  it("maps each comparison to a direction", () => {
    expect(comparisonDirection(compareReach(0, 0))).toBe("flat");
    expect(comparisonDirection(compareReach(5, 0))).toBe("up");
    expect(comparisonDirection(compareReach(5, 5))).toBe("flat");
    expect(comparisonDirection(compareReach(4, 8))).toBe("down");
  });

  it("keeps every comparison neutral against a partial previous period", () => {
    expect(comparisonDirection(compareReach(5, 0), true)).toBe("flat");
    expect(comparisonDirection(compareReach(60, 20), true)).toBe("flat");
    expect(comparisonDirection(compareReach(4, 8), true)).toBe("flat");
  });
});

describe("reachComparisonText", () => {
  const textFor = (reach: number, reachPrevious: number) =>
    reachComparisonText(
      compareReach(reach, reachPrevious),
      formatters,
      translate,
    );

  it("names the difference, the percent and the previous reach", () => {
    expect(textFor(33, 10)).toBe("+23 (+230%) vs 10");
  });

  it("leaves the percent off for a small previous reach", () => {
    expect(textFor(33, 7)).toBe("+26 vs 7");
  });

  it("signs a drop with a minus", () => {
    expect(textFor(45, 60)).toBe("-15 (-25%) vs 60");
  });

  it("keeps a one-request change on a large base visible", () => {
    expect(textFor(1001, 1000)).toBe("+1 (+0.1%) vs 1,000");
  });

  it("still shows the numbers for a change that reads as flat", () => {
    expect(textFor(102, 100)).toBe("+2 (+2%) vs 100");
  });

  it("reads an unchanged reach with the previous number", () => {
    expect(textFor(40, 40)).toBe("Same as before, 40");
  });

  it("reads no reach and new activity without any dates", () => {
    expect(textFor(0, 0)).toBe("No reach in either period");
    expect(textFor(3, 0)).toBe("New this period");
  });
});

describe("medianStanding", () => {
  it("returns null without a median or without reach", () => {
    expect(medianStanding(120, 0)).toBeNull();
    expect(medianStanding(0, 400)).toBeNull();
  });

  it("splits at 1.25 and 0.8 of the median", () => {
    expect(medianStanding(500, 400)).toEqual({ kind: "above", ratio: 1.25 });
    expect(medianStanding(499, 400)).toEqual({ kind: "about" });
    expect(medianStanding(320, 400)).toEqual({ kind: "about" });
    expect(medianStanding(319, 400)).toEqual({
      kind: "below",
      ratio: 319 / 400,
    });
  });
});

describe("medianNoteText", () => {
  const noteFor = (reach: number, reachMedian: number) => {
    const standing = medianStanding(reach, reachMedian);
    return standing ? medianNoteText(standing, formatters, translate) : null;
  };

  it("reads 1240 against a median of 400 as 3.1 times", () => {
    expect(noteFor(1240, 400)).toBe("3.1 times the median feature");
  });

  it("drops the decimal from 10 times up", () => {
    expect(noteFor(4300, 400)).toBe("11 times the median feature");
  });

  it("reads a near-median reach as about the median", () => {
    expect(noteFor(410, 400)).toBe("About the median feature");
  });

  it("reads a low reach as a percent of the median", () => {
    expect(noteFor(100, 400)).toBe("25% of the median feature");
    expect(noteFor(1, 400)).toBe("0.25% of the median feature");
  });
});

describe("bucketWeekly", () => {
  it("sums consecutive 7-day runs and keeps a shorter last bucket", () => {
    const nineDays = Array.from({ length: 9 }, () => 1);
    expect(bucketWeekly(nineDays)).toEqual([7, 2]);
    expect(bucketWeekly([])).toEqual([]);
  });
});

describe("buildReachBarsGeometry", () => {
  it("draws nothing for an all-zero range and keeps one slot minimum", () => {
    expect(buildReachBarsGeometry([], [])).toEqual({
      slotCount: 1,
      previousPath: "",
      currentPath: "",
    });
    expect(buildReachBarsGeometry([0, 0, 0], [0, 0, 0]).currentPath).toBe("");
  });

  it("skips zero days and scales both series to one shared maximum", () => {
    const geometry = buildReachBarsGeometry([0, 10], [20, 0]);
    expect(geometry.slotCount).toBe(2);
    expect(geometry.previousPath.startsWith("M0 2h1")).toBe(true);
    expect(geometry.currentPath.startsWith("M1.2 ")).toBe(true);
    expect(geometry.currentPath).toContain(`V${REACH_BARS_BASELINE_Y}h-0.6Z`);
  });

  it("keeps one slot per day up to 60 days", () => {
    const daily = Array.from({ length: 60 }, () => 5);
    expect(buildReachBarsGeometry(daily, daily).slotCount).toBe(60);
  });

  it("folds days into weekly buckets past 60 days", () => {
    const daily = Array.from({ length: 90 }, () => 5);
    const geometry = buildReachBarsGeometry(daily, daily);
    // 12 full weeks plus a 6-day bucket.
    expect(geometry.slotCount).toBe(13);
    // Wide weekly slots keep the narrower current bar.
    expect(geometry.currentPath.startsWith("M0.2 ")).toBe(true);
  });

  it("lines up current and previous buckets by index", () => {
    const current = Array.from({ length: 70 }, () => 0);
    const previous = Array.from({ length: 70 }, (_, day) =>
      day === 63 ? 4 : 0,
    );
    current[63] = 4;
    const geometry = buildReachBarsGeometry(current, previous);
    expect(geometry.previousPath.startsWith("M9 ")).toBe(true);
    expect(geometry.currentPath.startsWith("M9.2 ")).toBe(true);
  });

  it("gives the current bar the full slot when its share would drop under 2px", () => {
    const yearDaily = Array.from({ length: 365 }, () => 5);
    const geometry = buildReachBarsGeometry(yearDaily, yearDaily);
    expect(geometry.slotCount).toBe(53);
    expect(geometry.currentPath.startsWith("M0 ")).toBe(true);
    expect(geometry.currentPath).toContain("h1V");
  });
});
