import { describe, expect, it } from "vitest";
import type {
  QuizshowLeaderboardEntry,
  QuizshowScores,
} from "../../../shared/contracts/quizshow";
import { gapAheadOf, placesMovedOf } from "./quizshowPhoneScores";

function entryWith(
  entrantId: string,
  rank: number,
  score: number,
): QuizshowLeaderboardEntry {
  return {
    rank,
    kind: "player",
    entrantId,
    name: `Player ${entrantId}`,
    colorKey: null,
    score,
    previousScore: 0,
    streak: 0,
  };
}

function scoresWith(entries: QuizshowLeaderboardEntry[]): QuizshowScores {
  return {
    phaseId: "7",
    scope: "question",
    entries,
    entrantCount: entries.length,
  };
}

describe("placesMovedOf", () => {
  it("reads places gained as positive and places lost as negative", () => {
    expect(placesMovedOf({ previous: 5, current: 2 })).toBe(3);
    expect(placesMovedOf({ previous: 2, current: 4 })).toBe(-2);
  });

  it("returns null without a previous rank or with no change", () => {
    expect(placesMovedOf({ previous: null, current: 2 })).toBeNull();
    expect(placesMovedOf({ previous: 3, current: 3 })).toBeNull();
    expect(placesMovedOf({ previous: null, current: null })).toBeNull();
  });
});

describe("gapAheadOf", () => {
  const top = scoresWith([
    entryWith("a", 1, 3000),
    entryWith("b", 2, 2500),
    entryWith("c", 2, 2500),
    entryWith("d", 4, 2380),
  ]);

  it("names the entry ranked just above and the points between", () => {
    expect(gapAheadOf(top, "d", 2380)).toEqual({
      points: 120,
      name: "Player b",
    });
    expect(gapAheadOf(top, "b", 2500)).toEqual({
      points: 500,
      name: "Player a",
    });
  });

  it("returns null in first place", () => {
    expect(gapAheadOf(top, "a", 3000)).toBeNull();
  });

  it("returns null outside the top 10, also for an own row added below it", () => {
    const entries = Array.from({ length: 10 }, (_, index) =>
      entryWith(`p${index}`, index + 1, 5000 - index * 100),
    );
    const withOwnRow = scoresWith([...entries, entryWith("me", 14, 3000)]);
    expect(gapAheadOf(withOwnRow, "me", 3000)).toBeNull();
    expect(gapAheadOf(scoresWith(entries), "me", 3000)).toBeNull();
  });

  it("reads a tie at 10th as inside the top 10", () => {
    const entries = Array.from({ length: 10 }, (_, index) =>
      entryWith(`p${index}`, index + 1, 5000 - index * 100),
    );
    const tiedOwnRow = entryWith("me", 10, 4100);
    expect(
      gapAheadOf(scoresWith([...entries, tiedOwnRow]), "me", 4100),
    ).toEqual({ points: 100, name: "Player p8" });
  });

  it("returns null without scores or an entrant", () => {
    expect(gapAheadOf(null, "d", 2380)).toBeNull();
    expect(gapAheadOf(top, null, 2380)).toBeNull();
  });
});
