import { describe, expect, it } from "vitest";
import { foldForSearch } from "./foldForSearch";

describe("foldForSearch", () => {
  it("strips accents so an unaccented term matches an accented field", () => {
    expect(foldForSearch("Príncipe Real")).toBe("principe real");
    expect(foldForSearch("São Bento")).toBe("sao bento");
    expect(foldForSearch("Definições")).toBe("definicoes");
  });

  it("lower cases plain text and leaves it otherwise unchanged", () => {
    expect(foldForSearch("Arroios")).toBe("arroios");
    expect(foldForSearch("  Two  Spaces ")).toBe("  two  spaces ");
  });

  it("folds a term and a field to the same text", () => {
    expect(
      foldForSearch("Intendente").includes(foldForSearch("INTENDÊN")),
    ).toBe(true);
    expect(foldForSearch("Café Lisboa").includes(foldForSearch("cafe"))).toBe(
      true,
    );
  });

  it("returns an empty string for empty input", () => {
    expect(foldForSearch("")).toBe("");
  });
});
