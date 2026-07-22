import { describe, expect, it } from "vitest";
import { changemakerDtoToStory, deriveReadTime } from "./changemakers.adapters";
import type { ChangemakerDTO } from "./changemakers.api";

const baseDto: ChangemakerDTO = {
  id: "id-1",
  slug: "ada-lovelace",
  name: "Ada Lovelace",
  initials: "AL",
  cause: "Housing",
  tint: "jade",
  tags: ["Advocacy"],
  summary: "Summary",
  imageUrl: null,
  impact: ["Row one"],
  byline: "By the team",
  heroNote: "Note",
  lead: "The lead line.",
  body: ["First paragraph.", "Second paragraph."],
  pullQuoteText: "A quote.",
  pullQuoteCite: "Ada",
  status: "published",
  isFeatured: false,
  sortOrder: 0,
  publishedAt: "2026-01-01T00:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("changemakers adapter", () => {
  it("derives a minimum 1 min read", () => {
    expect(deriveReadTime([])).toBe("1 min read");
    expect(deriveReadTime(["one two three"])).toBe("1 min read");
  });

  it("maps DTO strings into the story shape", () => {
    const story = changemakerDtoToStory(baseDto, () => "1 Jan 2026");
    expect(story.slug).toBe("ada-lovelace");
    expect(story.image).toBeUndefined();
    expect(story.pullQuote).toEqual({ text: "A quote.", cite: "Ada" });
    expect(story.date).toBe("1 Jan 2026");
    expect(story.body).toEqual(["First paragraph.", "Second paragraph."]);
  });

  it("blanks the date when never published", () => {
    const story = changemakerDtoToStory(
      { ...baseDto, publishedAt: null },
      () => "should not be used",
    );
    expect(story.date).toBe("");
  });
});
