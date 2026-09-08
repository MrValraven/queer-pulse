import { describe, expect, it } from "vitest";
import {
  diffStringLists,
  isSameStringList,
  isStringList,
} from "./stringListDiff";

describe("diffStringLists", () => {
  it("names what was added, in the order the new list holds it", () => {
    const diff = diffStringLists(["consent"], ["consent", "warmth", "welcome"]);

    expect(diff.added).toEqual(["warmth", "welcome"]);
    expect(diff.removed).toEqual([]);
    expect(diff.isReordered).toBe(false);
  });

  it("names what was removed, in the order the old list held it", () => {
    const diff = diffStringLists(["consent", "warmth", "welcome"], ["warmth"]);

    expect(diff.added).toEqual([]);
    expect(diff.removed).toEqual(["consent", "welcome"]);
  });

  it("reports an addition and a removal in the same edit", () => {
    const diff = diffStringLists(["consent", "warmth"], ["warmth", "welcome"]);

    expect(diff.added).toEqual(["welcome"]);
    expect(diff.removed).toEqual(["consent"]);
  });

  it("finds nothing to report between two identical lists", () => {
    const diff = diffStringLists(["consent", "warmth"], ["consent", "warmth"]);

    expect(diff).toEqual({ added: [], removed: [], isReordered: false });
  });

  it("calls a pure reorder a reorder rather than an empty change", () => {
    const diff = diffStringLists(["consent", "warmth"], ["warmth", "consent"]);

    expect(diff.added).toEqual([]);
    expect(diff.removed).toEqual([]);
    expect(diff.isReordered).toBe(true);
  });

  it("treats an empty starting list as every value being added", () => {
    expect(diffStringLists([], ["consent"])).toEqual({
      added: ["consent"],
      removed: [],
      isReordered: false,
    });
  });

  it("treats an emptied list as every value being removed", () => {
    expect(diffStringLists(["consent"], [])).toEqual({
      added: [],
      removed: ["consent"],
      isReordered: false,
    });
  });

  it("counts occurrences, so dropping one of two duplicates is a removal", () => {
    const diff = diffStringLists(["warmth", "warmth"], ["warmth"]);

    expect(diff.added).toEqual([]);
    expect(diff.removed).toEqual(["warmth"]);
  });

  it("counts occurrences, so a second copy of a value is an addition", () => {
    const diff = diffStringLists(["warmth"], ["warmth", "warmth"]);

    expect(diff.added).toEqual(["warmth"]);
    expect(diff.removed).toEqual([]);
  });

  it("leaves both lists it was handed untouched", () => {
    const from = ["consent", "warmth"];
    const to = ["warmth", "welcome"];

    diffStringLists(from, to);

    expect(from).toEqual(["consent", "warmth"]);
    expect(to).toEqual(["warmth", "welcome"]);
  });
});

describe("isSameStringList", () => {
  it("is true only for the same values in the same positions", () => {
    expect(isSameStringList(["a", "b"], ["a", "b"])).toBe(true);
    expect(isSameStringList([], [])).toBe(true);
    expect(isSameStringList(["a", "b"], ["b", "a"])).toBe(false);
    expect(isSameStringList(["a"], ["a", "a"])).toBe(false);
  });
});

describe("isStringList", () => {
  it("accepts a list of strings, empty included", () => {
    expect(isStringList([])).toBe(true);
    expect(isStringList(["consent", "warmth"])).toBe(true);
  });

  it("rejects anything a jsonb column could hold instead", () => {
    expect(isStringList(["consent", 3])).toBe(false);
    expect(isStringList([null])).toBe(false);
    expect(isStringList("consent")).toBe(false);
    expect(isStringList({ 0: "consent" })).toBe(false);
    expect(isStringList(null)).toBe(false);
    expect(isStringList(undefined)).toBe(false);
  });
});
