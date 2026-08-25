import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

/** Vertical overflow (CSS px) below which there is nothing worth dragging. */
const MIN_SLACK_PX = 2;
/** Arrow-key nudge, in percentage points of the vertical focal position. */
const ARROW_STEP = 2;
/** Page-key nudge, same units. */
const PAGE_STEP = 10;

/** The custom property the banner's `object-position` Y reads. Written straight
 *  onto the `.pp-cover` node so a drag never has to re-render the page tree. */
export const COVER_Y_VAR = "--pp-cover-y";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * How far (in CSS px) an `object-fit: cover` image can travel vertically inside
 * its band before an edge shows: the height the image actually renders at,
 * minus the height of the box that crops it.
 *
 * `cover` scales by `max(boxW/naturalW, boxH/naturalH)`, so the rendered height
 * is `max(boxH, naturalH × boxW / naturalW)` — the `boxH` arm is the case where
 * the image is wider than the band and all the overflow is horizontal, which
 * gives a slack of exactly zero. That is the "nothing to move" case the caller
 * disables the control for.
 *
 * Measured on layout geometry, which is why the persona parallax transform is
 * suppressed while repositioning (`persona-motion.css`): a live `scale()` on
 * the image would put a factor between the pointer's travel and the image's.
 */
function measureSlack(cover: HTMLElement): number {
  const image = cover.querySelector("img");
  if (!image) return 0;
  const box = cover.getBoundingClientRect();
  const { naturalWidth, naturalHeight } = image;
  if (!naturalWidth || !naturalHeight || box.width === 0) return 0;
  const rendered = Math.max(
    box.height,
    (box.width * naturalHeight) / naturalWidth,
  );
  return Math.max(0, rendered - box.height);
}

export interface CoverReposition {
  /** Reposition mode is on: the drag surface and action bar are mounted. */
  isActive: boolean;
  /** The band has vertical slack, so there is somewhere for the image to go. */
  canReposition: boolean;
  /** Current vertical focal position, 0 (image top) to 100 (image bottom). */
  offsetY: number;
  /** A drag is in flight (for the grabbing cursor). */
  isDragging: boolean;
  start: () => void;
  /** Leave reposition mode, throwing the uncommitted move away. */
  cancel: () => void;
  /** Leave reposition mode, keeping the current position (the caller saves). */
  finish: () => void;
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
  nudge: (key: string) => boolean;
}

/**
 * The persona banner's owner-only vertical reposition, Notion-style: grab the
 * image, slide it up or down inside the band, save where it lands.
 *
 * Owns the geometry and the interaction only. The value it produces is a
 * vertical `object-position` percentage, which the caller persists (as
 * `skinData.coverOffsetY`) and feeds back in as `baseOffsetY`.
 *
 * The live position is written as a CSS custom property on the `.pp-cover`
 * node rather than passed down as a prop, so the whole persona tree below is
 * untouched while dragging. `baseOffsetY` stays the source of truth: the
 * property is re-written from state on every change, including the reset a
 * cancel performs, so there is never a frame where the two disagree.
 */
export function useCoverReposition(
  coverRef: RefObject<HTMLDivElement | null>,
  baseOffsetY: number,
): CoverReposition {
  const [isActive, setIsActive] = useState(false);
  const [slack, setSlack] = useState(0);
  const [offsetY, setOffsetY] = useState(baseOffsetY);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startY: number;
    startOffset: number;
  } | null>(null);

  // A saved value arriving from the server (or the owner editing the cover in
  // the editor pane) re-seeds the control — but never mid-move, which would
  // yank the image out from under the pointer. Done as React's documented
  // adjust-state-during-render rather than in an effect, which would paint the
  // stale position for a frame first.
  const [seededFrom, setSeededFrom] = useState(baseOffsetY);
  if (!isActive && baseOffsetY !== seededFrom) {
    setSeededFrom(baseOffsetY);
    setOffsetY(baseOffsetY);
  }

  const remeasure = useCallback(() => {
    const cover = coverRef.current;
    setSlack(cover ? measureSlack(cover) : 0);
  }, [coverRef]);

  // The band's width drives the slack, and the natural dimensions aren't known
  // until the image decodes — so watch both rather than measuring once.
  useEffect(() => {
    const cover = coverRef.current;
    if (!cover) return;
    remeasure();
    const observer = new ResizeObserver(remeasure);
    observer.observe(cover);
    const image = cover.querySelector("img");
    image?.addEventListener("load", remeasure);
    return () => {
      observer.disconnect();
      image?.removeEventListener("load", remeasure);
    };
  }, [coverRef, remeasure]);

  // The one writer of the live position. Runs on every change (including the
  // first), so the inline fallback in the caller's `object-position` only ever
  // covers the very first paint.
  useEffect(() => {
    const cover = coverRef.current;
    cover?.style.setProperty(COVER_Y_VAR, `${offsetY}%`);
  }, [coverRef, offsetY]);

  useEffect(() => {
    const cover = coverRef.current;
    return () => {
      cover?.style.removeProperty(COVER_Y_VAR);
    };
  }, [coverRef]);

  // Marks the band for the stylesheets: drops the bleed fade (which would
  // dissolve the action bar sitting on the bottom edge) and freezes the
  // parallax so the image tracks the pointer one to one.
  useEffect(() => {
    const cover = coverRef.current;
    if (!cover) return;
    if (isActive) cover.setAttribute("data-repositioning", "");
    else cover.removeAttribute("data-repositioning");
    return () => cover.removeAttribute("data-repositioning");
  }, [coverRef, isActive]);

  const canReposition = slack >= MIN_SLACK_PX;

  function start() {
    remeasure();
    setIsActive(true);
  }

  function cancel() {
    dragRef.current = null;
    setIsDragging(false);
    setIsActive(false);
    setOffsetY(baseOffsetY);
  }

  function finish() {
    dragRef.current = null;
    setIsDragging(false);
    setIsActive(false);
  }

  function onPointerDown(event: React.PointerEvent<HTMLElement>) {
    if (!isActive || !canReposition || event.button !== 0) return;
    // Pointer capture keeps the drag alive when the pointer leaves the band,
    // which on a short banner happens almost immediately.
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startOffset: offsetY,
    };
    setIsDragging(true);
  }

  function onPointerMove(event: React.PointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    // Dragging DOWN reveals more of the image's top, which is a SMALLER
    // `object-position` Y (0% aligns the image's top edge with the band's).
    const travelled = ((event.clientY - drag.startY) / slack) * 100;
    setOffsetY(clamp(drag.startOffset - travelled, 0, 100));
  }

  function onPointerUp(event: React.PointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  /** Keyboard equivalent of the drag, on slider conventions: Up raises the
   *  image (a larger focal Y shows more of its lower half). Returns whether
   *  the key was one this handles, so the caller can preventDefault. */
  function nudge(key: string): boolean {
    if (!isActive || !canReposition) return false;
    const step: Record<string, number | undefined> = {
      ArrowUp: ARROW_STEP,
      ArrowDown: -ARROW_STEP,
      PageUp: PAGE_STEP,
      PageDown: -PAGE_STEP,
    };
    const nudgeBy = step[key];
    if (nudgeBy !== undefined) {
      setOffsetY((current) => clamp(current + nudgeBy, 0, 100));
      return true;
    }
    if (key === "Home") {
      setOffsetY(0);
      return true;
    }
    if (key === "End") {
      setOffsetY(100);
      return true;
    }
    return false;
  }

  return {
    isActive,
    canReposition,
    offsetY,
    isDragging,
    start,
    cancel,
    finish,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    nudge,
  };
}
