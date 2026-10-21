import {
  AnimatePresence,
  m,
  PresenceContext,
  useIsPresent,
} from "motion/react";
import { useContext, useLayoutEffect, useRef, type ReactNode } from "react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import styles from "../../StudioPlayer.module.css";

/** `--ease-out` for the entering block, as a cubic-bezier motion can read. */
const SWAP_EASE_OUT = [0.16, 1, 0.3, 1] as const;
/** `--ease-in` for the leaving block, so it gets out of the way. */
const SWAP_EASE_IN = [0.4, 0, 1, 1] as const;
const SWAP_SECONDS = 0.2;
/** The leaving title's share of the swap: it is mostly gone by the time the
 *  new one reads, so the two never smear together at the midpoint. */
const TEXT_EXIT_SHARE = 0.6;
/** The entering title waits this share of the swap (0.04s) before it rises. */
const TEXT_ENTRY_DELAY_SHARE = 0.2;
/** The rise: the new block comes up from below, the old one leaves above. */
const SWAP_RISE_PX = 6;
/** The links and buttons a block can hold focus on, in reading order. */
const FOCUSABLE_SELECTOR = "a, button";

/** The swap's duration; instant under reduced motion (the OS setting or the
 *  in-app toggle). */
function useSwapSeconds(): number {
  const { reducedMotion } = useMotionPrefs();
  return reducedMotion ? 0 : SWAP_SECONDS;
}

/** Whether the swap this item takes part in is a swipe's skip. An entering
 *  item reads its own prop; a leaving one reads AnimatePresence's `custom`,
 *  which carries the value of the change that removed it. */
function useIsInstantSwap(isInstant: boolean): boolean {
  const presence = useContext(PresenceContext);
  if (presence && !presence.isPresent) return presence.custom === true;
  return isInstant;
}

/** One title block of the swap. On its way out it is inert (out of the tab
 *  order, keyboard and assistive tech) and ignores the pointer while it
 *  fades. In a swipe's skip it arrives whole and the old one goes at once:
 *  the slide carries the change. */
function NowTextItem({
  isInstant: isInstantSwap,
  children,
}: {
  isInstant: boolean;
  children: ReactNode;
}) {
  const isPresent = useIsPresent();
  const isInstant = useIsInstantSwap(isInstantSwap);
  const swapSeconds = useSwapSeconds();
  const duration = isInstant ? 0 : swapSeconds;
  return (
    <m.span
      className={styles.nowSwapItem}
      inert={!isPresent}
      aria-hidden={isPresent ? undefined : true}
      data-swap-item=""
      data-leaving={isPresent ? undefined : ""}
      initial={isInstant ? false : { opacity: 0, y: SWAP_RISE_PX }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          duration,
          delay: duration * TEXT_ENTRY_DELAY_SHARE,
          ease: SWAP_EASE_OUT,
        },
      }}
      exit={{
        opacity: 0,
        y: -SWAP_RISE_PX,
        transition: {
          duration: duration * TEXT_EXIT_SHARE,
          ease: SWAP_EASE_IN,
        },
      }}
    >
      {children}
    </m.span>
  );
}

/** The index of the focused link inside its block, or null. */
function readFocusedIndex(swap: HTMLElement): number | null {
  const focused = document.activeElement;
  if (!(focused instanceof HTMLElement) || !swap.contains(focused)) return null;
  const block = focused.closest("[data-swap-item]");
  if (!block) return null;
  const index = Array.from(
    block.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).indexOf(focused);
  return index === -1 ? null : index;
}

/**
 * Title and artist crossfade on a track change: the old block fades up and
 * out while the new one rises in. Both share one grid cell, so the column
 * keeps its size and nothing beside it moves. Focus on a leaving link moves
 * to the same link of the entering block, so it never drops to the page.
 */
export function StudioNowTextSwap({
  swapKey,
  isInstant = false,
  children,
}: {
  swapKey: string;
  /** A swipe's skip: the slide moves the blocks, so they swap at once. */
  isInstant?: boolean;
  children: ReactNode;
}) {
  const swapRef = useRef<HTMLSpanElement>(null);
  const shownKeyRef = useRef(swapKey);
  /** The focused link's index. A blur to nowhere (the leaving link turning
   *  inert) clears it only after the swap's own commit has read it. */
  const focusedIndexRef = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (shownKeyRef.current === swapKey) return;
    shownKeyRef.current = swapKey;
    const swap = swapRef.current;
    if (!swap) return;
    const focusedIndex = focusedIndexRef.current ?? readFocusedIndex(swap);
    if (focusedIndex === null) return;
    const enteringBlock = swap.querySelector(
      "[data-swap-item]:not([data-leaving])",
    );
    if (!enteringBlock) return;
    const entering =
      enteringBlock.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const target = entering[Math.min(focusedIndex, entering.length - 1)];
    if (target && target !== document.activeElement) target.focus();
  }, [swapKey]);
  return (
    <span
      ref={swapRef}
      className={styles.nowSwap}
      onFocus={() => {
        const swap = swapRef.current;
        if (swap) focusedIndexRef.current = readFocusedIndex(swap);
      }}
      onBlur={(event) => {
        const swap = swapRef.current;
        const next = event.relatedTarget;
        if (swap && next instanceof Node && swap.contains(next)) return;
        queueMicrotask(() => {
          focusedIndexRef.current = swap ? readFocusedIndex(swap) : null;
        });
      }}
    >
      <AnimatePresence initial={false} custom={isInstant}>
        <NowTextItem key={swapKey} isInstant={isInstant}>
          {children}
        </NowTextItem>
      </AnimatePresence>
    </span>
  );
}

/** One cover of the swap. The entering cover fades in on top; the leaving
 *  one stays whole underneath until it is covered, so the box never shows
 *  through mid-fade. */
function NowCoverItem({
  isInstant: isInstantSwap,
  children,
}: {
  isInstant: boolean;
  children: ReactNode;
}) {
  const isPresent = useIsPresent();
  const isInstant = useIsInstantSwap(isInstantSwap);
  const swapSeconds = useSwapSeconds();
  const duration = isInstant ? 0 : swapSeconds;
  return (
    <m.span
      className={styles.coverSwapItem}
      aria-hidden={isPresent ? undefined : true}
      data-leaving={isPresent ? undefined : ""}
      initial={isInstant ? false : { opacity: 0 }}
      animate={{ opacity: 1, transition: { duration, ease: SWAP_EASE_OUT } }}
      exit={{ opacity: 0, transition: { duration: 0, delay: duration } }}
    >
      {children}
    </m.span>
  );
}

/** The cover's crossfade on a track change, inside the art box; at once
 *  in a swipe's skip (`isInstant`). */
export function StudioNowCoverSwap({
  swapKey,
  isInstant = false,
  children,
}: {
  swapKey: string;
  isInstant?: boolean;
  children: ReactNode;
}) {
  return (
    <span className={styles.coverSwap}>
      <AnimatePresence initial={false} custom={isInstant}>
        <NowCoverItem key={swapKey} isInstant={isInstant}>
          {children}
        </NowCoverItem>
      </AnimatePresence>
    </span>
  );
}

/** Add to playlist fades in and out when the track turns into a private
 *  preview (which offers no save) or back. Inert while it leaves. */
function NowSaveSlotItem({ children }: { children: ReactNode }) {
  const isPresent = useIsPresent();
  const duration = useSwapSeconds();
  return (
    <m.span
      className={styles.addToPlaylistSlot}
      inert={!isPresent}
      aria-hidden={isPresent ? undefined : true}
      data-leaving={isPresent ? undefined : ""}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration, ease: SWAP_EASE_OUT } }}
      exit={{ opacity: 0, transition: { duration, ease: SWAP_EASE_IN } }}
    >
      {children}
    </m.span>
  );
}

export function StudioNowSaveSlot({
  isShown,
  children,
}: {
  isShown: boolean;
  children: ReactNode;
}) {
  return (
    <AnimatePresence initial={false}>
      {isShown && <NowSaveSlotItem key="save">{children}</NowSaveSlotItem>}
    </AnimatePresence>
  );
}
