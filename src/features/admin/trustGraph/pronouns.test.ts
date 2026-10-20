import { describe, expect, it } from "vitest";
import { formatPronouns } from "./pronouns";

describe("formatPronouns", () => {
  it("dedupes case-insensitively and keeps the first spelling", () => {
    expect(formatPronouns("he/they, they/them, He/They")).toBe(
      "he/they, they/them",
    );
  });

  it("splits on commas and semicolons and drops empty parts", () => {
    expect(formatPronouns(" she/her ; ,they/them,, ")).toBe(
      "she/her, they/them",
    );
  });

  it("returns an empty string for missing input", () => {
    expect(formatPronouns(null)).toBe("");
    expect(formatPronouns(undefined)).toBe("");
    expect(formatPronouns(" , ; ")).toBe("");
  });
});
