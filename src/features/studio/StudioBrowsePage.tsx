import { useSearchParams } from "react-router-dom";
import { FiMusic } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { EmptyState, LoadMoreFooter } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isStudioGenre, STUDIO_GENRE_LABEL_KEY } from "./api/studio.adapters";
import { useStudioBrowseReleases } from "./api/useStudioBrowseReleases";
import { useStudioGenres } from "./api/useStudioGenres";
import type { StudioReleasesResult } from "./api/useStudioReleases";
import { StudioGenreChips } from "./StudioGenreChips";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioReleaseCard } from "./StudioReleaseCard";
import { StudioShell } from "./StudioShell";
import { StudioCardGridSkeleton } from "./StudioSkeletons";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";
import s from "./studioPages.module.css";
import css from "./StudioBrowse.module.css";

function BrowseGrid({
  genreLabel,
  result,
}: {
  genreLabel: string;
  result: StudioReleasesResult;
}) {
  const { t } = useTranslation();
  const { releases, loadState } = result;
  if (loadState.isError) return <StudioLoadError loadState={loadState} />;
  if (loadState.isLoading)
    return <StudioCardGridSkeleton count={8} className={styles.rowGrid} />;
  if (releases.length === 0)
    return (
      <EmptyState
        icon={<FiMusic />}
        title={t("studio:browse.empty.title", { genre: genreLabel })}
        description={t("studio:browse.empty.body")}
        headingLevel={2}
        action={{ label: t("studio:states.backHomeCta"), to: routes.studio }}
      />
    );
  return (
    <section
      className={styles.row}
      aria-label={t("studio:browse.gridLabel", { genre: genreLabel })}
    >
      <div className={styles.rowGrid}>
        {releases.map((release) => (
          <StudioReleaseCard key={release.id} release={release} />
        ))}
      </div>
      {(result.hasMore || result.isFetchNextPageError) && (
        <div className={kit.moreFooter}>
          <LoadMoreFooter
            isFetchingNextPage={result.isFetchingNextPage}
            isFetchNextPageError={result.isFetchNextPageError}
            onLoadMore={result.fetchNextPage}
            label={t("studio:home.newReleases.showMore")}
            loadingLabel={t("studio:home.newReleases.loadingMore")}
            errorMessage={t("studio:home.newReleases.loadMoreError")}
          />
        </div>
      )}
    </section>
  );
}

/** /studio/browse?genre=: one genre's published releases, the genre chips
 *  as the filter. The genre lives in the URL, so a chip is a link. */
export function StudioBrowsePage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const genreParam = searchParams.get("genre");
  const genre = isStudioGenre(genreParam) ? genreParam : null;
  const { genres, loadState: genresLoadState } = useStudioGenres();
  const result = useStudioBrowseReleases(genre);
  const genreLabel = genre ? t(STUDIO_GENRE_LABEL_KEY[genre]) : "";
  return (
    <StudioShell>
      <div className={s.pageH}>
        <div className={s.eb}>{t("studio:browse.eyebrow")}</div>
        <h1>
          <Translation
            i18nKey={genre ? "studio:browse.title" : "studio:browse.titleNone"}
            values={{ genre: genreLabel }}
            components={{ em: <em /> }}
          />
        </h1>
      </div>
      {genresLoadState.isError ? (
        <StudioLoadError loadState={genresLoadState} />
      ) : genres.length > 0 ? (
        <StudioGenreChips
          genres={genres}
          activeGenre={genre}
          label={t("studio:home.genres.listLabel")}
        />
      ) : (
        !genresLoadState.isLoading && (
          <p className={css.note}>{t("studio:browse.noGenres")}</p>
        )
      )}
      {genre ? (
        <BrowseGrid key={genre} genreLabel={genreLabel} result={result} />
      ) : (
        !genresLoadState.isError && (
          <p className={css.note}>{t("studio:browse.pickPrompt")}</p>
        )
      )}
    </StudioShell>
  );
}
