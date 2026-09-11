import { describe, expect, it } from "vitest";
import {
  gatheringOccurrences,
  type GatheringOccurrenceInput,
} from "./gatheringOccurrences";

/**
 * The wizard's series list has to name exactly the dates the backend's
 * `resolveOccurrences` will create. Fixed dates are fine here: the helper
 * reads only the input it is handed.
 */

function seriesInput(
  overrides: Partial<GatheringOccurrenceInput> = {},
): GatheringOccurrenceInput {
  return {
    date: "2026-10-07",
    time: "19:30",
    repeats: true,
    cadence: "weekly",
    endType: "count",
    endCount: "4",
    endUntil: "",
    ...overrides,
  };
}

/** A local instant as `"YYYY-MM-DD HH:MM"`, read the way the host's clock does. */
function localStamp(instant: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${instant.getFullYear()}-${pad(instant.getMonth() + 1)}-${pad(
    instant.getDate(),
  )} ${pad(instant.getHours())}:${pad(instant.getMinutes())}`;
}

describe("gatheringOccurrences", () => {
  it("is empty without a real start date", () => {
    expect(gatheringOccurrences(seriesInput({ date: "" }))).toEqual([]);
    expect(gatheringOccurrences(seriesInput({ date: "2026-02-31" }))).toEqual(
      [],
    );
  });

  it("is the one start when the gathering does not repeat", () => {
    const occurrences = gatheringOccurrences(seriesInput({ repeats: false }));
    expect(occurrences.map(localStamp)).toEqual(["2026-10-07 19:30"]);
  });

  it("steps weekly on the host's clock, across a daylight-saving change", () => {
    const occurrences = gatheringOccurrences(seriesInput());
    expect(occurrences.map(localStamp)).toEqual([
      "2026-10-07 19:30",
      "2026-10-14 19:30",
      "2026-10-21 19:30",
      "2026-10-28 19:30",
    ]);
  });

  it("steps biweekly", () => {
    const occurrences = gatheringOccurrences(
      seriesInput({ cadence: "biweekly", endCount: "3" }),
    );
    expect(occurrences.map(localStamp)).toEqual([
      "2026-10-07 19:30",
      "2026-10-21 19:30",
      "2026-11-04 19:30",
    ]);
  });

  it("steps monthly with the backend's own month overflow", () => {
    const occurrences = gatheringOccurrences(
      seriesInput({ date: "2027-01-31", cadence: "monthly", endCount: "2" }),
    );
    expect(occurrences.map(localStamp)).toEqual([
      "2027-01-31 19:30",
      "2027-03-03 19:30",
    ]);
  });

  it("lists at most 52", () => {
    const occurrences = gatheringOccurrences(seriesInput({ endCount: "200" }));
    expect(occurrences).toHaveLength(52);
  });

  it("stops at the last start on or before the end date", () => {
    const occurrences = gatheringOccurrences(
      seriesInput({ endType: "date", endUntil: "2026-10-21" }),
    );
    expect(occurrences.map(localStamp)).toEqual([
      "2026-10-07 19:30",
      "2026-10-14 19:30",
      "2026-10-21 19:30",
    ]);
  });

  it("falls back to the one start for a rule the server would refuse", () => {
    expect(
      gatheringOccurrences(seriesInput({ endCount: "" })).map(localStamp),
    ).toEqual(["2026-10-07 19:30"]);
    expect(
      gatheringOccurrences(
        seriesInput({ endType: "date", endUntil: "2026-10-01" }),
      ).map(localStamp),
    ).toEqual(["2026-10-07 19:30"]);
  });
});
