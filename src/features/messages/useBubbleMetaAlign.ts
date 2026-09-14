// src/features/messages/useBubbleMetaAlign.ts
import { useLayoutEffect, useState, type RefObject } from "react";

/** Where the in-bubble meta (time + status tick) sits vertically inside a text
 *  bubble. The meta is a right float, so it always lands at the TOP of whatever
 *  line box it ends up in — these are the three offsets from there:
 *
 *   center  one-line bubble: centred on the single text line it shares.
 *   bottom  multi-line bubble: dropped the remaining half-leading so its bottom
 *           is flush with the bubble's bottom padding (tucked into the corner).
 *   flush   the float found no room beside the last text line and took a strip
 *           of its own at the bubble's foot, where it already sits flush.
 *
 *  CSS cannot tell a one-line bubble from a multi-line one, and the two want
 *  different offsets (they differ by the half-leading), so the line count is
 *  measured once per laid-out bubble here. The classes these map to only ever
 *  change `translate`, which is why applying one can never feed the
 *  ResizeObserver below a new box to react to. */
export type BubbleMetaAlign = "center" | "bottom" | "flush";

/** Keep in step with `--meta-height` on `.bubbleMeta`: the float's pinned
 *  height. Half of it separates "shares the last text line" (the gap under the
 *  text is only the line's half-leading, ~2px) from "took a strip of its own"
 *  (the gap is a whole meta box), with room to spare either side. */
const META_HEIGHT_PX = 12;

/** Reads the laid-out bubble and returns where its floating meta belongs.
 *
 *  Refs are owned by the CONSUMER rather than returned from here, so this
 *  hook's return value is a bare string: bundling a ref into it would make
 *  every property read off the result look like a ref access to
 *  `react-hooks/refs` (same reason `useMessageGestures` takes its refs in). */
export function useBubbleMetaAlign({
  bubbleRef,
  textRef,
  enabled,
  signal,
}: {
  /** The `.bubble` element itself — its padding/border give the content box. */
  bubbleRef: RefObject<HTMLElement | null>;
  /** An inline wrapper around the message text ONLY (never the reply quote or
   *  the meta): `getClientRects()` on it returns one rect per line box, which
   *  is the line count, and its last rect is the last text line. */
  textRef: RefObject<HTMLElement | null>;
  /** False on a bubble with no floating meta (a grouped bubble above a run's
   *  last, or the emoji/photo/document bodies, which render the meta below). */
  enabled: boolean;
  /** Re-measures when it changes — an edit can rewrite the body without
   *  changing the bubble's box at all, which the observer would never see. */
  signal: string;
}): BubbleMetaAlign {
  const [align, setAlign] = useState<BubbleMetaAlign>("center");
  useLayoutEffect(() => {
    const bubble = bubbleRef.current;
    const text = textRef.current;
    if (!enabled || !bubble || !text) return;
    const measure = () => setAlign(measureBubbleMetaAlign(bubble, text));
    measure();
    // Catches a reflow the signal cannot: the thread pane resizing, a font
    // finishing loading, an image above the text settling. Guarded the same way
    // `useMessageScroll` guards its own observer, so a layout-less environment
    // (jsdom, a prerender pass) keeps the measured-once default.
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(bubble);
    return () => observer.disconnect();
  }, [bubbleRef, textRef, enabled, signal]);
  return align;
}

function measureBubbleMetaAlign(
  bubble: HTMLElement,
  text: HTMLElement,
): BubbleMetaAlign {
  const lineRects = text.getClientRects();
  const lastLine = lineRects[lineRects.length - 1];
  // Nothing laid out yet (a hidden thread, a not-yet-mounted subtree): keep the
  // centred default — the observer re-measures as soon as it has a box.
  if (!lastLine) return "center";
  const style = getComputedStyle(bubble);
  const contentBottom =
    bubble.getBoundingClientRect().bottom -
    parseFloat(style.borderBottomWidth) -
    parseFloat(style.paddingBottom);
  // Measured as a DIFFERENCE inside one element, so a transform on the bubble
  // (the entrance animation, a swipe-to-reply follow) cancels out.
  if (contentBottom - lastLine.bottom > META_HEIGHT_PX / 2) return "flush";
  return lineRects.length > 1 ? "bottom" : "center";
}
