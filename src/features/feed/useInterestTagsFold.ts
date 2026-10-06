import { useLayoutEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../shared/hooks/usePrefersReducedMotion";

/** The same fold timing as the bio's "Read more" right above the tags
 *  (`shared/components/ui/ExpandableText`, which does not export it): the
 *  duration grows with the distance travelled, so a two-row list and a
 *  five-row list unfold at roughly one speed, between a crisp floor and a
 *  ceiling that keeps a long list from dragging. */
const FOLD_MS_PER_PX = 0.3;
const FOLD_MIN_MS = 260;
const FOLD_MAX_MS = 620;

/** Added on top of the fold's own duration for the safety net: a transition
 *  that never starts (an unchanged height, a backgrounded tab) fires no
 *  `transitionend`, and without it the row would stay pinned mid-fold. */
const SETTLE_GRACE_MS = 300;

function foldDurationMs(distancePx: number) {
  return Math.round(
    Math.min(FOLD_MAX_MS, Math.max(FOLD_MIN_MS, distancePx * FOLD_MS_PER_PX)),
  );
}

/** Set on the row, outside React, while the chips the fold reveals should be
 *  showing. It is written straight to the DOM because it has to flip after
 *  the measurement inside the fold's own layout effect, between two layout
 *  reads, which a render cannot do. React never renders this attribute, so it
 *  never overwrites it. */
const FOLD_SHOWN_ATTRIBUTE = "data-fold-shown";

/** At rest, or travelling towards the full list or back to one row. */
export type InterestTagsFoldPhase = "idle" | "opening" | "closing";

/** The height of the row's first line of chips: what the folded row rests at.
 *  Every chip and the toggle share one box, so the tallest item on the first
 *  line is the folded row's own height. */
function firstLineHeightOf(row: HTMLElement) {
  const items = Array.from(row.children);
  const firstTop = items[0]?.getBoundingClientRect().top ?? 0;
  return items
    .map((item) => item.getBoundingClientRect())
    .filter((box) => box.top - firstTop < 1)
    .reduce((tallest, box) => Math.max(tallest, box.height), 0);
}

/**
 * The open/close fold of the interest row, in step with `ExpandableText`.
 *
 * `isExpanded` flips on the click (it drives `aria-expanded` and the toggle's
 * label); `foldPhase` is what the eye sees. While a fold runs the component
 * renders every chip, wrapped, and the row's inline `height` does the
 * clipping, from the height it had at the click to the height it is heading
 * for. Only when the fold settles does the phase return to idle, which is
 * when a closed row switches back to its one-line "+N" layout. The inline
 * height is dropped in the effect's cleanup, inside that same commit, so the
 * wrapped list is never painted at full height for a frame on the way down.
 *
 * Under reduced motion the phase never leaves idle: the change is instant.
 */
export function useInterestTagsFold() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const rowRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [foldPhase, setFoldPhase] = useState<InterestTagsFoldPhase>("idle");
  /** Height the row was at when the reader pressed the toggle, including
   *  mid-flight when they change their mind before the fold has finished. */
  const fromHeightRef = useRef(0);

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row || foldPhase === "idle") return;
    const isOpening = foldPhase === "opening";

    // The folded chips' resting point for this fold, set before anything is
    // measured: opening starts them hidden, closing starts them shown. A
    // fold reversed mid-flight therefore sees no change here, and the chips
    // carry on from wherever their fade had got to.
    row.toggleAttribute(FOLD_SHOWN_ATTRIBUTE, !isOpening);
    row.style.height = "";
    const fromHeight = fromHeightRef.current;
    const toHeight = isOpening
      ? row.getBoundingClientRect().height
      : firstLineHeightOf(row);
    const durationMs = foldDurationMs(Math.abs(toHeight - fromHeight));

    row.style.setProperty("--interest-tags-fold-dur", `${durationMs}ms`);
    row.style.height = `${fromHeight}px`;
    // Reading a layout property commits the start height (and the chips' start
    // opacity), so the writes below are changes the browser can interpolate,
    // timed by the duration that is now on the row.
    void row.offsetHeight;
    row.style.height = `${toHeight}px`;
    row.toggleAttribute(FOLD_SHOWN_ATTRIBUTE, isOpening);

    const settle = () => setFoldPhase("idle");
    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target === row && event.propertyName === "height") settle();
    };
    row.addEventListener("transitionend", onTransitionEnd);
    const timer = window.setTimeout(settle, durationMs + SETTLE_GRACE_MS);
    return () => {
      row.removeEventListener("transitionend", onTransitionEnd);
      window.clearTimeout(timer);
      row.style.height = "";
      row.style.removeProperty("--interest-tags-fold-dur");
      row.removeAttribute(FOLD_SHOWN_ATTRIBUTE);
    };
  }, [foldPhase]);

  const toggle = () => {
    const row = rowRef.current;
    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded);
    if (!row || prefersReducedMotion) {
      setFoldPhase("idle");
      return;
    }
    fromHeightRef.current = row.getBoundingClientRect().height;
    setFoldPhase(nextExpanded ? "opening" : "closing");
  };

  return { rowRef, isExpanded, foldPhase, toggle };
}
