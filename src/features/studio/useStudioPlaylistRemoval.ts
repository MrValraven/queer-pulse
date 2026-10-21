import { useEffect, useRef } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  StudioPlaylistEntryView,
  StudioPlaylistView,
} from "./api/studio.adapters";
import {
  useAddStudioPlaylistTracks,
  useRemoveStudioPlaylistEntry,
  useReorderStudioPlaylist,
} from "./api/useStudioPlaylistMutations";
import {
  studioErrorMessageKey,
  studioErrorMessageKeyOf,
} from "./studioErrors.data";

/** A refused write in the shared Studio words (the restriction line for a
 *  403, the code's own line for a 409 or 422, a reason line otherwise),
 *  else the row's own line. */
export function playlistRowErrorKeyOf(
  error: unknown,
  fallbackKey: string,
): string {
  const key = studioErrorMessageKeyOf(error, "save");
  return key === studioErrorMessageKey(null) ? fallbackKey : key;
}

/** A removed entry, with where it stood, so Undo can put it back there. */
export interface RemovedPlaylistEntry {
  trackId: string;
  index: number;
  /** The track's title, so a one-track toast names what left. */
  title: string;
}

/** The order after Undo: the entries that stayed, with each re-added one
 *  slotted back at its old place (lowest place first, so the later ones
 *  land where they were). A track the server already held twice may come
 *  back once; only the entries it added move. */
function restoredOrder(
  after: StudioPlaylistEntryView[],
  entryIdsBefore: ReadonlySet<string>,
  removed: RemovedPlaylistEntry[],
): { order: string[]; restoredCount: number } {
  const order = after
    .filter((entry) => entryIdsBefore.has(entry.entryId))
    .map((entry) => entry.entryId);
  const added = after.filter((entry) => !entryIdsBefore.has(entry.entryId));
  let restoredCount = 0;
  for (const { trackId, index } of [...removed].sort(
    (left, right) => left.index - right.index,
  )) {
    const matchIndex = added.findIndex((entry) => entry.track?.id === trackId);
    if (matchIndex === -1) continue;
    const [match] = added.splice(matchIndex, 1);
    if (!match) continue;
    order.splice(Math.min(index, order.length), 0, match.entryId);
    restoredCount += 1;
  }
  // Anything the server added that matched no removal keeps its place last.
  return {
    order: [...order, ...added.map((entry) => entry.entryId)],
    restoredCount,
  };
}

/**
 * Taking entries out of a playlist, with Undo. `removeMany` takes the picked
 * entries out one by one (the server takes one entry per request) and stops
 * at the first refusal, which it names. `offerUndo` shows the toast whose
 * Undo adds the tracks back and moves them to their old places. An entry
 * whose track left Studio cannot come back, so it is left out of Undo.
 */
export function useStudioPlaylistRemoval(playlist: StudioPlaylistView) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const removeEntry = useRemoveStudioPlaylistEntry();
  const addTracks = useAddStudioPlaylistTracks();
  const reorder = useReorderStudioPlaylist();
  // Undo runs seconds later, against the playlist as it is by then.
  const playlistRef = useRef(playlist);
  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  async function restore(removed: RemovedPlaylistEntry[]) {
    const current = playlistRef.current;
    const entryIdsBefore = new Set(
      current.entries.map((entry) => entry.entryId),
    );
    try {
      const { playlist: after } = await addTracks.mutateAsync({
        playlistId: current.id,
        trackIds: removed.map((entry) => entry.trackId),
        previousTrackCount: current.trackCount,
      });
      const { order, restoredCount } = restoredOrder(
        after.entries,
        entryIdsBefore,
        removed,
      );
      const isOrderChanged = order.some(
        (entryId, index) => after.entries[index]?.entryId !== entryId,
      );
      if (isOrderChanged)
        await reorder.mutateAsync({ playlistId: current.id, entryIds: order });
      // A track the playlist still held elsewhere comes back once at most,
      // so the toast says how many of the removed entries returned.
      if (restoredCount === removed.length)
        showToast(t("studio:playlist.row.restoredToast"), "success");
      else if (restoredCount === 0)
        showToast(t("studio:playlist.row.restoredNoneToast"), "info");
      else
        showToast(
          t("studio:playlist.row.restoredSomeToast", {
            count: restoredCount,
            total: removed.length,
          }),
          "info",
        );
    } catch (error) {
      showToast(
        t(playlistRowErrorKeyOf(error, "studio:playlist.row.restoreError")),
        "error",
      );
    }
  }

  function offerUndo(removed: RemovedPlaylistEntry[], removedCount: number) {
    const removedTitle = removedCount === 1 ? removed[0]?.title : undefined;
    const message = removedTitle
      ? t("studio:playlist.row.removedTitledToast", { title: removedTitle })
      : removedCount === 1
        ? t("studio:playlist.row.removedToast")
        : t("studio:playlist.row.removedManyToast", { count: removedCount });
    if (removed.length === 0) {
      showToast(message, "info");
      return;
    }
    showToast(message, "info", undefined, {
      label: t("studio:playlist.row.undoCta"),
      onClick: () => void restore(removed),
    });
  }

  async function removeMany(entries: StudioPlaylistEntryView[]) {
    const indexOf = new Map(
      playlistRef.current.entries.map((entry, index) => [entry.entryId, index]),
    );
    const removed: RemovedPlaylistEntry[] = [];
    let removedCount = 0;
    for (const entry of entries) {
      try {
        await removeEntry.mutateAsync({
          playlistId: playlistRef.current.id,
          entryId: entry.entryId,
        });
      } catch (error) {
        showToast(
          t(playlistRowErrorKeyOf(error, "studio:playlist.row.removeError")),
          "error",
        );
        break;
      }
      removedCount += 1;
      if (entry.track)
        removed.push({
          trackId: entry.track.id,
          index: indexOf.get(entry.entryId) ?? Number.MAX_SAFE_INTEGER,
          title: entry.track.title,
        });
    }
    if (removedCount > 0) offerUndo(removed, removedCount);
  }

  return {
    offerUndo,
    removeMany,
    isBusy: removeEntry.isPending || addTracks.isPending || reorder.isPending,
  };
}
