import { useId, type ReactNode } from "react";
import { FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Collapse, LoadMoreFooter } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioSearchView } from "./api/studio.adapters";
import type { StudioFormat, StudioSearchType } from "./api/studio.types";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import { StudioShelf } from "./kit/StudioShelf";
import shelfCss from "./kit/StudioShelf.module.css";
import { StudioArtistCard } from "./StudioArtistCard";
import { StudioPlaylistCard } from "./StudioPlaylistCard";
import { StudioReleaseCard } from "./StudioReleaseCard";
import { StudioSearchTrackRow } from "./StudioSearchTrackRow";
import {
  STUDIO_SEARCH_ALL_VIEW_TRACKS,
  STUDIO_SEARCH_PAGE_SIZE,
} from "./studioSearch.data";
import { studioReasonCopyKey, type StudioFailureReason } from "./studioReason";
import searchStyles from "./StudioSearch.module.css";

export interface StudioSearchPaging {
  hasMore: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  nextPageReason: StudioFailureReason;
  fetchNextPage: () => void;
}

type ResultType = Exclude<StudioSearchType, "all">;

/** "See all 20+" once a section came back full (it may hold more), else
 *  "See all 6". */
function useSeeAllLabel() {
  const { t } = useTranslation();
  return (count: number) =>
    count >= STUDIO_SEARCH_PAGE_SIZE
      ? t("studio:searchPage.seeAllMore", { count })
      : t("studio:searchPage.seeAll", { count });
}

/** The track hits, as the shared rows under a shelf-style heading. */
function TrackSection({
  title,
  seeAllHref,
  seeAllLabel,
  children,
}: {
  title: ReactNode;
  seeAllHref?: string;
  seeAllLabel?: string;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section className={shelfCss.shelf} aria-labelledby={headingId}>
      <header className={shelfCss.head}>
        <div className={shelfCss.headText}>
          <h2 id={headingId} className={shelfCss.title}>
            {title}
          </h2>
        </div>
        {seeAllHref && (
          <Link
            to={seeAllHref}
            className={shelfCss.seeAll}
            aria-describedby={headingId}
          >
            {seeAllLabel}
            <FiChevronRight aria-hidden />
          </Link>
        )}
      </header>
      <ol className={searchStyles.trackList}>{children}</ol>
    </section>
  );
}

/** The server's answer, rendered as it came: no client filter runs over it.
 *  `query`, `type` and the facets the server applied are the ones this
 *  result answers; `type` picks the sections shown. The all-types view is
 *  a set of shelves, each with "See all" into its type tab; a type tab is
 *  a grid that pages with Show more to the end of the set (ENG-05). */
export function StudioSearchResults({
  result,
  type,
  format = null,
  hrefFor,
  paging,
}: {
  result: StudioSearchView;
  type: StudioSearchType;
  /** The format the result answers: Podcasts heads the section Episodes. */
  format?: StudioFormat | null;
  hrefFor: (type: ResultType) => string;
  paging: StudioSearchPaging;
}) {
  const { t } = useTranslation();
  const seeAllLabel = useSeeAllLabel();
  const shouldHideExplicit = useStudioHideExplicit();
  const idPrefix = useId();
  const isAll = type === "all";
  const layout = isAll ? "row" : "grid";
  const shows = (kind: ResultType) => isAll || type === kind;
  const seeAll = (kind: ResultType, count: number) =>
    isAll ? { seeAllHref: hrefFor(kind), seeAllLabel: seeAllLabel(count) } : {};
  const tracks = isAll
    ? result.tracks.slice(0, STUDIO_SEARCH_ALL_VIEW_TRACKS)
    : result.tracks;
  const heading = (key: string) => (
    <Translation i18nKey={key} components={{ em: <em /> }} />
  );
  return (
    <>
      {shows("releases") && result.releases.length > 0 && (
        <StudioShelf
          id={`${idPrefix}-releases`}
          title={heading("studio:searchPage.section.releases")}
          layout={layout}
          {...seeAll("releases", result.releases.length)}
        >
          {result.releases.map((release) => (
            <StudioReleaseCard key={release.id} release={release} />
          ))}
        </StudioShelf>
      )}
      {shows("tracks") && tracks.length > 0 && (
        <TrackSection
          title={heading(
            format === "podcast"
              ? "studio:searchPage.episodesHeading"
              : "studio:searchPage.section.tracks",
          )}
          {...seeAll("tracks", result.tracks.length)}
        >
          {tracks.map((track, index) => (
            <StudioSearchTrackRow
              key={track.id}
              track={track}
              index={index}
              shouldHideExplicit={shouldHideExplicit}
            />
          ))}
        </TrackSection>
      )}
      {shows("artists") && result.artists.length > 0 && (
        <StudioShelf
          id={`${idPrefix}-artists`}
          title={heading("studio:searchPage.section.artists")}
          layout={layout}
          {...seeAll("artists", result.artists.length)}
        >
          {result.artists.map((artist) => (
            <StudioArtistCard key={artist.id} artist={artist} />
          ))}
        </StudioShelf>
      )}
      {shows("playlists") && result.playlists.length > 0 && (
        <StudioShelf
          id={`${idPrefix}-playlists`}
          title={heading("studio:searchPage.section.playlists")}
          layout={layout}
          {...seeAll("playlists", result.playlists.length)}
        >
          {result.playlists.map((playlist) => (
            <StudioPlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </StudioShelf>
      )}
      <Collapse isOpen={!isAll && paging.hasMore}>
        <LoadMoreFooter
          className={searchStyles.showMore}
          isFetchingNextPage={paging.isFetchingNextPage}
          isFetchNextPageError={paging.isFetchNextPageError}
          onLoadMore={paging.fetchNextPage}
          label={t(
            // Podcasts head the track section Episodes, so Show more follows.
            type === "tracks" && format === "podcast"
              ? "studio:searchPage.showMore.episodes"
              : `studio:searchPage.showMore.${type}`,
          )}
          loadingLabel={t("studio:searchPage.showMoreLoading")}
          errorMessage={t("studio:searchPage.showMoreError", {
            reason: t(studioReasonCopyKey(paging.nextPageReason, "load")),
          })}
        />
      </Collapse>
    </>
  );
}
