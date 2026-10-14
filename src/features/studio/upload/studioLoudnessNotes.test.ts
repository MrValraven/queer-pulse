import { describe, expect, it } from "vitest";
import { loudnessNotesFor } from "./studioLoudnessNotes";

describe("loudnessNotesFor", () => {
  it("notes loud tracks first and peaks second, numbered by row", () => {
    expect(
      loudnessNotesFor([
        { loudnessLufs: -14.2, peakDb: -1.5 },
        null,
        { loudnessLufs: -7.8, peakDb: -0.1 },
        { loudnessLufs: -12, peakDb: 0.4 },
        { loudnessLufs: null, peakDb: null },
      ]),
    ).toEqual([
      { trackNumber: 3, kind: "loud", loudnessLufs: -7.8, peakDb: -0.1 },
      { trackNumber: 4, kind: "peak", loudnessLufs: -12, peakDb: 0.4 },
    ]);
  });

  it("keeps the thresholds exclusive", () => {
    expect(loudnessNotesFor([{ loudnessLufs: -9, peakDb: -0.3 }])).toEqual([]);
  });
});
