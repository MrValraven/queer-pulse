import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { QuizshowLeaderboardEntry } from "../../../shared/contracts/quizshow";
import {
  LEADERBOARD_COUNT_UP_MS,
  type QuizshowLeaderboardOvertakes,
  useLeaderboardOvertakes,
} from "./useLeaderboardOvertakes";

function entryOf(
  entrantId: string,
  rank: number,
  score: number,
  previousScore: number,
): QuizshowLeaderboardEntry {
  return {
    rank,
    kind: "player",
    entrantId,
    name: entrantId,
    colorKey: null,
    score,
    previousScore,
    streak: 0,
  };
}

/** Cleo climbs from 3rd to 1st past Ana and Bo; Dee stays 4th. */
const OVERTAKE: QuizshowLeaderboardEntry[] = [
  entryOf("cleo", 1, 3000, 1500),
  entryOf("ana", 2, 2600, 2000),
  entryOf("bo", 3, 2500, 1800),
  entryOf("dee", 4, 1000, 900),
];

function idsOf(overtakes: QuizshowLeaderboardOvertakes): string[] {
  return overtakes.rows.map((row) => row.entry.entrantId);
}

function renderOvertakes(
  entries: QuizshowLeaderboardEntry[],
  phaseId: string,
  isReducedMotion = false,
) {
  return renderHook(
    (props: {
      entries: QuizshowLeaderboardEntry[];
      phaseId: string;
      isReducedMotion: boolean;
    }) =>
      useLeaderboardOvertakes(
        props.entries,
        props.phaseId,
        props.isReducedMotion,
      ),
    { initialProps: { entries, phaseId, isReducedMotion } },
  );
}

function advance(milliseconds: number) {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useLeaderboardOvertakes", () => {
  it("stands in the previous order, then takes the new order after the count-up", () => {
    const { result } = renderOvertakes(OVERTAKE, "30");
    expect(result.current.isSettled).toBe(false);
    expect(idsOf(result.current)).toEqual(["ana", "bo", "cleo", "dee"]);
    expect(result.current.rows.map((row) => row.shownRank)).toEqual([
      1, 2, 3, 4,
    ]);

    advance(LEADERBOARD_COUNT_UP_MS - 1);
    expect(result.current.isSettled).toBe(false);

    advance(1);
    expect(result.current.isSettled).toBe(true);
    expect(idsOf(result.current)).toEqual(["cleo", "ana", "bo", "dee"]);
    expect(result.current.rows.map((row) => row.shownRank)).toEqual([
      1, 2, 3, 4,
    ]);
  });

  it("counts the places a row climbed and none for the others", () => {
    const { result } = renderOvertakes(OVERTAKE, "30");
    advance(LEADERBOARD_COUNT_UP_MS);
    const placesUp = Object.fromEntries(
      result.current.rows.map((row) => [row.entry.entrantId, row.placesUp]),
    );
    expect(placesUp).toEqual({ cleo: 2, ana: null, bo: null, dee: null });
  });

  it("shows no count for a row whose previous score is below every other", () => {
    const fromOffBoard = [
      entryOf("eve", 1, 3000, 100),
      entryOf("ana", 2, 2600, 2000),
      entryOf("bo", 3, 2500, 1800),
    ];
    const { result } = renderOvertakes(fromOffBoard, "31", true);
    expect(result.current.rows[0]?.placesUp).toBeNull();
  });

  it("takes the new order at once with reduced motion, arrows included", () => {
    const { result } = renderOvertakes(OVERTAKE, "30", true);
    expect(result.current.isSettled).toBe(true);
    expect(idsOf(result.current)).toEqual(["cleo", "ana", "bo", "dee"]);
    expect(result.current.rows[0]?.placesUp).toBe(2);
  });

  it("starts over for a new phase id", () => {
    const { result, rerender } = renderOvertakes(OVERTAKE, "30");
    advance(LEADERBOARD_COUNT_UP_MS);
    expect(result.current.isSettled).toBe(true);

    rerender({ entries: OVERTAKE, phaseId: "32", isReducedMotion: false });
    expect(result.current.isSettled).toBe(false);
    expect(idsOf(result.current)).toEqual(["ana", "bo", "cleo", "dee"]);

    advance(LEADERBOARD_COUNT_UP_MS);
    expect(result.current.isSettled).toBe(true);
  });

  it("keeps the phone's own row past the top ten last, at its own rank", () => {
    const topTen = Array.from({ length: 10 }, (_, index) =>
      entryOf(`top-${index + 1}`, index + 1, 5000 - index * 100, 1000 - index),
    );
    const ownRow = entryOf("sam", 13, 900, 600);
    const { result } = renderOvertakes([...topTen, ownRow], "33");
    expect(result.current.isSettled).toBe(false);
    const lastRow = result.current.rows.at(-1);
    expect(lastRow?.entry.entrantId).toBe("sam");
    expect(lastRow?.shownRank).toBe(13);
    expect(lastRow?.placesUp).toBeNull();

    advance(LEADERBOARD_COUNT_UP_MS);
    expect(result.current.rows.at(-1)?.shownRank).toBe(13);
  });

  it("stands settled from the start when every row shares its previous score", () => {
    const firstScores = [
      entryOf("cleo", 1, 1200, 0),
      entryOf("ana", 2, 900, 0),
      entryOf("bo", 3, 400, 0),
    ];
    const { result } = renderOvertakes(firstScores, "34");
    expect(result.current.isSettled).toBe(true);
    expect(idsOf(result.current)).toEqual(["cleo", "ana", "bo"]);
    expect(result.current.rows.map((row) => row.shownRank)).toEqual([1, 2, 3]);
    expect(result.current.rows.map((row) => row.placesUp)).toEqual([
      null,
      null,
      null,
    ]);
  });

  it("marks only the rows that climb as rising", () => {
    const { result } = renderOvertakes(OVERTAKE, "30");
    const risingIds = result.current.rows
      .filter((row) => row.isRising)
      .map((row) => row.entry.entrantId);
    expect(risingIds).toEqual(["cleo"]);
  });
});
