import { describe, expect, it } from "vitest";
import type { TranslateOptions } from "../../../shared/i18n/types";
import { quizshowOrdinal, quizshowPlaceOf } from "./quizshowOrdinal";

/** Reads the placeOf key the way the two catalogs word it. */
function translatorFor(joiningWord: string) {
  return (key: string, options?: TranslateOptions): string =>
    key === "quizshow:stage.placeOf"
      ? `${String(options?.place)} ${joiningWord} ${String(options?.total)}`
      : key;
}

describe("quizshowOrdinal", () => {
  it.each([
    [1, "1st"],
    [2, "2nd"],
    [3, "3rd"],
    [4, "4th"],
    [11, "11th"],
    [12, "12th"],
    [13, "13th"],
    [21, "21st"],
    [22, "22nd"],
    [101, "101st"],
  ])("writes English place %i as %s", (place, expected) => {
    expect(quizshowOrdinal(place, "en")).toBe(expected);
  });

  it("writes a Portuguese place with the ordinal mark", () => {
    expect(quizshowOrdinal(3, "pt")).toBe("3.º");
  });
});

describe("quizshowPlaceOf", () => {
  it("joins the ordinal and the total in English", () => {
    expect(quizshowPlaceOf(3, 12, "en", translatorFor("of"))).toBe("3rd of 12");
  });

  it("joins the ordinal and the total in Portuguese", () => {
    expect(quizshowPlaceOf(3, 12, "pt", translatorFor("de"))).toBe("3.º de 12");
  });
});
