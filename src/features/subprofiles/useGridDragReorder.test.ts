import { describe, expect, it } from "vitest";
import {
  nextGridNeighbourIndex,
  type DragCardRect,
} from "./useGridDragReorder";

// Unrun per repo policy (`do-not-run-tests-unless-asked`) — verified statically.

const CARD_WIDTH = 320;
const CARD_HEIGHT = 240;
const GAP = 20;

/** A `.sides` grid of `columnCount` columns, laid out the way the dashboard
 *  lays one out: cards in render order, left to right then top to bottom. */
function buildGrid(cardCount: number, columnCount: number): DragCardRect[] {
  return Array.from({ length: cardCount }, (_unused, index) => ({
    left: (index % columnCount) * (CARD_WIDTH + GAP),
    top: Math.floor(index / columnCount) * (CARD_HEIGHT + GAP),
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  }));
}

/** The exact centre of one card in a grid built above. */
function centreOf(rect: DragCardRect): { x: number; y: number } {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

describe("nextGridNeighbourIndex", () => {
  it("stays put while the pointer is nearest the dragged card's own centre", () => {
    const cardRects = buildGrid(4, 2);
    const { x, y } = centreOf(cardRects[1]!);
    expect(nextGridNeighbourIndex(cardRects, 1, x, y)).toBeNull();
  });

  it("steps forward one when the pointer reaches the next card", () => {
    const cardRects = buildGrid(4, 2);
    const { x, y } = centreOf(cardRects[1]!);
    expect(nextGridNeighbourIndex(cardRects, 0, x, y)).toBe(1);
  });

  it("steps back one when the pointer reaches an earlier card", () => {
    const cardRects = buildGrid(4, 2);
    const { x, y } = centreOf(cardRects[0]!);
    expect(nextGridNeighbourIndex(cardRects, 3, x, y)).toBe(2);
  });

  it("steps exactly one position, never straight to a distant card", () => {
    const cardRects = buildGrid(6, 3);
    const { x, y } = centreOf(cardRects[5]!);
    // Nearest is index 5, four places away — the answer is still one step.
    expect(nextGridNeighbourIndex(cardRects, 0, x, y)).toBe(1);
  });

  it("follows the pointer SIDEWAYS, which a vertical midpoint test cannot", () => {
    // Two columns: index 0 and index 1 share a row, so nothing separates them
    // vertically at all. Dragging card 0 onto card 1 has to register.
    const cardRects = buildGrid(4, 2);
    const { x, y } = centreOf(cardRects[1]!);
    expect(cardRects[0]!.top).toBe(cardRects[1]!.top);
    expect(nextGridNeighbourIndex(cardRects, 0, x, y)).toBe(1);
  });

  it("behaves like a plain list once the grid collapses to one column", () => {
    const cardRects = buildGrid(3, 1);
    const { x, y } = centreOf(cardRects[2]!);
    expect(nextGridNeighbourIndex(cardRects, 1, x, y)).toBe(2);
    const first = centreOf(cardRects[0]!);
    expect(nextGridNeighbourIndex(cardRects, 1, first.x, first.y)).toBe(0);
  });

  it("answers null for an index outside the grid", () => {
    const cardRects = buildGrid(3, 3);
    const { x, y } = centreOf(cardRects[0]!);
    expect(nextGridNeighbourIndex(cardRects, 3, x, y)).toBeNull();
    expect(nextGridNeighbourIndex(cardRects, -1, x, y)).toBeNull();
  });

  it("answers null for an empty grid", () => {
    expect(nextGridNeighbourIndex([], 0, 0, 0)).toBeNull();
  });
});
