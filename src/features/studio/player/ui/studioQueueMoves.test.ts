import { describe, expect, it } from "vitest";
import { resolveQueueMove } from "./studioQueueMoves";

describe("resolveQueueMove", () => {
  it("passes a swap of the entry being dragged", () => {
    expect(resolveQueueMove(["a", "b", "c"], "b", 1, 2)).toEqual({
      fromIndex: 1,
      toIndex: 2,
    });
  });

  it("ignores a swap whose source entry moved", () => {
    expect(resolveQueueMove(["b", "c"], "a", 0, 1)).toBeNull();
  });

  it("ignores swaps with no drag, out of range or onto itself", () => {
    expect(resolveQueueMove(["a", "b"], null, 0, 1)).toBeNull();
    expect(resolveQueueMove(["a", "b"], "a", 0, 2)).toBeNull();
    expect(resolveQueueMove(["a", "b"], "a", 0, 0)).toBeNull();
  });
});
