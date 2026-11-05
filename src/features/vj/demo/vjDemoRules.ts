/**
 * Field rules and refusals of the demo VJ library, mirroring the backend's
 * `vj.constants.ts` and `vj-input.ts` (contract 4 and 5). Each check answers
 * the contract's reason code, and no message carries the value it refused.
 */
import { ApiError } from "../../../shared/api/client";
import {
  VJ_CLIP_MIME_TYPES,
  VJ_FIT_MODES,
  VJ_LIMITS,
  type VjClipMimeType,
  type VjFitMode,
  type VjMediaKind,
  type VjRefusalCode,
} from "../../../shared/contracts/vj";

interface VjRefusalRule {
  status: number;
  message: string;
}

/** Status and fixed English message of every refusal (backend VJ_REFUSALS). */
const VJ_DEMO_REFUSALS: Record<VjRefusalCode, VjRefusalRule> = {
  VJ_PACK_NOT_FOUND: { status: 404, message: "No VJ pack has this id." },
  VJ_PACK_NAME_REQUIRED: { status: 400, message: "A pack needs a name." },
  VJ_PACK_NAME_TOO_LONG: {
    status: 400,
    message: `A pack name can be at most ${VJ_LIMITS.packNameMax} characters.`,
  },
  VJ_PACK_NAME_TAKEN: {
    status: 409,
    message: "Another pack already has this name.",
  },
  VJ_PACK_LIMIT_REACHED: {
    status: 409,
    message: `The library holds at most ${VJ_LIMITS.packsMax} packs.`,
  },
  VJ_PACK_REORDER_MISMATCH: {
    status: 400,
    message: "The new order must list every pack exactly once.",
  },
  VJ_PACK_FULL: {
    status: 409,
    message: `A pack holds at most ${VJ_LIMITS.packClipsMax} clips.`,
  },
  VJ_PACK_CLIPS_REORDER_MISMATCH: {
    status: 400,
    message: "The new order must list every clip of the pack exactly once.",
  },
  VJ_CLIP_NOT_FOUND: { status: 404, message: "No VJ clip has this id." },
  VJ_CLIP_ALREADY_IN_PACK: {
    status: 409,
    message: "This clip is already in the pack.",
  },
  VJ_CLIP_NOT_IN_PACK: {
    status: 404,
    message: "This clip is not in the pack.",
  },
  VJ_CLIP_TITLE_REQUIRED: { status: 400, message: "A clip needs a title." },
  VJ_CLIP_TITLE_TOO_LONG: {
    status: 400,
    message: `A clip title can be at most ${VJ_LIMITS.clipTitleMax} characters.`,
  },
  VJ_CLIP_FIT_MODE_INVALID: {
    status: 400,
    message: "The fit mode must be fill or fit.",
  },
  VJ_CLIP_DIMENSIONS_INVALID: {
    status: 400,
    message: "Width and height must be whole numbers from 1 to 16384.",
  },
  VJ_CLIP_DURATION_INVALID: {
    status: 400,
    message:
      "A video needs a duration from 1 ms to one hour, and a GIF takes none.",
  },
  VJ_CLIP_KEY_INVALID: {
    status: 400,
    message: "The storage key is not a VJ upload key.",
  },
  VJ_CLIP_KEY_IN_USE: {
    status: 409,
    message: "Another clip already stores this upload.",
  },
  VJ_CLIP_IDS_INVALID: {
    status: 400,
    message: `clipIds must list 1 to ${VJ_LIMITS.mediaClipIdsMax} clip ids separated by commas.`,
  },
  VJ_LIBRARY_FULL: {
    status: 409,
    message: `The library holds at most ${VJ_LIMITS.libraryClipsMax} clips.`,
  },
  VJ_UPLOAD_NOT_ADMIN: {
    status: 403,
    message: "Only an admin may upload VJ clips.",
  },
  VJ_UPLOAD_TYPE_UNSUPPORTED: {
    status: 400,
    message: "This file type is not accepted for this VJ upload.",
  },
  VJ_UPLOAD_TOO_LARGE: {
    status: 413,
    message: "The file is over the size cap for this VJ upload.",
  },
  VJ_UPLOAD_FORMAT_MOV: {
    status: 400,
    message: "The upload is a QuickTime MOV file. Export it as MP4 or WebM.",
  },
  VJ_UPLOAD_CONTENT_MISMATCH: {
    status: 400,
    message: "The uploaded bytes do not match the file type.",
  },
  VJ_UPLOAD_MISSING: {
    status: 409,
    message: "The upload never reached storage.",
  },
};

/** Builds the refusal the live API would throw for this code. */
export function vjRefusal(
  code: VjRefusalCode,
  extra?: {
    packId?: string;
    field?: "storageKey" | "thumbnailStorageKey";
    kind?: "vj_clip" | "vj_thumbnail";
    maxBytes?: number;
  },
): ApiError {
  const { status, message } = VJ_DEMO_REFUSALS[code];
  return new ApiError(status, message, {
    statusCode: status,
    message,
    code,
    ...extra,
  });
}

function countCodePoints(value: string): number {
  return Array.from(value).length;
}

function normalizeBoundedText(
  value: unknown,
  maxCodePoints: number,
  requiredCode: VjRefusalCode,
  tooLongCode: VjRefusalCode,
): string {
  if (typeof value !== "string") {
    throw vjRefusal(requiredCode);
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw vjRefusal(requiredCode);
  }
  if (countCodePoints(trimmed) > maxCodePoints) {
    throw vjRefusal(tooLongCode);
  }
  return trimmed;
}

/** A pack name, trimmed. Answers VJ_PACK_NAME_REQUIRED or VJ_PACK_NAME_TOO_LONG. */
export function normalizeVjPackName(value: unknown): string {
  return normalizeBoundedText(
    value,
    VJ_LIMITS.packNameMax,
    "VJ_PACK_NAME_REQUIRED",
    "VJ_PACK_NAME_TOO_LONG",
  );
}

/** A clip title, trimmed. Answers VJ_CLIP_TITLE_REQUIRED or VJ_CLIP_TITLE_TOO_LONG. */
export function normalizeVjClipTitle(value: unknown): string {
  return normalizeBoundedText(
    value,
    VJ_LIMITS.clipTitleMax,
    "VJ_CLIP_TITLE_REQUIRED",
    "VJ_CLIP_TITLE_TOO_LONG",
  );
}

/** A fit mode. Answers VJ_CLIP_FIT_MODE_INVALID for anything else. */
export function normalizeVjFitMode(value: unknown): VjFitMode {
  const fitMode = VJ_FIT_MODES.find((candidate) => candidate === value);
  if (fitMode === undefined) {
    throw vjRefusal("VJ_CLIP_FIT_MODE_INVALID");
  }
  return fitMode;
}

/** The media kind a clip mime type stands for. Answers
 *  VJ_UPLOAD_TYPE_UNSUPPORTED for a type outside the clip table. */
export function vjMediaKindOf(mimeType: unknown): {
  mimeType: VjClipMimeType;
  mediaKind: VjMediaKind;
} {
  const known = VJ_CLIP_MIME_TYPES.find((candidate) => candidate === mimeType);
  if (known === undefined) {
    throw vjRefusal("VJ_UPLOAD_TYPE_UNSUPPORTED", { kind: "vj_clip" });
  }
  return {
    mimeType: known,
    mediaKind: known === "image/gif" ? "gif" : "video",
  };
}

function isVjDimension(value: unknown): boolean {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 1 &&
    value <= VJ_LIMITS.dimensionMax
  );
}

/** Answers VJ_CLIP_DIMENSIONS_INVALID unless both sides are whole pixels in range. */
export function checkVjClipDimensions(width: unknown, height: unknown): void {
  if (!isVjDimension(width) || !isVjDimension(height)) {
    throw vjRefusal("VJ_CLIP_DIMENSIONS_INVALID");
  }
}

/** A duration for its kind: whole ms from 1 to one hour for a video, null
 *  for a GIF. Answers VJ_CLIP_DURATION_INVALID. */
export function normalizeVjDurationMs(
  mediaKind: VjMediaKind,
  value: unknown,
): number | null {
  if (mediaKind === "gif") {
    if (value === undefined || value === null) {
      return null;
    }
    throw vjRefusal("VJ_CLIP_DURATION_INVALID");
  }
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < 1 ||
    value > VJ_LIMITS.durationMsMax
  ) {
    throw vjRefusal("VJ_CLIP_DURATION_INVALID");
  }
  return value;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Whether a value is text in the shape of a uuid. */
export function isVjUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

/** Whether a reorder list names every expected id exactly once. */
export function isVjFullPermutation(
  given: unknown,
  expected: readonly string[],
): given is string[] {
  if (!Array.isArray(given) || given.length !== expected.length) {
    return false;
  }
  const expectedIds = new Set(expected);
  const seenIds = new Set<string>();
  for (const entry of given as unknown[]) {
    if (
      typeof entry !== "string" ||
      !expectedIds.has(entry) ||
      seenIds.has(entry)
    ) {
      return false;
    }
    seenIds.add(entry);
  }
  return true;
}

/** Answers VJ_CLIP_IDS_INVALID for a media `clipIds` list that is blank,
 *  over 200 entries, or holds a non-uuid. Null means no list was given. */
export function checkVjClipIdsQuery(clipIds: readonly unknown[] | null): void {
  if (clipIds === null) {
    return;
  }
  if (
    clipIds.length === 0 ||
    clipIds.length > VJ_LIMITS.mediaClipIdsMax ||
    !clipIds.every(isVjUuid)
  ) {
    throw vjRefusal("VJ_CLIP_IDS_INVALID");
  }
}

export interface VjCheckedClipUpload {
  title: string;
  mimeType: VjClipMimeType;
  mediaKind: VjMediaKind;
  durationMs: number | null;
  fitMode: VjFitMode;
}

/** The field checks of a clip create that need no library read, in the
 *  contract 5.3 order: title, kind, dimensions, duration, fit mode, pack id
 *  shape, then the stored size against the clip cap. */
export function checkVjClipUpload(upload: {
  title: unknown;
  mimeType: unknown;
  width: unknown;
  height: unknown;
  durationMs: unknown;
  fitMode: unknown;
  packId: unknown;
  byteSize: unknown;
}): VjCheckedClipUpload {
  const title = normalizeVjClipTitle(upload.title);
  const { mimeType, mediaKind } = vjMediaKindOf(upload.mimeType);
  checkVjClipDimensions(upload.width, upload.height);
  const durationMs = normalizeVjDurationMs(mediaKind, upload.durationMs);
  const fitMode = normalizeVjFitMode(upload.fitMode ?? "fill");
  if (
    upload.packId !== null &&
    upload.packId !== undefined &&
    !isVjUuid(upload.packId)
  ) {
    throw vjRefusal("VJ_PACK_NOT_FOUND");
  }
  if (
    typeof upload.byteSize !== "number" ||
    upload.byteSize > VJ_LIMITS.clipMaxBytes
  ) {
    throw vjRefusal("VJ_UPLOAD_TOO_LARGE", {
      kind: "vj_clip",
      maxBytes: VJ_LIMITS.clipMaxBytes,
      field: "storageKey",
    });
  }
  return { title, mimeType, mediaKind, durationMs, fitMode };
}
