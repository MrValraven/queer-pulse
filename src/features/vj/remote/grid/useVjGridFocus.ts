/**
 * The clip grid's roving tabindex: the grid is one tab stop, and the arrow
 * keys move the focus from tile to tile. Left and right step by one, up and
 * down by the column count the browser laid out (read from the grid's
 * computed `grid-template-columns`), Home and End jump to the first and last
 * tile. A native `keydown` listener on the grid element handles the keys and
 * calls `preventDefault`, so the page does not scroll and the remote keyboard
 * hook (it skips handled keydowns) never acts on the same arrow twice.
 *
 * Grid items carry `data-vj-grid-item`; a key pressed on any control inside an
 * item's cell (the favorite star) moves from that item. Items folding away
 * inside an `inert` row are skipped.
 */
import { useCallback, useEffect, useState, type RefObject } from "react";

export const VJ_GRID_ITEM_ATTRIBUTE = "data-vj-grid-item";

const VJ_GRID_ITEM_SELECTOR = `[${VJ_GRID_ITEM_ATTRIBUTE}]`;
const REPEAT_COUNT_PATTERN = /^repeat\(\s*(\d+)\s*,/;

/** The number of columns the grid lays out today, at least one. */
export function vjGridColumnCountOf(gridElement: Element): number {
  const template = window
    .getComputedStyle(gridElement)
    .gridTemplateColumns.trim();
  if (template === "" || template === "none") return 1;
  const repeatMatch = REPEAT_COUNT_PATTERN.exec(template);
  if (repeatMatch) return Math.max(1, Number(repeatMatch[1]));
  // An unresolved auto-fill template has no fixed count to read.
  if (template.startsWith("repeat(")) return 1;
  const trackCount = template
    .split(/\s+/)
    .filter((track) => !track.startsWith("[")).length;
  return Math.max(1, trackCount);
}

function focusableItemsOf(gridElement: HTMLElement): HTMLElement[] {
  return Array.from(
    gridElement.querySelectorAll<HTMLElement>(VJ_GRID_ITEM_SELECTOR),
  ).filter((item) => item.closest("[inert]") === null);
}

/** The item whose cell holds the target: the item itself or a sibling control. */
function itemIndexOf(
  items: readonly HTMLElement[],
  target: EventTarget | null,
): number {
  if (!(target instanceof Node)) return -1;
  return items.findIndex(
    (item) =>
      item === target || (item.parentElement?.contains(target) ?? false),
  );
}

/** Where a key moves the focus from `currentIndex`, or null for other keys. */
function targetIndexFor(
  key: string,
  currentIndex: number,
  options: { itemCount: number; columnCount: number; isRightToLeft: boolean },
): number | null {
  const { itemCount, columnCount, isRightToLeft } = options;
  const lastIndex = itemCount - 1;
  const forwardStep = isRightToLeft ? -1 : 1;
  const stepWithin = (step: number) => {
    const candidate = currentIndex + step;
    return candidate < 0 || candidate > lastIndex ? currentIndex : candidate;
  };
  switch (key) {
    case "ArrowRight":
      return stepWithin(forwardStep);
    case "ArrowLeft":
      return stepWithin(-forwardStep);
    case "ArrowDown":
      return stepWithin(columnCount);
    case "ArrowUp":
      return stepWithin(-columnCount);
    case "Home":
      return 0;
    case "End":
      return lastIndex;
    default:
      return null;
  }
}

export function useVjGridFocus(
  gridRef: RefObject<HTMLElement | null>,
  itemCount: number,
): { focusIndex: number; tabIndexOf: (index: number) => 0 | -1 } {
  const [storedIndex, setStoredIndex] = useState(0);
  const focusIndex =
    itemCount === 0 ? 0 : Math.min(Math.max(storedIndex, 0), itemCount - 1);

  useEffect(() => {
    const gridElement = gridRef.current;
    if (!gridElement) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const items = focusableItemsOf(gridElement);
      const currentIndex = itemIndexOf(items, event.target);
      if (currentIndex === -1) return;
      const nextIndex = targetIndexFor(event.key, currentIndex, {
        itemCount: items.length,
        columnCount: vjGridColumnCountOf(gridElement),
        isRightToLeft: window.getComputedStyle(gridElement).direction === "rtl",
      });
      if (nextIndex === null) return;
      event.preventDefault();
      setStoredIndex(nextIndex);
      items[nextIndex]?.focus();
    };

    const handleFocusIn = (event: FocusEvent) => {
      const focusedIndex = itemIndexOf(
        focusableItemsOf(gridElement),
        event.target,
      );
      if (focusedIndex !== -1) setStoredIndex(focusedIndex);
    };

    gridElement.addEventListener("keydown", handleKeyDown);
    gridElement.addEventListener("focusin", handleFocusIn);
    return () => {
      gridElement.removeEventListener("keydown", handleKeyDown);
      gridElement.removeEventListener("focusin", handleFocusIn);
    };
  }, [gridRef]);

  const tabIndexOf = useCallback(
    (index: number): 0 | -1 => (index === focusIndex ? 0 : -1),
    [focusIndex],
  );

  return { focusIndex, tabIndexOf };
}
