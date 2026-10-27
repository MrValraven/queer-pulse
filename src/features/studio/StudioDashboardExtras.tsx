import { Collapse } from "../../shared/components/ui";
import type { StudioArtistRefView } from "./api/studio.adapters";
import type { StudioDashboardStatsView } from "./api/studioDashboard.adapters";
import { StudioFollowerGrowthChart } from "./StudioFollowerGrowthChart";
import { StudioMilestonesCard } from "./StudioMilestonesCard";
import { StudioPlacementsCard } from "./StudioPlacementsCard";
import { StudioPlaysTrendChart } from "./StudioPlaysTrendChart";
import { StudioTopSupportersCard } from "./StudioTopSupportersCard";
import css from "./StudioDashboardExtras.module.css";

/** Under the follower total on /studio/dashboard, in this order: the plays
 *  trend across the full width, the follower growth chart across the full
 *  width, then a grid with Top supporters spanning both columns above "Where
 *  your music lives" and the milestones side by side from 900px. The plays
 *  trend and Top supporters mount only when the server sent plays, and
 *  never for a podcast persona: episodes never count, so a show's plays
 *  read nothing. The growth chart shows only when the server sent its
 *  weeks, so an older server leaves no "Nobody new followed" note behind.
 *  Milestones apply to every artist kind, so no persona kind is checked. */
export function StudioDashboardExtras({
  persona,
  stats,
}: {
  persona: StudioArtistRefView;
  stats: StudioDashboardStatsView;
}) {
  const hasFollowerGrowth = stats.followerGrowth.length > 0;
  const isCountingPlays = stats.hasPlays && persona.format !== "podcast";
  return (
    <div className={css.extras}>
      <Collapse isOpen={isCountingPlays}>
        <div className={css.plays}>
          <StudioPlaysTrendChart subprofileId={persona.id} />
        </div>
      </Collapse>
      <Collapse isOpen={hasFollowerGrowth}>
        <div className={css.growth}>
          <StudioFollowerGrowthChart weeks={stats.followerGrowth} />
        </div>
      </Collapse>
      <div className={css.pair}>
        <Collapse isOpen={isCountingPlays} className={css.supporters}>
          <StudioTopSupportersCard
            subprofileId={persona.id}
            personaName={persona.name}
          />
        </Collapse>
        <StudioPlacementsCard subprofileId={persona.id} />
        <StudioMilestonesCard persona={persona} />
      </div>
    </div>
  );
}
