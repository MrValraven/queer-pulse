import { m, useIsPresent, type HTMLMotionProps } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { cx } from "../../shared/lib/cx";
import {
  REORDER_DURATION,
  REORDER_EASE,
  reorderLayoutTransition,
} from "./reorderMotion";
import styles from "./ReorderRow.module.css";

/** A row the person just added eases in: a short fade and a small drop,
 *  matching `SkinListRow`. */
const ENTER_DURATION = 0.18;
const ENTER_OFFSET = -4;

type ReorderRowProps = Omit<
  HTMLMotionProps<"div">,
  "layout" | "layoutDependency" | "transition" | "initial" | "animate" | "exit"
> & {
  /** True while this row is held under the pointer. The drag engine moves
   *  the held row itself, so its own glide is instant. */
  isDragging?: boolean;
  /** A row added in this session: eases in on mount. Rows present on the
   *  first render appear as they are, and a swap never replays it. */
  isEntering?: boolean;
  /** From `useReorderableRows().moveCount`. When given, the row glides only
   *  on a render where the list moved, so an insert, a removal or a field
   *  growing as the person types reflows without a glide. */
  moveCount?: number;
  /** The list's own gap in CSS pixels, when the rows sit in an
   *  `AnimatePresence`. The row then grows in from no height (on
   *  `isEntering`) and folds away when removed, pulling the gap back with a
   *  negative bottom margin, so the rows below glide up and nothing snaps at
   *  the end. A folding row is `inert` and left out of the list's reorder
   *  maths (`liveRowsOf`). */
  foldGap?: number;
};

/** A folded row: no height, the list gap pulled back, transparent. It clips
 *  only while it moves, so focus rings and an open select show at rest. */
function foldedRow(foldGap: number) {
  return {
    height: 0,
    opacity: 0,
    marginBottom: -foldGap,
    overflow: "hidden",
  };
}
const OPEN_ROW = {
  height: "auto",
  opacity: 1,
  marginBottom: 0,
  transitionEnd: { overflow: "visible" },
};

/**
 * One row of a reorderable editor list: a motion `layout="position"` wrapper,
 * so a drag, an Alt+arrow or a move button glides every row into its new slot.
 * Position only, since rows holding growing fields change height as the person
 * types and a size animation would stretch the text. Instant under reduced
 * motion. Carries `REORDER_ROW_ATTRIBUTE` (`data-reorder-row`) for
 * `useReorderableRows`, and no CSS transition, so the drag's `translate` and
 * motion's `transform` land on the frame they are set.
 */
export function ReorderRow({
  isDragging = false,
  isEntering = false,
  moveCount,
  foldGap,
  className,
  ...props
}: ReorderRowProps) {
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const isFoldable = foldGap !== undefined;
  const entering = isFoldable
    ? { initial: foldedRow(foldGap), animate: OPEN_ROW }
    : {
        initial: { opacity: 0, y: ENTER_OFFSET },
        animate: { opacity: 1, y: 0 },
      };
  return (
    <m.div
      {...props}
      className={cx(styles.row, className)}
      data-reorder-row=""
      // A folding row keeps the handlers of its last render, whose index now
      // names another row, so it takes no input while it goes.
      inert={isFoldable && !isPresent}
      layout="position"
      layoutDependency={moveCount}
      initial={isEntering ? entering.initial : false}
      animate={isEntering || isFoldable ? entering.animate : undefined}
      exit={isFoldable ? foldedRow(foldGap) : undefined}
      transition={{
        duration: reducedMotion
          ? 0
          : isFoldable
            ? REORDER_DURATION
            : ENTER_DURATION,
        ease: REORDER_EASE,
        layout: isDragging
          ? { duration: 0 }
          : reorderLayoutTransition(reducedMotion),
      }}
    />
  );
}
