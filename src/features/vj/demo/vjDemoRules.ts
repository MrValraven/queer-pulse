/**
 * Field rules of the demo VJ library, mirroring the backend's `vj-input.ts`
 * (v1 contract 4 and 5, v2 contract 5 and 6.2). Each check answers the
 * contract's reason code through `vjRefusal` (`vjDemoRefusals.ts`, re-exported
 * here for v1 importers), and no message carries the value it refused.
 */
import {
  VJ_CLIP_MIME_TYPES,
  VJ_FIT_MODES,
  VJ_LIMITS,
  type VjClipMimeType,
  type VjFitMode,
  type VjMediaKind,
  type VjRefusalCode,
} from "../../../shared/contracts/vj";
import { vjRefusal } from "./vjDemoRefusals";

export { vjRefusal } from "./vjDemoRefusals";

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

/** A scene name, trimmed. Answers VJ_SCENE_NAME_REQUIRED or VJ_SCENE_NAME_TOO_LONG. */
export function normalizeVjSceneName(value: unknown): string {
  return normalizeBoundedText(
    value,
    VJ_LIMITS.sceneNameMax,
    "VJ_SCENE_NAME_REQUIRED",
    "VJ_SCENE_NAME_TOO_LONG",
  );
}

/** A set list name, trimmed. Answers VJ_SETLIST_NAME_REQUIRED or VJ_SETLIST_NAME_TOO_LONG. */
export function normalizeVjSetlistName(value: unknown): string {
  return normalizeBoundedText(
    value,
    VJ_LIMITS.setlistNameMax,
    "VJ_SETLIST_NAME_REQUIRED",
    "VJ_SETLIST_NAME_TOO_LONG",
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

/** Whether a value is a list of at most `max` uuid strings. Pass
 *  `Number.POSITIVE_INFINITY` to check the shape alone when an over-long
 *  list answers its own code (as set list items do). */
export function isVjUuidList(value: unknown, max: number): value is string[] {
  return (
    Array.isArray(value) &&
    value.length <= max &&
    (value as unknown[]).every(isVjUuid)
  );
}

/** A set list's `sceneIds` (backend normalizeSetlistSceneIds): uuid strings,
 *  lowercased, in order, a repeat kept. Anything but such an array answers
 *  VJ_SETLIST_ITEMS_INVALID; over 100 entries then answers VJ_SETLIST_FULL
 *  with `setlistId` when the set list exists. A create with no `sceneIds`
 *  passes `[]` itself. */
export function normalizeVjSetlistSceneIds(
  value: unknown,
  setlistId: string | null,
): string[] {
  if (!isVjUuidList(value, Number.POSITIVE_INFINITY)) {
    throw vjRefusal("VJ_SETLIST_ITEMS_INVALID");
  }
  if (value.length > VJ_LIMITS.setlistItemsMax) {
    throw vjRefusal("VJ_SETLIST_FULL", { setlistId: setlistId ?? undefined });
  }
  return value.map((sceneId) => sceneId.toLowerCase());
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
