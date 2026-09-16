// src/features/messages/scrollAnchor.ts
import type { RefObject } from "react";
import type { VirtualItem, Virtualizer } from "@tanstack/react-virtual";
import type { MessageRow } from "./messageRows";

type RowKey = VirtualItem["key"];

/**
 * A viewport position remembered in ONE coordinate space: the scroll
 * container's own DOM scroll space (what `scrollTop` and `scrollHeight`
 * measure). The virtualizer's offsets (`VirtualItem.start`, `getTotalSize()`)
 * begin at the sizer's origin, which sits below `.area`'s block padding (the
 * "loading older" line is an overlay outside the scroller). Every virtualizer
 * offset is therefore translated into DOM space through `sizerTopInScrollSpace`
 * before it is compared with `scrollTop`, on capture and on restore alike, so
 * those constants cancel out instead of surfacing as a fixed hop.
 */
export interface ScrollAnchor {
  /** Key of the row that must stay put on screen, or null when no safe row was
   *  mounted at capture (the fallback below is used then). */
  rowKey: RowKey | null;
  /** That row's top edge minus the viewport's top edge, in px. */
  rowOffsetFromViewportTopPx: number;
  /** `scrollHeight - scrollTop` at capture: used when the row is gone. */
  distanceFromBottomPx: number;
}

/** A remembered anchor plus whether it is already being applied. An armed
 *  anchor (`isRestoring: false`) waits for an older page and moves nothing; a
 *  restoring one is re-applied on every resize for a short settle window. */
export interface PendingScrollAnchor {
  anchor: ScrollAnchor;
  isRestoring: boolean;
  /** `performance.now()` when an anchor was armed, so one whose page never
   *  started loading can be recognised as abandoned. */
  armedAtMs?: number;
}

/** Where the virtualized sizer's top edge sits in the scroller's DOM scroll
 *  space. `contentRef` (`.areaContent`) starts exactly at the sizer, its first
 *  child. Scroll-invariant: both rects move together as the scroller scrolls. */
function sizerTopInScrollSpace(
  area: HTMLElement,
  content: HTMLElement,
): number {
  return (
    content.getBoundingClientRect().top -
    area.getBoundingClientRect().top -
    area.clientTop +
    area.scrollTop
  );
}

/** Current `start` offset of the row with `rowKey`, or undefined when the row
 *  is no longer in the list. Reads the public measurements cache, which the
 *  sizer's render (`getTotalSize()`) has already brought up to date. */
function findRowStart(
  virtualizer: Virtualizer<HTMLDivElement, Element>,
  rowKey: RowKey,
): number | undefined {
  for (let index = 0; index < virtualizer.options.count; index += 1) {
    if (virtualizer.options.getItemKey(index) === rowKey) {
      return virtualizer.measurementsCache[index]?.start;
    }
  }
  return undefined;
}

/**
 * Remembers where the reader is, ahead of an older page prepending above them.
 *
 * The anchor row must be one whose key and position relative to everything
 * below it survive the prepend. The first loaded message block does not: an
 * older message from the same author merges into that run, which changes its
 * key (a run is keyed by its first message) and grows it. The first day
 * separator can relocate above older same-day messages, and the unread divider
 * can latch late. So the anchor is the first mounted row past the first message
 * block, excluding the divider, whose bottom edge is below the viewport top.
 * It may start below the fold; any row works as long as all prepended height
 * lands above it.
 */
export function captureScrollAnchor(
  area: HTMLElement,
  content: HTMLElement,
  virtualizer: Virtualizer<HTMLDivElement, Element>,
  rows: MessageRow[],
): ScrollAnchor {
  const sizerTop = sizerTopInScrollSpace(area, content);
  const viewportTop = area.scrollTop;
  const firstBlockIndex = rows.findIndex(
    (row) => row.kind === "run" || row.kind === "system",
  );
  const anchorItem = virtualizer
    .getVirtualItems()
    .find(
      (item) =>
        firstBlockIndex !== -1 &&
        item.index > firstBlockIndex &&
        rows[item.index]?.kind !== "unreadDivider" &&
        sizerTop + item.end > viewportTop,
    );
  return {
    rowKey: anchorItem?.key ?? null,
    rowOffsetFromViewportTopPx: anchorItem
      ? sizerTop + anchorItem.start - viewportTop
      : 0,
    distanceFromBottomPx: area.scrollHeight - viewportTop,
  };
}

/** The `scrollTop` that puts `anchor` back where it was, in DOM scroll space. */
export function resolveAnchorScrollTop(
  area: HTMLElement,
  content: HTMLElement,
  virtualizer: Virtualizer<HTMLDivElement, Element>,
  anchor: ScrollAnchor,
): number {
  if (anchor.rowKey !== null) {
    const rowStart = findRowStart(virtualizer, anchor.rowKey);
    if (rowStart !== undefined) {
      return (
        sizerTopInScrollSpace(area, content) +
        rowStart -
        anchor.rowOffsetFromViewportTopPx
      );
    }
  }
  return area.scrollHeight - anchor.distanceFromBottomPx;
}

/**
 * Keeps `anchor` applied for two animation frames, then releases it. Rows that
 * mount around the restored position are still sized off their ESTIMATE when
 * the restore runs; `measureElement` corrects them a frame later and the
 * resize-follow observer re-applies the anchor across that correction. Two rAFs
 * is comfortably past it (a synchronous remeasure and re-render, no network).
 * The release only clears THIS anchor, so a fresh one armed in between survives.
 */
export function holdAnchorThroughSettle(
  pendingAnchorRef: RefObject<PendingScrollAnchor | null>,
  anchor: ScrollAnchor,
): void {
  const settling: PendingScrollAnchor = { anchor, isRestoring: true };
  pendingAnchorRef.current = settling;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (pendingAnchorRef.current === settling) {
        pendingAnchorRef.current = null;
      }
    });
  });
}
