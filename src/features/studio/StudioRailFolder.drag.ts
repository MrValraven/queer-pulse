import { useState, type DragEvent } from "react";

/** A rail playlist row on its way to a folder. Payload JSON `{playlistId}`. */
export const STUDIO_PLAYLIST_DRAG_TYPE = "application/x-studio-playlist";

const isPlaylistDrag = (event: DragEvent<HTMLElement>) =>
  event.dataTransfer.types.includes(STUDIO_PLAYLIST_DRAG_TYPE);

function droppedPlaylistIdOf(event: DragEvent<HTMLElement>): string | null {
  try {
    const payload: unknown = JSON.parse(
      event.dataTransfer.getData(STUDIO_PLAYLIST_DRAG_TYPE),
    );
    if (
      payload !== null &&
      typeof payload === "object" &&
      "playlistId" in payload &&
      typeof payload.playlistId === "string"
    )
      return payload.playlistId;
  } catch {
    // Not a rail playlist: nothing to file.
  }
  return null;
}

export interface StudioPlaylistDragSource {
  draggable: true;
  onDragStart: (event: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
}

/** What a rail row spreads on its link so it can be dragged onto a folder.
 *  The link's own URL still travels as text, so a drop elsewhere (a chat
 *  field) keeps working as before. */
export function studioPlaylistDragSource(
  playlistId: string,
  onDragChange: (playlistId: string | null) => void,
): StudioPlaylistDragSource {
  return {
    draggable: true,
    onDragStart: (event) => {
      event.dataTransfer.setData(
        STUDIO_PLAYLIST_DRAG_TYPE,
        JSON.stringify({ playlistId }),
      );
      event.dataTransfer.effectAllowed = "copyMove";
      onDragChange(playlistId);
    },
    onDragEnd: () => onDragChange(null),
  };
}

export interface StudioPlaylistDropHandlers {
  onDragEnter: (event: DragEvent<HTMLElement>) => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDragLeave: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
}

/** A folder (or the rail's "move out" strip) as a drop target for a dragged
 *  rail playlist. It lights up while a playlist hovers it and ignores every
 *  other drag, so a dragged track passes over it untouched. */
export function useStudioPlaylistDrop(
  onDropPlaylist: (playlistId: string) => void,
): { isOver: boolean; handlers: StudioPlaylistDropHandlers } {
  const [isOver, setIsOver] = useState(false);
  const accept = (event: DragEvent<HTMLElement>) => {
    if (!isPlaylistDrag(event)) return false;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    return true;
  };
  return {
    isOver,
    handlers: {
      onDragEnter: (event) => {
        if (accept(event)) setIsOver(true);
      },
      onDragOver: (event) => {
        if (accept(event)) setIsOver(true);
      },
      onDragLeave: (event) => {
        const next = event.relatedTarget;
        if (next instanceof Node && event.currentTarget.contains(next)) return;
        setIsOver(false);
      },
      onDrop: (event) => {
        setIsOver(false);
        if (!isPlaylistDrag(event)) return;
        event.preventDefault();
        const playlistId = droppedPlaylistIdOf(event);
        if (playlistId) onDropPlaylist(playlistId);
      },
    },
  };
}
