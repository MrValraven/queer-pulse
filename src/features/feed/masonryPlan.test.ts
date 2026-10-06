import { describe, expect, it } from "vitest";
import { planMasonry } from "./masonryPlan";

/**
 * DES-405 / design review M1: plain shortest-column placement, with no memory
 * of where a card sat on a previous pass, keeps two guarantees at once. First,
 * removing a card never leaves a hole, because the next layout repacks every
 * remaining card by its currently measured height, closing straight over any
 * slot a removed card used to occupy. Second, every card's top still
 * lands at or after the top of the card before it in DOM order (WCAG 2.4.3,
 * focus order matches reading order), because only the column a card was just
 * placed in can grow between two cards, so the lowest slot on offer to the
 * next card can never be smaller than the top the previous card was given.
 * With `pinnedColumns`, a card the reader has seen keeps its column, so a
 * card growing above it only slides the cards below it in its own column.
 */
describe("planMasonry", () => {
  it("tops never decrease in DOM order with plain shortest-column packing", () => {
    const heights = [40, 220, 15, 90, 5, 300, 60, 25, 150, 10];
    const fullWidth = [
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      false,
      false,
    ];

    const result = planMasonry({ heights, fullWidth, columnCount: 3, gap: 8 });

    for (let index = 1; index < result.tops.length; index += 1) {
      const currentTop = result.tops[index] ?? 0;
      const priorTop = result.tops[index - 1] ?? 0;
      expect(currentTop).toBeGreaterThanOrEqual(priorTop);
    }
  });

  it("leaves no hole after removing the top-right card", () => {
    const heights = [300, 50, 80, 60, 90, 70];
    const fullWidth = heights.map(() => false);
    const columnCount = 2;
    const gap = 10;

    const before = planMasonry({ heights, fullWidth, columnCount, gap });
    // Index 1 is the first card the tall index-0 card leaves for the right
    // column, painting at its very top: the "top-right card" a block or a
    // mute removes.
    expect(before.columns[1]).toBe(1);
    expect(before.tops[1]).toBe(0);

    const afterRemoval = planMasonry({
      heights: heights.filter((_, index) => index !== 1),
      fullWidth: fullWidth.filter((_, index) => index !== 1),
      columnCount,
      gap,
    });

    // The card that used to sit under the removed one (at top 60, a 60px gap
    // under the old locked build) now packs straight into the vacated slot,
    // landing at its very top.
    expect(afterRemoval.columns[1]).toBe(1);
    expect(afterRemoval.tops[1]).toBe(0);
  });

  it("a full-width row sits below every column", () => {
    const result = planMasonry({
      heights: [100, 30, 20, 5],
      fullWidth: [false, false, true, false],
      columnCount: 2,
      gap: 10,
    });

    // Column 0 reaches 110 (100 + gap), column 1 reaches 40 (30 + gap); the
    // full-width row sits at the taller of the two.
    expect(result.tops[2]).toBe(110);
    // Every column continues underneath it: the next card lands at the row's
    // bottom (110 + 20 + gap).
    expect(result.tops[3]).toBe(140);
  });

  it("pinned cards keep their columns and stay contiguous when a card above grows", () => {
    const heights = [100, 60, 80, 40, 120, 50];
    const fullWidth = heights.map(() => false);
    const columnCount = 2;
    const gap = 10;

    const firstPass = planMasonry({ heights, fullWidth, columnCount, gap });

    // The first card folds open. Free packing would now send the fourth and
    // fifth cards to the other column; pinned, every card keeps its column.
    const grownHeights = [300, ...heights.slice(1)];
    const grownPass = planMasonry({
      heights: grownHeights,
      fullWidth,
      columnCount,
      gap,
      pinnedColumns: firstPass.columns,
    });

    expect(grownPass.columns).toEqual(firstPass.columns);

    // Each card sits exactly one gap below the card before it in its column.
    const columnNextTops = Array.from({ length: columnCount }, () => 0);
    grownPass.columns.forEach((columnIndex, index) => {
      expect(grownPass.tops[index]).toBe(columnNextTops[columnIndex]);
      columnNextTops[columnIndex] =
        (grownPass.tops[index] ?? 0) + (grownHeights[index] ?? 0) + gap;
    });
  });
});
