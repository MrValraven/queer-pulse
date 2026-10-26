import { apiGet, apiPut } from "../../../shared/api/client";
import type {
  StudioProfilePlaylistsDTO,
  UpdateStudioProfilePlaylistsBody,
} from "./studio.types";

/** The member's own choice of which playlists their profile shows. */
export const STUDIO_PROFILE_PLAYLISTS_PATH = "/studio/me/profile-playlists";

export const getStudioProfilePlaylists = () =>
  apiGet<StudioProfilePlaylistsDTO>(STUDIO_PROFILE_PLAYLISTS_PATH);

export const putStudioProfilePlaylists = (
  body: UpdateStudioProfilePlaylistsBody,
) => apiPut<StudioProfilePlaylistsDTO>(STUDIO_PROFILE_PLAYLISTS_PATH, body);
