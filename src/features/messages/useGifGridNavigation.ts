import { useEffect, useRef, useState, type KeyboardEvent } from "react";

/** The GIF picker's grid is always 2 columns (`grid-template-columns: 1fr
 *  1fr` in `GifPicker.module.css`); Up/Down below moves by this many tiles
 *  so it lands one visual row away regardless of result count. */
export const GIF_GRID_COLUMN_COUNT = 2;

interface UseGifGridNavigationOptions {
  /** Total number of tiles currently rendered. */
  itemCount: number;
  /** Changing this resets the roving tab stop back to the first tile: the
   *  picker passes its search query, so a fresh set of results always starts
   *  keyboard navigation top-left. Growing the same result set via "Load
   *  more" keeps the member's current position, since the query stays the
   *  same. */
  resetKey: unknown;
}

export interface GifGridNavigation {
  /** Index of the tile currently in the tab order (tabIndex 0); every other
   *  tile is -1. This is what makes the grid a single tab stop (DES-205). */
  focusedIndex: number;
  /** Arrow/Home/End handler, attached to each tile's own `<button>` the same
   *  way `EmojiGrid` handles its cells. Enter/Space need no handling here:
   *  every tile is a real `<button>`, so the browser already fires
   *  `onClick` for both keys on its own. */
  handleTileKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  /** Ref callback a tile hands its `<button>` so arrow navigation can move
   *  DOM focus, keyed by the tile's flat index in the results array. */
  registerTile: (index: number) => (element: HTMLButtonElement | null) => void;
  /** Lets a tile claim the roving tab stop itself: a direct pointer
   *  click/tap or Tab landing on it, ahead of any arrow key. */
  setFocusedIndex: (index: number) => void;
}

/**
 * Roving-tabindex + arrow-key navigation for the GIF picker's 2-column grid
 * (DES-205). Left/Right move one cell and stop at the row edge; Up/Down move
 * a full row and hold the current tile when the destination row has no tile
 * in that column (an odd result count leaves the last row short); Home/End
 * jump to the first/last tile in the whole grid. This boundary behaviour
 * matches the ARIA APG grid pattern. Only one tile is ever a natural Tab
 * stop at a time, so Tab out of the grid reaches "Load more" and the
 * attribution link in a single step.
 */
export function useGifGridNavigation({
  itemCount,
  resetKey,
}: UseGifGridNavigationOptions): GifGridNavigation {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const previousResetKeyRef = useRef(resetKey);

  useEffect(() => {
    if (previousResetKeyRef.current !== resetKey) {
      previousResetKeyRef.current = resetKey;
      setFocusedIndex(0);
      return;
    }
    // A fresh page of the same search: clamp in case the previous position
    // no longer exists (e.g. an error cleared the results).
    setFocusedIndex((current) => Math.min(current, Math.max(itemCount - 1, 0)));
  }, [resetKey, itemCount]);

  function focusTile(index: number) {
    setFocusedIndex(index);
    tileRefs.current[index]?.focus();
  }

  function moveByColumn(columnDelta: number) {
    if (itemCount === 0) return;
    const currentColumn = focusedIndex % GIF_GRID_COLUMN_COUNT;
    const targetColumn = currentColumn + columnDelta;
    if (targetColumn < 0 || targetColumn >= GIF_GRID_COLUMN_COUNT) return;
    const targetIndex = focusedIndex + columnDelta;
    if (targetIndex < 0 || targetIndex >= itemCount) return;
    focusTile(targetIndex);
  }

  function moveByRow(rowDelta: number) {
    if (itemCount === 0) return;
    const currentRow = Math.floor(focusedIndex / GIF_GRID_COLUMN_COUNT);
    const currentColumn = focusedIndex % GIF_GRID_COLUMN_COUNT;
    const targetRow = currentRow + rowDelta;
    if (targetRow < 0) return;
    const targetIndex = targetRow * GIF_GRID_COLUMN_COUNT + currentColumn;
    if (targetIndex >= itemCount) return;
    focusTile(targetIndex);
  }

  function handleTileKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (itemCount === 0) return;
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        moveByColumn(1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        moveByColumn(-1);
        break;
      case "ArrowDown":
        event.preventDefault();
        moveByRow(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveByRow(-1);
        break;
      case "Home":
        event.preventDefault();
        focusTile(0);
        break;
      case "End":
        event.preventDefault();
        focusTile(itemCount - 1);
        break;
      default:
        break;
    }
  }

  function registerTile(index: number) {
    return (element: HTMLButtonElement | null) => {
      tileRefs.current[index] = element;
    };
  }

  return { focusedIndex, handleTileKeyDown, registerTile, setFocusedIndex };
}
