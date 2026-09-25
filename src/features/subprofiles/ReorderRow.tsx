import { m, type HTMLMotionProps } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { cx } from "../../shared/lib/cx";
import { REORDER_EASE, reorderLayoutTransition } from "./reorderMotion";
import styles from "./ReorderRow.module.css";

/** A row the person just added eases in: a short fade and a small drop,
 *  matching `SkinListRow`. */
const ENTER_DURATION = 0.18;
const ENTER_OFFSET = -4;

type ReorderRowProps = Omit<
  HTMLMotionProps<"div">,
  "layout" | "layoutDependency" | "transition" | "initial" | "animate"
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
  className,
  ...props
}: ReorderRowProps) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <m.div
      {...props}
      className={cx(styles.row, className)}
      data-reorder-row=""
      layout="position"
      layoutDependency={moveCount}
      initial={isEntering ? { opacity: 0, y: ENTER_OFFSET } : false}
      animate={isEntering ? { opacity: 1, y: 0 } : undefined}
      transition={{
        duration: reducedMotion ? 0 : ENTER_DURATION,
        ease: REORDER_EASE,
        layout: isDragging
          ? { duration: 0 }
          : reorderLayoutTransition(reducedMotion),
      }}
    />
  );
}
