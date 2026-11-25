import { describe, expect, it } from "vitest";
import { quizBadgeCodePointLength, quizBadgeTextIn } from "./quizWinBadgeText";

describe("quizBadgeTextIn", () => {
  it("reads Portuguese for a Portuguese viewer", () => {
    expect(quizBadgeTextIn({ en: "Champion", pt: "Campeã" }, "pt")).toBe(
      "Campeã",
    );
  });

  it("falls back to English when the Portuguese text is null or blank", () => {
    expect(quizBadgeTextIn({ en: "Champion", pt: null }, "pt")).toBe(
      "Champion",
    );
    expect(quizBadgeTextIn({ en: "Champion", pt: "  " }, "pt")).toBe(
      "Champion",
    );
  });

  it("reads English for an English viewer whatever pt holds", () => {
    expect(quizBadgeTextIn({ en: "Champion", pt: "Campeã" }, "en")).toBe(
      "Champion",
    );
    expect(quizBadgeTextIn({ en: "Champion", pt: null }, "en")).toBe(
      "Champion",
    );
  });
});

describe("quizBadgeCodePointLength", () => {
  it("counts an emoji as one character", () => {
    expect(
      quizBadgeCodePointLength(`${String.fromCodePoint(0x1f3c6)} win`),
    ).toBe(5);
  });
});
