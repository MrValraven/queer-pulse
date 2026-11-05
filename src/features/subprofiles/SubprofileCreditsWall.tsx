import { Collapse } from "../../shared/components/ui/Collapse";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  SubprofileCreditsWallGrid,
  wallSpanAttributes,
} from "./SubprofileCreditsWallGrid";
import {
  useSubprofileCreditsWall,
  type CreditsWallState,
} from "./useSubprofileCreditsWall";
import styles from "./SubprofileCreditsWall.module.css";

interface SubprofileCreditsWallProps {
  /** Layout hook for the hero, applied to the wall's root. */
  className?: string;
}

/**
 * The "wall of faces" beside the hero copy: a bento mosaic of personas from
 * the curated wall (the admin's picks, then the automatic fill), the lead
 * tile two by two. Skeleton tiles in the same layout hold its place while
 * the wall loads, so nothing shifts when the faces arrive; then each tile
 * reveals in turn. It renders nothing with fewer than three personas (a first
 * fetch that failed has none), and the hero copy takes the full width. Faces
 * already shown survive a failed background refetch.
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
              {...wallSpanAttributes(span)}
            >
              <div className={styles.skeletonTile} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <SubprofileCreditsWallGrid
      layout={wall.layout}
      tiles={wall.tiles}
      label={t("subprofiles:directory.wall.label")}
    />
  );
}
