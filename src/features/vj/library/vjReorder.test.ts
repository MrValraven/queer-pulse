import { describe, expect, it } from "vitest";
import { moveVjItem } from "./vjReorder";

describe("moveVjItem", () => {
  it("moves an item forward and back", () => {
    const items = ["a", "b", "c"] as const;
    expect(moveVjItem(items, 0, 2)).toEqual(["b", "c", "a"]);
    expect(moveVjItem(items, 2, 0)).toEqual(["c", "a", "b"]);
    const unchanged = moveVjItem(items, 5, 0);
    expect(unchanged).toEqual(["a", "b", "c"]);
    expect(unchanged).not.toBe(items);
  });

  it("leaves the input untouched", () => {
    const items = ["a", "b", "c"];
    moveVjItem(items, 0, 1);
    expect(items).toEqual(["a", "b", "c"]);
  });

  it("gives an unchanged copy for a negative or equal index", () => {
    expect(moveVjItem(["a", "b"], -1, 1)).toEqual(["a", "b"]);
    expect(moveVjItem(["a", "b"], 0, 2)).toEqual(["a", "b"]);
    expect(moveVjItem(["a", "b"], 1, 1)).toEqual(["a", "b"]);
  });
});
