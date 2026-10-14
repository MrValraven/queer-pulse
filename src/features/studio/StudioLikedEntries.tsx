import { useEffect, useId, useMemo, useRef } from "react";
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
import type { StudioLikedTracksResult } from "./api/useStudioLikedTracks";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { queueFromTracks } from "./player/studioQueue";
import { StudioLikedEntryRow } from "./StudioLikedEntryRow";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";
import css from "./StudioPlaylistPage.module.css";

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

/** Liked songs' list, newest like first. Play from a row queues the loaded
 *  likes from there; Show more reads the next 100. Unliking a row fades it
 *  out and moves focus to the next row's heart (the previous one at the
 *  end, the list heading once none are left). */
export function StudioLikedEntries({
  liked,
}: {
  liked: StudioLikedTracksResult;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const player = useStudioPlayer();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const rowsRef = useRef(new Map<string, HTMLLIElement>());
  const queue = useMemo(
    () => queueFromTracks(liked.playableTracks),
    [liked.playableTracks],
  );
  const fade = { duration: reducedMotion ? 0 : 0.2, ease: "easeOut" } as const;
  const isFooterOpen = liked.hasMore || liked.isFetchNextPageError;
  const hasEntries = liked.entries.length > 0;
  // Every loaded like unliked while more pages wait: the footer reads the
  // next page, so the empty state holds until none are left.
  const isEmpty = !hasEntries && !liked.hasMore;
  // Every loaded row unliked with more pages to come: read the next page
  // straight away, so the section never shows a bare Show more footer. A
  // failed read stops here and leaves the footer's retry. A read already
  // under way (the refetch an unlike starts) finishes first.
  const shouldReadNextPage =
    !hasEntries &&
    liked.hasMore &&
    !liked.isFetchingNextPage &&
    !liked.isFetchNextPageError;
  const { fetchNextPage } = liked;
  useEffect(() => {
    if (shouldReadNextPage) fetchNextPage({ cancelRefetch: false });
  }, [shouldReadNextPage, fetchNextPage]);

  function focusAfterUnlike(index: number) {
    const neighbour = liked.entries[index + 1] ?? liked.entries[index - 1];
    const neighbourHeart = neighbour
      ? rowsRef.current
          .get(neighbour.savedId)
          ?.querySelector<HTMLButtonElement>("button[aria-pressed]")
      : null;
    (neighbourHeart ?? headingRef.current)?.focus();
  }

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
      {/* initial={false}: the first paint stays still, and later swaps
          between the list and the empty state fade. */}
      <AnimatePresence initial={false} mode="wait">
        {isEmpty ? (
          <m.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            <LikedEmptyState />
          </m.div>
        ) : hasEntries ? (
          <m.ol
            key="entries"
            className={`${styles.setCard} ${css.list}`}
            aria-labelledby={headingId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            <AnimatePresence initial={false}>
              {liked.entries.map((entry, index) => {
                const track = entry.track;
                const isCurrent =
                  track !== null && player.isCurrentTrack(track.id);
                return (
                  <StudioLikedEntryRow
                    key={entry.savedId}
                    entry={entry}
                    isCurrent={isCurrent}
                    isPlaying={isCurrent && player.status === "playing"}
                    rowRef={(element) => {
                      if (element) rowsRef.current.set(entry.savedId, element);
                      else rowsRef.current.delete(entry.savedId);
                    }}
                    onPlay={() => {
                      if (!track) return;
                      if (isCurrent) player.togglePlay();
                      else void player.playTracks(queue, track.id);
                    }}
                    onToggled={(isNowLiked) => {
                      if (!isNowLiked) focusAfterUnlike(index);
                    }}
                  />
                );
              })}
            </AnimatePresence>
          </m.ol>
        ) : null}
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
    </section>
  );
}
