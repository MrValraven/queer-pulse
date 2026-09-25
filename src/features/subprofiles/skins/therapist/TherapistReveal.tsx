import { useContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  m,
  PresenceContext,
  useIsPresent,
} from "motion/react";
import { cx } from "../../../../shared/lib/cx";
import {
  RevealListContext,
  useRevealList,
  useRevealTransition,
  useRowReveal,
} from "./revealKeys";
import styles from "./therapistShared.module.css";

/* Edits to the therapist page animate; its first render never does (the
   public page's load, the editor preview's mount, a device switch). Nothing
   here uses Motion's `layout` or a measured rect: the editor preview shrinks
   the page with CSS `zoom`, and a rect comes back in zoomed pixels. */

interface RevealBlockProps {
  /** Mounts the children and grows them in; false folds them away and
   *  unmounts them once folded. */
  isShown: boolean;
  children: ReactNode;
  /** On the outer wrapper, the box the parent lays out. */
  className?: string;
  /** The parent's gap along the block axis, in CSS pixels, when the parent
   *  is a flex or grid column (the reading column's 16px). A folded block
   *  pulls it back with a negative bottom margin, so it takes no room. */
  parentGap?: number;
}

/**
 * A block that grows in when it appears and folds away when it goes. The
 * wrapper's single grid row animates 0fr to 1fr with the opacity; its inner
 * box contains the children's margins, so they count toward the height
 * throughout and never collapse with the block's neighbours. Clipping holds
 * only while the row moves, so focus rings show at rest.
 */
export function RevealBlock({
  isShown,
  children,
  className,
  parentGap = 0,
}: RevealBlockProps) {
  return (
    <AnimatePresence initial={false}>
      {isShown && (
        <RevealBlockFrame
          key="reveal"
          className={className}
          parentGap={parentGap}
        >
          {children}
        </RevealBlockFrame>
      )}
    </AnimatePresence>
  );
}

/** The animated wrapper. It clips while its row moves: from the first frame
 *  of a grow (a first render that AnimatePresence holds still starts
 *  unclipped), through a fold, and again from the render a folding block
 *  comes back in, until that grow ends. The clip is React state, so it lands
 *  in the same commit as the change that starts the move. */
function RevealBlockFrame({
  children,
  className,
  parentGap,
}: Omit<RevealBlockProps, "isShown"> & { parentGap: number }) {
  const transition = useRevealTransition();
  const isPresent = useIsPresent();
  const isFirstRenderHeld = useContext(PresenceContext)?.initial === false;
  const [isGrowing, setIsGrowing] = useState(!isFirstRenderHeld);
  const [wasPresent, setWasPresent] = useState(isPresent);
  if (wasPresent !== isPresent) {
    setWasPresent(isPresent);
    if (isPresent) setIsGrowing(true);
  }
  const foldedMargin = parentGap > 0 ? { marginBottom: -parentGap } : {};
  const restMargin = parentGap > 0 ? { marginBottom: 0 } : {};
  return (
    <m.div
      className={cx(styles.reveal, className)}
      style={{ overflow: isGrowing || !isPresent ? "hidden" : undefined }}
      initial={{ gridTemplateRows: "0fr", opacity: 0, ...foldedMargin }}
      animate={{ gridTemplateRows: "1fr", opacity: 1, ...restMargin }}
      exit={{ gridTemplateRows: "0fr", opacity: 0, ...foldedMargin }}
      transition={transition}
      onAnimationComplete={() => {
        if (isPresent) setIsGrowing(false);
      }}
    >
      <div className={styles.revealInner}>{children}</div>
    </m.div>
  );
}

/**
 * AnimatePresence for a list of reveal items (`RevealListItem`, `RevealRow`,
 * `RevealPop`, `TherapistChip`): wrap the `.map` in it, keyed with
 * `occurrenceKeys`. Items must be its direct children. The list's first
 * render shows as is; an item added later animates in, and a removed item
 * animates out before it unmounts.
 */
export function RevealList({ children }: { children: ReactNode }) {
  const hasMountedRef = useRef(false);
  // Passive, so it runs after every item's layout effect of the first commit.
  useEffect(() => {
    hasMountedRef.current = true;
  }, []);
  return (
    <RevealListContext.Provider value={hasMountedRef}>
      <AnimatePresence initial={false}>{children}</AnimatePresence>
    </RevealListContext.Provider>
  );
}

interface RevealRowProps {
  children: ReactNode;
  className?: string;
  /** The list's own gap in CSS pixels (a flex column's `gap`), pulled back
   *  while the row is folded so the rows below glide without a final snap. */
  parentGap?: number;
}

/** An `<li>` that grows in and folds away. A direct child of `RevealList`. */
export function RevealListItem({
  children,
  className,
  parentGap = 0,
}: RevealRowProps) {
  const rowRef = useRowReveal<HTMLLIElement>(parentGap);
  return (
    <li ref={rowRef} className={className}>
      {children}
    </li>
  );
}

/** A `<div>` row that grows in and folds away. A direct child of
 *  `RevealList`. */
export function RevealRow({
  children,
  className,
  parentGap = 0,
}: RevealRowProps) {
  const rowRef = useRowReveal<HTMLDivElement>(parentGap);
  return (
    <div ref={rowRef} className={className}>
      {children}
    </div>
  );
}

const POP_HIDDEN = { opacity: 0, scale: 0.85 };
const POP_SHOWN = { opacity: 1, scale: 1 };

/** A `<span>` (or, with `as="li"`, an `<li>`) that pops in and out as the
 *  editor's chips do (fade and scale from 0.85), for items in a wrapping row
 *  or grid cells. It keeps its place while it fades out; the items after it
 *  close up once it unmounts. Inside `RevealList` only it animates. */
export function RevealPop({
  children,
  className,
  as = "span",
}: {
  children: ReactNode;
  className?: string;
  /** The element: `li` for a cell that is a direct child of its list. */
  as?: "span" | "li";
}) {
  const transition = useRevealTransition();
  const isInList = useRevealList() !== null;
  const motionProps = {
    className,
    initial: isInList ? POP_HIDDEN : false,
    animate: POP_SHOWN,
    exit: POP_HIDDEN,
    transition,
  };
  return as === "li" ? (
    <m.li {...motionProps}>{children}</m.li>
  ) : (
    <m.span {...motionProps}>{children}</m.span>
  );
}
