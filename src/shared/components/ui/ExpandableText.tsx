import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { FiChevronDown } from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import styles from "./ExpandableText.module.css";

/** Added on top of the fold's own duration for the safety net below. A
 *  transition that never starts (an unchanged height, a backgrounded tab) fires
 *  no `transitionend`, and without this the block would stay pinned at its
 *  animation target for good. */
const SETTLE_GRACE_MS = 300;

/** A collapsing bio travels as far as the reader wrote: three paragraphs fold
 *  away over a thousand pixels, a short one over eighty. Holding both to a
 *  single duration means the long fold has to move ten times as fast, which is
 *  what reads as a snap rather than a fold however the curve is shaped. Scaling
 *  the duration with the distance keeps the words moving at roughly one speed;
 *  the floor keeps a short fold crisp and the ceiling keeps a very long one
 *  from feeling slow. */
const FOLD_MS_PER_PX = 0.3;
const FOLD_MIN_MS = 260;
const FOLD_MAX_MS = 620;

function foldDurationMs(distancePx: number) {
  return Math.round(
    Math.min(FOLD_MAX_MS, Math.max(FOLD_MIN_MS, distancePx * FOLD_MS_PER_PX)),
  );
}

interface ExpandableTextProps {
  /** The prose itself — usually a `<ResolvedMentionText>`. */
  children: ReactNode;
  /** The caller's own typography class for the paragraph (bio, review, …).
   *  This component brings the clamp and the toggle, never the type style. */
  className?: string;
  /** Line boxes kept visible while collapsed. */
  lines?: number;
  /** Line boxes kept visible on a narrow column, where the same words reflow
   *  onto far more lines. Defaults to `lines`. */
  linesMobile?: number;
  /** How the collapsed block is clipped.
   *
   *  `"lines"` uses `-webkit-line-clamp`, which adds the familiar ellipsis on
   *  the last visible line. It forces `display: -webkit-box`, so it destroys
   *  any multi-column or drop-cap treatment the caller's own CSS applies.
   *
   *  `"height"` clips to the same number of line boxes with `max-height`,
   *  leaving `display` alone. No ellipsis, but multi-column text and
   *  `::first-letter` drop caps survive — which is why the persona pages, whose
   *  skins style `.pp-bio` with both, use it. */
  clampMode?: "lines" | "height";
  /** Re-measure and re-collapse whenever this changes. Pass the text itself:
   *  a collapsed block is clamped to a fixed height, so its own resize never
   *  fires when the words underneath it are swapped (the EN/PT bio toggle). */
  resetKey?: string;
}

/**
 * Long prose folded down to a few lines, with a Read more / Show less toggle
 * beneath it. Used for member and persona bios, which members write at any
 * length and which otherwise push everything below them off the first screen.
 *
 * The clamp lives in CSS on `[data-clamped]`, so the block is always clamped
 * while collapsed — including when the text is short enough to fit. That is
 * what makes the overflow measurable: an unclamped block reports
 * `scrollHeight === clientHeight` and would never ask for the toggle. When
 * nothing is actually clipped, no toggle renders and the block looks exactly
 * as it did before.
 *
 * Both states keep the full text in the DOM, so a screen reader was never
 * reading a truncated bio; the toggle is a visual affordance, wired to the
 * paragraph with `aria-expanded`/`aria-controls`.
 *
 * (`features/marketing/DirectoryReviewText` predates this and clamps space
 * reviews the same way against its own page-scoped styles.)
 */
export function ExpandableText({
  children,
  className,
  lines = 6,
  linesMobile,
  clampMode = "lines",
  resetKey,
}: ExpandableTextProps) {
  const { t } = useTranslation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const bodyId = useId();
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  /** Height the block was at when the reader pressed the toggle, including
   *  mid-flight when they change their mind before the fold has finished. */
  const fromHeightRef = useRef(0);

  // A swapped-in text (the EN/PT bio toggle) starts folded again, so the reader
  // is never left looking at an unfolded block with no toggle under it. Adjusted
  // during render rather than in an effect: React re-runs this component
  // immediately with the corrected state, so the new text is never painted
  // expanded for a frame first.
  const [lastResetKey, setLastResetKey] = useState(resetKey);
  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey);
    setIsExpanded(false);
    setIsAnimating(false);
  }

  // Re-measured on every resize of the block: the same words reflow onto more
  // lines in a narrow column, so a bio that fits on desktop can overflow on a
  // phone, and a late webfont swap changes the count again. Measuring is
  // skipped while expanded or mid-fold (nothing is clipped then, and the toggle
  // must stay put so "Show less" does not vanish out from under the reader).
  useLayoutEffect(() => {
    const node = bodyRef.current;
    if (!node || isExpanded || isAnimating) return;
    const measure = () => {
      setIsOverflowing(node.scrollHeight - node.clientHeight > 1);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [isExpanded, isAnimating, resetKey]);

  // The fold itself. While it runs the block carries no clamp at all — the full
  // text is laid out and an inline `max-height` does the clipping — because a
  // clamped block has already dropped the overflow from layout, so shrinking a
  // box around it would animate empty space. The clamp goes back on at the end,
  // in the same synchronous block that drops the inline height, so the two
  // never disagree for a frame.
  useLayoutEffect(() => {
    const node = bodyRef.current;
    if (!node || !isAnimating) return;

    node.style.maxHeight = "";
    const fromHeight = fromHeightRef.current;
    const toHeight = isExpanded ? node.scrollHeight : clampedHeightOf(node);

    const durationMs = foldDurationMs(Math.abs(toHeight - fromHeight));

    node.style.overflow = "hidden";
    node.style.setProperty("--expandable-text-fold-dur", `${durationMs}ms`);
    node.style.maxHeight = `${fromHeight}px`;
    // Reading a layout property commits that start height, so the write below
    // is a change the browser can interpolate rather than one it folds into a
    // single style update and paints instantly.
    void node.offsetHeight;
    node.style.maxHeight = `${toHeight}px`;

    const settle = () => {
      if (!isExpanded) node.setAttribute("data-clamped", "");
      node.style.maxHeight = "";
      node.style.overflow = "";
      node.style.removeProperty("--expandable-text-fold-dur");
      setIsAnimating(false);
    };
    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target === node && event.propertyName === "max-height")
        settle();
    };
    node.addEventListener("transitionend", onTransitionEnd);
    const timer = window.setTimeout(settle, durationMs + SETTLE_GRACE_MS);
    return () => {
      node.removeEventListener("transitionend", onTransitionEnd);
      window.clearTimeout(timer);
    };
  }, [isAnimating, isExpanded]);

  const toggle = () => {
    const node = bodyRef.current;
    const nextExpanded = !isExpanded;

    // Folding a long bio away pulls the toggle up by hundreds of pixels. If the
    // reader had scrolled past the top of the block, bring it back to them
    // rather than leaving them somewhere further down the page. Measured before
    // the fold, which is correct: only the block's own height changes, so its
    // document position is the same either side of it.
    if (!nextExpanded && node && node.getBoundingClientRect().top < 0) {
      node.scrollIntoView({
        block: "nearest",
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }

    setIsExpanded(nextExpanded);
    if (!node || prefersReducedMotion) return;
    fromHeightRef.current = node.getBoundingClientRect().height;
    setIsAnimating(true);
  };

  return (
    <>
      <p
        id={bodyId}
        ref={bodyRef}
        className={[styles.body, className].filter(Boolean).join(" ")}
        data-clamped={isExpanded || isAnimating ? undefined : ""}
        data-clamp-mode={clampMode}
        data-folding={
          isAnimating ? (isExpanded ? "open" : "closed") : undefined
        }
        style={
          {
            "--expandable-text-lines": lines,
            "--expandable-text-lines-mobile": linesMobile ?? lines,
          } as CSSProperties
        }
      >
        {children}
      </p>
      {isOverflowing && (
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={isExpanded}
          aria-controls={bodyId}
          onClick={toggle}
        >
          {isExpanded
            ? t("shared:expandableText.showLess")
            : t("shared:expandableText.readMore")}
          <FiChevronDown aria-hidden />
        </button>
      )}
    </>
  );
}

/**
 * The height the block rests at once folded, read back from the DOM rather than
 * worked out from line-height so it is exact in either clamp mode. The
 * attribute goes on and comes straight off inside one synchronous block, so
 * nothing is ever painted in the clamped state here.
 */
function clampedHeightOf(node: HTMLElement) {
  node.setAttribute("data-clamped", "");
  const height = node.getBoundingClientRect().height;
  node.removeAttribute("data-clamped");
  return height;
}
