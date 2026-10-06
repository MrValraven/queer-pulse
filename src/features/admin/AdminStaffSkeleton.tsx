import { SkeletonAvatar, SkeletonLine } from "../../shared/components/ui";
import pageStyles from "./AdminStaffPage.module.css";
import coverageStyles from "./AdminStaffCoverage.module.css";
import rosterStyles from "./AdminStaffRows.module.css";
import rowStyles from "./AdminStaffRow.module.css";

const TILE_KEYS = ["admins", "moderators", "holders", "uncovered"];
const CARD_KEYS = ["first", "second", "third", "fourth"];
const ROW_KEYS = ["first", "second", "third", "fourth"];

/** The loaded layout in outline: four tiles, coverage cards, roster rows. */
export function AdminStaffSkeleton() {
  return (
    <div className={pageStyles.board} aria-hidden>
      <div className={pageStyles.summary}>
        {TILE_KEYS.map((tileKey) => (
          <div key={tileKey} className={pageStyles.tileSkeleton}>
            <SkeletonLine width="45%" height={10} />
            <SkeletonLine width="30%" height={30} />
            <SkeletonLine width="70%" height={10} />
          </div>
        ))}
      </div>
      <div className={coverageStyles.panel}>
        <SkeletonLine width={180} height={22} />
        <div className={coverageStyles.grid}>
          {CARD_KEYS.map((cardKey) => (
            <div key={cardKey} className={coverageStyles.cardSkeleton}>
              <SkeletonLine width="55%" height={14} />
              <SkeletonLine height={10} />
              <SkeletonLine width="80%" height={10} />
              <SkeletonLine width="40%" height={24} />
            </div>
          ))}
        </div>
      </div>
      <div className={rosterStyles.rows}>
        {ROW_KEYS.map((rowKey) => (
          <div key={rowKey} className={rowStyles.rowSkeleton}>
            <SkeletonAvatar size={40} />
            <div className={rowStyles.rowSkeletonText}>
              <SkeletonLine width="40%" height={14} />
              <SkeletonLine width="25%" height={10} />
            </div>
            <SkeletonLine width={96} height={32} />
          </div>
        ))}
      </div>
    </div>
  );
}
