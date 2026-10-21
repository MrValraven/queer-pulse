import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiHeart } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import {
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

/** Liked songs' list, newest like first, with search, sort and selection
 *  mode. Play from a row queues the loaded likes from there; Show more
 *  reads the next 100, and a search or a sort reads every page first, so
 *  it covers all of them. Unliking a row fades it out, offers Undo and
 *  moves focus to the next row (the previous one at the end, the list
 *  heading once none are left). */
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
  const shown = useStudioListFilter(liked.entries, query, sort, likedEntryText);
  const isFiltering = query.trim() !== "" || sort !== "custom";
  const selectableIds = useMemo(
    () => shown.flatMap((entry) => (entry.track ? [entry.savedId] : [])),
    [shown],
  );
  const selection = useStudioRowSelection(selectableIds);
  const rows = useStudioLikedRows({ liked, shown, headingRef, selection });
  const fade = reducedMotion ? { duration: 0.12 } : STUDIO_FADE;
  const isFooterOpen = liked.hasMore || liked.isFetchNextPageError;
  const hasEntries = liked.entries.length > 0;
  // Every loaded like unliked while more pages wait: the footer reads the
  // next page, so the empty state holds until none are left.
  const isEmpty = !hasEntries && !liked.hasMore;
  // Read the next page straight away when every loaded row was unliked
  // (never a bare Show more footer), or while a search or sort needs the
  // whole list. A failed read stops here and leaves the footer's retry. A
  // read already under way (the refetch an unlike starts) finishes first.
  const shouldReadNextPage =
    (!hasEntries || isFiltering) &&
    liked.hasMore &&
    !liked.isFetchingNextPage &&
    !liked.isFetchNextPageError;
  const { fetchNextPage } = liked;
  useEffect(() => {
    if (shouldReadNextPage) fetchNextPage({ cancelRefetch: false });
  }, [shouldReadNextPage, fetchNextPage]);

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
    <section className={styles.row} aria-labelledby={headingId}>
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
          onQueryChange={setQuery}
          sort={sort}
          onSortChange={setSort}
          sortOptions={LIKED_SORTS}
          selection={selection}
        />
      </Collapse>
      {/* initial={false}: the first paint stays still, and later swaps
          between the list and the empty states fade. */}
      <AnimatePresence initial={false} mode="wait">
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
          <m.p
            key="noMatch"
            className={css.noMatch}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: STUDIO_EXIT }}
            transition={fade}
          >
            {t("studio:tracklist.noMatch", { query: query.trim() })}
          </m.p>
        )}
        {listState === "entries" && (
          <m.ol
            key="entries"
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
