import { useId, useMemo, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiMusic } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Collapse, EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  StudioPlaylistEntryView,
  StudioPlaylistView,
} from "./api/studio.adapters";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import { StudioSelectionBar } from "./kit/StudioSelectionBar";
import { useStudioRowSelection } from "./kit/useStudioRowSelection";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { StudioPlaylistEntryRow } from "./StudioPlaylistEntryRow";
import { STUDIO_EXIT, STUDIO_FADE } from "./studioMotion";
import {
  StudioTracklistToolbar,
  type StudioTracklistSortOption,
} from "./StudioTracklistToolbar";
import {
  useStudioListFilter,
  type StudioListSort,
} from "./useStudioListFilter";
import { useStudioPlaylistRows } from "./useStudioPlaylistRows";
import styles from "./studio.module.css";
import css from "./StudioPlaylistPage.module.css";

const PLAYLIST_SORTS: StudioTracklistSortOption[] = [
  { id: "custom", labelKey: "studio:tracklist.sortCustom" },
  { id: "added", labelKey: "studio:tracklist.sortRecentlyAdded" },
  { id: "title", labelKey: "studio:tracklist.sortTitle" },
  { id: "artist", labelKey: "studio:tracklist.sortArtist" },
  { id: "duration", labelKey: "studio:tracklist.sortDuration" },
];

/** What the in-list search reads: the title, the artist and the release. */
const entryText = (entry: StudioPlaylistEntryView) =>
  [
    entry.track?.title,
    entry.track?.release.artist.name,
    entry.track?.release.title,
  ]
    .filter(Boolean)
    .join(" ");

function EntriesEmptyState({ hasEditRights }: { hasEditRights: boolean }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<FiMusic />}
      headingLevel={3}
      title={t(
        hasEditRights
          ? "studio:playlist.page.emptyOwnerTitle"
          : "studio:playlist.page.emptyViewerTitle",
      )}
      description={
        hasEditRights ? t("studio:playlist.page.emptyOwnerBody") : undefined
      }
      action={{
        label: t("studio:playlist.page.findMusicCta"),
        to: routes.studioSearch,
      }}
    />
  );
}

/** The tracklist, with search, sort and selection mode. The owner and
 *  editors move rows with Move up, Move down or a drag while the list shows
 *  its own order, and remove them (with Undo); one write runs at a time. A
 *  move refused because the list changed meanwhile reads the playlist again
 *  and says so; a removal another editor made first settles as a removal. */
export function StudioPlaylistEntries({
  playlist,
}: {
  playlist: StudioPlaylistView;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const player = useStudioPlayer();
  const shouldHideExplicit = useStudioHideExplicit();
  const headingId = useId();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<StudioListSort>("custom");
  const shown = useStudioListFilter(playlist.entries, query, sort, entryText);
  const isReorderable = query.trim() === "" && sort === "custom";
  const canReorder = playlist.hasEditRights && isReorderable;
  const selectableIds = useMemo(
    () => shown.flatMap((entry) => (entry.track ? [entry.entryId] : [])),
    [shown],
  );
  const selection = useStudioRowSelection(selectableIds);
  const {
    headingRef,
    registerControl,
    statusText,
    isBusy,
    playHandlerOf,
    moveHandlerOf,
    removeHandlerOf,
    listDrop,
    bulkActions,
    picker,
  } = useStudioPlaylistRows(playlist, shown, selection);
  const fade = reducedMotion ? { duration: 0.12 } : STUDIO_FADE;
  const hasEntries = playlist.entries.length > 0;
  const listState = !hasEntries
    ? "empty"
    : shown.length === 0
      ? "noMatch"
      : "entries";

  return (
    <section className={styles.row} aria-labelledby={headingId}>
      <h2
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className={styles.visuallyHidden}
      >
        {t("studio:playlist.page.tracklistLabel", { name: playlist.name })}
      </h2>
      <Collapse isOpen={hasEntries}>
        <StudioTracklistToolbar
          listName={playlist.name}
          query={query}
          onQueryChange={setQuery}
          sort={sort}
          onSortChange={setSort}
          sortOptions={PLAYLIST_SORTS}
          selection={selection}
        />
      </Collapse>
      <AnimatePresence initial={false} mode="wait">
        {listState === "empty" && (
          <m.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: STUDIO_EXIT }}
            transition={fade}
          >
            <EntriesEmptyState hasEditRights={playlist.hasEditRights} />
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
            onDragOver={canReorder ? listDrop.onDragOver : undefined}
            onDrop={canReorder ? listDrop.onDrop : undefined}
            exit={{ opacity: 0, transition: STUDIO_EXIT }}
            transition={fade}
          >
            <AnimatePresence initial={false}>
              {shown.map((entry, index) => {
                const isCurrent =
                  entry.track !== null && player.isCurrentTrack(entry.track.id);
                return (
                  <StudioPlaylistEntryRow
                    key={entry.entryId}
                    entry={entry}
                    index={index}
                    rowCount={shown.length}
                    hasEditRights={playlist.hasEditRights}
                    isReorderable={isReorderable}
                    isCollaborative={playlist.isCollaborative}
                    isBusy={isBusy}
                    isCurrent={isCurrent}
                    isPlaying={isCurrent && player.status === "playing"}
                    shouldHideExplicit={shouldHideExplicit}
                    selection={selection}
                    registerControl={registerControl}
                    onPlay={playHandlerOf(entry.entryId)}
                    onMove={moveHandlerOf(entry.entryId)}
                    onRemove={removeHandlerOf(entry.entryId)}
                  />
                );
              })}
            </AnimatePresence>
          </m.ol>
        )}
      </AnimatePresence>
      <div role="status" className={styles.visuallyHidden}>
        {statusText}
      </div>
      <StudioSelectionBar selection={selection} actions={bulkActions} />
      {picker}
    </section>
  );
}
