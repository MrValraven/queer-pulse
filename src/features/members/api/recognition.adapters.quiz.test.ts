import { describe, expect, it } from "vitest";
import { BADGE_CATEGORY_LABEL_KEY } from "../badgeCatalog.data";
import type { BadgeDTO } from "./recognition.api";
import { badgeFromDto } from "./recognition.adapters";

const platformDto: BadgeDTO = {
  key: "local-scout",
  cat: "Exploration",
  name: "Local scout",
  context: "Visit a local spot",
  rarity: "common",
  tint: "jade",
};

describe("badgeFromDto with quiz details", () => {
  it("copies the quiz details onto the badge", () => {
    const quiz = {
      definitionId: "d1",
      name: { en: "Quiz champion", pt: null },
      description: { en: "Win a quiz night", pt: null },
      iconKey: "award",
      winCount: 2,
      wins: [
        {
          wonAt: "2026-11-01T20:00:00.000Z",
          gameNumber: 1,
          eventName: "Quiz night",
          eventSlug: "quiz-night",
          isAdultsOnlyEvent: false,
        },
      ],
    };
    const badge = badgeFromDto({
      key: "quiz:d1",
      cat: "Quiz nights",
      name: "Quiz champion",
      context: "Win a quiz night",
      rarity: "rare",
      tint: "accent",
      quiz,
    });
    expect(badge.quiz).toEqual(quiz);
    expect(badge.key).toBe("quiz:d1");
    expect(badge.category).toBe("Quiz nights");
    expect(badge.when).toBe("Win a quiz night");
    expect(BADGE_CATEGORY_LABEL_KEY["Quiz nights"]).toBe(
      "members:badges.category.quizNights",
    );
  });

  it("leaves a platform badge without quiz details", () => {
    const badge = badgeFromDto(platformDto);
    expect(badge.quiz).toBeUndefined();
    expect(badge.key).toBe("local-scout");
    expect(badge.hiddenFromProfile).toBe(false);
  });
});
