import { apiGet, apiPut } from "../../../shared/api/client";
import type { StudioPlaybackPreferencesDTO } from "./studio.types";

/** GET /me/studio-playback: the member's Studio player settings. Needs a
 *  Studio grant; answers the defaults when nothing is stored. */
export const getStudioPlayback = () =>
  apiGet<StudioPlaybackPreferencesDTO>("/me/studio-playback");

/** PUT /me/studio-playback: a partial update. Only the fields passed change;
 *  the answer is the whole stored row. */
export const putStudioPlayback = (
  patch: Partial<StudioPlaybackPreferencesDTO>,
) => apiPut<StudioPlaybackPreferencesDTO>("/me/studio-playback", patch);
