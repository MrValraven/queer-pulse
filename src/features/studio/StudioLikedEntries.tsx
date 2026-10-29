import { useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiHeart } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import {
  Button,
  Collapse,
  EmptyState,
  LoadMoreFooter,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioLikedEntryView } from "./api/studioLiked.adapters";
import type { StudioLikedTracksResult } from "./api/useStudioLikedTracks";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import { StudioSelectionBar } from "./kit/StudioSelectionBar";
import { useStudioRowSelection } from "./kit/useStudioRowSelection";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { StudioLikedEntryRow } from "./StudioLikedEntryRow";
import { StudioLikedGenreChips } from "./StudioLikedGenreChips";
import {
  useStudioLikedGenres,
  type StudioLikedGenres,
} from "./useStudioLikedGenres";
import { useStudioLikedRows } from "./useStudioLikedRows";
import { STUDIO_EXIT, STUDIO_FADE } from "./studioMotion";
import {
  StudioTracklistToolbar,
  type StudioTracklistSortOption,
} from "./StudioTracklistToolbar";
import {
  useStudioListFilter,
  type StudioListSort,
} from "./useStudioListFilter";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";
import css from "./StudioPlaylistPage.module.css";
import likedCss from "./StudioLikedPage.module.css";

const LIKED_SORTS: StudioTracklistSortOption[] = [
  { id: "custom", labelKey: "studio:tracklist.sortRecentlyLiked" },
  { id: "title", labelKey: "studio:tracklist.sortTitle" },
  { id: "artist", labelKey: "studio:tracklist.sortArtist" },
  { id: "duration", labelKey: "studio:tracklist.sortDuration" },
];

/** What the in-list search reads: the title, the artist and the release. */
const likedEntryText = (entry: StudioLikedEntryView) =>
  [entry.title, entry.track?.release.artist.name, entry.track?.release.title]
    .filter(Boolean)
    .join(" ");

function LikedEmptyState() {
  const { t } = useTranslation();
  return (
    <EmptyState
      className={likedCss.emptyState}
      icon={<FiHeart fill="none" />}
      headingLevel={3}
      title={t("studio:liked.page.emptyTitle")}
      description={t("studio:liked.page.emptyBody")}
      action={{
        label: t("studio:playlist.page.findMusicCta"),
        to: routes.studioSearch,
      }}
    />
  );
}

/** The search found nothing. With a genre picked it names the genre and
 *  offers every genre back, since the like may sit in another one. */
function LikedNoMatch({
  query,
  genres,
  onShowAllGenres,
}: {
  query: string;
  genres: StudioLikedGenres;
  onShowAllGenres: () => void;
}) {
  const { t } = useTranslation();
  const activeOption = genres.options.find(
    (option) => option.genre === genres.activeGenre,
  );
  if (!activeOption) {
    return (
      <p className={css.noMatch}>{t("studio:tracklist.noMatch", { query })}</p>
    );
  }
  return (
    <div className={likedCss.noMatchInGenre}>
      <p className={css.noMatch}>
        {t("studio:liked.page.noMatchInGenre", {
          genre: activeOption.label,
          query,
        })}
      </p>
      <Button variant="quiet" size="sm" onClick={onShowAllGenres}>
        {t("studio:liked.page.showAllGenres")}
      </Button>
    </div>
  );
}

/** Liked songs' list, newest like first, with search, sort, genre chips
 *  and selection mode. Play from a row queues the loaded likes from there.
 *  The pages still waiting are read in the background (the footer shows
 *  the read and its retry), so the genre counts, the search and the sort
 *  cover every like. The genre, the search and the sort combine. Unliking a
 *  row fades it out, offers Undo and moves focus to the next row (the
 *  previous one at the end, the list heading once none are left). */
export function StudioLikedEntries({
  liked,
}: {
  liked: StudioLikedTracksResult;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const player = useStudioPlayer();
  const shouldHideExplicit = useStudioHideExplicit();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<StudioListSort>("custom");
  const genres = useStudioLikedGenres(liked);
  const shown = useStudioListFilter(
    genres.entries,
    query,
    sort,
    likedEntryText,
  );
  const selectableIds = useMemo(
    () => shown.flatMap((entry) => (entry.track ? [entry.savedId] : [])),
    [shown],
  );
  const selection = useStudioRowSelection(selectableIds);
  const rows = useStudioLikedRows({ liked, shown, headingRef, selection });
  // While a genre is picked the tracklist keeps a screen's height, so a short
  // filtered list never shortens the page under the member's scroll. After
  // a clear the hold lasts until the filtered list has faded out, or, with a
  // search typed, until the member edits the search.
  const [isHeightHeld, setIsHeightHeld] = useState(false);
  if (genres.activeGenre !== null && !isHeightHeld) setIsHeightHeld(true);
  const changeQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    if (genres.activeGenre === null) setIsHeightHeld(false);
  };
  const showAllGenres = () => {
    genres.clearGenre();
    headingRef.current?.focus({ preventScroll: true });
  };
  const fade = reducedMotion ? { duration: 0.12 } : STUDIO_FADE;
  const isFooterOpen = liked.hasMore || liked.isFetchNextPageError;
  const hasEntries = liked.entries.length > 0;
  // Every loaded like unliked while more pages wait: the footer reads the
  // next page, so the empty state holds until none are left.
  const isEmpty = !hasEntries && !liked.hasMore;

  // A picked genre always holds a like (it clears itself at none), so a
  // list with nothing to show means the search found nothing.
  const listState = isEmpty
    ? "empty"
    : !hasEntries
      ? null
      : shown.length > 0
        ? "entries"
        : liked.hasMore
          ? null
          : "noMatch";
  return (
    <section
      className={`${styles.row} ${likedCss.tracklist}`}
      aria-labelledby={headingId}
      data-genre-held={isHeightHeld || undefined}
    >
      <h2
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className={styles.visuallyHidden}
      >
        {t("studio:playlist.page.tracklistLabel", {
          name: t("studio:liked.title"),
        })}
      </h2>
      <Collapse isOpen={hasEntries}>
        <StudioTracklistToolbar
          listName={t("studio:liked.title")}
          query={query}
          onQueryChange={changeQuery}
          sort={sort}
          onSortChange={setSort}
          sortOptions={LIKED_SORTS}
          selection={selection}
        />
        <StudioLikedGenreChips genres={genres} />
      </Collapse>
      {/* initial={false}: the first paint stays still, and later swaps
          between the list and the empty states fade. Each genre keys its
          own list and its own no-match line, so a pick cross-fades the
          whole list; rows slide only when an unlike closes a gap. */}
      <AnimatePresence
        initial={false}
        mode="wait"
        onExitComplete={() =>
          setIsHeightHeld(genres.activeGenre !== null || query.trim() !== "")
        }
      >
        {listState === "empty" && (
          <m.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: STUDIO_EXIT }}
            transition={fade}
          >
            <LikedEmptyState />
          </m.div>
        )}
        {listState === "noMatch" && (
          <m.div
            key={`noMatch-${genres.activeGenre ?? "all"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: STUDIO_EXIT }}
            transition={fade}
          >
            <LikedNoMatch
              query={query.trim()}
              genres={genres}
              onShowAllGenres={showAllGenres}
            />
          </m.div>
        )}
        {listState === "entries" && (
          <m.ol
            key={`entries-${genres.activeGenre ?? "all"}`}
            className={css.list}
            aria-labelledby={headingId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: STUDIO_EXIT }}
            transition={fade}
          >
            <AnimatePresence initial={false}>
              {shown.map((entry, index) => {
                const isCurrent =
                  entry.track !== null && player.isCurrentTrack(entry.track.id);
                return (
                  <StudioLikedEntryRow
                    key={entry.savedId}
                    entry={entry}
                    index={index}
                    isCurrent={isCurrent}
                    isPlaying={isCurrent && player.status === "playing"}
                    onPlay={rows.playHandlerOf(entry.savedId)}
                    likeOptions={rows.likeOptionsOf(entry.savedId)}
                    rowRef={rows.rowRefOf(entry.savedId)}
                    selection={selection}
                    shouldHideExplicit={shouldHideExplicit}
                  />
                );
              })}
            </AnimatePresence>
          </m.ol>
        )}
      </AnimatePresence>
      <Collapse isOpen={isFooterOpen}>
        <div className={kit.moreFooter}>
          <LoadMoreFooter
            isFetchingNextPage={liked.isFetchingNextPage}
            isFetchNextPageError={liked.isFetchNextPageError}
            onLoadMore={liked.fetchNextPage}
            label={t("studio:liked.page.showMore")}
            loadingLabel={t("studio:liked.page.loadingMore")}
            errorMessage={t("studio:liked.page.loadMoreError")}
          />
        </div>
      </Collapse>
      <StudioSelectionBar selection={selection} actions={rows.bulkActions} />
      {rows.picker}
    </section>
  );
}
