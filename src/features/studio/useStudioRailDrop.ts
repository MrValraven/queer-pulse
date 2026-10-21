import { useState, type DragEvent } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAddStudioPlaylistTracks } from "./api/useStudioPlaylistMutations";
import { STUDIO_TRACK_DRAG_TYPE } from "./kit/useStudioTrackRowEvents";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import type { StudioRailPlaylistRowModel } from "./studioRailPlaylistRows";

export interface StudioRailDropHandlers {
  onDragEnter: (event: DragEvent<HTMLElement>) => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDragLeave: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
}

const isTrackDrag = (event: DragEvent<HTMLElement>) =>
  event.dataTransfer.types.includes(STUDIO_TRACK_DRAG_TYPE);

/** The track id a row's drag carries, or null for anything else. */
function droppedTrackIdOf(event: DragEvent<HTMLElement>): string | null {
  try {
    const payload: unknown = JSON.parse(
      event.dataTransfer.getData(STUDIO_TRACK_DRAG_TYPE),
    );
    if (
      payload !== null &&
      typeof payload === "object" &&
      "trackId" in payload &&
      typeof payload.trackId === "string"
    )
      return payload.trackId;
  } catch {
    // Not a Studio track: nothing to add.
  }
  return null;
}

/**
 * A rail playlist as a drop target for a dragged track row
 * (`application/x-studio-track`). Only a playlist the member may add to
 * (their own, or one they edit) takes the drop; it lights up while a track
 * hovers it, and the add ends in "Added to {name}", "Already in {name}" or
 * the reason it failed.
 */
export function useStudioRailDrop(row: StudioRailPlaylistRowModel): {
  handlers: StudioRailDropHandlers | null;
  isOver: boolean;
  isAdding: boolean;
} {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const add = useAddStudioPlaylistTracks();
  const [isOver, setIsOver] = useState(false);
  if (!row.hasEditRights)
    return { handlers: null, isOver: false, isAdding: false };

  const accept = (event: DragEvent<HTMLElement>) => {
    if (!isTrackDrag(event)) return false;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    return true;
  };

  async function addTrack(trackId: string) {
    try {
      const { addedCount } = await add.mutateAsync({
        playlistId: row.playlistId,
        trackIds: [trackId],
        previousTrackCount: row.trackCount ?? 0,
      });
      showToast(
        t(
          addedCount > 0
            ? "studio:playlist.add.addedToast"
            : "studio:playlist.add.alreadyThereToast",
          { name: row.name },
        ),
        addedCount > 0 ? "success" : "info",
      );
    } catch (error) {
      showToast(t(studioErrorMessageKeyOf(error)), "error");
    }
  }

  return {
    isOver,
    isAdding: add.isPending,
    handlers: {
      onDragEnter: (event) => {
        if (accept(event)) setIsOver(true);
      },
      onDragOver: (event) => {
        // The highlight also comes back after a dragleave onto a child.
        if (accept(event)) setIsOver(true);
      },
      onDragLeave: (event) => {
        // Moving onto the row's own name or meta line is still over it.
        const next = event.relatedTarget;
        if (next instanceof Node && event.currentTarget.contains(next)) return;
        setIsOver(false);
      },
      onDrop: (event) => {
        setIsOver(false);
        if (!isTrackDrag(event)) return;
        event.preventDefault();
        const trackId = droppedTrackIdOf(event);
        if (trackId) void addTrack(trackId);
      },
    },
  };
}
