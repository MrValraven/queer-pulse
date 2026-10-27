import { apiDelete, apiGet, apiPost, apiPut } from "../../../shared/api/client";
import type {
  RecordStudioPlayBody,
  StudioListeningRange,
  StudioListeningSummaryDTO,
  StudioListensPageDTO,
  StudioSupporterStateDTO,
  StudioSupportingResponseDTO,
  UpdateStudioSupporterBody,
} from "./studioListening.types";

// One raw call per listener read and write of the Studio dashboard upgrade,
// Part 2 (QUEERPULSE-STUDIO-DASHBOARD-UPGRADE-CONTRACT-PART-2-2026-10-27.md,
// sections 2, 4 and 5, with backend delta 1). The play call answers 204
// whatever the server did with it, so a 400 or a throttler 429 is the only
// failure a caller can see; callers stay silent on it.

const segment = (id: string) => encodeURIComponent(id);

/** POST /studio/plays, the recorder's count. Resolves on the 204. */
export const postStudioPlay = (trackId: string) =>
  apiPost<void>("/studio/plays", { trackId } satisfies RecordStudioPlayBody);

/** GET /me/studio-listening?range=, the caller's own counts, unfloored. */
export const getStudioListeningSummary = (range: StudioListeningRange) =>
  apiGet<StudioListeningSummaryDTO>(
    `/me/studio-listening?range=${encodeURIComponent(range)}`,
  );

/** GET /me/studio-listening/recent, newest first. Page one carries no cursor. */
export const getStudioListeningRecent = (cursor: string | null) =>
  apiGet<StudioListensPageDTO>(
    `/me/studio-listening/recent${
      cursor === null ? "" : `?cursor=${encodeURIComponent(cursor)}`
    }`,
  );

/** DELETE /me/studio-listening, 204 and idempotent. */
export const deleteStudioListening = () =>
  apiDelete<void>("/me/studio-listening");

/** GET /me/studio-listening/supporting, newest opt-in first. */
export const getStudioListeningSupporting = () =>
  apiGet<StudioSupportingResponseDTO>("/me/studio-listening/supporting");

/** GET /studio/artists/:subprofileId/supporter, the caller's opt-in. */
export const getStudioSupporterState = (subprofileId: string) =>
  apiGet<StudioSupporterStateDTO>(
    `/studio/artists/${segment(subprofileId)}/supporter`,
  );

/** PUT /studio/artists/:subprofileId/supporter; a null id shows the account. */
export const putStudioSupporter = (
  subprofileId: string,
  body: UpdateStudioSupporterBody,
) =>
  apiPut<StudioSupporterStateDTO>(
    `/studio/artists/${segment(subprofileId)}/supporter`,
    body,
  );

/** DELETE /studio/artists/:subprofileId/supporter, 204 for any uuid. */
export const deleteStudioSupporter = (subprofileId: string) =>
  apiDelete<void>(`/studio/artists/${segment(subprofileId)}/supporter`);
