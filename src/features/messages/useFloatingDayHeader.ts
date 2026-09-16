// src/features/messages/useFloatingDayHeader.ts
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { Virtualizer } from "@tanstack/react-virtual";
import { ROW_GAP_PX, type MessageRow } from "./messageRows";
import { createScrollIntentTracker } from "./scrollIntent";

/** How long after the last scroll the header fades out, WhatsApp-style. */
const IDLE_HIDE_MS = 1500;

/** The day of the row at `index`, or of the nearest row above it that has one
 *  (the unread divider and the group "Seen by" line carry no `day`). */
function rowDayAt(rows: MessageRow[], index: number): string | undefined {
  for (let cursor = index; cursor >= 0; cursor -= 1) {
    const row = rows[cursor];
    if (row && "day" in row) return row.day;
  }
  return undefined;
}

export interface FloatingDayHeaderState {
  /** Canonical day id of the topmost visible row, if any row is loaded. */
  day: string | undefined;
  isVisible: boolean;
}

/**
 * Drives the floating date pill pinned over the top of the message log.
 *
 * Rows are absolutely positioned by the virtualizer, so the topmost visible
 * row is resolved from the virtualizer's own measurements with a binary search
 * (`getVirtualItemForOffset`), once per animation frame at most, from a
 * passive scroll listener. React state is written only when the resolved day,
 * the "a separator is under the pill" flag or the revealed flag actually
 * changes, so scrolling a long thread re-renders this pill a handful of times
 * and never re-renders the log.
 *
 * The pill's band is measured from the DOM (the sticky host's rect against
 * the virtualized sizer's, plus the label's own offset and height) instead of
 * derived from the virtualizer's scroll offset or a hard-coded padding: the
 * virtualizer runs without a `scrollMargin`, and where the browser pins a
 * sticky box inside a padded scroller is its own business.
 *
 * A scroll only REVEALS the pill when it follows the member's own input (see
 * `createScrollIntentTracker`); once shown, any scroll keeps it alive, which
 * covers touch momentum.
 */
export function useFloatingDayHeader(
  areaRef: RefObject<HTMLDivElement | null>,
  hostRef: RefObject<HTMLDivElement | null>,
  labelRef: RefObject<HTMLSpanElement | null>,
  conversationId: string,
  rows: MessageRow[],
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>,
): FloatingDayHeaderState {
  const [day, setDay] = useState<string | undefined>(undefined);
  const [isSeparatorUnderPill, setIsSeparatorUnderPill] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);

  const rowsRef = useRef(rows);
  const scheduleMeasureRef = useRef<() => void>(() => {});

  // A cache patch or an older page can change which day sits at the top
  // without any scroll, so re-resolve on every new row list.
  useLayoutEffect(() => {
    rowsRef.current = rows;
    scheduleMeasureRef.current();
  }, [rows]);

  // `conversationId` is a dependency so a thread switch re-subscribes:
  // `MessageArea` is not remounted per thread, so this is what drops a pill
  // still showing from the previous thread (the cleanup hides it, and the new
  // run starts with `isShown` false).
  useEffect(() => {
    const area = areaRef.current;
    const host = hostRef.current;
    if (!area || !host) return;

    let frameId: number | null = null;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let isShown = false;

    const measure = () => {
      frameId = null;
      const sizer = host.parentElement;
      const label = labelRef.current;
      if (!sizer || !label) return;
      const currentRows = rowsRef.current;
      // The pill's box in the virtualizer's coordinate space (0 is the
      // sizer's top). The host's rect already carries wherever the browser
      // pinned it, `.area`'s padding included, and `offsetTop`/`offsetHeight`
      // ignore the label's entrance transform.
      const pillTop =
        host.getBoundingClientRect().top -
        sizer.getBoundingClientRect().top +
        label.offsetTop;
      const pillBottom = pillTop + label.offsetHeight;
      const topItem = rowVirtualizer.getVirtualItemForOffset(
        Math.max(0, pillTop),
      );
      if (!topItem) {
        setDay(undefined);
        setIsSeparatorUnderPill(true);
        return;
      }
      setDay(rowDayAt(currentRows, topItem.index));
      // Any day separator overlapping the pill's band (the topmost row's own,
      // partly scrolled away, or the next day's arriving from below) would
      // read twice, so the pill steps aside for it. A row's measured box
      // includes its `ROW_GAP_PX` bottom padding, which holds no label, so a
      // separator whose label has already scrolled above the pill no longer
      // counts.
      let hasSeparatorInBand = false;
      for (
        let cursor = topItem.index;
        cursor < currentRows.length;
        cursor += 1
      ) {
        const measurement = rowVirtualizer.measurementsCache[cursor];
        if (!measurement || measurement.start >= pillBottom) break;
        if (
          currentRows[cursor]?.kind === "daySeparator" &&
          measurement.end - ROW_GAP_PX > pillTop
        ) {
          hasSeparatorInBand = true;
          break;
        }
      }
      setIsSeparatorUnderPill(hasSeparatorInBand);
    };

    const scheduleMeasure = () => {
      if (frameId === null) frameId = requestAnimationFrame(measure);
    };

    const intent = createScrollIntentTracker(area);

    const handleScroll = () => {
      scheduleMeasure();
      if (!isShown && !intent.hasRecentIntent()) return;
      if (!isShown) {
        isShown = true;
        setIsRevealed(true);
      }
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        isShown = false;
        setIsRevealed(false);
      }, IDLE_HIDE_MS);
    };

    area.addEventListener("scroll", handleScroll, { passive: true });
    scheduleMeasureRef.current = scheduleMeasure;
    scheduleMeasure();

    return () => {
      intent.dispose();
      area.removeEventListener("scroll", handleScroll);
      scheduleMeasureRef.current = () => {};
      if (frameId !== null) cancelAnimationFrame(frameId);
      clearTimeout(hideTimer);
      setIsRevealed(false);
    };
  }, [areaRef, hostRef, labelRef, rowVirtualizer, conversationId]);

  return {
    day,
    isVisible: isRevealed && !isSeparatorUnderPill && day !== undefined,
  };
}
