import type { ReactNode, Ref } from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { keepOnFrameLoop } from "../../../gatherings/checkin/checkinMotion";
import { VJ_GRID_SWAP_RISE_PX, vjGridTransition } from "./vjTileMotion";
import styles from "./VjGrid.module.css";

export interface VjGridListProps {
  /** The grid's accessible name. */
  label: string;
  /** The `VjGridItem` cells, each keyed by its clip or generator id. */
  children: ReactNode;
  /** Set by the grid's `AnimatePresence` (popLayout) to measure the leaving grid. */
  ref?: Ref<HTMLUListElement>;
}

/**
 * One whole grid of tiles: the active pack's clips or the generators. The
 * grid keys it by pack or source, so a switch crossfades the two grids as
 * units: the leaving grid is popped out of flow over the stage and fades out
 * while the new one fades in with a small rise, opacity and transform only.
 * The leaving grid is `inert`. Tiles that come and go inside one grid run
 * through their own `AnimatePresence`, so a search filter or a clip added or
 * removed fades just those tiles.
 */
export function VjGridList({
  label,
  children,
  ref,
}: VjGridListProps): ReactNode {
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  return (
    <m.ul
      ref={ref}
      className={styles.grid}
      aria-label={label}
      inert={!isPresent}
      onUpdate={keepOnFrameLoop}
      initial={{ opacity: 0, y: VJ_GRID_SWAP_RISE_PX }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={vjGridTransition(reducedMotion)}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {children}
      </AnimatePresence>
    </m.ul>
  );
}
