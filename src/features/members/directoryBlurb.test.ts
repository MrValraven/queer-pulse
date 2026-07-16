import { describe, expect, it } from "vitest";
import {
  DIRECTORY_BLURB_MAX_CHARS,
  directoryBlurb,
  isBlurbBorrowedFromBio,
  truncateAtWord,
} from "./directoryBlurb";

const LONG_BIO =
  "I build things for the web and spend most weekends cooking for more people than my kitchen was designed for. Lately I've been learning to bind books.";

describe("truncateAtWord", () => {
  it("returns text within the limit untouched", () => {
    expect(truncateAtWord("Fullstack developer")).toBe("Fullstack developer");
  });

  it("collapses runs of whitespace", () => {
    expect(truncateAtWord("Cooks  a\n lot")).toBe("Cooks a lot");
  });

  it("cuts on a word boundary and never exceeds the limit", () => {
    const result = truncateAtWord(LONG_BIO);
    expect(result.length).toBeLessThanOrEqual(DIRECTORY_BLURB_MAX_CHARS + 1);
    expect(result.endsWith("…")).toBe(true);
    // The cut lands between words — no half-word before the ellipsis.
    expect(LONG_BIO.startsWith(result.slice(0, -1))).toBe(true);
    expect(LONG_BIO[result.length - 1]).toBe(" ");
  });

  it("drops punctuation left dangling by the cut", () => {
    expect(truncateAtWord("Designer, cook, and neighbour", 10)).toBe(
      "Designer…",
    );
  });

  it("cuts mid-word when a single word is longer than the limit", () => {
    expect(truncateAtWord("Supercalifragilistic", 10)).toBe("Supercalif…");
  });

  it("keeps a word that ends exactly on the limit", () => {
    expect(truncateAtWord("Cooks a lot always", 11)).toBe("Cooks a lot…");
  });
});

describe("directoryBlurb", () => {
  it("prefers the short bio when there is one", () => {
    expect(directoryBlurb("Fullstack developer", LONG_BIO)).toBe(
      "Fullstack developer",
    );
  });

  it("trims the short bio", () => {
    expect(directoryBlurb("  Cooks a lot  ", LONG_BIO)).toBe("Cooks a lot");
  });

  it("borrows the bio's opening when the short bio is empty", () => {
    expect(directoryBlurb("", LONG_BIO)).toBe(truncateAtWord(LONG_BIO));
  });

  it("treats a whitespace-only short bio as empty", () => {
    expect(directoryBlurb("   ", "Cooks a lot")).toBe("Cooks a lot");
  });

  it("returns empty when the member has written neither", () => {
    expect(directoryBlurb("", "")).toBe("");
    expect(directoryBlurb(undefined, undefined)).toBe("");
  });
});

describe("isBlurbBorrowedFromBio", () => {
  it("is true only when the short bio is empty and a bio exists", () => {
    expect(isBlurbBorrowedFromBio("", LONG_BIO)).toBe(true);
    expect(isBlurbBorrowedFromBio("Cooks a lot", LONG_BIO)).toBe(false);
    expect(isBlurbBorrowedFromBio("", "")).toBe(false);
    expect(isBlurbBorrowedFromBio(undefined, undefined)).toBe(false);
  });
});
