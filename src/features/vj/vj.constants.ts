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
export const VJ_SCREEN_SNAPSHOT_STORAGE_KEY = "queerpulse.vj.screen.v1";
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

export const VJ_DEMO_CHANNEL_NAME = "queerpulse-vj-demo";
export const VJ_DEMO_SERVER_LOCK_NAME = "queerpulse-vj-demo-server";
export const VJ_DEMO_LIBRARY_STORAGE_KEY = "queerpulse.vj.demo.library.v1";
export const VJ_DEMO_HEARTBEAT_MS = 1_000;
export const VJ_DEMO_SILENCE_MS = 3_500;
/** Contract 6.7. */
export const VJ_DEMO_SCREENS_UPDATE_THROTTLE_MS = 250;
/** Contract 6.7. */
export const VJ_SCREEN_OFFLINE_RETENTION_MS = 600_000;
/** Contract 6.5. */
export const VJ_CLIENT_SEQUENCES_KEPT = 32;
