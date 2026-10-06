import { useCallback, useLayoutEffect, useRef, useState } from "react";

/** Marks each item copy inside the measuring layer, in display order. */
const FIT_ITEM_ATTRIBUTE = "data-fit-item";
/** Marks the "+N" sizer inside the measuring layer. */
const FIT_MORE_CHIP_ATTRIBUTE = "data-fit-more-chip";

/**
 * Rounding headroom, in layout px. `offsetWidth` rounds each width to a whole
 * pixel, so a row of pills that adds up to the row width exactly could still
 * be a fraction too wide once painted. One pixel keeps the last pill whole.
 */
const ROUNDING_ALLOWANCE = 1;

/**
 * How many leading items fit on one line of `rowWidth`.
 *
 * When every item fits, all of them show and no room is kept for a "+N" chip.
 * When something overflows, the chip (and the gap before it) is reserved first
 * and the items fill what is left. At least one item always shows when there is
 * one: a lone item wider than the row is the caller's to ellipsize.
 */
export function countFittingItems(
  itemWidths: number[],
  gapWidth: number,
  moreChipWidth: number,
  rowWidth: number,
): number {
  const itemCount = itemWidths.length;
  if (itemCount === 0) return 0;

  const totalWidth = itemWidths.reduce(
    (runningWidth, itemWidth, index) =>
      runningWidth + itemWidth + (index > 0 ? gapWidth : 0),
    0,
  );
  if (totalWidth <= rowWidth) return itemCount;

  const roomForItems = rowWidth - moreChipWidth - gapWidth;
  let usedWidth = 0;
  let fittingCount = 0;
  for (const [index, itemWidth] of itemWidths.entries()) {
    const nextWidth = usedWidth + itemWidth + (index > 0 ? gapWidth : 0);
    if (nextWidth > roomForItems) break;
    usedWidth = nextWidth;
    fittingCount += 1;
  }
  return Math.max(1, fittingCount);
}

/** The row's column gap in px; `normal` (no gap set) reads as 0. */
function readColumnGap(row: HTMLElement): number {
  const gapWidth = Number.parseFloat(getComputedStyle(row).columnGap);
  return Number.isFinite(gapWidth) ? gapWidth : 0;
}

interface MeasuredFit {
  itemCount: number;
  visibleCount: number;
}

/**
 * Keeps a row of items on one line by measuring how many fit and leaving the
 * rest to a "+N" chip.
 *
 * The caller renders every item once more inside an off-screen measuring layer
 * in the same row (hidden, absolutely placed, unwrapped, with the same classes
 * so the widths match), each copy marked `data-fit-item`, plus one "+N" sizer
 * at its widest likely text marked `data-fit-more-chip`. The layer is a span
 * that `measureLayerRef` points at, inside an `<li>` that clips it to nothing,
 * so the row stays a valid list and the copies never widen a scroll area. The
 * visible row then shows the first `visibleCount` items.
 *
 * No flash: the first measure runs in a layout effect, so the corrected count
 * renders before the browser paints. No loop: the measurement reads only the
 * layer and the row's own width, neither of which depends on how many items
 * are visible, and state is set only when the count changes. A ResizeObserver
 * on the row (width) and on the layer (late web fonts, new labels) measures
 * again. Widths come from `offsetWidth`, which stays in layout px inside a
 * scaled ancestor such as the listing wizard's preview.
 */
export function useOneLineFit<RowElement extends HTMLElement>(
  itemCount: number,
) {
  const rowRef = useRef<RowElement>(null);
  const measureLayerRef = useRef<HTMLSpanElement>(null);
  // Keyed by the item count it was measured for, so a row that gains or loses
  // items shows all of them until its next measure (and in jsdom, where
  // nothing has a width, it simply shows everything).
  const [fit, setFit] = useState<MeasuredFit>({
    itemCount,
    visibleCount: itemCount,
  });

  const measure = useCallback(() => {
    const row = rowRef.current;
    const measureLayer = measureLayerRef.current;
    if (!row || !measureLayer) return;
    // A row that is not laid out (a closed tab, a hidden panel) has no width
    // to fit into; the observer measures again once it appears.
    if (row.clientWidth === 0) return;
    const itemWidths = Array.from(
      measureLayer.querySelectorAll<HTMLElement>(`[${FIT_ITEM_ATTRIBUTE}]`),
      (item) => item.offsetWidth,
    );
    const moreChip = measureLayer.querySelector<HTMLElement>(
      `[${FIT_MORE_CHIP_ATTRIBUTE}]`,
    );
    const nextCount = countFittingItems(
      itemWidths,
      readColumnGap(row),
      moreChip?.offsetWidth ?? 0,
      row.clientWidth - ROUNDING_ALLOWANCE,
    );
    setFit((currentFit) =>
      currentFit.itemCount === itemWidths.length &&
      currentFit.visibleCount === nextCount
        ? currentFit
        : { itemCount: itemWidths.length, visibleCount: nextCount },
    );
  }, []);

  useLayoutEffect(() => {
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    if (rowRef.current) observer.observe(rowRef.current);
    if (measureLayerRef.current) observer.observe(measureLayerRef.current);
    return () => observer.disconnect();
  }, [measure, itemCount]);

  return {
    rowRef,
    measureLayerRef,
    visibleCount: fit.itemCount === itemCount ? fit.visibleCount : itemCount,
  };
}
