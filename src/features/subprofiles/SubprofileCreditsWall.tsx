import { Collapse } from "../../shared/components/ui/Collapse";
import { Reveal } from "../../shared/components/ui/Reveal";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SubprofileCreditsWallTile } from "./SubprofileCreditsWallTile";
import type { WallTileSpan } from "./subprofileCreditsWall.data";
import {
  useSubprofileCreditsWall,
  type CreditsWallState,
} from "./useSubprofileCreditsWall";
import styles from "./SubprofileCreditsWall.module.css";

/** Milliseconds between tiles as they reveal, capped so the last tile of a
 *  nine-tile wall still lands within half a second of the first. */
const TILE_STAGGER_MS = 60;
const MAX_STAGGERED_TILES = 8;

interface SubprofileCreditsWallProps {
  /** Layout hook for the hero, applied to the wall's root. */
  className?: string;
}

/** The grid placement of one cell, read by the wall's CSS. */
function spanAttributes(span: WallTileSpan) {
  return {
    "data-column-span": span.columnSpan,
    "data-row-span": span.rowSpan,
  };
}

/**
 * The "wall of faces" beside the hero copy: a bento mosaic of personas from
 * the directory, the lead tile two by two. Skeleton tiles in the same layout
 * hold its place while the first page loads, so nothing shifts when the
 * faces arrive; then each tile reveals in turn. It renders nothing with
 * fewer than three personas (a first fetch that failed has none), and the
 * hero copy takes the full width. Faces already shown survive a failed
 * background refetch.
 *
 * Its presence rides the shared `Collapse`, so when loading settles to fewer
 * than three tiles the skeleton folds away and the copy column follows,
 * instead of snapping. `className` (the hero's layout hook) sits on the
 * Collapse wrapper, which is the flex item beside the copy.
 */
export function SubprofileCreditsWall({
  className,
}: SubprofileCreditsWallProps) {
  const wall = useSubprofileCreditsWall();

  return (
    <Collapse isOpen={wall.status !== "hidden"} className={className}>
      {wall.status === "hidden" ? null : <WallBody wall={wall} />}
    </Collapse>
  );
}

/** The wall's skeleton or tiles. Split out so the presence fold above holds
 *  the last body it drew while it folds away. */
function WallBody({
  wall,
}: {
  wall: Exclude<CreditsWallState, { status: "hidden" }>;
}) {
  const { t } = useTranslation();

  if (wall.status === "loading") {
    return (
      <div className={styles.wall}>
        <div
          className={styles.grid}
          data-columns={wall.layout.columns}
          aria-hidden
        >
          {wall.layout.spans.map((span, index) => (
            <div
              // The skeleton never reorders: a slot index is its identity.
              key={`skeleton-${index}`}
              className={styles.cell}
              {...spanAttributes(span)}
            >
              <div className={styles.skeletonTile} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wall}>
      <ul
        className={styles.grid}
        data-columns={wall.layout.columns}
        aria-label={t("subprofiles:directory.wall.label")}
      >
        {wall.tiles.map((tile, index) => {
          const span = wall.layout.spans[index];
          // The hook slices tiles to the layout's length, so every tile has
          // a span; a tile without one is skipped rather than misplaced.
          if (!span) return null;
          return (
            <Reveal
              as="li"
              key={tile.key}
              className={styles.cell}
              delay={Math.min(index, MAX_STAGGERED_TILES) * TILE_STAGGER_MS}
              {...spanAttributes(span)}
            >
              <SubprofileCreditsWallTile tile={tile} span={span} />
            </Reveal>
          );
        })}
      </ul>
    </div>
  );
}
