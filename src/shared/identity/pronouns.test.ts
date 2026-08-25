import { describe, expect, it } from "vitest";
import { parsePronouns, serializePronouns } from "./pronouns";

describe("pronoun helpers", () => {
  it("round-trips a multi-set string", () => {
    expect(parsePronouns("she/her, they/them")).toEqual([
      "she/her",
      "they/them",
    ]);
    expect(serializePronouns(["she/her", "they/them"])).toBe(
      "she/her, they/them",
    );
  });
  it("drops blank/whitespace entries", () => {
    expect(parsePronouns(" , she/her ,")).toEqual(["she/her"]);
  });
  it("returns an empty list for an empty string", () => {
    expect(parsePronouns("")).toEqual([]);
  });
});
