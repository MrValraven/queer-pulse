import { describe, expect, it } from "vitest";
import { spellNumber } from "./numberWords";

describe("spellNumber", () => {
  it("spells small numbers as English words", () => {
    expect(spellNumber(1, "en")).toBe("One");
    expect(spellNumber(8, "en")).toBe("Eight");
  });

  it("spells small numbers as Portuguese words", () => {
    expect(spellNumber(1, "pt")).toBe("Um");
    expect(spellNumber(8, "pt")).toBe("Oito");
  });

  it("spells the compound twenties", () => {
    expect(spellNumber(21, "en")).toBe("Twenty-one");
    expect(spellNumber(21, "pt")).toBe("Vinte e um");
  });

  it("spells thirty, the last spelled-out number", () => {
    expect(spellNumber(30, "en")).toBe("Thirty");
    expect(spellNumber(30, "pt")).toBe("Trinta");
  });

  it("switches to numerals from thirty-one up, where words stop helping a headline", () => {
    expect(spellNumber(31, "en")).toBe("31");
    expect(spellNumber(31, "pt")).toBe("31");
    expect(spellNumber(140, "en")).toBe("140");
  });

  it("renders zero as a numeral rather than a word", () => {
    // Zero communities never reaches the headline — the grid shows the empty
    // state instead — but the helper must not return undefined if it does.
    expect(spellNumber(0, "en")).toBe("0");
  });

  it("does not crash on a negative or fractional count", () => {
    expect(spellNumber(-3, "en")).toBe("-3");
    expect(spellNumber(2.5, "en")).toBe("2.5");
  });
});
