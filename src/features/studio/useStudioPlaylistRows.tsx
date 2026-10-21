import { useMemo, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
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
import type { StudioSelectionAction } from "./kit/StudioSelectionBar";
import type { StudioRowSelection } from "./kit/useStudioRowSelection";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { queueFromTracks } from "./player/studioQueue";
import { useStudioBulkTrackActions } from "./useStudioBulkTrackActions";
import {
  useStudioPlaylistEntryFocus,
  type PlaylistFocusRequest,
} from "./useStudioPlaylistEntryFocus";
import {
  playlistRowErrorKeyOf,
  useStudioPlaylistRemoval,
} from "./useStudioPlaylistRemoval";
import { listDropTarget } from "./studioPlaylistEntryDrag";
import {
  useStudioLatestCallback,
  useStudioRowHandlers,
} from "./useStudioRowHandlers";

const doNothing = () => {};

/**
 * What a playlist's rows do: play (stable per row, from the playlist's own
 * queue), Move up, Move down, drop and Remove for the owner and editors,
 * with one write at a time, so no order goes out built on a list the server
 * has not confirmed. Remove offers Undo. Also the selection bar's actions:
 * Add to playlist, Add to queue and, for the owner and editors, Remove from
 * this playlist.
 */
export function useStudioPlaylistRows(
  playlist: StudioPlaylistView,
  shown: StudioPlaylistEntryView[],
  selection: StudioRowSelection,
) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const player = useStudioPlayer();
  const reorder = useReorderStudioPlaylist();
  const removeEntry = useRemoveStudioPlaylistEntry();
  const removal = useStudioPlaylistRemoval(playlist);
  const focus = useStudioPlaylistEntryFocus(
    playlist.entries.map((entry) => entry.entryId).join(" "),
  );
  const [statusText, setStatusText] = useState("");
  const isBusy = reorder.isPending || removeEntry.isPending || removal.isBusy;
  const queue = useMemo(
    () => queueFromTracks(playlist.playableTracks),
    [playlist.playableTracks],
  );
  const ids = useMemo(() => shown.map((entry) => entry.entryId), [shown]);
  const entryOf = (entryId: string) =>
    shown.find((entry) => entry.entryId === entryId);

  function saveOrder(
    entryIds: string[],
    moved: StudioPlaylistEntryView,
    focusRequest: PlaylistFocusRequest | null,
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
            t(playlistRowErrorKeyOf(error, "studio:playlist.row.orderError")),
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
    const control = offset === -1 ? "moveUp" : "moveDown";
    const request = focus.requestFocus(
      { entryId: entry.entryId, control },
      true,
    );
    saveOrder(entryIds, entry, request);
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

  function remove(entry: StudioPlaylistEntryView) {
    if (isBusy) return;
    const index = shown.indexOf(entry);
    const neighbour = shown[index + 1] ?? shown[index - 1];
    const request = focus.requestFocus(
      neighbour ? { entryId: neighbour.entryId, control: "remove" } : "heading",
      false,
    );
    const placeInPlaylist = playlist.entries.indexOf(entry);
    removeEntry.mutate(
      { playlistId: playlist.id, entryId: entry.entryId },
      {
        onSuccess: () => {
          request.isReady = true;
          request.isSettled = true;
          removal.offerUndo(
            entry.track
              ? [
                  {
                    trackId: entry.track.id,
                    index: placeInPlaylist,
                    title: entry.track.title,
                  },
                ]
              : [],
            1,
          );
        },
        onError: (error) => {
          focus.dropRequest(request);
          showToast(
            t(playlistRowErrorKeyOf(error, "studio:playlist.row.removeError")),
            "error",
          );
        },
      },
    );
  }

  // One identity per row for the life of the list, so a memoised row stays
  // still while the player or a save changes state around it.
  const play = useStudioLatestCallback((entryId: string) => {
    const track = entryOf(entryId)?.track;
    if (!track) return;
    if (player.isCurrentTrack(track.id)) player.togglePlay();
    else void player.playTracks(queue, track.id);
  });
  const moveRow = useStudioLatestCallback((entryId: string, offset: -1 | 1) => {
    const entry = entryOf(entryId);
    if (entry) move(entry, offset);
  });
  const removeRow = useStudioLatestCallback((entryId: string) => {
    const entry = entryOf(entryId);
    if (entry) remove(entry);
  });
  const dropOnRow = useStudioLatestCallback(
    (draggedEntryId: string, targetIndex: number) =>
      dropAt(draggedEntryId, targetIndex),
  );
  const listDrop = useMemo(() => listDropTarget(dropOnRow), [dropOnRow]);
  const playHandlers = useStudioRowHandlers(ids, play);
  const moveHandlers = useStudioRowHandlers<-1 | 1>(ids, moveRow);
  const removeHandlers = useStudioRowHandlers(ids, removeRow);

  const entriesOf = (rowIds: string[]) =>
    rowIds.flatMap((rowId) => entryOf(rowId) ?? []);
  const bulk = useStudioBulkTrackActions(selection, (rowIds) =>
    entriesOf(rowIds).flatMap((entry) =>
      entry.track?.hasAudio ? [entry.track.id] : [],
    ),
  );
  const removeAction: StudioSelectionAction = {
    id: "remove",
    label: t("studio:selection.removeFromPlaylist"),
    icon: <FiTrash2 aria-hidden />,
    tone: "danger",
    onRun: (rowIds) => {
      if (isBusy) return;
      selection.clear();
      void removal.removeMany(entriesOf(rowIds));
    },
  };

  return {
    ...focus,
    statusText,
    isBusy,
    playHandlerOf: (entryId: string) => playHandlers.get(entryId) ?? doNothing,
    moveHandlerOf: (entryId: string) => moveHandlers.get(entryId) ?? doNothing,
    removeHandlerOf: (entryId: string) =>
      removeHandlers.get(entryId) ?? doNothing,
    /** Drops land on the list: every row takes one, an unavailable row
     *  included, without a handler of its own. */
    listDrop,
    bulkActions: playlist.hasEditRights
      ? [...bulk.actions, removeAction]
      : bulk.actions,
    picker: bulk.picker,
  };
}
