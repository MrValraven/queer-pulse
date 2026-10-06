import { describe, expect, it } from "vitest";
import { CATS } from "../forum.data";
import {
  ANONYMOUS_CATEGORIES,
  COMPOSE_CATEGORY_IDS,
  SUGGESTABLE_CATEGORIES,
  TAG_SUGGESTIONS,
} from "./composeCategories.data";
import { FORUM_TAG_OPTIONS } from "../forumTags.data";

function suggestedFor(text: string): string | undefined {
  return SUGGESTABLE_CATEGORIES.find((category) => category.keyword.test(text))
    ?.id;
}

describe("ANONYMOUS_CATEGORIES", () => {
  it("matches the backend contract list exactly", () => {
    expect([...ANONYMOUS_CATEGORIES].sort()).toEqual([
      "funding",
      "health",
      "housing",
      "legal",
      "relationships",
      "trans",
    ]);
  });
});

describe("the funding category", () => {
  it("is a real destination with its own description", () => {
    expect(CATS.some((category) => category.id === "funding")).toBe(true);
    expect(COMPOSE_CATEGORY_IDS).toContain("funding");
  });

  it("is suggested for grant and fundraising wording in both languages", () => {
    expect(suggestedFor("Candidatura ao concurso de apoio a projetos")).toBe(
      "funding",
    );
    expect(suggestedFor("Is there a grant for our collective?")).toBe(
      "funding",
    );
    expect(suggestedFor("We are crowdfunding a community radio")).toBe(
      "funding",
    );
  });

  it("leaves campaigns with Activism and legal help with Legal", () => {
    expect(suggestedFor("Petition to fund the Pride march")).toBe("activism");
    expect(suggestedFor("Preciso de apoio jurídico para o visto")).toBe(
      "legal",
    );
  });

  it("suggests only tags the tag box accepts", () => {
    for (const tag of TAG_SUGGESTIONS.funding ?? []) {
      expect(FORUM_TAG_OPTIONS).toContain(tag);
    }
  });
});
