/**
 * VJ (`vj`) wire contract, frontend mirror: pure vocabulary with zero imports.
 * Source of truth: QUEERPULSE-VJ-CONTRACT-2026-11-05.md,
 * `queerpulse-backend/src/vj/vj.contract.ts` and `vj-response.ts`. Names, members
 * and string values match it; edit both together.
 */

export const VJ_MEDIA_KINDS = ["video", "gif"] as const;
export type VjMediaKind = (typeof VJ_MEDIA_KINDS)[number];

export const VJ_CLIP_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "image/gif",
] as const;
export type VjClipMimeType = (typeof VJ_CLIP_MIME_TYPES)[number];

export const VJ_FIT_MODES = ["fill", "fit"] as const;
export type VjFitMode = (typeof VJ_FIT_MODES)[number];
export const DEFAULT_VJ_FIT_MODE: VjFitMode = "fill";

export const VJ_TRANSITION_MODES = ["fade", "cut"] as const;
export type VjTransitionMode = (typeof VJ_TRANSITION_MODES)[number];

export const VJ_OVERLAY_STYLES = ["big", "ticker"] as const;
export type VjOverlayStyle = (typeof VJ_OVERLAY_STYLES)[number];

export const VJ_SPEEDS = [0.5, 1, 1.5, 2] as const;
export type VjSpeed = (typeof VJ_SPEEDS)[number];

export const VJ_SHUFFLE_INTERVAL_KINDS = ["seconds", "beats"] as const;
export type VjShuffleIntervalKind = (typeof VJ_SHUFFLE_INTERVAL_KINDS)[number];

export const VJ_SHUFFLE_BEAT_COUNTS = [4, 8, 16, 32] as const;
export type VjShuffleBeatCount = (typeof VJ_SHUFFLE_BEAT_COUNTS)[number];

export const VJ_ATTACH_ROLES = ["screen", "remote"] as const;
export type VjAttachRole = (typeof VJ_ATTACH_ROLES)[number];

export const VJ_LIMITS = {
  /** 100 MB, the `vj_clip` kind cap. */
  clipMaxBytes: 104_857_600,
  /** 256 KB, the `vj_thumbnail` kind cap. */
  thumbnailMaxBytes: 262_144,
  /** Thumbnail longest edge in pixels. */
  thumbnailLongEdgePx: 480,
  clipTitleMax: 120,
  packNameMax: 60,
  packsMax: 50,
  packClipsMax: 200,
  libraryClipsMax: 1000,
  dimensionMax: 16_384,
  durationMsMax: 3_600_000,
  fadeMsMin: 0,
  fadeMsMax: 4000,
  fadeMsDefault: 800,
  overlayTextMax: 80,
  shuffleSecondsMin: 2,
  shuffleSecondsMax: 60,
  shuffleSecondsDefault: 8,
  shuffleBeatsDefault: 8,
  bpmMin: 60,
  bpmMax: 200,
  bpmDefault: 124,
  strobeMaxFlashesPerSecond: 3,
  strobeMaxDurationMs: 10_000,
  /** Lifetime of a preload URL from GET /admin/vj/packs/:id/media. */
  mediaUrlTtlSeconds: 900,
  /** Most ids in one `clipIds` query. */
  mediaClipIdsMax: 200,
} as const;

// Stage state

export interface VjTransition {
  mode: VjTransitionMode;
  /** Integer 0..4000, default 800. */
  fadeMs: number;
}

export interface VjOverlay {
  /** Trimmed, 0..80 code points, default "". */
  text: string;
  style: VjOverlayStyle;
  /** Default false; true needs non-blank text. */
  isVisible: boolean;
}

export interface VjEffects {
  /** Default 1; GIFs ignore it. */
  speed: VjSpeed;
  isMonochrome: boolean;
  isMirrored: boolean;
  isHueCycling: boolean;
  /** The server turns it off 10 s after it went on. */
  isStrobing: boolean;
  isBlackout: boolean;
  /**
   * Server epoch ms when isStrobing last went true; null while off. Shown on
   * the remote as a countdown. Screens time the 10 s cut-off on their own
   * clock from the moment they applied isStrobing: true.
   */
  strobeStartedAt: number | null;
}

export interface VjShuffle {
  isOn: boolean;
  intervalKind: VjShuffleIntervalKind;
  /** "seconds": integer 2..60. "beats": one of 4, 8, 16, 32. Default 8 (either kind). */
  intervalValue: number;
  /** 60..200, rounded to one decimal place; default 124. */
  bpm: number;
}

export interface VjStageState {
  /**
   * Random uuid minted when the server creates this stage in memory. A new
   * value means the backend restarted or the stage was evicted.
   */
  stageEpoch: string;
  /** Starts at 0 for a fresh stage; +1 on every applied change. */
  revision: number;
  /**
   * Starts at 0; +1 whenever liveClipId or activePackId is set, including a
   * re-tap of the live clip. Shuffle reports must name the current value.
   */
  clipSequence: number;
  activePackId: string | null;
  /** Null shows a black screen. */
  liveClipId: string | null;
  transition: VjTransition;
  overlay: VjOverlay;
  effects: VjEffects;
  shuffle: VjShuffle;
  /** Server epoch ms of the last applied change (or creation). */
  updatedAt: number;
}

/** What a screen sends on attach to seed a stage the server lost. */
export type VjStageRestore = Pick<
  VjStageState,
  | "stageEpoch"
  | "revision"
  | "activePackId"
  | "liveClipId"
  | "transition"
  | "overlay"
  | "effects"
  | "shuffle"
>;

export const VJ_STAGE_CAUSES = [
  "attach",
  "restore",
  "command",
  "shuffle",
  "strobe_timeout",
  "library",
] as const;
export type VjStageCause = (typeof VJ_STAGE_CAUSES)[number];

/** Builds the default state for a new stage (backend `createVjStageState`, frontend demo store). */
export function createVjStageState(
  stageEpoch: string,
  now: number,
): VjStageState {
  return {
    stageEpoch,
    revision: 0,
    clipSequence: 0,
    activePackId: null,
    liveClipId: null,
    transition: { mode: "fade", fadeMs: VJ_LIMITS.fadeMsDefault },
    overlay: { text: "", style: "big", isVisible: false },
    effects: {
      speed: 1,
      isMonochrome: false,
      isMirrored: false,
      isHueCycling: false,
      isStrobing: false,
      isBlackout: false,
      strobeStartedAt: null,
    },
    shuffle: {
      isOn: false,
      intervalKind: "seconds",
      intervalValue: VJ_LIMITS.shuffleSecondsDefault,
      bpm: VJ_LIMITS.bpmDefault,
    },
    updatedAt: now,
  };
}

/** Shuffle interval in milliseconds, computed identically on screen, remote and demo. */
export function vjShuffleIntervalMs(shuffle: VjShuffle): number {
  if (shuffle.intervalKind === "seconds") {
    return shuffle.intervalValue * 1000;
  }
  return Math.round((shuffle.intervalValue * 60000) / shuffle.bpm);
}

/** One flash per beat, capped at 3 per second at any tempo. */
export function vjStrobeFlashesPerSecond(bpm: number): number {
  return Math.min(VJ_LIMITS.strobeMaxFlashesPerSecond, bpm / 60);
}

// Screen status

export const VJ_CLIP_READY_STATES = [
  "queued",
  "loading",
  "ready",
  "failed",
] as const;
export type VjClipReadyState = (typeof VJ_CLIP_READY_STATES)[number];

/** Why a screen could not preload a clip; the remote names it. */
export const VJ_PRELOAD_FAILURES = [
  "url_expired",
  "network",
  "storage_full",
  "decode_failed",
  "not_found",
] as const;
export type VjPreloadFailure = (typeof VJ_PRELOAD_FAILURES)[number];

export interface VjScreenClipStatus {
  clipId: string;
  state: VjClipReadyState;
  /** 0..1, bytes received over byteSize; 1 when ready. */
  progress: number;
  /** Set only when state is "failed". */
  failure: VjPreloadFailure | null;
}

export interface VjScreenPreload {
  /** The pack this report covers. */
  packId: string | null;
  /** One entry per clip of that pack, pack order. */
  clips: VjScreenClipStatus[];
}

export interface VjScreenStatus {
  screenId: string;
  /** 1-based, assigned at the first attach of this screenId in this stage and kept for the stage's life. */
  number: number;
  isConnected: boolean;
  /** False while disconnected. */
  isLead: boolean;
  isFullscreen: boolean;
  /** Server epoch ms the current connection attached; null while disconnected. */
  connectedAt: number | null;
  /** Server epoch ms of the last frame or attach from this screen. */
  lastSeenAt: number;
  preload: VjScreenPreload;
}

// REST response shapes (dates are ISO 8601 strings; no response carries a storage key)

export interface VjCreatorDTO {
  userId: string;
  displayName: string;
}

export interface VjPackDTO {
  id: string;
  name: string;
  position: number;
  clipCount: number;
  /** Sum of its clips' byte_size; 0 when empty. */
  totalByteSize: number;
  /** Thumbnail of the clip at position 0. */
  coverThumbnailUrl: string | null;
  createdBy: VjCreatorDTO | null;
  createdAt: string;
  updatedAt: string;
}

export interface VjClipDTO {
  id: string;
  title: string;
  mediaKind: VjMediaKind;
  mimeType: VjClipMimeType;
  byteSize: number;
  width: number;
  height: number;
  /** Null for a GIF. */
  durationMs: number | null;
  fitMode: VjFitMode;
  thumbnailUrl: string;
  /** Admin-only /files URL for library preview. */
  mediaUrl: string;
  /** Every pack holding it, in pack position order. */
  packIds: string[];
  /** packIds.length; the delete dialog's count. */
  packCount: number;
  createdBy: VjCreatorDTO | null;
  createdAt: string;
  updatedAt: string;
}

/** Position order. */
export interface VjPackListDTO {
  items: VjPackDTO[];
}
/** created_at DESC, id DESC. */
export interface VjClipListDTO {
  items: VjClipDTO[];
}
/** Pack order. */
export interface VjPackClipsDTO {
  pack: VjPackDTO;
  items: VjClipDTO[];
}

export interface VjClipMediaDTO {
  clipId: string;
  /** Presigned GET, fetch with credentials: "omit". */
  url: string;
  /** ISO; the URL works for a fetch that starts before it. */
  expiresAt: string;
  mimeType: VjClipMimeType;
  byteSize: number;
}
export interface VjPackMediaDTO {
  packId: string;
  /** Pack order. */
  items: VjClipMediaDTO[];
}

export interface VjPackDeletedDTO {
  deletedPackId: string;
  clipsKeptCount: number;
}
export interface VjClipDeletedDTO {
  deletedClipId: string;
  removedFromPackCount: number;
}

/** Body of POST /admin/vj/clips. The server derives mimeType, mediaKind and byteSize. */
export interface CreateVjClipBody {
  /** The file name without extension, cut to 120 code points by the frontend. */
  title: string;
  /** From the vj_clip presign. */
  storageKey: string;
  /** From the vj_thumbnail presign. */
  thumbnailStorageKey: string;
  width: number;
  height: number;
  /** Integer ms for a video, null for a GIF. */
  durationMs: number | null;
  /** Default "fill". */
  fitMode?: VjFitMode;
  /** When set, the clip is appended to that pack in the same transaction. */
  packId?: string | null;
}

// Reason codes (REST and upload)

/** Refusal codes the server sends, in the contract's table order. */
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
] as const;
export type VjRefusalCode = (typeof VJ_REFUSAL_CODES)[number];

/** Raised by the frontend only (never sent by the server). */
export const VJ_CLIENT_UPLOAD_CODES = [
  "VJ_UPLOAD_HEVC",
  "VJ_UPLOAD_UNPLAYABLE",
  "VJ_UPLOAD_GIF_DAMAGED",
  "VJ_UPLOAD_THUMBNAIL_FAILED",
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
] as const;

/**
 * `exception` frame: handshake refusals and FORBIDDEN after a lost admin role
 * (then disconnect), TOKEN_EXPIRED (then disconnect), and payloads the
 * ValidationPipe rejects (the socket stays up and gets no ack).
 */
export interface VjExceptionFrame {
  status: "error";
  code: VjWsTransportCode;
  message: unknown;
  /** "vj_not_admin" on a role refusal, "vj_screen_replaced" on a replaced screen. */
  domainCode?: string;
  statusCode?: number;
}

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
  "vj_server_error",
] as const;
export type VjSocketErrorCode = (typeof VJ_SOCKET_ERROR_CODES)[number];

export type VjAck<Success extends object = Record<string, never>> =
  ({ ok: true } & Success) | VjAckFailure;

export interface VjAckFailure {
  ok: false;
  code: VjSocketErrorCode;
  /** English, for logs; the frontend maps `code` to copy. */
  message: string;
  /**
   * On vj_stale_command, vj_stale_clip_sequence, vj_not_lead, vj_shuffle_off,
   * vj_no_active_pack: the current state, so the sender can snap to it.
   */
  state?: VjStageState;
}

/** Success ack of every stage command. */
export interface VjCommandSuccess {
  /** The state's revision after this command. */
  revision: number;
  /** True when nothing changed (nothing broadcast, revision unchanged). */
  isNoop: boolean;
}

export type VjAttachPayload =
  | { role: "screen"; screenId: string; restoreState: VjStageRestore | null }
  | { role: "remote" };

export interface VjAttachSuccess {
  role: VjAttachRole;
  /** Epoch ms, exp * 1000. */
  connectionExpiresAt: number;
  stageEpoch: string;
  /** Screen only: whether this attach seeded the stage from restoreState. */
  isRestored: boolean;
  /** Screen only: whether this screen leads now; null for a remote. */
  isLead: boolean | null;
}

export interface VjStageFrame {
  state: VjStageState;
  cause: VjStageCause;
  /** The clientId whose command caused this; null for every other cause. */
  sourceClientId: string | null;
}

export const VJ_LIBRARY_CHANGE_KINDS = [
  "pack_created",
  "pack_renamed",
  "pack_deleted",
  "packs_reordered",
  "pack_clips_changed",
  "clip_created",
  "clip_updated",
  "clip_deleted",
] as const;
export type VjLibraryChangeKind = (typeof VJ_LIBRARY_CHANGE_KINDS)[number];

export interface VjLibraryChange {
  kind: VjLibraryChangeKind;
  /** The pack touched, when one is. */
  packId: string | null;
  /** The clip touched, when one is. */
  clipId: string | null;
  /** Every pack whose clip list changed (a clip delete lists all its packs). */
  packIds: string[];
}

/** Frames a client emits; `screen:status` has no ack. */
export const VJ_CLIENT_FRAME_NAMES = [
  "vj:attach",
  "session:reauth",
  "stage:setPack",
  "stage:goClip",
  "stage:setTransition",
  "stage:setOverlay",
  "stage:setEffects",
  "stage:setStrobe",
  "stage:setShuffle",
  "screen:advance",
  "screen:status",
] as const;
export type VjClientFrameNameConst = (typeof VJ_CLIENT_FRAME_NAMES)[number];

export const VJ_SERVER_FRAME_NAMES = [
  "stage:state",
  "screen:role",
  "screens:update",
  "library:changed",
  "exception",
] as const;
export type VjServerFrameName = (typeof VJ_SERVER_FRAME_NAMES)[number];
