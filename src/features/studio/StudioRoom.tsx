import { Collapse } from "../../shared/components/ui";
import { useStudioCuration } from "./api/useStudioCuration";
import { useStudioFormatReleases } from "./api/useStudioFormatReleases";
import { useStudioReleases } from "./api/useStudioReleases";
import { StudioArtistsRow } from "./StudioArtistsRow";
import { StudioCuratedShelf } from "./StudioCuratedShelf";
import { StudioFormatChips } from "./StudioFormatChips";
import { StudioFormatShelves } from "./StudioFormatShelves";
import { StudioHomeGenres } from "./StudioGenreChips";
import { StudioHomeHero } from "./StudioHomeHero";
import { StudioHomeScenes } from "./StudioHomeScenes";
import { StudioNewReleases } from "./StudioNewReleases";
import { StudioSetSection } from "./StudioPageSections";
import { StudioShell } from "./StudioShell";
import { homeHeroOf } from "./studioHome.data";
import { studioHomePath } from "./studioPaths";
import { useStudioActiveFormat } from "./useStudioFormatParam";
import { useStudioShowcase } from "./useStudioShowcase";

/** Studio home for a signed-in member, top to bottom: the featured release
 *  (else the newest), the format chips, genre and mood chips (hidden under
 *  Podcasts), Staff picks, New this week, scenes, under All the New
 *  episodes, Spoken word and On stage shelves, (demo) the Wednesday set, the
 *  new releases grid and the artists behind them, both narrowed by the
 *  chosen format. */
export function StudioRoom() {
  const releasesResult = useStudioReleases();
  // Artist kinds: a format chip narrows New releases and Artists; the hero
  // and the curated shelves keep reading every format (spec 5.1).
  const format = useStudioActiveFormat();
  const formatReleasesResult = useStudioFormatReleases(format);
  const gridResult = format === null ? releasesResult : formatReleasesResult;
  const { curation, loadState: curationLoadState } = useStudioCuration();
  const isShowcase = useStudioShowcase();
  // The hero waits for curation to settle (read or failed), so a featured
  // pick never swaps in over a newest release already on screen.
  const isHeroSettled = !curationLoadState.isLoading;
  const hero = homeHeroOf(curation?.featured ?? null, releasesResult.releases);
  return (
    <StudioShell>
      <StudioHomeHero
        releasesResult={releasesResult}
        hero={hero}
        isHeroSettled={isHeroSettled}
      />
      <StudioFormatChips activeFormat={format} hrefOf={studioHomePath} />
      {/* Podcasts carry no genre or mood (spec 4.6). */}
      <Collapse isOpen={format !== "podcast"}>
        <StudioHomeGenres />
      </Collapse>
      <StudioCuratedShelf
        picks={curation?.staffPicks ?? []}
        titleKey="studio:home.staffPicks.title"
      />
      <StudioCuratedShelf
        picks={curation?.newThisWeek ?? []}
        titleKey="studio:home.newThisWeek.title"
      />
      <StudioHomeScenes />
      <Collapse isOpen={format === null}>
        <StudioFormatShelves />
      </Collapse>
      {isShowcase && <StudioSetSection />}
      <StudioNewReleases
        releasesResult={gridResult}
        heroReleaseId={format === null ? (hero.release?.id ?? null) : null}
        isHeroSettled={isHeroSettled}
      />
      <StudioArtistsRow releases={gridResult.releases} />
    </StudioShell>
  );
}
