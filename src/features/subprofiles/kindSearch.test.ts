import { describe, expect, it } from "vitest";
import { kindsMatchingSearch } from "./kindSearch";

describe("kindsMatchingSearch (demo mirror)", () => {
  it("finds game masters by DM aliases and PT labels", () => {
    for (const term of [
      "dm",
      "DM",
      "gm",
      "dungeon master",
      "mestre de jogo",
      "narracao",
      "Narração",
    ]) {
      expect(kindsMatchingSearch(term)).toContain("game_master");
    }
  });
  it("matches only at a word start", () => {
    expect(kindsMatchingSearch("aster")).not.toContain("game_master");
  });
  it("requires a whole word for a two-character needle", () => {
    expect(kindsMatchingSearch("es")).toEqual([]);
    expect(kindsMatchingSearch("pr")).toEqual([]);
    expect(kindsMatchingSearch("dm")).toContain("game_master");
    expect(kindsMatchingSearch("gm")).toContain("game_master");
    expect(kindsMatchingSearch("dj")).toContain("dj");
    expect(kindsMatchingSearch("esc")).toContain("ttrpg_designer");
  });
  it("ignores stop words and single characters", () => {
    for (const term of ["", "d", "de", "the"]) {
      expect(kindsMatchingSearch(term)).toEqual([]);
    }
  });
  it("finds every kind by its English label", () => {
    expect(kindsMatchingSearch("photographer")).toContain("photographer");
  });
});
