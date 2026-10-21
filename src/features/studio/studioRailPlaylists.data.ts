import { studioSavedId } from "./api/studio.adapters";

/** Placeholder rows the rail shows while the member's playlists load. */
export const RAIL_PLAYLIST_SKELETON_ROW_COUNT = 4;

/** The `${kind}:` part of a saved playlist's `SavedItem.id`, derived from
 *  the saved-id builder so the two formats stay in step. */
export const SAVED_ID_PREFIX = studioSavedId.playlist("");

/** Past this many playlists the rail offers its filter box. */
export const RAIL_PLAYLIST_FILTER_THRESHOLD = 8;
