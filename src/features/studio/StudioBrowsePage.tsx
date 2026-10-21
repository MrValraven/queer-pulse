import { m } from "motion/react";
import { useSearchParams } from "react-router-dom";
import { FiMusic } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { routes } from "../../app/routeMap";
import {
  Collapse,
  EmptyState,
  LoadMoreFooter,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  isStudioGenre,
  isStudioMood,
  STUDIO_FORMAT_LABEL_KEY,
  STUDIO_GENRE_LABEL_KEY,
} from "./api/studio.adapters";
import { useStudioBrowseReleases } from "./api/useStudioBrowseReleases";
import { useStudioGenres } from "./api/useStudioGenres";
import { useStudioMoods } from "./api/useStudioMoods";
import type { StudioReleasesResult } from "./api/useStudioReleases";
import { StudioBrowseDefault } from "./StudioBrowseDefault";
import { useBrowseOmittedGenres } from "./StudioFormatShown";
import { StudioFormatChips } from "./StudioFormatChips";
import { StudioFilterChips } from "./StudioGenreChips";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioPlayRadioButtons } from "./StudioPlayRadioButtons";
import { StudioReleaseCard } from "./StudioReleaseCard";
import { StudioShell } from "./StudioShell";
import { StudioCardGridSkeleton } from "./StudioSkeletons";
import { browseCopyKeysOf, FORMAT_BROWSE_COPY_KEYS } from "./studioBrowse.data";
import { STUDIO_MOOD_LABEL_KEY } from "./studioDiscoveryLabels";
import { STUDIO_FADE } from "./studioMotion";
import { studioBrowsePath } from "./studioPaths";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import { useStudioActiveFormat } from "./useStudioFormatParam";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";
import s from "./studioPages.module.css";
import css from "./StudioBrowse.module.css";

function BrowseGrid({
  gridLabel,
  emptyTitle,
  result,
}: {
  gridLabel: string;
  emptyTitle: string;
  result: StudioReleasesResult;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { releases, loadState } = result;
  if (loadState.isError)
    return (
      <StudioLoadError
        loadState={loadState}
        what="studio:errors.what.releases"
      />
    );
  if (loadState.isLoading)
    return <StudioCardGridSkeleton count={8} className={styles.rowGrid} />;
  if (releases.length === 0)
    return (
      <EmptyState
        icon={<FiMusic />}
        title={emptyTitle}
        description={t("studio:browse.empty.body")}
        headingLevel={2}
        action={{ label: t("studio:states.backHomeCta"), to: routes.studio }}
      />
    );
  // The grid fades in over the skeleton it replaces.
  return (
    <m.section
      className={styles.row}
      aria-label={gridLabel}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reducedMotion ? { duration: 0.12 } : STUDIO_FADE}
    >
      <div className={styles.rowGrid}>
        {releases.map((release) => (
          <StudioReleaseCard key={release.id} release={release} />
        ))}
      </div>
      {/* The footer folds away once the last page lands. */}
      <Collapse isOpen={result.hasMore || result.isFetchNextPageError}>
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
      </Collapse>
    </m.section>
  );
}

/** /studio/browse?genre=&mood=&format=: releases in a genre, a mood, a
 *  format or a mix. Under Podcasts the genre and mood filters fold away.
 *  Every filter lives in the URL, so every chip is a link; a chosen genre
 *  or mood adds its Play radio button to the header. */
export function StudioBrowsePage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const genreParam = searchParams.get("genre");
  const moodParam = searchParams.get("mood");
  const genre = isStudioGenre(genreParam) ? genreParam : null;
  const mood = isStudioMood(moodParam) ? moodParam : null;
  const { genres, loadState: genresLoadState } = useStudioGenres();
  const { moods } = useStudioMoods();
  const format = useStudioActiveFormat();
  // Podcasts carry no genre or mood: under Podcasts those filters drop.
  const isPodcast = format === "podcast";
  const shownGenre = isPodcast ? null : genre;
  const shownMood = isPodcast ? null : mood;
  const result = useStudioBrowseReleases(shownGenre, shownMood, format);
  // "Spoken word" is a format chip already, so its genre chip steps aside.
  const omitGenres = useBrowseOmittedGenres(format, shownGenre);
  const chipGenres = genres.filter((genre) => !omitGenres.includes(genre));
  const copyKeys =
    format !== null && shownGenre === null && shownMood === null
      ? FORMAT_BROWSE_COPY_KEYS
      : browseCopyKeysOf(shownGenre, shownMood);
  const values = {
    genre: shownGenre ? t(STUDIO_GENRE_LABEL_KEY[shownGenre]) : "",
    mood: shownMood ? t(STUDIO_MOOD_LABEL_KEY[shownMood]) : "",
    format: format ? t(STUDIO_FORMAT_LABEL_KEY[format]) : "",
  };
  const hasFilter =
    shownGenre !== null || shownMood !== null || format !== null;
  // The tab names the page as its heading reads, without the emphasis tags.
  useStudioDocumentTitle(t(copyKeys.titleKey, values).replace(/<[^>]+>/g, ""));
  return (
    <StudioShell>
      <div className={s.pageH}>
        <div className={s.eb}>{t("studio:browse.eyebrow")}</div>
        <h1>
          <Translation
            i18nKey={copyKeys.titleKey}
            values={values}
            components={{ em: <em /> }}
          />
        </h1>
        <StudioPlayRadioButtons genre={shownGenre} mood={shownMood} />
      </div>
      <StudioFormatChips
        caption={t("studio:searchPage.formatLabel")}
        activeFormat={format}
        hrefOf={(chosen) =>
          chosen === "podcast"
            ? studioBrowsePath(null, null, chosen)
            : studioBrowsePath(shownGenre, shownMood, chosen)
        }
      />
      <Collapse isOpen={!isPodcast}>
        <>
          {genresLoadState.isError ? (
            <StudioLoadError
              loadState={genresLoadState}
              what="studio:errors.what.genres"
            />
          ) : genres.length > 0 ? (
            <StudioFilterChips
              facet={{ kind: "genre", values: chipGenres }}
              caption={t("studio:searchPage.genreLabel")}
              activeGenre={shownGenre}
              activeMood={shownMood}
              activeFormat={format}
              label={t("studio:home.genres.listLabel")}
              hasAnyChip
            />
          ) : (
            !genresLoadState.isLoading && (
              <p className={css.note}>{t("studio:browse.noGenres")}</p>
            )
          )}
          <Collapse isOpen={moods.length > 0}>
            <StudioFilterChips
              facet={{ kind: "mood", values: moods }}
              caption={t("studio:searchPage.moodLabel")}
              activeGenre={shownGenre}
              activeMood={shownMood}
              activeFormat={format}
              label={t("studio:home.moods.listLabel")}
              hasAnyChip
            />
          </Collapse>
        </>
      </Collapse>
      {hasFilter ? (
        <BrowseGrid
          key={`${shownGenre ?? "any"}:${shownMood ?? "any"}:${format ?? "any"}`}
          gridLabel={t(copyKeys.gridLabelKey, values)}
          emptyTitle={t(copyKeys.emptyTitleKey, values)}
          result={result}
        />
      ) : (
        !genresLoadState.isError && (
          <>
            <p className={css.note}>{t("studio:browse.pickPrompt")}</p>
            <StudioBrowseDefault omitGenres={omitGenres} />
          </>
        )
      )}
    </StudioShell>
  );
}
