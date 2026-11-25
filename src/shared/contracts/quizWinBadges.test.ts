import { describe, expect, it } from "vitest";
import {
  QUIZ_BADGE_CATEGORY,
  QUIZ_BADGE_DESCRIPTION_MAX_LENGTH,
  QUIZ_BADGE_KEY_PREFIX,
  QUIZ_BADGE_NAME_MAX_LENGTH,
  QUIZ_BADGE_RARITIES,
  QUIZ_BADGE_TINTS,
  QUIZ_BADGE_WINS_PER_BADGE_MAX,
  QUIZ_BADGES_PER_GAME_MAX,
  QUIZ_EVENT_GAME_SLOTS_MAX,
  QUIZ_EVENT_SEARCH_MAX_LENGTH,
  QUIZ_REVOKE_REASON_MAX_LENGTH,
  isQuizBadgeKey,
} from "./quizWinBadges";

describe("quiz win badges contract", () => {
  it("pins the contract limits", () => {
    expect(QUIZ_BADGE_NAME_MAX_LENGTH).toBe(40);
    expect(QUIZ_BADGE_DESCRIPTION_MAX_LENGTH).toBe(140);
    expect(QUIZ_EVENT_GAME_SLOTS_MAX).toBe(5);
    expect(QUIZ_BADGES_PER_GAME_MAX).toBe(3);
    expect(QUIZ_REVOKE_REASON_MAX_LENGTH).toBe(300);
    expect(QUIZ_EVENT_SEARCH_MAX_LENGTH).toBe(100);
    expect(QUIZ_BADGE_WINS_PER_BADGE_MAX).toBe(100);
    expect(QUIZ_BADGE_KEY_PREFIX).toBe("quiz:");
    expect(QUIZ_BADGE_CATEGORY).toBe("Quiz nights");
  });

  it("knows a quiz badge key by its prefix", () => {
    expect(isQuizBadgeKey("quiz:3f1c")).toBe(true);
    expect(isQuizBadgeKey("regular")).toBe(false);
    expect(isQuizBadgeKey("Quiz:x")).toBe(false);
  });

  it("holds the three platform tints and rarities in order", () => {
    expect([...QUIZ_BADGE_TINTS]).toEqual(["jade", "accent", "plum"]);
    expect([...QUIZ_BADGE_RARITIES]).toEqual(["common", "rare", "legendary"]);
  });
});
