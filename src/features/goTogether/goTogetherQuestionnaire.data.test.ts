import { describe, expect, it } from "vitest";
import {
  ACTIVE_HUMOUR_PAIR_IDS,
  HUMOUR_PAIRS,
  INTEREST_TAGS_BY_FAMILY,
  MUSIC_TAG_IDS,
  VALUE_ITEM_IDS,
} from "./goTogetherQuestionnaire.data";

describe("goTogether questionnaire catalog", () => {
  it("has unique interest ids across families", () => {
    const ids = Object.values(INTEREST_TAGS_BY_FAMILY).flat();
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only activates humour pairs that exist in the bank", () => {
    const bankIds = HUMOUR_PAIRS.map((pair) => pair.id);
    expect(
      ACTIVE_HUMOUR_PAIR_IDS.every((pairId) => bankIds.includes(pairId)),
    ).toBe(true);
  });

  it("keeps the value and music lists free of duplicates", () => {
    expect(new Set(VALUE_ITEM_IDS).size).toBe(VALUE_ITEM_IDS.length);
    expect(new Set(MUSIC_TAG_IDS).size).toBe(MUSIC_TAG_IDS.length);
  });
});
