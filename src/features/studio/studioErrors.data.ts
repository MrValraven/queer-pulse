import {
  ACCOUNT_RESTRICTED_COPY,
  isAccountRestricted,
} from "../../shared/api/errorMessage";
import { studioErrorCodeOf } from "./api/studio.api";
import type { StudioErrorCode } from "./api/studio.types";
import type { StudioSafetyErrorCode } from "./api/studioSafety.types";
import {
  studioReasonCopyKey,
  studioReasonOf,
  type StudioFailureContext,
} from "./studioReason";

/** Studio safety and moderation: one message per new contract code. */
export const STUDIO_SAFETY_ERROR_MESSAGE_KEY: Record<
  StudioSafetyErrorCode,
  string
> = {
  studio_track_withheld: "studio:errors.trackWithheld",
  studio_track_explicit_locked: "studio:errors.trackExplicitLocked",
  studio_use_copyright_claim: "studio:errors.useCopyrightClaim",
  studio_claim_own_track: "studio:errors.claimOwnTrack",
  studio_claim_exists: "studio:errors.claimExists",
  studio_claim_limit: "studio:errors.claimLimit",
  studio_claim_not_countered: "studio:errors.claimNotCountered",
  studio_claim_already_replied: "studio:errors.claimAlreadyReplied",
  studio_claim_not_live: "studio:errors.claimNotLive",
  studio_claim_not_accepted: "studio:errors.claimNotAccepted",
  studio_claim_not_submitted: "studio:errors.claimNotSubmitted",
  studio_claim_not_decidable: "studio:errors.claimNotDecidable",
  studio_track_report_mismatch: "studio:errors.trackReportMismatch",
  studio_track_report_not_open: "studio:errors.trackReportNotOpen",
};

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
  studio_release_not_schedulable: "studio:errors.releaseNotSchedulable",
  studio_release_needs_playable_track:
    "studio:errors.releaseNeedsPlayableTrack",
  studio_release_no_changes: "studio:errors.releaseNoChanges",
  studio_preview_not_available: "studio:errors.previewNotAvailable",
  studio_preview_not_found: "studio:errors.previewNotFound",
  studio_schedule_out_of_range: "studio:errors.scheduleOutOfRange",
  studio_press_track_not_allowed: "studio:errors.pressTrackNotAllowed",
  studio_release_withdrawn: "studio:errors.releaseWithdrawn",
  studio_release_not_taken_down: "studio:errors.releaseNotTakenDown",
  studio_dispute_already_open: "studio:errors.disputeAlreadyOpen",
  studio_dispute_limit_reached: "studio:errors.disputeLimitReached",
  studio_dispute_not_open: "studio:errors.disputeNotOpen",
  studio_takedown_report_mismatch: "studio:errors.takedownReportMismatch",
  studio_takedown_report_not_open: "studio:errors.takedownReportNotOpen",
  studio_release_has_open_dispute: "studio:errors.releaseHasOpenDispute",
  studio_radio_filter_required: "studio:errors.radioFilterRequired",
  studio_scene_not_found: "studio:errors.sceneNotFound",
  studio_credit_candidate_not_found: "studio:credits.editor.notFound",
  studio_credit_not_found: "studio:errors.creditNotFound",
  studio_curation_shelf_full: "studio:errors.curationShelfFull",
  studio_curation_already_on_shelf: "studio:errors.curationAlreadyOnShelf",
  studio_curation_order_mismatch: "studio:errors.curationOrderMismatch",
  studio_spotlight_not_an_artist: "studio:errors.spotlightNotAnArtist",
  studio_spotlight_no_release: "studio:errors.spotlightNoRelease",
  studio_spotlight_slot_full: "studio:errors.spotlightSlotFull",
  studio_spotlight_already_in_slot: "studio:errors.spotlightAlreadyInSlot",
  studio_spotlight_order_mismatch: "studio:errors.spotlightOrderMismatch",
  studio_spotlight_not_found: "studio:errors.spotlightNotFound",
  studio_scene_slug_taken: "studio:errors.sceneSlugTaken",
  studio_scene_order_mismatch: "studio:errors.sceneOrderMismatch",
  studio_credit_already_requested: "studio:errors.creditAlreadyRequested",
  studio_credit_limit: "studio:credits.editor.limit",
  studio_credit_not_pending: "studio:credits.inbox.gone",
  studio_credit_not_accepted: "studio:errors.creditNotAccepted",
  studio_scene_cover_changed: "studio:errors.sceneCoverChanged",
  studio_scene_not_available: "studio:errors.sceneNotAvailable",
  studio_curation_release_not_published:
    "studio:errors.curationReleaseNotPublished",
  studio_scene_event_not_pinnable: "studio:errors.sceneEventNotPinnable",
  studio_credit_persona_not_creditable:
    "studio:errors.creditPersonaNotCreditable",
  studio_credit_self_persona: "studio:errors.creditSelfPersona",
  studio_chapters_out_of_range: "studio:chapters.error.outOfRange",
  // Studio artist kinds.
  studio_publish_missing_sources: "studio:errors.publishMissingSources",
  studio_episode_show_not_published: "studio:errors.episodeShowNotPublished",
  studio_episode_already_published: "studio:errors.episodeAlreadyPublished",
  studio_episode_order_locked: "studio:errors.episodeOrderLocked",
  studio_not_a_podcast: "studio:errors.notAPodcast",
  studio_episode_limit: "studio:errors.episodeLimit",
  // Studio collaborative playlists.
  studio_playlist_not_found: "studio:errors.playlistNotFound",
  studio_playlist_owner_only: "studio:errors.playlistOwnerOnly",
  studio_playlist_editor_source_mismatch:
    "studio:errors.playlistEditorSourceMismatch",
  studio_playlist_editor_cap: "studio:errors.playlistEditorCap",
  studio_playlist_editor_ineligible: "studio:errors.playlistEditorIneligible",
  studio_playlist_invite_unavailable: "studio:errors.playlistInviteUnavailable",
  studio_playlist_invite_not_found: "studio:errors.playlistInviteNotFound",
  studio_playlist_credit_change_removes_editors:
    "studio:errors.playlistCreditChangeRemovesEditors",
  studio_playlist_entry_not_found: "studio:errors.playlistEntryNotFound",
  studio_playlist_editor_not_found: "studio:errors.playlistEditorNotFound",
  studio_milestone_not_found: "studio:errors.reason.studio_milestone_not_found",
  studio_supporter_artist_not_found:
    "studio:errors.reason.studio_supporter_artist_not_found",
  studio_supporter_own_persona:
    "studio:errors.reason.studio_supporter_own_persona",
  studio_supporter_identity_not_yours:
    "studio:errors.reason.studio_supporter_identity_not_yours",
  studio_persona_not_found: "studio:errors.reason.studio_persona_not_found",
  studio_release_type_not_for_sale:
    "studio:errors.reason.studio_release_type_not_for_sale",
  studio_price_out_of_range: "studio:errors.reason.studio_price_out_of_range",
  studio_payment_methods_needed_for_sale:
    "studio:errors.reason.studio_payment_methods_needed_for_sale",
  studio_payment_methods_limit:
    "studio:errors.reason.studio_payment_methods_limit",
  studio_payment_link_invalid:
    "studio:errors.reason.studio_payment_link_invalid",
  studio_payment_mbway_invalid:
    "studio:errors.reason.studio_payment_mbway_invalid",
  studio_payment_iban_invalid:
    "studio:errors.reason.studio_payment_iban_invalid",
  studio_purchase_item_required:
    "studio:errors.reason.studio_purchase_item_required",
  studio_purchase_item_not_found:
    "studio:errors.reason.studio_purchase_item_not_found",
  studio_purchase_own_persona:
    "studio:errors.reason.studio_purchase_own_persona",
  studio_purchase_not_for_sale:
    "studio:errors.reason.studio_purchase_not_for_sale",
  studio_purchase_release_not_published:
    "studio:errors.reason.studio_purchase_release_not_published",
  studio_purchase_track_unavailable:
    "studio:errors.reason.studio_purchase_track_unavailable",
  studio_purchase_unavailable:
    "studio:errors.reason.studio_purchase_unavailable",
  studio_purchase_no_payment_methods:
    "studio:errors.reason.studio_purchase_no_payment_methods",
  studio_purchase_pending_exists:
    "studio:errors.reason.studio_purchase_pending_exists",
  studio_purchase_already_owned:
    "studio:errors.reason.studio_purchase_already_owned",
  studio_purchase_amount_below_minimum:
    "studio:errors.reason.studio_purchase_amount_below_minimum",
  studio_purchase_amount_above_cap:
    "studio:errors.reason.studio_purchase_amount_above_cap",
  studio_purchase_price_changed:
    "studio:errors.reason.studio_purchase_price_changed",
  studio_purchase_reference_invalid:
    "studio:errors.reason.studio_purchase_reference_invalid",
  studio_purchase_reference_taken:
    "studio:errors.reason.studio_purchase_reference_taken",
  studio_purchase_not_found: "studio:errors.reason.studio_purchase_not_found",
  studio_purchase_not_pending:
    "studio:errors.reason.studio_purchase_not_pending",
  studio_purchase_wall_not_available:
    "studio:errors.reason.studio_purchase_wall_not_available",
  studio_purchase_not_confirmed:
    "studio:errors.reason.studio_purchase_not_confirmed",
  studio_download_item_deleted:
    "studio:errors.reason.studio_download_item_deleted",
  studio_download_track_removed:
    "studio:errors.reason.studio_download_track_removed",
  studio_download_release_taken_down:
    "studio:errors.reason.studio_download_release_taken_down",
  studio_download_artist_unavailable:
    "studio:errors.reason.studio_download_artist_unavailable",
  studio_download_track_withheld:
    "studio:errors.reason.studio_download_track_withheld",
  studio_download_track_not_ready:
    "studio:errors.reason.studio_download_track_not_ready",
  studio_download_track_preparing:
    "studio:errors.reason.studio_download_track_preparing",
  // Studio landing v2 (2026-10-28).
  studio_landing_preview_unavailable:
    "studio:errors.reason.studio_landing_preview_unavailable",
  studio_landing_preview_not_found:
    "studio:errors.reason.studio_landing_preview_not_found",
  studio_landing_preview_track_not_eligible:
    "studio:errors.reason.studio_landing_preview_track_not_eligible",
  studio_landing_preview_exists:
    "studio:errors.reason.studio_landing_preview_exists",
  studio_landing_previews_full:
    "studio:errors.reason.studio_landing_previews_full",
  studio_landing_preview_no_reachable_owner:
    "studio:errors.reason.studio_landing_preview_no_reachable_owner",
  studio_landing_preview_not_pending:
    "studio:errors.reason.studio_landing_preview_not_pending",
  studio_landing_preview_not_approved:
    "studio:errors.reason.studio_landing_preview_not_approved",
  studio_landing_preview_main_persona_only:
    "studio:errors.reason.studio_landing_preview_main_persona_only",
  studio_landing_consent_required:
    "studio:errors.reason.studio_landing_consent_required",
  studio_landing_persona_not_eligible:
    "studio:errors.reason.studio_landing_persona_not_eligible",
  studio_landing_card_exists: "studio:errors.reason.studio_landing_card_exists",
  studio_landing_cards_full: "studio:errors.reason.studio_landing_cards_full",
  studio_landing_card_not_found:
    "studio:errors.reason.studio_landing_card_not_found",
  studio_landing_photo_not_yours:
    "studio:errors.reason.studio_landing_photo_not_yours",
  studio_landing_order_mismatch:
    "studio:errors.reason.studio_landing_order_mismatch",
  studio_founding_persona_not_eligible:
    "studio:errors.reason.studio_founding_persona_not_eligible",
  studio_founding_artist_exists:
    "studio:errors.reason.studio_founding_artist_exists",
  studio_founding_artists_full:
    "studio:errors.reason.studio_founding_artists_full",
  studio_founding_artist_not_found:
    "studio:errors.reason.studio_founding_artist_not_found",
  studio_access_request_exists:
    "studio:errors.reason.studio_access_request_exists",
  studio_access_already_granted:
    "studio:errors.reason.studio_access_already_granted",
  studio_access_request_not_found:
    "studio:errors.reason.studio_access_request_not_found",
  ...STUDIO_SAFETY_ERROR_MESSAGE_KEY,
};

export function studioErrorMessageKey(code: StudioErrorCode | null): string {
  return code ? STUDIO_ERROR_MESSAGE_KEY[code] : "studio:errors.generic";
}

/** A refused Studio request as a catalog key: the shared restriction line for
 *  a member under a moderation restriction (the server's 403 sentence,
 *  translated), else the Studio code's own line, else the `context` line for
 *  the failure's reason (offline, unreachable, timeout, rate limit, server,
 *  access, gone). A reason we cannot name keeps the generic key, because
 *  callers compare against `studioErrorMessageKey(null)` to swap in their
 *  own line. */
export function studioErrorMessageKeyOf(
  error: unknown,
  context: StudioFailureContext = "save",
): string {
  if (isAccountRestricted(error)) return ACCOUNT_RESTRICTED_COPY.key;
  const code = studioErrorCodeOf(error);
  if (code) return STUDIO_ERROR_MESSAGE_KEY[code];
  const reason = studioReasonOf(error);
  if (reason === "unknown") return studioErrorMessageKey(null);
  return studioReasonCopyKey(reason, context);
}
