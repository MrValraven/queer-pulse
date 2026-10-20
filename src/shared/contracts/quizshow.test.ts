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
  QUIZSHOW_GAMES_PER_MEMBER_MAX,
  QUIZSHOW_LOBBY_OPENS_PER_HOUR_MAX,
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
  it("offers eight team shapes and five starter packs", () => {
    expect(QUIZSHOW_TEAM_COLOR_KEYS).toHaveLength(8);
    expect(QUIZSHOW_STARTER_PACK_KEYS).toEqual([
      "pride_history",
      "portuguese_queer_culture",
      "eurovision",
      "drag_herstory",
      "lisbon_queer_icons",
    ]);
  });
  it("carries the shared screen mute on the state base", () => {
    const base: Pick<
      QuizshowStateBase,
      "isScreenMuted" | "kind" | "gameId" | "isAdultsOnly"
    > = {
      isScreenMuted: true,
      kind: "game",
      gameId: "game-1",
      isAdultsOnly: false,
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
  it("carries the game error codes and keeps the restriction code last", () => {
    const resultsIndex = QUIZSHOW_ERROR_CODES.indexOf(
      "quizshow_results_not_found",
    );
    expect(
      QUIZSHOW_ERROR_CODES.slice(resultsIndex + 1, resultsIndex + 5),
    ).toEqual([
      "quizshow_game_not_found",
      "quizshow_game_limit_reached",
      "quizshow_lobby_rate_limited",
      "quizshow_game_adults_rounds_need_switch",
    ]);
    const rateLimitedIndex = QUIZSHOW_ERROR_CODES.indexOf(
      "quizshow_rate_limited",
    );
    expect(QUIZSHOW_ERROR_CODES[rateLimitedIndex + 1]).toBe(
      "quizshow_adult_consent_required",
    );
    expect(QUIZSHOW_ERROR_CODES.at(-1)).toBe("ACCOUNT_RESTRICTED");
  });
  it("caps games at 50 and lobbies at 10 an hour", () => {
    expect(QUIZSHOW_GAMES_PER_MEMBER_MAX).toBe(50);
    expect(QUIZSHOW_LOBBY_OPENS_PER_HOUR_MAX).toBe(10);
  });
  it("ends the error list with the reused restriction code", () => {
    expect(QUIZSHOW_ERROR_CODES.at(-1)).toBe("ACCOUNT_RESTRICTED");
    expect(new Set(QUIZSHOW_ERROR_CODES).size).toBe(
      QUIZSHOW_ERROR_CODES.length,
    );
  });
});
