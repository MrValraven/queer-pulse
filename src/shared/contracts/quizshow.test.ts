import { describe, expect, it } from "vitest";
import {
  QUIZSHOW_JOIN_CODE_ALPHABET,
  QUIZSHOW_JOIN_CODE_PATTERN,
  QUIZSHOW_LIMITS,
  QUIZSHOW_OPEN_SESSION_STATUSES,
  QUIZSHOW_PHASES,
  QUIZSHOW_TEAM_COLOR_KEYS,
  QUIZSHOW_TIMED_PHASES,
  QUIZSHOW_STARTER_PACK_KEYS,
  QUIZSHOW_ERROR_CODES,
  type QuizshowMyReveal,
  type QuizshowStateBase,
} from "./quizshow";

describe("quizshow contract mirror", () => {
  it("keeps the join code alphabet free of look-alike characters", () => {
    expect(QUIZSHOW_JOIN_CODE_ALPHABET).toBe("ABCDEFGHJKMNPQRSTUVWXYZ23456789");
    expect(QUIZSHOW_JOIN_CODE_PATTERN.test("QZ7KP4")).toBe(true);
    expect(QUIZSHOW_JOIN_CODE_PATTERN.test("QZ7KP0")).toBe(false);
    expect(QUIZSHOW_JOIN_CODE_PATTERN.test("qz7kp4")).toBe(false);
    expect(QUIZSHOW_JOIN_CODE_PATTERN.test("QZ7KP")).toBe(false);
  });
  it("carries the scoring numbers the server uses", () => {
    expect(QUIZSHOW_LIMITS.streakStep).toBe(100);
    expect(QUIZSHOW_LIMITS.streakCap).toBe(500);
    expect(QUIZSHOW_LIMITS.answerGraceMs).toBe(500);
    expect(QUIZSHOW_LIMITS.extraTimeFactor).toBe(1.5);
    expect(QUIZSHOW_LIMITS.readPhaseMs).toBe(4000);
    expect(QUIZSHOW_LIMITS.pointsValues).toEqual([500, 1000, 2000]);
    expect(QUIZSHOW_LIMITS.lieDetectorFooledPoints).toBe(500);
    expect(QUIZSHOW_LIMITS.partyVotePoints).toBe(250);
  });
  it("lists phases, timed phases and open statuses in contract order", () => {
    expect(QUIZSHOW_PHASES).toEqual([
      "lobby",
      "round_intro",
      "read",
      "open",
      "write",
      "review",
      "vote",
      "reveal",
      "scores",
      "leaderboard",
      "podium",
      "ended",
    ]);
    expect(QUIZSHOW_TIMED_PHASES).toEqual(["read", "open", "write", "vote"]);
    expect(QUIZSHOW_OPEN_SESSION_STATUSES).toEqual([
      "lobby",
      "running",
      "paused",
    ]);
  });
  it("offers eight team shapes and four starter packs", () => {
    expect(QUIZSHOW_TEAM_COLOR_KEYS).toHaveLength(8);
    expect(QUIZSHOW_STARTER_PACK_KEYS).toEqual([
      "pride_history",
      "portuguese_queer_culture",
      "eurovision",
      "drag_herstory",
    ]);
  });
  it("carries the shared screen mute on the state base", () => {
    const base: Pick<QuizshowStateBase, "isScreenMuted"> = {
      isScreenMuted: true,
    };
    expect(base.isScreenMuted).toBe(true);
  });
  it("names the player's own answer row on their reveal, null without an answer", () => {
    const withAnswer: Pick<QuizshowMyReveal, "hasAnswered" | "ownAnswerId"> = {
      hasAnswered: true,
      ownAnswerId: "answer-1",
    };
    const withoutAnswer: Pick<QuizshowMyReveal, "hasAnswered" | "ownAnswerId"> =
      { hasAnswered: false, ownAnswerId: null };
    expect(withAnswer.ownAnswerId).toBe("answer-1");
    expect(withoutAnswer.ownAnswerId).toBeNull();
  });
  it("ends the error list with the reused restriction code", () => {
    expect(QUIZSHOW_ERROR_CODES.at(-1)).toBe("ACCOUNT_RESTRICTED");
    expect(new Set(QUIZSHOW_ERROR_CODES).size).toBe(
      QUIZSHOW_ERROR_CODES.length,
    );
  });
});
