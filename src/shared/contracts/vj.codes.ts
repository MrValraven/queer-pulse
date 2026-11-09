/**
 * VJ wire contract (C 3), frontend mirror of
 * `queerpulse-backend/src/vj/vj.contract.ts` and `vj-response.ts`. Names and
 * values match it; edit both together.
 * Reason codes: REST and upload (C 5), socket (C 7.11).
 */

// Reason codes (REST and upload)

/** Refusal codes the server sends, in the contract's table order (v1, then C 5). */
export const VJ_REFUSAL_CODES = [
  "VJ_PACK_NOT_FOUND",
  "VJ_PACK_NAME_REQUIRED",
  "VJ_PACK_NAME_TOO_LONG",
  "VJ_PACK_NAME_TAKEN",
  "VJ_PACK_LIMIT_REACHED",
  "VJ_PACK_REORDER_MISMATCH",
  "VJ_PACK_FULL",
  "VJ_PACK_CLIPS_REORDER_MISMATCH",
  "VJ_CLIP_NOT_FOUND",
  "VJ_CLIP_ALREADY_IN_PACK",
  "VJ_CLIP_NOT_IN_PACK",
  "VJ_CLIP_TITLE_REQUIRED",
  "VJ_CLIP_TITLE_TOO_LONG",
  "VJ_CLIP_FIT_MODE_INVALID",
  "VJ_CLIP_DIMENSIONS_INVALID",
  "VJ_CLIP_DURATION_INVALID",
  "VJ_CLIP_KEY_INVALID",
  "VJ_CLIP_KEY_IN_USE",
  "VJ_CLIP_IDS_INVALID",
  "VJ_LIBRARY_FULL",
  "VJ_UPLOAD_NOT_ADMIN",
  "VJ_UPLOAD_TYPE_UNSUPPORTED",
  "VJ_UPLOAD_TOO_LARGE",
  "VJ_UPLOAD_FORMAT_MOV",
  "VJ_UPLOAD_CONTENT_MISMATCH",
  "VJ_UPLOAD_MISSING",
  "VJ_CLIP_FAVORITE_INVALID",
  "VJ_CLIP_SPEED_INVALID",
  "VJ_CLIP_LOOP_MODE_INVALID",
  "VJ_CLIP_LOOP_INVALID",
  "VJ_EVENT_NOT_FOUND",
  "VJ_EVENT_NOT_LINKABLE",
  "VJ_SCENE_NOT_FOUND",
  "VJ_SCENE_NAME_REQUIRED",
  "VJ_SCENE_NAME_TOO_LONG",
  "VJ_SCENE_LIMIT_REACHED",
  "VJ_SCENE_LOOK_INVALID",
  "VJ_SCENE_CLIP_NOT_FOUND",
  "VJ_SCENE_REORDER_MISMATCH",
  "VJ_SETLIST_NOT_FOUND",
  "VJ_SETLIST_NAME_REQUIRED",
  "VJ_SETLIST_NAME_TOO_LONG",
  "VJ_SETLIST_NAME_TAKEN",
  "VJ_SETLIST_LIMIT_REACHED",
  "VJ_SETLIST_REORDER_MISMATCH",
  "VJ_SETLIST_ITEMS_INVALID",
  "VJ_SETLIST_FULL",
  "VJ_CONNECTION_NOT_FOUND",
  "VJ_CONNECTION_NOT_YOURS",
] as const;
export type VjRefusalCode = (typeof VJ_REFUSAL_CODES)[number];

/** Raised by the frontend only (never sent by the server). */
export const VJ_CLIENT_UPLOAD_CODES = [
  "VJ_UPLOAD_HEVC",
  "VJ_UPLOAD_UNPLAYABLE",
  "VJ_UPLOAD_GIF_DAMAGED",
  "VJ_UPLOAD_THUMBNAIL_FAILED",
  "VJ_PREVIEW_UNSUPPORTED",
  "VJ_PREVIEW_FAILED",
] as const;
export type VjClientUploadCode = (typeof VJ_CLIENT_UPLOAD_CODES)[number];

// Socket.io namespace /vj

/** Same codes as ChatWsErrorCode. */
export type VjWsTransportCode =
  | "UNAUTHORIZED"
  | "TOKEN_EXPIRED"
  | "SESSION_REVOKED"
  | "PLATFORM_LOCKED"
  | "RATE_LIMITED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "SERVER_ERROR";

/** The `exception` frame's `domainCode` values. */
export const VJ_EXCEPTION_DOMAIN_CODES = [
  "vj_not_admin",
  "vj_screen_replaced",
  "vj_stopped",
] as const;

/** v1 codes in v1 order, with the C 7.11 codes inserted before vj_server_error
 *  and the codes added since appended after it. */
export const VJ_SOCKET_ERROR_CODES = [
  "vj_not_admin",
  "vj_not_attached",
  "vj_already_attached",
  "vj_wrong_role",
  "vj_screen_id_invalid",
  "vj_client_id_invalid",
  "vj_rate_limited",
  "vj_stale_command",
  "vj_stale_clip_sequence",
  "vj_not_lead",
  "vj_shuffle_off",
  "vj_no_active_pack",
  "vj_pack_not_found",
  "vj_clip_not_found",
  "vj_clip_not_in_pack",
  "vj_patch_empty",
  "vj_transition_mode_invalid",
  "vj_fade_out_of_range",
  "vj_overlay_text_invalid",
  "vj_overlay_text_too_long",
  "vj_overlay_text_blank",
  "vj_overlay_style_invalid",
  "vj_speed_invalid",
  "vj_effect_flag_invalid",
  "vj_shuffle_interval_invalid",
  "vj_bpm_out_of_range",
  "vj_client_outdated",
  "vj_immediate_not_allowed",
  "vj_transition_length_invalid",
  "vj_overlay_position_invalid",
  "vj_overlay_size_invalid",
  "vj_color_token_invalid",
  "vj_overlay_hide_out_of_range",
  "vj_effect_unknown",
  "vj_effect_amount_invalid",
  "vj_effect_variant_invalid",
  "vj_effect_exclusive_conflict",
  "vj_effects_too_many",
  "vj_generator_invalid",
  "vj_generator_variant_invalid",
  "vj_downbeat_out_of_range",
  "vj_quantize_invalid",
  "vj_tempo_source_invalid",
  "vj_tempo_source_conflict",
  "vj_mic_unavailable",
  "vj_mix_amount_invalid",
  "vj_blend_mode_invalid",
  "vj_mix_empty",
  "vj_shuffle_source_invalid",
  "vj_excluded_clips_invalid",
  "vj_clip_excluded",
  "vj_clip_not_favorite",
  "vj_screen_not_attached",
  "vj_override_invalid",
  "vj_overrides_too_many",
  "vj_scene_not_found",
  "vj_setlist_not_found",
  "vj_setlist_none",
  "vj_setlist_empty",
  "vj_setlist_index_invalid",
  "vj_setlist_start",
  "vj_setlist_end",
  "vj_stale_setlist",
  "vj_countdown_target_conflict",
  "vj_countdown_out_of_range",
  "vj_countdown_target_missing",
  "vj_countdown_label_invalid",
  "vj_countdown_label_too_long",
  "vj_logo_corner_invalid",
  "vj_event_card_kind_invalid",
  "vj_event_card_no_event",
  "vj_server_error",
  "vj_stopped",
  "vj_render_mode_invalid",
  "vj_no_screens_connected",
] as const;
export type VjSocketErrorCode = (typeof VJ_SOCKET_ERROR_CODES)[number];
