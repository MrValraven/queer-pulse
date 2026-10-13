import {
  ACCOUNT_RESTRICTED_COPY,
  isAccountRestricted,
} from "../../shared/api/errorMessage";
import { studioErrorCodeOf } from "./api/studio.api";
import type { StudioErrorCode } from "./api/studio.types";

/** One message per contract error code. The publish codes reuse the publish
 *  checklist's lines, so a refusal reads the same as the checklist. */
export const STUDIO_ERROR_MESSAGE_KEY: Record<StudioErrorCode, string> = {
  studio_access_required: "studio:errors.accessRequired",
  studio_not_persona_owner: "studio:errors.notPersonaOwner",
  studio_persona_kind_not_allowed: "studio:errors.personaKindNotAllowed",
  studio_publish_missing_title: "studio:uploadFlow.publish.gap.title",
  studio_publish_missing_cover: "studio:uploadFlow.publish.gap.cover",
  studio_publish_missing_rights: "studio:uploadFlow.publish.gap.rights",
  studio_publish_missing_tracks: "studio:uploadFlow.publish.gap.tracks",
  studio_publish_tracks_pending: "studio:uploadFlow.publish.gap.pending",
  studio_release_not_draft: "studio:errors.releaseNotDraft",
  studio_release_type_mismatch: "studio:errors.releaseTypeMismatch",
  studio_track_order_mismatch: "studio:errors.trackOrderMismatch",
  studio_track_limit: "studio:errors.trackLimit",
  studio_audio_unreadable: "studio:errors.audioUnreadable",
  studio_audio_wrong_owner: "studio:errors.audioWrongOwner",
  studio_playlist_limit: "studio:errors.playlistLimit",
  studio_playlist_track_limit: "studio:errors.playlistTrackLimit",
  studio_playlist_order_mismatch: "studio:errors.playlistOrderMismatch",
  studio_playlist_credit_not_allowed: "studio:errors.playlistCreditNotAllowed",
  studio_playlist_track_unavailable: "studio:errors.playlistTrackUnavailable",
};

export function studioErrorMessageKey(code: StudioErrorCode | null): string {
  return code ? STUDIO_ERROR_MESSAGE_KEY[code] : "studio:errors.generic";
}

/** A refused Studio request as a catalog key: the shared restriction line for
 *  a member under a moderation restriction (the server's 403 sentence,
 *  translated), else the Studio code's own line, else the generic one. */
export function studioErrorMessageKeyOf(error: unknown): string {
  if (isAccountRestricted(error)) return ACCOUNT_RESTRICTED_COPY.key;
  return studioErrorMessageKey(studioErrorCodeOf(error));
}
