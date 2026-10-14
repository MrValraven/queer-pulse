import { apiDelete, apiGet, apiPost, apiPut } from "../../../shared/api/client";
import type {
  StudioPreviewLinkDTO,
  StudioPreviewResultDTO,
  StudioPressKitDTO,
  StudioReleaseDTO,
  StudioStreamDTO,
  UpdateStudioPressKitBody,
} from "./studio.types";

// One raw call per Studio v3 endpoint
// (QUEERPULSE-STUDIO-V3-ARTIST-TOOLS-CONTRACT-2026-10-13.md). Kept apart
// from studio.api.ts so other Studio work editing that file never collides
// with this one. Nothing here records who opens a preview or a press kit.

const segment = (id: string) => encodeURIComponent(id);
const releasePath = (releaseId: string) =>
  `/studio/releases/${segment(releaseId)}`;

/** Owner; draft or scheduled. `publishAt` is ISO 8601 with an offset
 *  (`Date#toISOString()`), 15 minutes to 365 days ahead on the server clock.
 *  409 `studio_release_not_schedulable`, 422 `studio_schedule_out_of_range`,
 *  then the publish rule's codes. */
export const scheduleStudioRelease = (releaseId: string, publishAt: string) =>
  apiPost<StudioReleaseDTO>(`${releasePath(releaseId)}/schedule`, {
    publishAt,
  });

/** Owner; back to draft. Reminders stay. A no-op on a draft. */
export const unscheduleStudioRelease = (releaseId: string) =>
  apiPost<StudioReleaseDTO>(`${releasePath(releaseId)}/unschedule`);

/** 204; 404 unless the release is scheduled and visible. */
export const setStudioReleaseReminder = (releaseId: string) =>
  apiPut<void>(`${releasePath(releaseId)}/reminder`);

/** 204, idempotent. */
export const clearStudioReleaseReminder = (releaseId: string) =>
  apiDelete<void>(`${releasePath(releaseId)}/reminder`);

/** 200 on a published release; 409 `studio_release_no_changes` without a
 *  track change (and on a draft or scheduled release). */
export const createStudioReleaseVersion = (releaseId: string, note: string) =>
  apiPost<StudioReleaseDTO>(`${releasePath(releaseId)}/versions`, { note });

/** Owner; draft or scheduled. Mints a link or replaces the existing one. */
export const mintStudioPreviewLink = (releaseId: string) =>
  apiPost<StudioPreviewLinkDTO>(`${releasePath(releaseId)}/preview-link`);

/** Owner; 204, idempotent. */
export const revokeStudioPreviewLink = (releaseId: string) =>
  apiDelete<void>(`${releasePath(releaseId)}/preview-link`);

/** Any granted member holding the link. Every failure is the same 404
 *  `studio_preview_not_found`. */
export const getStudioPreview = (token: string) =>
  apiGet<StudioPreviewResultDTO>(`/studio/previews/${segment(token)}`);

/** A signed URL for one track of the previewed release. Never cached. */
export const getStudioPreviewStream = (token: string, trackId: string) =>
  apiGet<StudioStreamDTO>(
    `/studio/previews/${segment(token)}/tracks/${segment(trackId)}/stream`,
  );

export const getStudioPressKit = (subprofileId: string) =>
  apiGet<StudioPressKitDTO>(
    `/studio/artists/${segment(subprofileId)}/press-kit`,
  );

/** Owner; every key required, null or [] clears. 403
 *  `studio_not_persona_owner` for anyone else. */
export const putStudioPressKit = (
  subprofileId: string,
  body: UpdateStudioPressKitBody,
) =>
  apiPut<StudioPressKitDTO>(
    `/studio/artists/${segment(subprofileId)}/press-kit`,
    body,
  );
