import type { ReactNode, Ref } from "react";
import { m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { keepOnFrameLoop } from "../../../gatherings/checkin/checkinMotion";
import { VJ_GRID_ITEM_HIDDEN_SCALE, vjGridTransition } from "./vjTileMotion";

const VJ_GRID_ITEM_HIDDEN = { opacity: 0, scale: VJ_GRID_ITEM_HIDDEN_SCALE };
const VJ_GRID_ITEM_SHOWN = { opacity: 1, scale: 1 };

export interface VjGridItemProps {
  children: ReactNode;
  /** Set by the list's `AnimatePresence` (popLayout) to measure the leaving cell. */
  ref?: Ref<HTMLLIElement>;
}

/**
 * One cell of the clip grid. It fades and scales in and out with opacity and
 * transform only. A leaving tile is popped out of the grid's flow (the list's
 * `AnimatePresence mode="popLayout"`), so the tiles after it glide to their
 * new cells at once through `layout="position"`. While it leaves it is
 * `inert`, so focus and taps never land on a tile on its way out, and the
 * grid's arrow keys skip it. Reduced motion makes it instant.
 * `keepOnFrameLoop` keeps the last opacity frame from flashing back.
 */
export function VjGridItem({ children, ref }: VjGridItemProps): ReactNode {
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  return (
    <m.li
      ref={ref}
      inert={!isPresent}
      layout={reducedMotion ? false : "position"}
      onUpdate={keepOnFrameLoop}
      initial={VJ_GRID_ITEM_HIDDEN}
      animate={VJ_GRID_ITEM_SHOWN}
      exit={VJ_GRID_ITEM_HIDDEN}
      transition={vjGridTransition(reducedMotion)}
    >
      {children}
    </m.li>
  );
}
