import type { ReactNode } from "react";
import { Reveal } from "../../shared/components/ui/Reveal";
import type { WallTileView } from "./api/directoryCard.adapters";
import { SubprofileCreditsWallTile } from "./SubprofileCreditsWallTile";
import type { WallLayout, WallTileSpan } from "./subprofileCreditsWall.data";
import styles from "./SubprofileCreditsWall.module.css";

/** Milliseconds between tiles as they reveal, capped so the last tile of a
 *  nine-tile wall still lands within half a second of the first. */
const TILE_STAGGER_MS = 60;
const MAX_STAGGERED_TILES = 8;

/** A device the grid draws for whatever the viewport is. */
export type WallGridDevice = "desktop" | "phone";

export interface SubprofileCreditsWallGridProps {
  layout: WallLayout;
  tiles: readonly WallTileView[];
  /** The list's accessible name. */
  label: string;
  /** Draws the grid for this device whatever the viewport (the admin
   *  preview); the public wall leaves it out and follows the viewport. */
  device?: WallGridDevice;
  /** A mark drawn on a tile's corner (the admin preview's Picked or Filled). */
  badgeFor?: (tile: WallTileView, index: number) => ReactNode;
}

/** The grid placement of one cell, read by the wall's CSS. */
// eslint-disable-next-line react-refresh/only-export-components -- the wall's skeleton and the admin preview place cells with this same helper
export function wallSpanAttributes(span: WallTileSpan): {
  "data-column-span": 1 | 2;
  "data-row-span": 1 | 2;
} {
  return {
    "data-column-span": span.columnSpan,
    "data-row-span": span.rowSpan,
  };
}

/**
 * The wall's tiles laid out as a bento mosaic, one linked face per span of
 * the layout, each revealing in turn. The public wall and the admin preview
 * both draw it, so the preview matches the real wall tile for tile.
 */
export function SubprofileCreditsWallGrid({
  layout,
  tiles,
  label,
  device,
  badgeFor,
}: SubprofileCreditsWallGridProps) {
  return (
    <div className={styles.wall}>
      <ul
        className={styles.grid}
        data-columns={layout.columns}
        data-device={device}
        aria-label={label}
      >
        {tiles.map((tile, index) => {
          const span = layout.spans[index];
          // Tiles beyond the layout have no span and are skipped, so a long
          // list never draws a misplaced tile.
          if (!span) return null;
          return (
            <Reveal
              as="li"
              key={tile.key}
              className={styles.cell}
              delay={Math.min(index, MAX_STAGGERED_TILES) * TILE_STAGGER_MS}
              {...wallSpanAttributes(span)}
            >
              <SubprofileCreditsWallTile
                tile={tile}
                span={span}
                badge={badgeFor?.(tile, index)}
              />
            </Reveal>
          );
        })}
      </ul>
    </div>
  );
}
