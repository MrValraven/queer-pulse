import { describe, expect, it } from "vitest";
import { STICKER_TEMPLATES, templateById } from "./registry";

const ITEM_ID_MAX_LENGTH = 40;
const KEYWORDS_MAX_COUNT = 24;
const KEYWORD_MAX_LENGTH = 40;
const KEBAB_CASE_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

describe("STICKER_TEMPLATES", () => {
  it("lists Uno reverse, Blip and Tea in that order", () => {
    expect(STICKER_TEMPLATES.map((template) => template.id)).toEqual([
      "uno-reverse",
      "blip",
      "tea-slang",
    ]);
  });

  it("has a unique id per template", () => {
    const templateIds = STICKER_TEMPLATES.map((template) => template.id);
    expect(new Set(templateIds).size).toBe(templateIds.length);
  });

  it("has a unique slug prefix per template", () => {
    const slugPrefixes = STICKER_TEMPLATES.map(
      (template) => template.slugPrefix,
    );
    expect(new Set(slugPrefixes).size).toBe(slugPrefixes.length);
  });

  for (const template of STICKER_TEMPLATES) {
    describe(template.id, () => {
      it("has a coverItemId that is one of its items", () => {
        const itemIds = template.items.map((item) => item.id);
        expect(itemIds).toContain(template.coverItemId);
      });

      it("has kebab-case item ids of at most 40 characters", () => {
        for (const item of template.items) {
          expect(item.id).toMatch(KEBAB_CASE_PATTERN);
          expect(item.id.length).toBeLessThanOrEqual(ITEM_ID_MAX_LENGTH);
        }
      });

      it("has at most 24 keywords per language, each at most 40 characters", () => {
        for (const item of template.items) {
          for (const language of ["en", "pt"] as const) {
            const keywords = item.keywords[language];
            expect(keywords.length).toBeLessThanOrEqual(KEYWORDS_MAX_COUNT);
            for (const keyword of keywords) {
              expect(keyword.length).toBeLessThanOrEqual(KEYWORD_MAX_LENGTH);
            }
          }
        }
      });
    });
  }
});

describe("templateById", () => {
  it("finds Uno reverse, Blip and Tea by id", () => {
    expect(templateById("uno-reverse")?.id).toBe("uno-reverse");
    expect(templateById("blip")?.id).toBe("blip");
    expect(templateById("tea-slang")?.id).toBe("tea-slang");
  });

  it("returns null for an unknown template id", () => {
    expect(templateById("unknown-template")).toBeNull();
  });
});
