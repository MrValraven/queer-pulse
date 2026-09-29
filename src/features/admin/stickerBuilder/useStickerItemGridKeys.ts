import { useRef, useState, type FocusEvent, type KeyboardEvent } from "react";

/** How many tracks the grid lays out right now. The columns come from
 *  `auto-fill`, so they change with the panel width; reading the resolved
 *  track list at key time keeps Up/Down one visual row away. */
function measureColumnCount(grid: HTMLElement | null): number {
  if (!grid) return 1;
  const tracks = getComputedStyle(grid)
    .gridTemplateColumns.split(" ")
    .filter((track) => track !== "" && track !== "none");
  return Math.max(tracks.length, 1);
}

/** The tile index an arrow, Home or End key moves to, or null when the key
 *  is not a move. Left/Right step one tile and wrap between the ends; Up and
 *  Down step a whole row and stop at the edges, landing on the last item
 *  when the row below is short. */
function nextTileIndex(
  key: string,
  index: number,
  tileCount: number,
  columnCount: number,
): number | null {
  const lastIndex = tileCount - 1;
  if (key === "ArrowRight") return index === lastIndex ? 0 : index + 1;
  if (key === "ArrowLeft") return index === 0 ? lastIndex : index - 1;
  if (key === "Home") return 0;
  if (key === "End") return lastIndex;
  if (key === "ArrowUp") {
    return index - columnCount >= 0 ? index - columnCount : index;
  }
  if (key === "ArrowDown") {
    const isOnLastRow =
      Math.floor(index / columnCount) === Math.floor(lastIndex / columnCount);
    return isOnLastRow ? index : Math.min(index + columnCount, lastIndex);
  }
  return null;
}

/**
 * The grid's roving tab stop: one tile holds `tabIndex` 0, so Tab enters and
 * leaves the whole grid in one press. While focus is outside the grid, the
 * stop follows the previewed item; while a tile holds focus, only the keys
 * and clicks inside the grid move it. Enter previews the focused item, Space
 * toggles it.
 */
export function useStickerItemGridKeys({
  itemIds,
  focusedItemId,
  onPreview,
  onToggle,
}: {
  itemIds: readonly string[];
  focusedItemId: string | null;
  onPreview: (itemId: string) => void;
  onToggle: (itemId: string) => void;
}) {
  const gridRef = useRef<HTMLUListElement>(null);
  const tileRefs = useRef(new Map<string, HTMLLIElement>());
  const [roving, setRoving] = useState<{
    itemId: string | null;
    followedItemId: string | null;
  }>({ itemId: focusedItemId, followedItemId: focusedItemId });
  const [isFocusInGrid, setIsFocusInGrid] = useState(false);
  // A preview chosen elsewhere (the hero, the contents tab) moves the stop
  // with it. The preview is derived: with no explicit pick it is the first
  // ticked item, so a Space press can move it. While a tile holds focus the
  // change is only acknowledged, and the stop stays on the focused tile.
  // Adjusting state during render avoids an extra paint.
  if (roving.followedItemId !== focusedItemId) {
    setRoving({
      itemId: isFocusInGrid ? roving.itemId : (focusedItemId ?? roving.itemId),
      followedItemId: focusedItemId,
    });
  }
  // With nothing previewed yet, the first item holds the stop.
  const rovingItemId =
    roving.itemId !== null && itemIds.includes(roving.itemId)
      ? roving.itemId
      : (itemIds[0] ?? null);

  function claimTile(itemId: string) {
    setRoving((current) =>
      current.itemId === itemId ? current : { ...current, itemId },
    );
  }

  function handleTileKeyDown(
    event: KeyboardEvent<HTMLLIElement>,
    itemId: string,
  ) {
    if (event.altKey || event.metaKey || event.ctrlKey) return;
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      if (event.key === " ") onToggle(itemId);
      else onPreview(itemId);
      return;
    }
    const index = itemIds.indexOf(itemId);
    if (index === -1) return;
    const targetIndex = nextTileIndex(
      event.key,
      index,
      itemIds.length,
      measureColumnCount(gridRef.current),
    );
    if (targetIndex === null) return;
    event.preventDefault();
    const targetItemId = itemIds[targetIndex];
    if (targetItemId === undefined) return;
    claimTile(targetItemId);
    tileRefs.current.get(targetItemId)?.focus();
  }

  function registerTile(itemId: string) {
    return (element: HTMLLIElement | null) => {
      if (element) tileRefs.current.set(itemId, element);
      else tileRefs.current.delete(itemId);
    };
  }

  // Focus events bubble in React, so the listbox hears every tile's.
  const gridFocusProps = {
    onFocus: () => setIsFocusInGrid(true),
    onBlur: (event: FocusEvent<HTMLUListElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        setIsFocusInGrid(false);
      }
    },
  };

  return {
    gridRef,
    gridFocusProps,
    rovingItemId,
    claimTile,
    handleTileKeyDown,
    registerTile,
  };
}
