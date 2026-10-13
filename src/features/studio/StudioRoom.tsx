import { useStudioReleases } from "./api/useStudioReleases";
import { StudioArtistsRow } from "./StudioArtistsRow";
import { StudioHomeHero } from "./StudioHomeHero";
import { StudioNewReleases } from "./StudioNewReleases";
import { StudioSetSection } from "./StudioPageSections";
import { StudioShell } from "./StudioShell";
import { useStudioShowcase } from "./useStudioShowcase";

/** Studio home for a signed-in member: the newest release, the new releases
 *  grid, the artists behind them, and (demo) the Wednesday set. */
export function StudioRoom() {
  const releasesResult = useStudioReleases();
  const isShowcase = useStudioShowcase();
  return (
    <StudioShell>
      <StudioHomeHero releasesResult={releasesResult} />
      {isShowcase && <StudioSetSection />}
      <StudioNewReleases releasesResult={releasesResult} />
      <StudioArtistsRow releases={releasesResult.releases} />
    </StudioShell>
  );
}
