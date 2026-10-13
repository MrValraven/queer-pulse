import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiMusic } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { EmptyState } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  StudioPlaylistEntryView,
  StudioPlaylistView,
} from "./api/studio.adapters";
import { movedEntryIds, movedEntryIdsTo } from "./api/studioPlaylistCache";
import {
  useRemoveStudioPlaylistEntry,
  useReorderStudioPlaylist,
} from "./api/useStudioPlaylistMutations";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { queueFromTracks } from "./player/studioQueue";
import {
  studioErrorMessageKey,
  studioErrorMessageKeyOf,
} from "./studioErrors.data";
import {
  StudioPlaylistEntryRow,
  type PlaylistEntryControl,
} from "./StudioPlaylistEntryRow";
import styles from "./studio.module.css";
import css from "./StudioPlaylistPage.module.css";

type FocusTarget =
  { entryId: string; control: PlaylistEntryControl } | "heading";

interface FocusRequest {
  target: FocusTarget;
  /** The pressed button, recorded at click time. */
  fromElement: Element | null;
  /** The row order the last commit showed: a commit that changes it is one
   *  where React moved or dropped rows, the only time focus can fall to the
   *  page body on its own. */
  orderKey: string;
  /** A removal waits for the server before focus goes anywhere. */
  isReady: boolean;
  /** The write settled: the next commit applies the request and drops it. */
  isSettled: boolean;
}

/** A refused write in the shared Studio words (the restriction line for a
 *  403, the code's own line for a 409 or 422), else the row's own line. */
function rowErrorKeyOf(error: unknown, fallbackKey: string): string {
  const key = studioErrorMessageKeyOf(error);
  return key === studioErrorMessageKey(null) ? fallbackKey : key;
}

/** Keeps focus on the pressed Move button while its row moves (each commit
 *  that moves the row puts focus back, until the save settles), and sends
 *  it to a neighbour's Remove, or the list heading, once a row goes. Focus
 *  the member put somewhere else, the page body included, stays there. */
function useEntryFocus(orderKey: string) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const controlsRef = useRef(new Map<string, HTMLButtonElement>());
  const focusRequestRef = useRef<FocusRequest | null>(null);
  useLayoutEffect(() => {
    const request = focusRequestRef.current;
    if (!request?.isReady) return;
    const target =
      request.target === "heading"
        ? headingRef.current
        : controlsRef.current.get(
            `${request.target.entryId}:${request.target.control}`,
          );
    if (!target) return;
    const hasOrderChanged = request.orderKey !== orderKey;
    request.orderKey = orderKey;
    const activeElement = document.activeElement;
    const isFocusOnBody =
      activeElement === null || activeElement === document.body;
    const isFocusStillOurs =
      activeElement === request.fromElement ||
      activeElement === target ||
      (hasOrderChanged && isFocusOnBody);
    if (isFocusStillOurs && activeElement !== target) target.focus();
    if (!isFocusStillOurs || request.isSettled) focusRequestRef.current = null;
  });
  return {
    headingRef,
    registerControl: (
      entryId: string,
      control: PlaylistEntryControl,
      element: HTMLButtonElement | null,
    ) => {
      const key = `${entryId}:${control}`;
      if (element) controlsRef.current.set(key, element);
      else controlsRef.current.delete(key);
    },
    /** Call at click time, so the pressed button is what holds focus. */
    requestFocus: (target: FocusTarget, isReady: boolean): FocusRequest => {
      const request = {
        target,
        fromElement: document.activeElement,
        orderKey,
        isReady,
        isSettled: false,
      };
      focusRequestRef.current = request;
      return request;
    },
    dropRequest: (request: FocusRequest) => {
      if (focusRequestRef.current === request) focusRequestRef.current = null;
    },
  };
}

function EntriesEmptyState({ isOwner }: { isOwner: boolean }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<FiMusic />}
      headingLevel={3}
      title={t(
        isOwner
          ? "studio:playlist.page.emptyOwnerTitle"
          : "studio:playlist.page.emptyViewerTitle",
      )}
      description={
        isOwner ? t("studio:playlist.page.emptyOwnerBody") : undefined
      }
      action={{
        label: t("studio:playlist.page.findMusicCta"),
        to: routes.studioSearch,
      }}
    />
  );
}

/** The tracklist. Owners move rows with Move up, Move down or a drag, and
 *  remove them; one write runs at a time, so no order goes out built on a
 *  list the server has not confirmed. */
export function StudioPlaylistEntries({
  playlist,
}: {
  playlist: StudioPlaylistView;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { reducedMotion } = useMotionPrefs();
  const player = useStudioPlayer();
  const reorder = useReorderStudioPlaylist();
  const removeEntry = useRemoveStudioPlaylistEntry();
  const { headingRef, registerControl, requestFocus, dropRequest } =
    useEntryFocus(playlist.entries.map((entry) => entry.entryId).join(" "));
  const headingId = useId();
  const [statusText, setStatusText] = useState("");
  const queue = useMemo(
    () => queueFromTracks(playlist.playableTracks),
    [playlist.playableTracks],
  );
  const isBusy = reorder.isPending || removeEntry.isPending;
  const fade = { duration: reducedMotion ? 0 : 0.2, ease: "easeOut" } as const;

  function saveOrder(
    entryIds: string[],
    moved: StudioPlaylistEntryView,
    focusRequest: FocusRequest | null,
  ) {
    setStatusText(
      t("studio:playlist.row.movedStatus", {
        title: moved.track?.title ?? t("studio:playlist.row.unavailable"),
        position: entryIds.indexOf(moved.entryId) + 1,
      }),
    );
    reorder.mutate(
      { playlistId: playlist.id, entryIds },
      {
        onError: (error) =>
          showToast(
            t(rowErrorKeyOf(error, "studio:playlist.row.orderError")),
            "error",
          ),
        onSettled: () => {
          if (focusRequest) focusRequest.isSettled = true;
        },
      },
    );
  }

  function move(entry: StudioPlaylistEntryView, offset: -1 | 1) {
    const entryIds = movedEntryIds(playlist.entries, entry.entryId, offset);
    if (isBusy || !entryIds) return;
    const focusRequest = requestFocus(
      {
        entryId: entry.entryId,
        control: offset === -1 ? "moveUp" : "moveDown",
      },
      true,
    );
    saveOrder(entryIds, entry, focusRequest);
  }

  function dropAt(draggedEntryId: string, targetIndex: number) {
    const entryIds = movedEntryIdsTo(
      playlist.entries,
      draggedEntryId,
      targetIndex,
    );
    const moved = playlist.entries.find(
      (entry) => entry.entryId === draggedEntryId,
    );
    if (isBusy || !entryIds || !moved) return;
    saveOrder(entryIds, moved, null);
  }

  function remove(entry: StudioPlaylistEntryView, index: number) {
    if (isBusy) return;
    const neighbour =
      playlist.entries[index + 1] ?? playlist.entries[index - 1];
    const focusRequest = requestFocus(
      neighbour ? { entryId: neighbour.entryId, control: "remove" } : "heading",
      false,
    );
    removeEntry.mutate(
      { playlistId: playlist.id, entryId: entry.entryId },
      {
        onSuccess: () => {
          focusRequest.isReady = true;
          focusRequest.isSettled = true;
          showToast(t("studio:playlist.row.removedToast"), "info");
        },
        onError: (error) => {
          dropRequest(focusRequest);
          showToast(
            t(rowErrorKeyOf(error, "studio:playlist.row.removeError")),
            "error",
          );
        },
      },
    );
  }

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
      <AnimatePresence initial={false} mode="wait">
        {playlist.entries.length === 0 ? (
          <m.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            <EntriesEmptyState isOwner={playlist.isOwner} />
          </m.div>
        ) : (
          <m.ol
            key="entries"
            className={`${styles.setCard} ${css.list}`}
            aria-labelledby={headingId}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            <AnimatePresence initial={false}>
              {playlist.entries.map((entry, index) => {
                const isCurrent =
                  entry.track !== null && player.isCurrentTrack(entry.track.id);
                return (
                  <StudioPlaylistEntryRow
                    key={entry.entryId}
                    entry={entry}
                    index={index}
                    rowCount={playlist.entries.length}
                    isOwner={playlist.isOwner}
                    isBusy={isBusy}
                    isCurrent={isCurrent}
                    isPlaying={isCurrent && player.status === "playing"}
                    registerControl={registerControl}
                    onPlay={() => {
                      if (!entry.track) return;
                      if (isCurrent) player.togglePlay();
                      else void player.playTracks(queue, entry.track.id);
                    }}
                    onMove={(offset) => move(entry, offset)}
                    onDropAt={(draggedEntryId) => dropAt(draggedEntryId, index)}
                    onRemove={() => remove(entry, index)}
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
    </section>
  );
}
