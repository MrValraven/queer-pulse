import type { StudioGenre } from "./api/studio.types";
import { useStudioReleases } from "./api/useStudioReleases";
import { StudioHomeGenres } from "./StudioGenreChips";
import { StudioNewReleases } from "./StudioNewReleases";

/** Browse before a filter is chosen: the genre and mood tiles, then the
 *  newest releases, so the page opens on music to explore. */
export function StudioBrowseDefault({
  omitGenres,
}: {
  omitGenres: readonly StudioGenre[];
}) {
  const releasesResult = useStudioReleases();
  return (
    <>
      <StudioHomeGenres omitGenres={omitGenres} hasSeeAll={false} />
      <StudioNewReleases
        releasesResult={releasesResult}
        heroReleaseId={null}
        isHeroSettled
      />
    </>
  );
}
