// src/features/messages/useEmojiGridVirtualizer.ts
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer, type Virtualizer } from "@tanstack/react-virtual";
import type { EmojiGridItem, EmojiSection } from "./emojiSections";

/** Mirrors `.grid`'s own cell sizing (`EmojiPicker.module.css`) so the row
 *  chunking below produces exactly the column count the grid actually lays
 *  out — keep the two in sync if that rule ever changes. `CELL_SIZE_PX` is the
 *  cell's height and its MINIMUM width: `.gridRow` lays the count this hook
 *  arrives at out as equal `1fr` tracks (so no remainder piles up unused on
 *  the right), which makes a real track a hair wider than 36px, never
 *  narrower. `HEADER_ROW_HEIGHT_PX`
 *  mirrors `.sectionHeader`'s own fixed height the same way: keep that rule
 *  in sync too, since the virtualizer estimates a header row's size from this
 *  constant alone (no `measureElement` here, so the CSS and this number must
 *  actually agree). */
const CELL_SIZE_PX = 36;
const CELL_GAP_PX = 4;
const HEADER_ROW_HEIGHT_PX = 28;

/** A row is either a section's sticky-ish label (no items, just the section
 *  it introduces) or a row of real emoji cells. Keeping this as a
 *  discriminated union rather than an optional `items` lets every read site
 *  (the virtualizer's size estimate, `EmojiGrid`'s render, its keyboard
 *  `moveTo`) be exhaustive instead of guessing from an empty array. */
export type EmojiGridRow =
  | { kind: "header"; key: string; sectionKey: string }
  | { kind: "cells"; key: string; sectionKey: string; items: EmojiGridItem[] };

export interface EmojiGridVirtualizerResult {
  /** Attach to the grid's scrolling wrapper via `ref={containerRef}` — both
   *  the virtualizer's scroll element and the column-count measurement read
   *  off this node. A CALLBACK ref, not a plain object ref: the wrapper only
   *  exists once the dataset has loaded and `EmojiGrid` actually mounts,
   *  which is a LATER render than this hook's own first call (the panel
   *  opens showing a loading state first) — an object ref read inside a
   *  mount-once `useLayoutEffect` would measure `null` on that first render
   *  and never get a second chance. The callback fires exactly when the real
   *  node attaches, however many renders later that turns out to be. */
  containerRef: (node: HTMLDivElement | null) => void;
  columnCount: number;
  rows: EmojiGridRow[];
  /** First row index of each section, for the category rail's "jump to
   *  group" click — a section absent from the current sections list (a
   *  search results view has only "results") simply has no entry. Points at
   *  the section's HEADER row (not its first cell row), so a rail jump lands
   *  with the label pinned at the top of the grid rather than one row below
   *  it. */
  sectionFirstRowIndex: Record<string, number>;
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  /** The section currently topmost in the scrolled viewport, derived fresh on
   *  every render from the virtualizer's own scroll state (see this hook's
   *  own doc for why that's enough and no scroll listener is needed). `null`
   *  when there are no rows at all (empty search, dataset still loading). */
  activeSectionKey: string | null;
}

/**
 * Windows the emoji grid exactly like `useMessageRowVirtualizer` windows the
 * message log: 1,914 live buttons would jank the thread, so only the visible
 * window (+ overscan) mounts. Unlike a message bubble, a grid cell's height
 * never varies with its content (a fixed-size button around one glyph), so
 * this skips `measureElement` entirely and just estimates the true constant
 * size — there's nothing to correct.
 *
 * Chunks each section's items into `columnCount`-wide rows separately (never
 * spanning two sections in one row), so a section's own row count stays
 * stable regardless of neighbouring sections and the rail's "jump to group"
 * always lands exactly on that group's first cell.
 *
 * Each non-empty section also gets its own header row ahead of its cell rows,
 * a visible, trackable label the way WhatsApp's picker has one, EXCEPT the
 * synthetic "results" section a live search builds, which stays headerless
 * (a search already has its own query as the "label"; a "Results" heading
 * over one flat list of matches would be noise).
 */
export function useEmojiGridVirtualizer(
  sections: EmojiSection[],
): EmojiGridVirtualizerResult {
  "use no memo";

  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [columnCount, setColumnCount] = useState(1);
  // Bumped by the callback ref below whenever the real DOM node attaches, so
  // the measurement effect re-runs even though it happens on a render other
  // than this hook's first — see `containerRef`'s own doc for why a plain
  // object ref + a mount-once effect can't do this.
  const [attachedNodeVersion, setAttachedNodeVersion] = useState(0);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    nodeRef.current = node;
    setAttachedNodeVersion((version) => version + 1);
  }, []);

  useLayoutEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    // `getBoundingClientRect().width` is the BORDER-BOX width: it counts
    // `.grid`'s own `padding: 6px 10px 10px` (20px horizontally) AND it's
    // measured on the exact element that owns the vertical scrollbar, so it
    // over-reports the space actually available to `.gridRow`'s cells by the
    // padding plus the scrollbar's width. That over-count is what chunked
    // rows one cell too wide and forced `overflow-x` into `auto`. `clientWidth`
    // already excludes the border AND the vertical scrollbar (it's the
    // padding-box width minus the scrollbar gutter), so subtracting the
    // computed horizontal padding from `clientWidth` is the true CONTENT
    // width `.gridRow`'s cells have to fit inside. Read the padding via
    // `getComputedStyle` rather than hardcoding it so this stays correct if
    // `.grid`'s padding ever changes.
    const recomputeColumnCount = () => {
      const computedStyle = getComputedStyle(node);
      const horizontalPadding =
        parseFloat(computedStyle.paddingLeft) +
        parseFloat(computedStyle.paddingRight);
      const contentWidth = node.clientWidth - horizontalPadding;
      // A zero/negative/NaN read (node not yet laid out, or a transiently
      // collapsed container) is not a real measurement. Skip the update and
      // keep whatever column count is already in state rather than chunking
      // rows against a bogus width.
      if (!Number.isFinite(contentWidth) || contentWidth <= 0) return;
      const fitted = Math.floor(
        (contentWidth + CELL_GAP_PX) / (CELL_SIZE_PX + CELL_GAP_PX),
      );
      setColumnCount(Math.max(1, fitted));
    };
    recomputeColumnCount();
    const observer = new ResizeObserver(recomputeColumnCount);
    observer.observe(node);
    return () => observer.disconnect();
  }, [attachedNodeVersion]);

  const { rows, sectionFirstRowIndex } = useMemo(() => {
    const builtRows: EmojiGridRow[] = [];
    const firstRowIndexBySection: Record<string, number> = {};
    for (const section of sections) {
      if (section.items.length === 0) continue;
      firstRowIndexBySection[section.key] = builtRows.length;
      // The "results" section (a live search) stays headerless, same as
      // before this row got a `kind`: a search already reads as its own
      // label, and jumping to it never happens (the rail is hidden then).
      if (section.key !== "results") {
        builtRows.push({
          kind: "header",
          key: `${section.key}-header`,
          sectionKey: section.key,
        });
      }
      for (let index = 0; index < section.items.length; index += columnCount) {
        builtRows.push({
          kind: "cells",
          key: `${section.key}-${index}`,
          sectionKey: section.key,
          items: section.items.slice(index, index + columnCount),
        });
      }
    }
    return { rows: builtRows, sectionFirstRowIndex: firstRowIndexBySection };
  }, [sections, columnCount]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => nodeRef.current,
    // A per-index estimate rather than one constant: a header row is a fixed
    // 28px label band, a cells row is a 36px button plus its 4px gap. Every
    // row's true size is already known exactly from its `kind` (no content
    // ever varies a row's height), so this never needs `measureElement` to
    // correct it.
    estimateSize: (index) =>
      rows[index]?.kind === "header"
        ? HEADER_ROW_HEIGHT_PX
        : CELL_SIZE_PX + CELL_GAP_PX,
    getItemKey: (index) => rows[index]?.key ?? index,
    overscan: 6,
  });

  // Scroll-spy: derived fresh on every render rather than via a scroll
  // listener or an IntersectionObserver, because the virtualizer already
  // re-renders this hook's caller on every scroll frame (it has to, to
  // reposition the mounted rows), so piggybacking on that render is free
  // while a second listener would just be redundant work reacting to the
  // same frames. The "active" section is whichever row is topmost in the
  // viewport: the first virtual item whose bottom edge (`end`) has scrolled
  // past the current offset. `scrollOffset` can report `null`/`undefined`
  // before tanstack's first measurement pass, so it's treated as 0 (top of
  // the list) rather than breaking the comparison below.
  const scrollOffset = rowVirtualizer.scrollOffset ?? 0;
  const activeVirtualRow = rowVirtualizer
    .getVirtualItems()
    .find((virtualItem) => virtualItem.end > scrollOffset);
  const activeSectionKey =
    activeVirtualRow !== undefined
      ? (rows[activeVirtualRow.index]?.sectionKey ?? null)
      : null;

  return {
    containerRef,
    columnCount,
    rows,
    sectionFirstRowIndex,
    rowVirtualizer,
    activeSectionKey,
  };
}
