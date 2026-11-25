import { describe, expect, it } from "vitest";
import type { TFunction } from "../../shared/i18n/types";
import { badgeDisplayMetaFor } from "./badgeCatalog.data";
import { badgeCriteriaFor, badgeNameFor } from "./badgeDisplayText";
import type { Badge, QuizBadgeDetails } from "./badges.data";
import { QUIZ_BADGE_CATEGORY } from "../../shared/contracts/quizWinBadges";
import {
  hasAdultsOnlyWin,
  isQuizBadge,
  quizBadgeDescription,
  quizBadgeModelOf,
  quizBadgeName,
} from "./quizBadges";

const translate: TFunction = (key) => `t:${key}`;

function quizDetailsOf(
  overrides: Partial<QuizBadgeDetails> = {},
): QuizBadgeDetails {
  return {
    definitionId: "d1",
    name: { en: "Quiz champion", pt: "Campeao do quiz" },
    description: { en: "Win a quiz night", pt: "Ganha uma noite de quiz" },
    iconKey: "award",
    winCount: 1,
    wins: [],
    ...overrides,
  };
}

function badgeOf(overrides: Partial<Badge> = {}): Badge {
  return {
    key: "quiz:d1",
    category: QUIZ_BADGE_CATEGORY,
    name: "Server name",
    when: "Server when",
    rarity: "common",
    tint: "jade",
    icon: null,
    ...overrides,
  };
}

describe("quiz badge text", () => {
  it("names a quiz badge in the viewer's language with the English fallback", () => {
    const badge = badgeOf({ quiz: quizDetailsOf() });
    expect(isQuizBadge(badge)).toBe(true);
    expect(quizBadgeName(badge, "pt")).toBe("Campeao do quiz");
    expect(quizBadgeName(badge, "en")).toBe("Quiz champion");

    const withoutPortuguese = badgeOf({
      quiz: quizDetailsOf({ name: { en: "Quiz champion", pt: null } }),
    });
    expect(quizBadgeName(withoutPortuguese, "pt")).toBe("Quiz champion");
    expect(badgeNameFor(withoutPortuguese, translate, "pt")).toBe(
      "Quiz champion",
    );
  });

  it("reads a platform badge through the catalogue", () => {
    const catalogKey = "local-scout";
    const displayMeta = badgeDisplayMetaFor(catalogKey);
    if (!displayMeta) throw new Error("local-scout must stay in the catalogue");
    const platformBadge = badgeOf({
      key: catalogKey,
      category: "Exploration",
      name: "Local scout",
    });
    expect(isQuizBadge(platformBadge)).toBe(false);
    expect(badgeNameFor(platformBadge, translate, "en")).toBe(
      translate(displayMeta.nameKey),
    );
    expect(badgeCriteriaFor(platformBadge, translate, "en")).toBe(
      translate(displayMeta.lockedContextKey),
    );

    const unknownBadge = badgeOf({
      key: "not-in-the-catalogue",
      name: "Server name",
      criteria: "Server criteria",
    });
    expect(badgeNameFor(unknownBadge, translate, "en")).toBe("Server name");
    expect(badgeCriteriaFor(unknownBadge, translate, "en")).toBe(
      "Server criteria",
    );
    expect(quizBadgeName(unknownBadge, "pt")).toBe("Server name");
  });

  it("reads a quiz badge's description as its criteria", () => {
    const badge = badgeOf({ quiz: quizDetailsOf() });
    expect(quizBadgeDescription(badge, "en")).toBe("Win a quiz night");
    expect(badgeCriteriaFor(badge, translate, "pt")).toBe(
      "Ganha uma noite de quiz",
    );
    expect(quizBadgeDescription(badgeOf({ criteria: "Longer" }), "en")).toBe(
      "Longer",
    );
    expect(quizBadgeDescription(badgeOf(), "en")).toBe("Server when");
  });

  it("spots an adults-only win", () => {
    const win = {
      wonAt: "2026-11-01T20:00:00.000Z",
      gameNumber: 1,
      eventName: "Quiz night",
      eventSlug: "quiz-night",
      isAdultsOnlyEvent: false,
    };
    expect(hasAdultsOnlyWin(quizDetailsOf({ wins: [win] }))).toBe(false);
    expect(
      hasAdultsOnlyWin(
        quizDetailsOf({ wins: [win, { ...win, isAdultsOnlyEvent: true }] }),
      ),
    ).toBe(true);
  });

  it("builds a preview badge in the Quiz nights category", () => {
    const preview = quizBadgeModelOf({
      name: { en: "Preview name", pt: null },
      description: { en: "Preview description", pt: null },
      iconKey: "award",
      tint: "plum",
      rarity: "rare",
    });
    expect(preview.key).toBe("quiz:preview");
    expect(preview.category).toBe("Quiz nights");
    expect(preview.name).toBe("Preview name");
    expect(preview.when).toBe("Preview description");
    expect(preview.tint).toBe("plum");
    expect(preview.rarity).toBe("rare");
    expect(preview.quiz?.winCount).toBe(1);
    expect(preview.quiz?.wins).toEqual([]);
    expect(preview.quiz?.definitionId).toBe("preview");
  });
});
