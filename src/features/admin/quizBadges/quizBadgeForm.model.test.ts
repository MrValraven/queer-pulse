import { describe, expect, it } from "vitest";
import type { QuizBadgeDefinitionDTO } from "../../../shared/contracts/quizWinBadges";
import { quizWinBadgeRefusal } from "../../quizshow/winBadges/quizWinBadgeErrors";
import {
  createBodyFromDraft,
  draftFromDefinition,
  draftProblem,
  emptyQuizBadgeDraft,
  fieldOfRefusal,
  updateBodyFromDraft,
} from "./quizBadgeForm.model";

const CHAMPION: QuizBadgeDefinitionDTO = {
  id: "badge-champion",
  badgeKey: "quiz:badge-champion",
  name: { en: "Quiz Night Champion", pt: "Campeã da noite de quiz" },
  description: {
    en: "Won a game at an official QueerPulse quiz night",
    pt: null,
  },
  iconKey: "star",
  tint: "plum",
  rarity: "legendary",
  isArchived: false,
  archivedAt: null,
  holderCount: 1,
  winCount: 2,
  eventCount: 1,
  canDelete: false,
  createdAt: "2026-05-04T10:00:00.000Z",
  updatedAt: "2026-05-04T10:00:00.000Z",
};

describe("quizBadgeForm.model", () => {
  it("starts a badge on the award icon, jade and common", () => {
    expect(emptyQuizBadgeDraft()).toEqual({
      nameEn: "",
      namePt: "",
      descriptionEn: "",
      descriptionPt: "",
      iconKey: "award",
      tint: "jade",
      rarity: "common",
    });
    expect(
      draftFromDefinition({ ...CHAMPION, iconKey: "rocket" }).iconKey,
    ).toBe("award");
  });

  it("sends a blank Portuguese text as null", () => {
    const body = createBodyFromDraft({
      ...emptyQuizBadgeDraft(),
      nameEn: "  Bingo Royalty ",
      namePt: "   ",
      descriptionEn: "Won the bingo round",
      descriptionPt: "",
    });
    expect(body).toEqual({
      name: { en: "Bingo Royalty", pt: null },
      description: { en: "Won the bingo round", pt: null },
      iconKey: "award",
      tint: "jade",
      rarity: "common",
    });
  });

  it("sends only the groups that changed on an edit", () => {
    const draft = {
      ...draftFromDefinition(CHAMPION),
      nameEn: "Quiz Night Legend",
    };
    const body = updateBodyFromDraft(draft, CHAMPION);
    expect(body).toEqual({
      name: { en: "Quiz Night Legend", pt: "Campeã da noite de quiz" },
    });
    expect(body).not.toHaveProperty("description");
    expect(body).not.toHaveProperty("iconKey");
    expect(body).not.toHaveProperty("tint");
    expect(body).not.toHaveProperty("rarity");
    expect(
      updateBodyFromDraft(draftFromDefinition(CHAMPION), CHAMPION),
    ).toEqual({});
  });

  it("names an empty English name and a long Portuguese one", () => {
    expect(
      draftProblem({
        ...emptyQuizBadgeDraft(),
        descriptionEn: "Won the bingo round",
      }),
    ).toEqual({
      code: "quiz_badge_name_required",
      field: "nameEn",
      language: "en",
    });
    expect(
      draftProblem({
        ...emptyQuizBadgeDraft(),
        nameEn: "Bingo Royalty",
        namePt: "a".repeat(41),
        descriptionEn: "Won the bingo round",
      }),
    ).toEqual({
      code: "quiz_badge_name_too_long",
      field: "namePt",
      language: "pt",
    });
    expect(
      draftProblem({
        ...emptyQuizBadgeDraft(),
        nameEn: "Bingo Royalty",
        namePt: "a".repeat(40),
        descriptionEn: "Won the bingo round",
      }),
    ).toBeNull();
  });

  it("places each refusal under its field", () => {
    expect(
      fieldOfRefusal(
        quizWinBadgeRefusal("quiz_badge_name_taken", { language: "pt" }),
      ),
    ).toBe("namePt");
    expect(fieldOfRefusal(quizWinBadgeRefusal("quiz_badge_tint_unknown"))).toBe(
      "tint",
    );
    expect(
      fieldOfRefusal(
        quizWinBadgeRefusal("quiz_badge_text_invalid", {
          field: "description.en",
        }),
      ),
    ).toBe("descriptionEn");
    expect(fieldOfRefusal(quizWinBadgeRefusal("quiz_badge_not_found"))).toBe(
      null,
    );
    expect(fieldOfRefusal(new Error("offline"))).toBe(null);
  });
});
