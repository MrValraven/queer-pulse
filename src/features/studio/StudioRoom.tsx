import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioCuration } from "./api/useStudioCuration";
import { useStudioFormatReleases } from "./api/useStudioFormatReleases";
import { useStudioReleases } from "./api/useStudioReleases";
import { StudioArtistsRow } from "./StudioArtistsRow";
import { StudioCuratedShelf } from "./StudioCuratedShelf";
import { StudioFirstRun } from "./StudioFirstRun";
import { StudioFormatChips } from "./StudioFormatChips";
import { StudioFormatShelves } from "./StudioFormatShelves";
import { StudioFoundingShelf } from "./StudioFoundingShelf";
import { StudioHomeGenres } from "./StudioGenreChips";
import { StudioHomeContinue } from "./StudioHomeContinue";
import { StudioHomeHero } from "./StudioHomeHero";
import { StudioHomeScenes } from "./StudioHomeScenes";
import { StudioNewReleases } from "./StudioNewReleases";
import { StudioSetSection } from "./StudioPageSections";
import { StudioShell } from "./StudioShell";
import { homeHeroOf } from "./studioHome.data";
import { studioHomePath } from "./studioPaths";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import { useStudioActiveFormat } from "./useStudioFormatParam";
import { useStudioShowcase } from "./useStudioShowcase";
import kit from "./studioKit.module.css";

/** Studio home for a signed-in member, top to bottom: the featured release
 *  (else the newest), the format chips, Continue listening (this device's
 *  unfinished episodes), Staff picks, New this week, the Founding artists
 *  launch shelf (while staff keep it on), under All the New
 *  episodes, Spoken word and On stage shelves, Local scenes, (demo) the
 *  Wednesday set, the New releases grid and the artists behind it, both
 *  narrowed by the chosen format, and last the genre and mood tiles (hidden
 *  under Podcasts). Every shelf is one swipeable row. */
export function StudioRoom() {
  const { t } = useTranslation();
  useStudioDocumentTitle(t("studio:home.tabTitle"));
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
      <div className={kit.homeRoot}>
        <StudioHomeHero
          releasesResult={releasesResult}
          hero={hero}
          isHeroSettled={isHeroSettled}
        />
        <StudioFormatChips activeFormat={format} hrefOf={studioHomePath} />
        <StudioHomeContinue />
        <StudioCuratedShelf
          picks={curation?.staffPicks ?? []}
          titleKey="studio:home.staffPicks.title"
          shelfKey="staff-picks"
        />
        <StudioCuratedShelf
          picks={curation?.newThisWeek ?? []}
          titleKey="studio:home.newThisWeek.title"
          shelfKey="new-this-week"
        />
        <StudioFoundingShelf />
        <Collapse isOpen={format === null}>
          <StudioFormatShelves />
        </Collapse>
        <StudioHomeScenes />
        {isShowcase && <StudioSetSection />}
        <StudioNewReleases
          releasesResult={gridResult}
          heroReleaseId={format === null ? (hero.release?.id ?? null) : null}
          isHeroSettled={isHeroSettled}
        />
        <StudioArtistsRow releases={gridResult.releases} shelfKey="artists" />
        {/* Podcasts carry no genre or mood (spec 4.6). */}
        <Collapse isOpen={format !== "podcast"}>
          <StudioHomeGenres activeFormat={format} />
        </Collapse>
      </div>
      <StudioFirstRun />
    </StudioShell>
  );
}
