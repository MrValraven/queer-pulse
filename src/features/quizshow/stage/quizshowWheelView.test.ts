import { describe, expect, it } from "vitest";
import type {
  QuizshowWheelBonusView,
  QuizshowWheelSlice,
  QuizshowWheelSpin,
  QuizshowWheelView,
} from "../../../shared/contracts/quizshow";
import {
  drawnWheelSlicesOf,
  isMyWheelBonus,
  landedWheelSliceOf,
  playedWheelSlicesOf,
  playingWheelSliceOf,
} from "./quizshowWheelView";

function sliceAt(roundIndex: number, isPlayed = false): QuizshowWheelSlice {
  return {
    roundIndex,
    title: { en: `Round ${roundIndex}`, pt: `Ronda ${roundIndex}` },
    kind: "quiz",
    contentLabel: "none",
    wheelBonus: 0,
    questionCount: 4,
    isPlayed,
  };
}

function spinLandingOn(landedSliceIndex: number): QuizshowWheelSpin {
  return {
    landedSliceIndex,
    startedAt: 1_000,
    durationMs: 5_500,
    turns: 5,
    jitterSeed: 10,
    startAngle: 0,
  };
}

/** Five slices (rounds 1 to 5, running order a to e), slice b (round 2) played. */
function wheelWith(
  overrides: Partial<QuizshowWheelView> = {},
): QuizshowWheelView {
  return {
    wheelRoundIndex: 0,
    pick: "round",
    slices: [sliceAt(1), sliceAt(2, true), sliceAt(3), sliceAt(4), sliceAt(5)],
    spinNumber: 2,
    spinTotal: 5,
    spin: null,
    playingRoundIndex: null,
    ...overrides,
  };
}

function bonusFor(
  winners: QuizshowWheelBonusView["winners"],
): QuizshowWheelBonusView {
  return {
    points: 500,
    pick: "round",
    sliceRoundIndex: 3,
    sliceTitle: { en: "Music", pt: "Música" },
    winners,
  };
}

function roundIndexesOf(slices: readonly QuizshowWheelSlice[]): number[] {
  return slices.map((slice) => slice.roundIndex);
}

describe("drawnWheelSlicesOf and playedWheelSlicesOf", () => {
  it("splits the slices by isPlayed and keeps running order", () => {
    const wheel = wheelWith();
    expect(roundIndexesOf(drawnWheelSlicesOf(wheel))).toEqual([1, 3, 4, 5]);
    expect(roundIndexesOf(playedWheelSlicesOf(wheel))).toEqual([2]);
  });
});

describe("landedWheelSliceOf", () => {
  it("indexes the list of drawn slices", () => {
    const landed = landedWheelSliceOf(wheelWith({ spin: spinLandingOn(2) }));
    expect(landed?.roundIndex).toBe(4);
  });

  it("is null for an index out of range", () => {
    expect(
      landedWheelSliceOf(wheelWith({ spin: spinLandingOn(9) })),
    ).toBeNull();
  });

  it("is null without a spin", () => {
    expect(landedWheelSliceOf(wheelWith())).toBeNull();
  });
});

describe("playingWheelSliceOf", () => {
  it("finds the slice for playingRoundIndex, played or not", () => {
    const wheel = wheelWith({ playingRoundIndex: 2 });
    expect(playingWheelSliceOf(wheel)?.roundIndex).toBe(2);
  });

  it("is null when nothing is playing or the index is unknown", () => {
    expect(playingWheelSliceOf(wheelWith())).toBeNull();
    expect(
      playingWheelSliceOf(wheelWith({ playingRoundIndex: 99 })),
    ).toBeNull();
  });
});

describe("isMyWheelBonus", () => {
  const soloBonus = bonusFor([
    { entrantId: "player-1", kind: "player", name: "Ana", colorKey: null },
  ]);
  const teamBonus = bonusFor([
    { entrantId: "team-1", kind: "team", name: "Reds", colorKey: null },
  ]);
  const me = { playerId: "player-1", teamId: "team-1" };

  it("matches a solo winner by player id", () => {
    expect(isMyWheelBonus(soloBonus, me, "solo")).toBe(true);
  });

  it("does not match a player winner when the game is in teams", () => {
    expect(isMyWheelBonus(soloBonus, me, "teams")).toBe(false);
  });

  it("matches a team winner by team id in teams", () => {
    expect(isMyWheelBonus(teamBonus, me, "teams")).toBe(true);
    expect(isMyWheelBonus(teamBonus, me, "solo")).toBe(false);
  });

  it("is false without me or without a bonus", () => {
    expect(isMyWheelBonus(soloBonus, null, "solo")).toBe(false);
    expect(isMyWheelBonus(null, me, "solo")).toBe(false);
  });

  it("is false for a player with no team in teams", () => {
    expect(
      isMyWheelBonus(
        teamBonus,
        { playerId: "player-1", teamId: null },
        "teams",
      ),
    ).toBe(false);
  });
});
