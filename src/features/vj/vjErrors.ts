import { ApiError } from "../../shared/api/client";
import {
  VJ_CLIENT_UPLOAD_CODES,
  VJ_LIMITS,
  VJ_REFUSAL_CODES,
  VJ_SOCKET_ERROR_CODES,
  type VjClientUploadCode,
  type VjRefusalCode,
  type VjSocketErrorCode,
} from "../../shared/contracts/vj";
import {
  studioReasonOf,
  type StudioFailureReason,
} from "../studio/studioReason";
import { VjSendError, type VjConnectionRefusal } from "./realtime/vjTransport";
import { VjUploadFailure } from "./upload/vjUploadFailure";
import { formatVjBytes } from "./vjFormat";

export type VjFailureReason = StudioFailureReason;

type VjReasonCode = VjRefusalCode | VjClientUploadCode | VjSocketErrorCode;

/** "VJ_PACK_CLIPS_REORDER_MISMATCH" with prefix "VJ_" gives "packClipsReorderMismatch". */
function lowerCamelOf(code: string, prefix: string): string {
  const words = code.slice(prefix.length).toLowerCase().split("_");
  return words
    .map((word, wordIndex) =>
      wordIndex === 0
        ? word
        : `${word.charAt(0).toUpperCase()}${word.slice(1)}`,
    )
    .join("");
}

function keyTableOf<Code extends string>(
  codes: readonly Code[],
  prefix: string,
  keyPrefix: string,
): Record<Code, string> {
  const table = {} as Record<Code, string>;
  for (const code of codes)
    table[code] = `${keyPrefix}${lowerCamelOf(code, prefix)}`;
  return table;
}

/** REST and upload reasons, one catalog line each: `vj:error.<lowerCamel without VJ_>`. */
export const VJ_REASON_KEY: Record<VjRefusalCode | VjClientUploadCode, string> =
  keyTableOf(
    [...VJ_REFUSAL_CODES, ...VJ_CLIENT_UPLOAD_CODES],
    "VJ_",
    "vj:error.",
  );

/** A thumbnail over its own cap reads differently from a clip over its cap. */
export const VJ_THUMBNAIL_TOO_LARGE_KEY = "vj:error.uploadThumbnailTooLarge";

/** An animated preview over its own cap gets its own line too (C 4.1). */
export const VJ_PREVIEW_TOO_LARGE_KEY = "vj:error.uploadPreviewTooLarge";

/** Socket ack reasons: `vj:error.socket.<lowerCamel without vj_>`. */
export const VJ_SOCKET_REASON_KEY: Record<VjSocketErrorCode, string> =
  keyTableOf(VJ_SOCKET_ERROR_CODES, "vj_", "vj:error.socket.");

export const VJ_FAILURE_KEY: Record<VjFailureReason, string> = {
  offline: "vj:failure.offline",
  timeout: "vj:failure.timeout",
  rateLimited: "vj:failure.rateLimited",
  server: "vj:failure.server",
  unreachable: "vj:failure.unreachable",
  forbidden: "vj:failure.forbidden",
  notFound: "vj:failure.notFound",
  restricted: "vj:failure.restricted",
  unknown: "vj:failure.unknown",
};

export const VJ_CONNECTION_REFUSAL_KEY: Record<VjConnectionRefusal, string> = {
  not_admin: "vj:connection.refused.notAdmin",
  screen_replaced: "vj:connection.refused.screenReplaced",
  session_revoked: "vj:connection.refused.sessionRevoked",
  unauthorized: "vj:connection.refused.unauthorized",
  platform_locked: "vj:connection.refused.platformLocked",
  server_error: "vj:connection.refused.serverError",
  client_outdated: "vj:connection.refused.clientOutdated",
};

/** The number each reason names in its line as {max}. */
export const VJ_ERROR_MAX: Partial<
  Record<VjRefusalCode | VjSocketErrorCode, number>
> = {
  VJ_PACK_NAME_TOO_LONG: VJ_LIMITS.packNameMax,
  VJ_PACK_LIMIT_REACHED: VJ_LIMITS.packsMax,
  VJ_PACK_FULL: VJ_LIMITS.packClipsMax,
  VJ_CLIP_TITLE_TOO_LONG: VJ_LIMITS.clipTitleMax,
  VJ_LIBRARY_FULL: VJ_LIMITS.libraryClipsMax,
  vj_overlay_text_too_long: VJ_LIMITS.overlayTextMax,
  VJ_SCENE_NAME_TOO_LONG: VJ_LIMITS.sceneNameMax,
  VJ_SCENE_LIMIT_REACHED: VJ_LIMITS.scenesMax,
  VJ_SETLIST_NAME_TOO_LONG: VJ_LIMITS.setlistNameMax,
  VJ_SETLIST_LIMIT_REACHED: VJ_LIMITS.setlistsMax,
  VJ_SETLIST_FULL: VJ_LIMITS.setlistItemsMax,
  vj_effects_too_many: VJ_LIMITS.effectsOnMax,
  vj_overrides_too_many: VJ_LIMITS.screenOverridesMax,
  vj_countdown_label_too_long: VJ_LIMITS.countdownLabelMax,
};

/** The number each reason names in its line as {min}. */
export const VJ_ERROR_MIN: Partial<
  Record<VjRefusalCode | VjSocketErrorCode, number>
> = {
  VJ_CLIP_LOOP_INVALID: VJ_LIMITS.loopMinLengthMs,
};

/** Contract 8.7 and C 7.11: the state in these acks is applied and nothing shows. */
const VJ_SILENT_SOCKET_CODES: readonly VjSocketErrorCode[] = [
  "vj_stale_command",
  "vj_stale_clip_sequence",
  "vj_not_lead",
  "vj_clip_excluded",
  "vj_clip_not_favorite",
  "vj_stale_setlist",
];

export function isVjSilentSocketCode(code: VjSocketErrorCode): boolean {
  return VJ_SILENT_SOCKET_CODES.includes(code);
}

function isRefusalCode(value: unknown): value is VjRefusalCode {
  return (
    typeof value === "string" &&
    (VJ_REFUSAL_CODES as readonly string[]).includes(value)
  );
}

function isSocketCode(value: unknown): value is VjSocketErrorCode {
  return (
    typeof value === "string" &&
    (VJ_SOCKET_ERROR_CODES as readonly string[]).includes(value)
  );
}

function isClientUploadCode(value: unknown): value is VjClientUploadCode {
  return (
    typeof value === "string" &&
    (VJ_CLIENT_UPLOAD_CODES as readonly string[]).includes(value)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** A failed storage PUT names the same cause as a clip the server cannot find:
 *  the file never reached the server. */
function reasonOfUploadFailure(failure: VjUploadFailure): VjReasonCode {
  return failure.code === "VJ_UPLOAD_PUT_FAILED"
    ? "VJ_UPLOAD_MISSING"
    : failure.code;
}

/** The reason code a failure carries, or null when it carries none:
 *  a server refusal body, an upload failure raised in the browser, or a
 *  socket ack failure `{ ok: false, code }`. */
export function vjReasonOf(cause: unknown): VjReasonCode | null {
  if (cause instanceof ApiError) {
    const code = isRecord(cause.data) ? cause.data.code : undefined;
    return isRefusalCode(code) ? code : null;
  }
  if (cause instanceof VjUploadFailure) return reasonOfUploadFailure(cause);
  if (isRecord(cause) && cause.ok === false && isSocketCode(cause.code)) {
    return cause.code;
  }
  return null;
}

/** True for a VJ_UPLOAD_TOO_LARGE body that names this upload kind or its field. */
function isTooLargeFor(cause: unknown, kind: string, field: string): boolean {
  if (!(cause instanceof ApiError) || !isRecord(cause.data)) return false;
  if (cause.data.code !== "VJ_UPLOAD_TOO_LARGE") return false;
  return cause.data.kind === kind || cause.data.field === field;
}

function isThumbnailTooLarge(cause: unknown): boolean {
  return isTooLargeFor(cause, "vj_thumbnail", "thumbnailStorageKey");
}

function isPreviewTooLarge(cause: unknown): boolean {
  return isTooLargeFor(cause, "vj_preview", "previewStorageKey");
}

function keyOfReasonCode(code: VjReasonCode): string {
  if (isSocketCode(code)) return VJ_SOCKET_REASON_KEY[code];
  return VJ_REASON_KEY[code];
}

function isDeviceOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/** The catalog key that names why this failed. Never generic while a
 *  specific cause is known. */
export function vjErrorKeyOf(cause: unknown): string {
  if (isPreviewTooLarge(cause)) return VJ_PREVIEW_TOO_LARGE_KEY;
  if (isThumbnailTooLarge(cause)) return VJ_THUMBNAIL_TOO_LARGE_KEY;
  // A storage PUT that failed while the device has no network names the
  // missing network: that is the cause the admin can act on.
  if (
    cause instanceof VjUploadFailure &&
    cause.code === "VJ_UPLOAD_PUT_FAILED" &&
    isDeviceOffline()
  ) {
    return VJ_FAILURE_KEY.offline;
  }
  const code = vjReasonOf(cause);
  if (code !== null) return keyOfReasonCode(code);
  if (cause instanceof VjSendError) {
    return isDeviceOffline()
      ? VJ_FAILURE_KEY.offline
      : VJ_FAILURE_KEY.unreachable;
  }
  return VJ_FAILURE_KEY[studioReasonOf(cause)];
}

/** The values the line for this failure interpolates. */
export function vjErrorValuesOf(
  cause: unknown,
  context?: { fileByteSize?: number },
): { max?: number | string; min?: number; sizeLabel?: string } {
  const code = vjReasonOf(cause);
  if (code === "VJ_UPLOAD_TOO_LARGE") {
    if (isPreviewTooLarge(cause)) {
      return { max: formatVjBytes(VJ_LIMITS.previewMaxBytes) };
    }
    if (isThumbnailTooLarge(cause)) {
      return { max: formatVjBytes(VJ_LIMITS.thumbnailMaxBytes) };
    }
    const knownByteSize =
      cause instanceof VjUploadFailure && cause.byteSize !== null
        ? cause.byteSize
        : context?.fileByteSize;
    return {
      max: formatVjBytes(VJ_LIMITS.clipMaxBytes),
      ...(knownByteSize === undefined
        ? {}
        : { sizeLabel: formatVjBytes(knownByteSize) }),
    };
  }
  if (code === null || isClientUploadCode(code)) return {};
  const max = VJ_ERROR_MAX[code];
  const min = VJ_ERROR_MIN[code];
  return {
    ...(max === undefined ? {} : { max }),
    ...(min === undefined ? {} : { min }),
  };
}
