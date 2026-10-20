import {
  toReleaseView,
  toTrackRowView,
  type StudioReleaseView,
  type StudioTrackRowView,
} from "../../../studio/api/studio.adapters";
import type { StudioReleaseDTO } from "../../../studio/api/studio.types";

/** A fixed placeholder token: the preview components render their preview shape, and the frame keeps Play inert. */
export const STAFF_STUDIO_PREVIEW_TOKEN = "staff-preview";

/**
 * A release as staff preview it. `toReleaseView` builds the public release
 * view, which drops a draft episode for anyone but the owner. The draft
 * episode staff opened is mapped on its own, as a listener's row, from the
 * raw `dto.tracks` entry the server sends with it.
 */
export function toStaffStudioPreview(
  dto: StudioReleaseDTO,
  episodeTrackId: string | null,
): { release: StudioReleaseView; episode: StudioTrackRowView | null } {
  const episodeTrack =
    episodeTrackId === null
      ? undefined
      : dto.tracks.find((track) => track.id === episodeTrackId);
  return {
    release: toReleaseView(dto),
    episode: episodeTrack
      ? toTrackRowView(episodeTrack, { isOwnerView: false })
      : null,
  };
}
