import { apiGet } from "../../../shared/api/client";
import type { StudioLikedTracksPageDTO } from "./studio.types";

// Liked songs reads the member's own `studio_track` saves. Liking and
// unliking go through the Saved feature (`PUT/DELETE /me/saved/:id`).

const cursorQuery = (cursor: string | null) =>
  cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";

export const getStudioLikedTracks = (cursor: string | null) =>
  apiGet<StudioLikedTracksPageDTO>(
    `/studio/playlists/liked${cursorQuery(cursor)}`,
  );
