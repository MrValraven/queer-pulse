import { apiGet, apiPut } from "../../../shared/api/client";
import type {
  StudioPlaybackPreferencesDTO,
  StudioPlaybackUpdateDTO,
} from "./studio.types";

/** GET /me/studio-playback: the member's Studio player settings. Needs a
 *  Studio grant; answers the defaults when nothing is stored. */
export const getStudioPlayback = () =>
  apiGet<StudioPlaybackPreferencesDTO>("/me/studio-playback");

/** PUT /me/studio-playback: a partial update. Only the fields passed change;
 *  the answer is the whole stored row. `isListeningHistoryOn` is the single
 *  Listening history switch (pausing deletes nothing on the server).
 *  `hasSeenListeningNotice` is sent only as true: it stamps
 *  listeningNoticeSeenAt once, and a later call keeps the first stamp. */
export const putStudioPlayback = (
  patch: StudioPlaybackUpdateDTO,
): Promise<StudioPlaybackPreferencesDTO> =>
  apiPut<StudioPlaybackPreferencesDTO>("/me/studio-playback", patch);
