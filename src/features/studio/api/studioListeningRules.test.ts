import { describe, expect, it } from "vitest";
import {
  areChaptersInsideAudio,
  areChaptersWellFormed,
  isValidSyncedLyrics,
  isValidWaveformPeaks,
  listeningRuleFailureOf,
  normalizeChapters,
  roundToTenth,
} from "./studioListeningRules";

const track = { durationSeconds: 300, hasAudio: true };
const peaks = Array.from({ length: 200 }, (_value, index) => index % 256);

describe("listening PATCH rules", () => {
  it("accepts 200 integer peaks from 0 to 255 only", () => {
    expect(isValidWaveformPeaks(peaks)).toBe(true);
    expect(isValidWaveformPeaks(peaks.slice(1))).toBe(false);
    expect(isValidWaveformPeaks([...peaks.slice(1), 256])).toBe(false);
    expect(isValidWaveformPeaks([...peaks.slice(1), 1.5])).toBe(false);
  });

  it("rounds loudness and peak before the range check", () => {
    expect(roundToTenth(-7.84)).toBe(-7.8);
    expect(Object.is(roundToTenth(-0.04), 0)).toBe(true);
    expect(
      listeningRuleFailureOf({ loudnessLufs: -70.04, peakDb: 3.04 }, track),
    ).toBeNull();
    expect(
      listeningRuleFailureOf({ loudnessLufs: -70.06, peakDb: 0 }, track),
    ).toEqual({
      kind: "invalid",
      field: "loudnessLufs",
    });
  });

  it("sends loudness and peak as a pair of numbers or a pair of nulls", () => {
    expect(listeningRuleFailureOf({ loudnessLufs: -9 }, track)).toEqual({
      kind: "invalid",
      field: "loudnessLufs",
    });
    expect(listeningRuleFailureOf({ peakDb: null }, track)).toEqual({
      kind: "invalid",
      field: "loudnessLufs",
    });
    expect(
      listeningRuleFailureOf({ loudnessLufs: -9, peakDb: null }, track),
    ).toEqual({ kind: "invalid", field: "loudnessLufs" });
    expect(
      listeningRuleFailureOf({ loudnessLufs: null, peakDb: null }, track),
    ).toBeNull();
  });

  it("checks synced lines: count, times in order, text length", () => {
    expect(
      isValidSyncedLyrics([
        { ms: 0, text: "" },
        { ms: 0, text: "a" },
      ]),
    ).toBe(true);
    expect(isValidSyncedLyrics([])).toBe(false);
    expect(
      isValidSyncedLyrics([
        { ms: 5, text: "a" },
        { ms: 4, text: "b" },
      ]),
    ).toBe(false);
    expect(isValidSyncedLyrics([{ ms: 1, text: "x".repeat(301) }])).toBe(false);
    expect(isValidSyncedLyrics([{ ms: 86_400_001, text: "a" }])).toBe(false);
    expect(
      isValidSyncedLyrics(
        Array.from({ length: 501 }, (_value, index) => ({
          ms: index,
          text: "",
        })),
      ),
    ).toBe(false);
  });

  it("checks chapter shape: first at 0, strictly ascending, titled", () => {
    expect(
      areChaptersWellFormed([
        { startSeconds: 0, title: "A" },
        { startSeconds: 10, title: "B", artist: "" },
      ]),
    ).toBe(true);
    expect(areChaptersWellFormed([{ startSeconds: 5, title: "A" }])).toBe(
      false,
    );
    expect(
      areChaptersWellFormed([
        { startSeconds: 0, title: "A" },
        { startSeconds: 0, title: "B" },
      ]),
    ).toBe(false);
    expect(areChaptersWellFormed([{ startSeconds: 0, title: "   " }])).toBe(
      false,
    );
    expect(
      areChaptersWellFormed([
        { startSeconds: 0, title: "A", artist: "x".repeat(121) },
      ]),
    ).toBe(false);
  });

  it("needs playable audio and every start inside it for chapters", () => {
    const chapters = [
      { startSeconds: 0, title: "A" },
      { startSeconds: 299, title: "B" },
    ];
    expect(areChaptersInsideAudio(chapters, 300, true)).toBe(true);
    expect(
      areChaptersInsideAudio(
        [...chapters, { startSeconds: 300, title: "C" }],
        300,
        true,
      ),
    ).toBe(false);
    expect(areChaptersInsideAudio(chapters, null, false)).toBe(false);
    expect(
      listeningRuleFailureOf(
        { chapters },
        { durationSeconds: null, hasAudio: false },
      ),
    ).toEqual({
      kind: "chaptersOutOfRange",
    });
    expect(
      listeningRuleFailureOf(
        { loudnessLufs: -9, peakDb: -1 },
        { durationSeconds: null, hasAudio: false },
      ),
    ).toBeNull();
  });

  it("stores an empty or absent chapter artist as null", () => {
    expect(
      normalizeChapters([
        { startSeconds: 0, title: " A ", artist: " " },
        { startSeconds: 5, title: "B" },
        { startSeconds: 9, title: "C", artist: " Rita " },
      ]),
    ).toEqual([
      { startSeconds: 0, title: "A", artist: null },
      { startSeconds: 5, title: "B", artist: null },
      { startSeconds: 9, title: "C", artist: "Rita" },
    ]);
  });
});
