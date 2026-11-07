// Timing, storage and demo constants for the VJ feature. Wire vocabulary lives in shared/contracts/vj.ts.

/** Contract 6.2. */
export const VJ_ACK_TIMEOUT_MS = 5_000;
export const VJ_REAUTH_LEAD_MS = 60_000;
export const VJ_REAUTH_MIN_DELAY_MS = 5_000;
export const VJ_REAUTH_ACK_TIMEOUT_MS = 10_000;
export const VJ_REAUTH_RATE_LIMITED_RETRY_MS = 10_000;
export const VJ_TICKET_MINT_RETRY_MS = 5_000;
export const VJ_RECONNECT_BASE_DELAY_MS = 2_000;
export const VJ_RECONNECT_MAX_DELAY_MS = 60_000;

/** Contract 3.3. */
export const VJ_UPLOAD_CONCURRENCY = 2;
export const VJ_PRESIGN_RETRY_WAIT_MS = 30_000;
export const VJ_PRESIGN_RETRY_MAX = 2;
export const VJ_DECODE_TIMEOUT_MS = 15_000;
/** Contract 8.4 step 3. */
export const VJ_HEVC_SCAN_BYTES = 4 * 1024 * 1024;
export const VJ_THUMBNAIL_QUALITY = 0.7;
export const VJ_THUMBNAIL_RETRY_QUALITY = 0.5;

export const VJ_SCREEN_ID_STORAGE_KEY = "queerpulse.vj.screenId";
/** Contract 9.1: the v2 offline snapshot. */
export const VJ_SCREEN_SNAPSHOT_STORAGE_KEY = "queerpulse.vj.screen.v2";
/** Contract 9.1: the v1 snapshot key, read once for the upgrade and then removed. */
export const VJ_SCREEN_SNAPSHOT_V1_STORAGE_KEY = "queerpulse.vj.screen.v1";
/** Contract 9.2: whether this screen has the mic on. */
export const VJ_SCREEN_MIC_STORAGE_KEY = "queerpulse.vj.screen.mic.v1";
/** Contract 9.2: MIDI learn mappings on this remote. */
export const VJ_REMOTE_MIDI_STORAGE_KEY = "queerpulse.vj.remote.midi.v1";
/** Contract 9.2: the effect ids in the dock row, in order. */
export const VJ_REMOTE_DOCK_PADS_STORAGE_KEY =
  "queerpulse.vj.remote.dockPads.v1";
/** Contract 9.2: whether cue mode is on. */
export const VJ_REMOTE_CUE_MODE_STORAGE_KEY = "queerpulse.vj.remote.cueMode.v1";
export const VJ_REMOTE_OVERLAY_LINES_STORAGE_KEY =
  "queerpulse.vj.remote.overlayLines.v1";
export const VJ_REMOTE_OVERLAY_LINES_MAX = 10;

export const VJ_CLIP_CACHE_NAME = "queerpulse-vj-clips-v1";
export const VJ_CLIP_CACHE_PATH_PREFIX = "/__vj-cache/clips/";
/** A GIF drawn 2x or more its native size scales pixelated. */
export const VJ_PIXELATED_MIN_SCALE = 2;
/** Contract 6.9. */
export const VJ_LEAD_ADVANCE_FALLBACK_MS = 2_000;
/** Contract 6.12. */
export const VJ_FADE_SLIDER_THROTTLE_MS = 100;
/** Contract 7.12: crossfader, effect amount sliders and MIDI CC streams send at most one frame per 50 ms while moving, trailing, and always send the final value. */
export const VJ_DRAG_THROTTLE_MS = 50;
/** Contract 7.6 and design 7: a pad press shorter than this latches and sends no release. */
export const VJ_PAD_LATCH_MAX_MS = 250;
/** Contract 7.9: a screen reports status this often while health or mic is reported. */
export const VJ_SCREEN_STATUS_REPORT_INTERVAL_MS = 2_000;

/** Contract 7.3: after each connect a client sends a burst of clock:sync frames, then one per interval. */
export const VJ_CLOCK_SYNC_BURST_COUNT = 5;
export const VJ_CLOCK_SYNC_BURST_SPACING_MS = 250;
export const VJ_CLOCK_SYNC_INTERVAL_MS = 30_000;
/** Shared plan call 2: an offset move under this slews halfway; a larger one jumps. */
export const VJ_CLOCK_SLEW_THRESHOLD_MS = 25;
/** Shared plan call 2: clock listeners hear about an offset move of at least
 *  this much. Every notification re-renders the stage's consumers, so a few
 *  ms of slew stays quiet; timers re-arm on the next notification. */
export const VJ_CLOCK_NOTIFY_MIN_DELTA_MS = 5;

export const VJ_DEMO_CHANNEL_NAME = "queerpulse-vj-demo";
export const VJ_DEMO_SERVER_LOCK_NAME = "queerpulse-vj-demo-server";
/** Contract 9.5: the v2 demo library. */
export const VJ_DEMO_LIBRARY_STORAGE_KEY = "queerpulse.vj.demo.library.v2";
/** Contract 9.5: a v1 demo library here is upgraded and seeded, then this key is removed. */
export const VJ_DEMO_LIBRARY_V1_STORAGE_KEY = "queerpulse.vj.demo.library.v1";
export const VJ_DEMO_HEARTBEAT_MS = 1_000;
export const VJ_DEMO_SILENCE_MS = 3_500;
/** Contract 6.7. */
export const VJ_DEMO_SCREENS_UPDATE_THROTTLE_MS = 250;
/** Contract 6.7. */
export const VJ_SCREEN_OFFLINE_RETENTION_MS = 600_000;
/** Contract 6.5. */
export const VJ_CLIENT_SEQUENCES_KEPT = 32;
