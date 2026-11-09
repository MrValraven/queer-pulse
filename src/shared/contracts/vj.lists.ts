/**
 * VJ wire contract (C 3), frontend mirror of
 * `queerpulse-backend/src/vj/vj.contract.ts` and `vj-response.ts`. Names and
 * values match it; edit both together.
 *
 * Lists, limits and the stage causes (C 1, C 3.1, C 3.4, C 3.8).
 */

/** Bumped when a frame or state shape changes incompatibly (C 1). */
export const VJ_CONTRACT_VERSION = 2;

/** What a clip plays as: a video file or an animated GIF (v1 C 2). */
export const VJ_MEDIA_KINDS = ["video", "gif"] as const;
export type VjMediaKind = (typeof VJ_MEDIA_KINDS)[number];

/** The content types a stored clip may have (v1 C 2). */
export const VJ_CLIP_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "image/gif",
] as const;
export type VjClipMimeType = (typeof VJ_CLIP_MIME_TYPES)[number];

/** How a clip fills the screen: cropped to fill it, or letterboxed to fit (v1 C 2). */
export const VJ_FIT_MODES = ["fill", "fit"] as const;
export type VjFitMode = (typeof VJ_FIT_MODES)[number];
/** The fit mode a clip created with none starts with (v1 C 2). */
export const DEFAULT_VJ_FIT_MODE: VjFitMode = "fill";

/** Playback rates a remote may pick; GIFs ignore them (C 3.1). */
export const VJ_SPEEDS = [0.25, 0.5, 1, 1.5, 2, 4] as const;
export type VjSpeed = (typeof VJ_SPEEDS)[number];

/** How the screens move from one source to the next (C 3.1). */
export const VJ_TRANSITION_IDS = [
  "fade",
  "cut",
  "dipBlack",
  "dipWhite",
  "wipeLeft",
  "wipeRight",
  "wipeRadial",
  "iris",
  "zoomBlur",
  "glitch",
  "lumaFade",
] as const;
export type VjTransitionId = (typeof VJ_TRANSITION_IDS)[number];

/** Whether a transition length counts milliseconds or beats of the tempo (C 3.1). */
export const VJ_TRANSITION_LENGTH_UNITS = ["ms", "beats"] as const;
export type VjTransitionLengthUnit =
  (typeof VJ_TRANSITION_LENGTH_UNITS)[number];

/** The beat counts a beats transition length may take (C 3.1). */
export const VJ_TRANSITION_BEAT_COUNTS = [1, 2, 4, 8, 16] as const;
export type VjTransitionBeatCount = (typeof VJ_TRANSITION_BEAT_COUNTS)[number];

/** How overlay text is drawn (C 3.1). */
export const VJ_OVERLAY_STYLES = [
  "big",
  "ticker",
  "neon",
  "outline",
  "typewriter",
  "glitch",
  "stacked",
  "slanted",
] as const;
export type VjOverlayStyle = (typeof VJ_OVERLAY_STYLES)[number];

/** Where overlay text sits on the screen (C 3.1). */
export const VJ_OVERLAY_POSITIONS = ["top", "center", "bottom"] as const;
export type VjOverlayPosition = (typeof VJ_OVERLAY_POSITIONS)[number];

/** Overlay text sizes (C 3.1). */
export const VJ_OVERLAY_SIZES = ["s", "m", "l", "xl"] as const;
export type VjOverlaySize = (typeof VJ_OVERLAY_SIZES)[number];

/** Palette names. The screen maps each to a `--vj-palette-<name>` token (C 3.1). */
export const VJ_COLOR_TOKENS = [
  "cream",
  "coral",
  "jade",
  "amber",
  "violet",
  "sky",
  "rose",
  "plum",
] as const;
export type VjColorToken = (typeof VJ_COLOR_TOKENS)[number];

/** Duotone variants: shadow colour, then highlight colour, both from VJ_COLOR_TOKENS (C 3.1). */
export const VJ_DUOTONE_PAIRS = [
  "plum-coral",
  "violet-amber",
  "sky-rose",
  "jade-cream",
  "plum-jade",
] as const;
export type VjDuotonePair = (typeof VJ_DUOTONE_PAIRS)[number];

/** The flags the pride grade and the flag wave generator draw (C 3.1). */
export const VJ_PRIDE_FLAGS = [
  "rainbow",
  "trans",
  "bi",
  "lesbian",
  "nonbinary",
  "progress",
] as const;
export type VjPrideFlag = (typeof VJ_PRIDE_FLAGS)[number];

/** Where the logo sits (C 3.1). */
export const VJ_LOGO_CORNERS = [
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
] as const;
export type VjLogoCorner = (typeof VJ_LOGO_CORNERS)[number];

/** What the event card shows: a QR code or the next event's details (C 3.1). */
export const VJ_EVENT_CARD_KINDS = ["qr", "nextEvent"] as const;
export type VjEventCardKind = (typeof VJ_EVENT_CARD_KINDS)[number];

/** How the mix layer blends over the live source (C 3.1). */
export const VJ_BLEND_MODES = [
  "normal",
  "screen",
  "multiply",
  "difference",
  "add",
  "lighten",
] as const;
export type VjBlendMode = (typeof VJ_BLEND_MODES)[number];

/** The grid a quantized change lands on (C 3.1). */
export const VJ_QUANTIZE_MODES = ["off", "beat", "bar"] as const;
export type VjQuantize = (typeof VJ_QUANTIZE_MODES)[number];

/** Where the tempo came from (C 3.1). */
export const VJ_TEMPO_SOURCES = ["manual", "tap", "mic"] as const;
export type VjTempoSource = (typeof VJ_TEMPO_SOURCES)[number];

/** Which clips the shuffle draws from (C 3.1). */
export const VJ_SHUFFLE_SOURCES = ["pack", "favorites"] as const;
export type VjShuffleSource = (typeof VJ_SHUFFLE_SOURCES)[number];

/** How a clip plays between its loop points (C 3.1). */
export const VJ_LOOP_MODES = ["loop", "pingPong"] as const;
export type VjLoopMode = (typeof VJ_LOOP_MODES)[number];

/** The renderer a screen draws with (C 3.1; simple renderer addendum 2026-11-09). */
export const VJ_RENDERERS = ["webgl2", "dom", "simple"] as const;
export type VjRenderer = (typeof VJ_RENDERERS)[number];

/** The show-wide render mode the remote sends; never stored. */
export const VJ_RENDER_MODES = ["effects", "simple"] as const;
export type VjRenderMode = (typeof VJ_RENDER_MODES)[number];
export function isVjRenderMode(value: unknown): value is VjRenderMode {
  return (VJ_RENDER_MODES as readonly unknown[]).includes(value);
}

/** Beats in one bar of the tempo grid (C 3.1). */
export const VJ_BEATS_PER_BAR = 4;

/** Whether the shuffle interval counts seconds or beats of the tempo (v1 C 2). */
export const VJ_SHUFFLE_INTERVAL_KINDS = ["seconds", "beats"] as const;
export type VjShuffleIntervalKind = (typeof VJ_SHUFFLE_INTERVAL_KINDS)[number];

/** The beat counts a beats interval may take (v1 C 2). */
export const VJ_SHUFFLE_BEAT_COUNTS = [4, 8, 16, 32] as const;
export type VjShuffleBeatCount = (typeof VJ_SHUFFLE_BEAT_COUNTS)[number];

/** The two roles a socket can attach as (v1 C 2). */
export const VJ_ATTACH_ROLES = ["screen", "remote"] as const;
export type VjAttachRole = (typeof VJ_ATTACH_ROLES)[number];

/** Every size, length, count and timing bound of the VJ contract (C 3.1). */
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
  /** Bounds of a transition length in the "ms" unit. */
  fadeMsMin: 0,
  fadeMsMax: 4000,
  fadeMsDefault: 800,
  overlayTextMax: 80,
  shuffleSecondsMin: 2,
  shuffleSecondsMax: 60,
  shuffleSecondsDefault: 8,
  shuffleBeatsDefault: 8,
  /** Bounds of `tempo.bpm`. */
  bpmMin: 60,
  bpmMax: 200,
  bpmDefault: 124,
  strobeMaxFlashesPerSecond: 3,
  strobeMaxDurationMs: 10_000,
  /** Lifetime of a preload URL from GET /admin/vj/packs/:id/media. */
  mediaUrlTtlSeconds: 900,
  /** Most ids in one `clipIds` query. */
  mediaClipIdsMax: 200,
  /** 512 KB, the `vj_preview` kind cap. */
  previewMaxBytes: 524_288,
  /** Preview longest edge in pixels. */
  previewLongEdgePx: 240,
  /** Preview length the browser records. */
  previewDurationMs: 2000,
  /** Smallest playable span between loop points. */
  loopMinLengthMs: 250,
  /** Effect and mix amounts are stored rounded to this step. */
  amountStep: 0.01,
  /** Most effect settings with isOn true at once. */
  effectsOnMax: 8,
  overlayHideAfterMsMin: 1000,
  overlayHideAfterMsMax: 600_000,
  countdownLabelMax: 40,
  /** A countdown target lies 1 s to 24 h after the server receives it. */
  countdownLeadMsMin: 1000,
  countdownLeadMsMax: 86_400_000,
  /** How long a finished countdown shows zero before the server hides it. */
  countdownHoldMs: 10_000,
  recentClipsMax: 8,
  excludedClipIdsMax: 200,
  screenOverridesMax: 16,
  identifyDurationMs: 3000,
  sceneNameMax: 60,
  scenesMax: 200,
  /** Serialised `look` JSON, in bytes (UTF-8). */
  sceneLookMaxBytes: 16_384,
  setlistNameMax: 60,
  setlistsMax: 50,
  setlistItemsMax: 100,
  /** A remote's downbeatAt lies within this many ms of the server's clock. */
  downbeatSkewMsMax: 60_000,
  /** Earliest a quantized change may land after the server receives it. */
  quantizeMinLeadMs: 150,
  /** The lead sends a quantized shuffle advance this early. */
  quantizedAdvanceEarlyMs: 300,
  micConfidenceMin: 0.6,
  micTempoMinIntervalMs: 2000,
  micBpmDeltaMin: 0.5,
  micPhaseDriftMsMin: 40,
  upcomingEventsMax: 50,
} as const;

/** How far a screen got preloading one clip (v1 C 2.2). */
export const VJ_CLIP_READY_STATES = [
  "queued",
  "loading",
  "ready",
  "failed",
] as const;
export type VjClipReadyState = (typeof VJ_CLIP_READY_STATES)[number];

/** Why a screen could not preload a clip; the remote names it (v1 C 2.2). */
export const VJ_PRELOAD_FAILURES = [
  /** The URL expired twice in a row before its fetch started. */
  "url_expired",
  /** The fetch failed or was cut off. */
  "network",
  /** Cache Storage refused the write (QuotaExceededError). */
  "storage_full",
  /** The browser could not play the cached file. */
  "decode_failed",
  /** The media endpoint no longer lists the clip. */
  "not_found",
] as const;
export type VjPreloadFailure = (typeof VJ_PRELOAD_FAILURES)[number];

/** Why a `stage:state` frame was sent (C 3.4). */
export const VJ_STAGE_CAUSES = [
  "attach",
  "restore",
  "command",
  "shuffle",
  "strobe_timeout",
  "library",
  "mic_tempo",
  "overlay_timeout",
  "countdown_end",
] as const;
export type VjStageCause = (typeof VJ_STAGE_CAUSES)[number];
