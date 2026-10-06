import { describe, expect, it } from "vitest";
import { countFittingItems } from "./useOneLineFit";

describe("countFittingItems", () => {
  it("shows nothing when there are no items", () => {
    expect(countFittingItems([], 6, 24, 300)).toBe(0);
  });

  it("shows every item when they all fit, keeping no room for the chip", () => {
    // 80 + 6 + 80 + 6 + 80 = 252, inside 260 even though a chip would not be.
    expect(countFittingItems([80, 80, 80], 6, 24, 260)).toBe(3);
  });

  it("shows every item when the row is filled exactly", () => {
    expect(countFittingItems([80, 80, 80], 6, 24, 252)).toBe(3);
  });

  it("reserves the chip and its gap once something overflows", () => {
    // 252 does not fit in 251, so the chip takes 24 + 6 and leaves 221:
    // two items (166) fit there, the third does not.
    expect(countFittingItems([80, 80, 80], 6, 24, 251)).toBe(2);
  });

  it("fits an item that lands exactly on the room left beside the chip", () => {
    // Room for items is 200 - 24 - 6 = 170, and 80 + 6 + 84 = 170.
    expect(countFittingItems([80, 84, 80], 6, 24, 200)).toBe(2);
    expect(countFittingItems([80, 85, 80], 6, 24, 200)).toBe(1);
  });

  it("keeps the first item when nothing fits beyond it", () => {
    expect(countFittingItems([150, 60, 60], 6, 24, 160)).toBe(1);
  });

  it("keeps a lone item wider than the row, for the caller to ellipsize", () => {
    expect(countFittingItems([400], 6, 24, 200)).toBe(1);
    expect(countFittingItems([400, 40], 6, 24, 200)).toBe(1);
  });

  it("treats a zero gap like any other gap", () => {
    expect(countFittingItems([50, 50, 50], 0, 20, 150)).toBe(3);
    expect(countFittingItems([50, 50, 50], 0, 20, 149)).toBe(2);
  });
});
