/** The shared Collapse curve and its fast length, for a tile's tags, rings and failure badge. */
export const VJ_TILE_EASE = [0.22, 0.68, 0.16, 1] as const;
export const VJ_TILE_MOTION_SECONDS = 0.2;

/** How far the incoming grid rises as it fades in on a pack or source switch. */
export const VJ_GRID_SWAP_RISE_PX = 6;

/** A tile's resting scale when it fades in or out of the grid. */
export const VJ_GRID_ITEM_HIDDEN_SCALE = 0.96;

/** The grid and tile transition: the tile curve, instant under reduced motion. */
export function vjGridTransition(isReducedMotion: boolean) {
  return isReducedMotion
    ? { duration: 0 }
    : { duration: VJ_TILE_MOTION_SECONDS, ease: VJ_TILE_EASE };
}
