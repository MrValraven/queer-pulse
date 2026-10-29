import { AnimatePresence, m } from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import type { ImageSlotTint } from "../../../shared/components/ui";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { STUDIO_EXIT, STUDIO_FADE } from "../studioMotion";
import { useStudioCoverTint } from "../useStudioCoverTint";
import styles from "./StudioStickyHeader.module.css";

export interface StudioStickyHeaderProps {
  /** An element at the foot of the hero. The bar shows once it has scrolled
   *  up under the shell topbar. Read after every render, so a hero that
   *  mounts after loading still arms it. */
  sentinelRef?: RefObject<Element | null>;
  /** The same sentinel held in state (from a callback ref). Wins over
   *  `sentinelRef` when both are given. */
  sentinel?: Element | null;
  title: string;
  /** A small cover (an `ImageSlot` with inset 0) for the bar's square. */
  cover?: ReactNode;
  /** The compact actions, Play first. */
  actions?: ReactNode;
  /** The hero's cover tint, so the bar picks up the same wash. */
  tint?: ImageSlotTint;
  /** The hero's cover image. In light, the bar washes in the same colour
   *  the hero reads from it (useStudioCoverTint.ts). */
  coverUrl?: string | null;
}

const REDUCED_FADE = { duration: 0.12 } as const;

interface ArmedObserver {
  element: Element;
  topOffset: number;
  observer: IntersectionObserver;
}

/** The anchor's resolved sticky `top`: the shell topbar's height. */
function readTopOffset(anchor: HTMLElement): number {
  return Math.round(parseFloat(getComputedStyle(anchor).top) || 0);
}

/**
 * Observes `element` with the topbar's height cut off the viewport top, and
 * re-arms only when the sentinel or that height changed.
 */
function syncObserver(
  armedRef: RefObject<ArmedObserver | null>,
  element: Element | null,
  anchor: HTMLElement | null,
  onPassedChange: (isPassed: boolean) => void,
) {
  const armed = armedRef.current;
  const topOffset = anchor ? readTopOffset(anchor) : 0;
  if (armed && armed.element === element && armed.topOffset === topOffset)
    return;
  armed?.observer.disconnect();
  armedRef.current = null;
  if (!element || !anchor || typeof IntersectionObserver === "undefined")
    return;
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry) return;
      onPassedChange(
        !entry.isIntersecting && entry.boundingClientRect.top < topOffset,
      );
    },
    { rootMargin: `-${topOffset}px 0px 0px 0px`, threshold: 0 },
  );
  observer.observe(element);
  armedRef.current = { element, topOffset, observer };
}

/** True once the sentinel has scrolled up past the anchor's sticky top. */
function useIsSentinelPassed(
  sentinelRef: RefObject<Element | null> | undefined,
  sentinel: Element | null | undefined,
  anchorRef: RefObject<HTMLElement | null>,
): boolean {
  const [isPassed, setIsPassed] = useState(false);
  const armedRef = useRef<ArmedObserver | null>(null);
  // The setter only ever runs from the observer callback, never during the
  // effect, so the per-render effect below cannot loop.
  const passedSetterRef = useRef(setIsPassed);

  // After every render: a sentinel that mounts late, or a new one, arms it.
  // syncObserver returns early while the sentinel and offset are unchanged.
  useEffect(() => {
    syncObserver(
      armedRef,
      sentinel ?? sentinelRef?.current ?? null,
      anchorRef.current,
      passedSetterRef.current,
    );
  });

  // The topbar changes height across the compact breakpoint and with the
  // notch inset, so a resize re-reads the offset.
  useEffect(() => {
    const handleResize = () =>
      syncObserver(
        armedRef,
        armedRef.current?.element ?? null,
        anchorRef.current,
        passedSetterRef.current,
      );
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      armedRef.current?.observer.disconnect();
      armedRef.current = null;
    };
  }, [anchorRef]);

  return isPassed;
}

/**
 * The compact header of a detail page: cover, title and Play, on a bar
 * tinted like the hero and pinned flush to the shell topbar's bottom edge.
 * In light it continues the frosted topbar edge to edge, and the cover's
 * tint fades in once read; dark keeps an opaque inset card. It fades and
 * slides down from under the topbar once the hero has scrolled away, and
 * leaves the same way. Place it as the
 * page's first child, so its sticky anchor spans the whole page; the anchor
 * takes no height. Its title is plain text, since the page's h1 already
 * names the page.
 */
export function StudioStickyHeader({
  sentinelRef,
  sentinel,
  title,
  cover,
  actions,
  tint,
  coverUrl,
}: StudioStickyHeaderProps) {
  const { reducedMotion } = useMotionPrefs();
  const anchorRef = useRef<HTMLDivElement>(null);
  const isShown = useIsSentinelPassed(sentinelRef, sentinel, anchorRef);
  const coverTint = useStudioCoverTint(coverUrl);

  return (
    <div
      ref={anchorRef}
      className={styles.anchor}
      data-cover-tint={coverTint ? "" : undefined}
      style={
        coverTint
          ? ({ "--hero-cover-tint": coverTint } as CSSProperties)
          : undefined
      }
    >
      <AnimatePresence initial={false}>
        {isShown && (
          <m.div
            key="bar"
            className={styles.bar}
            data-tint={tint}
            initial={{ opacity: 0, y: reducedMotion ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: reducedMotion ? 0 : -6,
              transition: reducedMotion ? REDUCED_FADE : STUDIO_EXIT,
            }}
            transition={reducedMotion ? REDUCED_FADE : STUDIO_FADE}
          >
            {cover && (
              <span className={styles.cover} aria-hidden="true">
                {cover}
              </span>
            )}
            <p className={styles.title}>{title}</p>
            {actions && <div className={styles.actions}>{actions}</div>}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
