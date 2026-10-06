import { useLayoutEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../shared/hooks/usePrefersReducedMotion";
import { foldDurationMs } from "./useInterestTagsFold";

/** Added on top of the fold's own duration for the safety net: a transition
 *  that never starts (an unchanged height, a backgrounded tab) fires no
 *  `transitionend`, and without it the list would stay pinned mid-fold. */
const SETTLE_GRACE_MS = 300;

/** Set on the list, outside React, while the rows the fold reveals should be
 *  showing. Written straight to the DOM for the same reason as the interest
 *  row's (see `useInterestTagsFold`): it has to flip after the measurement,
 *  between two layout reads, which a render cannot do. React never renders
 *  this attribute, so it never overwrites it. */
const FOLD_SHOWN_ATTRIBUTE = "data-fold-shown";

/** At rest, or travelling towards the full list or back to the first rows. */
export type NewMembersFoldPhase = "idle" | "opening" | "closing";

/** The list's height with only its first `rowCount` rows: from its top edge
 *  to the bottom of the last row that stays. The list has no padding, so
 *  that is exactly the height it rests at once the rest unmount. */
function collapsedHeightOf(list: HTMLElement, rowCount: number) {
  const lastKeptRow = list.children[rowCount - 1];
  if (!lastKeptRow) return list.getBoundingClientRect().height;
  return (
    lastKeptRow.getBoundingClientRect().bottom -
    list.getBoundingClientRect().top
  );
}

/** The phone app bar's height while it is scrolled away, else 0. It slides
 *  back on any scroll up (`useAppBarScrollAway`, which stamps
 *  `data-app-bar-hidden` on <html> while it is away), so a scroll up has to
 *  clear the bar it brings back as well. */
function returningAppBarHeight(): number {
  const root = document.documentElement;
  if (root.getAttribute("data-app-bar-hidden") !== "true") return 0;
  return (
    parseFloat(getComputedStyle(root).getPropertyValue("--app-bar-h")) || 0
  );
}

/** Brings the card back on screen when a long list folding away has left
 *  its toggle above (or below) the reader, so they land on the title and
 *  the first rows with the toggle under them. The clearances are the
 *  toggle's own `scroll-margin`, which keeps clear of the fixed nav and any
 *  bottom bar, so "on screen" means visible as well as inside the viewport.
 *  A card taller than that visible band brings back as much of itself as
 *  fits, ending at the toggle. The card is the toggle's parent, the feed
 *  card's shell, and the feed scrolls the window. */
function revealIfOffscreen(toggle: HTMLElement, isSmooth: boolean) {
  const toggleBox = toggle.getBoundingClientRect();
  const toggleStyle = getComputedStyle(toggle);
  const topClearance = parseFloat(toggleStyle.scrollMarginTop) || 0;
  const bottomClearance = parseFloat(toggleStyle.scrollMarginBottom) || 0;
  const visibleBottom = window.innerHeight - bottomClearance;
  const isOffscreen =
    toggleBox.top < topClearance || toggleBox.bottom > visibleBottom;
  if (!isOffscreen) return;
  const behavior: ScrollBehavior = isSmooth ? "smooth" : "auto";
  const cardBox = (toggle.parentElement ?? toggle).getBoundingClientRect();
  // The nearest edge, as `block: "nearest"` would: a card above the reader
  // comes down to the top clearance, one below rises to the bottom one.
  const isCardAbove = cardBox.top < topClearance;
  const visibleTop = isCardAbove
    ? topClearance + returningAppBarHeight()
    : topClearance;
  if (cardBox.height > visibleBottom - visibleTop) {
    toggle.scrollIntoView({ block: "end", behavior });
    return;
  }
  window.scrollBy({
    top: isCardAbove
      ? cardBox.top - visibleTop
      : cardBox.bottom - visibleBottom,
    behavior,
  });
}

/**
 * The "Show all" / "Show fewer" fold of the people-joined list, timed like
 * the interest row's (`useInterestTagsFold`) and the bio's "Read more".
 *
 * `isExpanded` flips on the click (it drives `aria-expanded` and the toggle's
 * label); `foldPhase` is what the eye sees. While a fold runs the card renders
 * every row and the list's inline `height` does the clipping, from the height
 * it had at the click to the height it is heading for. Only when the fold
 * settles does the phase return to idle, which is when a closed list unmounts
 * the rows past `collapsedRowCount`. The inline height is dropped in the
 * effect's cleanup, inside that same commit, so the full list is never
 * painted for a frame on the way down. The masonry observes the card, so the
 * cards below follow the height as it moves.
 *
 * After a close settles, the card is brought back into view if the list
 * folding away left its toggle off screen (as much of it as fits, ending at
 * the toggle, when the card is taller than the screen); focus stays on the
 * toggle.
 *
 * Under reduced motion the phase never leaves idle: the change is instant.
 */
export function useNewMembersFold(collapsedRowCount: number) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const listRef = useRef<HTMLUListElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [foldPhase, setFoldPhase] = useState<NewMembersFoldPhase>("idle");
  /** Height the list was at when the reader pressed the toggle, including
   *  mid-flight when they change their mind before the fold has finished. */
  const fromHeightRef = useRef(0);
  /** Set by a close, cleared by an open: the next time the list is at rest
   *  and closed, check where the toggle ended up. */
  const shouldRevealToggleRef = useRef(false);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || foldPhase === "idle") return;
    const isOpening = foldPhase === "opening";

    // The folded rows' resting point for this fold, set before anything is
    // measured: opening starts them hidden, closing starts them shown. A
    // fold reversed mid-flight therefore sees no change here, and the rows
    // carry on from wherever their fade had got to.
    list.toggleAttribute(FOLD_SHOWN_ATTRIBUTE, !isOpening);
    list.style.height = "";
    const fromHeight = fromHeightRef.current;
    const toHeight = isOpening
      ? list.getBoundingClientRect().height
      : collapsedHeightOf(list, collapsedRowCount);
    const durationMs = foldDurationMs(Math.abs(toHeight - fromHeight));

    list.style.setProperty("--new-members-fold-dur", `${durationMs}ms`);
    list.style.height = `${fromHeight}px`;
    // Reading a layout property commits the start height (and the rows' start
    // opacity), so the writes below are changes the browser can interpolate,
    // timed by the duration that is now on the list.
    void list.offsetHeight;
    list.style.height = `${toHeight}px`;
    list.toggleAttribute(FOLD_SHOWN_ATTRIBUTE, isOpening);

    const settle = () => setFoldPhase("idle");
    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target === list && event.propertyName === "height") settle();
    };
    list.addEventListener("transitionend", onTransitionEnd);
    const timer = window.setTimeout(settle, durationMs + SETTLE_GRACE_MS);
    return () => {
      list.removeEventListener("transitionend", onTransitionEnd);
      window.clearTimeout(timer);
      list.style.height = "";
      list.style.removeProperty("--new-members-fold-dur");
      list.removeAttribute(FOLD_SHOWN_ATTRIBUTE);
    };
  }, [foldPhase, collapsedRowCount]);

  // Runs after the fold effect's cleanup has dropped the inline height, so
  // the toggle is measured where it finally rests.
  useLayoutEffect(() => {
    const toggle = toggleRef.current;
    if (!shouldRevealToggleRef.current || foldPhase !== "idle" || isExpanded) {
      return;
    }
    shouldRevealToggleRef.current = false;
    if (toggle) revealIfOffscreen(toggle, !prefersReducedMotion);
  }, [foldPhase, isExpanded, prefersReducedMotion]);

  const toggle = () => {
    const list = listRef.current;
    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded);
    shouldRevealToggleRef.current = !nextExpanded;
    if (!list || prefersReducedMotion) {
      setFoldPhase("idle");
      return;
    }
    fromHeightRef.current = list.getBoundingClientRect().height;
    setFoldPhase(nextExpanded ? "opening" : "closing");
  };

  return { listRef, toggleRef, isExpanded, foldPhase, toggle };
}
