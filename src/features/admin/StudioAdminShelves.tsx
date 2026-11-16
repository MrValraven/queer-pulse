import { SkeletonLine } from "../../shared/components/ui";
import { useAdminStudioCuration } from "./api/StudioAdminCurationHooks";
import { StudioAdminFeaturedShelf } from "./StudioAdminFeaturedShelf";
import { StudioAdminShelf } from "./StudioAdminShelf";
import { picksOnShelf } from "./studioAdmin.model";
import { StudioAdminReadNotice } from "./StudioAdminReadNotice";
import css from "./StudioAdminShelves.module.css";

/** The two list shelves, in the order Studio home shows them. */
const LIST_SHELVES = ["staff_picks", "new_this_week"] as const;

const SKELETON_SLEEVE_IDS = ["sleeve-1", "sleeve-2", "sleeve-3", "sleeve-4"];
const SKELETON_RADIUS = { borderRadius: "var(--radius-12)" };

/** The tab's shapes while curation loads: the featured card with its cover
 *  and lines, then two shelves of sleeves. */
function StudioAdminShelvesSkeleton() {
  return (
    <div className={css.shelves} aria-hidden>
      <div className={css.featured}>
        <div className={css.featuredBody}>
          <span className={css.featuredCover}>
            <SkeletonLine height="100%" style={SKELETON_RADIUS} />
          </span>
          <div className={css.featuredInfo}>
            <SkeletonLine width="22%" height={12} />
            <SkeletonLine width="58%" height={30} />
            <SkeletonLine width="34%" height={14} />
            <SkeletonLine width="46%" height={14} />
          </div>
        </div>
      </div>
      {LIST_SHELVES.map((shelf) => (
        <div key={shelf} className={css.shelf}>
          <SkeletonLine width="30%" height={22} />
          <div className={css.grid}>
            {SKELETON_SLEEVE_IDS.map((sleeveId) => (
              <span key={sleeveId} className={css.skeletonSleeve}>
                <SkeletonLine height="100%" style={SKELETON_RADIUS} />
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** The Shelves tab: the featured slot as its hero card, then Staff picks
 *  and New this week as grids of record sleeves. */
export function StudioAdminShelves() {
  const { data, isLoading, error, refetch } = useAdminStudioCuration();
  if (isLoading) return <StudioAdminShelvesSkeleton />;
  if (data === undefined)
    return (
      <StudioAdminReadNotice error={error} onRetry={() => void refetch()} />
    );
  return (
    <div className={css.shelves}>
      <StudioAdminFeaturedShelf
        pick={picksOnShelf(data, "featured")[0] ?? null}
      />
      {LIST_SHELVES.map((shelf) => (
        <StudioAdminShelf
          key={shelf}
          shelf={shelf}
          picks={picksOnShelf(data, shelf)}
        />
      ))}
    </div>
  );
}
