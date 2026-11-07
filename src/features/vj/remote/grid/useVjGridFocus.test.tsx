import { useRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useVjGridFocus, VJ_GRID_ITEM_ATTRIBUTE } from "./useVjGridFocus";

const TILE_COUNT = 7;

function FocusHarness() {
  const gridRef = useRef<HTMLUListElement>(null);
  const { tabIndexOf } = useVjGridFocus(gridRef, TILE_COUNT);
  return (
    <ul ref={gridRef} aria-label="Clips">
      {Array.from({ length: TILE_COUNT }, (_, tileIndex) => (
        <li key={tileIndex}>
          <div>
            <button
              type="button"
              {...{ [VJ_GRID_ITEM_ATTRIBUTE]: "" }}
              tabIndex={tabIndexOf(tileIndex)}
            >
              {`Clip ${tileIndex + 1}`}
            </button>
            <button type="button" tabIndex={tabIndexOf(tileIndex)}>
              {`Star ${tileIndex + 1}`}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function tile(number: number): HTMLElement {
  return screen.getByRole("button", { name: `Clip ${number}` });
}

beforeEach(() => {
  const realGetComputedStyle = window.getComputedStyle.bind(window);
  // jsdom lays nothing out: the grid reports three 100px columns.
  vi.spyOn(window, "getComputedStyle").mockImplementation((element) =>
    element.tagName === "UL"
      ? ({
          gridTemplateColumns: "100px 100px 100px",
          direction: "ltr",
        } as CSSStyleDeclaration)
      : realGetComputedStyle(element),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useVjGridFocus", () => {
  it("makes the first tile the grid's only tile tab stop", () => {
    render(<FocusHarness />);
    expect(tile(1)).toHaveAttribute("tabindex", "0");
    for (let number = 2; number <= TILE_COUNT; number += 1) {
      expect(tile(number)).toHaveAttribute("tabindex", "-1");
    }
  });

  it("right arrow moves to the next tile", () => {
    render(<FocusHarness />);
    tile(1).focus();
    const isNotHandled = fireEvent.keyDown(tile(1), { key: "ArrowRight" });
    // Handled keys are prevented, so the remote keyboard hook skips them.
    expect(isNotHandled).toBe(false);
    expect(tile(2)).toHaveFocus();
    expect(tile(2)).toHaveAttribute("tabindex", "0");
    expect(tile(1)).toHaveAttribute("tabindex", "-1");
    fireEvent.keyDown(tile(2), { key: "ArrowLeft" });
    expect(tile(1)).toHaveFocus();
  });

  it("down arrow moves by the column count", () => {
    render(<FocusHarness />);
    tile(2).focus();
    fireEvent.keyDown(tile(2), { key: "ArrowDown" });
    expect(tile(5)).toHaveFocus();
    fireEvent.keyDown(tile(5), { key: "ArrowUp" });
    expect(tile(2)).toHaveFocus();
    // Past the first row the focus stays put.
    fireEvent.keyDown(tile(2), { key: "ArrowUp" });
    expect(tile(2)).toHaveFocus();
  });

  it("Home and End jump", () => {
    render(<FocusHarness />);
    tile(3).focus();
    fireEvent.keyDown(tile(3), { key: "End" });
    expect(tile(TILE_COUNT)).toHaveFocus();
    fireEvent.keyDown(tile(TILE_COUNT), { key: "Home" });
    expect(tile(1)).toHaveFocus();
  });

  it("moves from the tile whose star holds the focus", () => {
    render(<FocusHarness />);
    const star = screen.getByRole("button", { name: "Star 1" });
    star.focus();
    fireEvent.keyDown(star, { key: "ArrowRight" });
    expect(tile(2)).toHaveFocus();
  });

  it("leaves other keys and modified arrows to the page", () => {
    render(<FocusHarness />);
    tile(1).focus();
    expect(fireEvent.keyDown(tile(1), { key: "Enter" })).toBe(true);
    expect(
      fireEvent.keyDown(tile(1), { key: "ArrowRight", altKey: true }),
    ).toBe(true);
    expect(tile(1)).toHaveFocus();
  });
});
