import {
  ACCOUNT_RESTRICTED_COPY,
  isAccountRestricted,
} from "../../shared/api/errorMessage";
import { studioErrorCodeOf } from "./api/studio.api";
import { StudioAudioUploadError } from "./api/studioAudioUpload";
import {
  STUDIO_AUDIO_CONTENT_TYPES,
  STUDIO_LIMITS,
  type StudioAudioContentType,
  type StudioErrorCode,
  type StudioFormat,
} from "./api/studio.types";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import {
  isConvertibleAudio,
  type ConvertFailureReason,
} from "./upload/convert/studioWavConverter";

export type FileRejectionReason = "type" | "size" | "limit";

export const FILE_REJECTION_KEY: Record<FileRejectionReason, string> = {
  type: "studio:uploadFlow.files.rejectType",
  size: "studio:uploadFlow.files.rejectSize",
  limit: "studio:uploadFlow.files.rejectLimit",
};

const KNOWN_TYPES: ReadonlySet<string> = new Set(STUDIO_AUDIO_CONTENT_TYPES);
/** Browsers that send no type, or an older alias, still name the file. */
const TYPE_BY_EXTENSION: Record<string, StudioAudioContentType> = {
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
};
const TYPE_ALIASES: Record<string, StudioAudioContentType> = {
  "audio/mp3": "audio/mpeg",
  "audio/x-m4a": "audio/mp4",
  "audio/m4a": "audio/mp4",
};

export function audioContentTypeOf(file: File): StudioAudioContentType | null {
  if (KNOWN_TYPES.has(file.type)) return file.type as StudioAudioContentType;
  const alias = TYPE_ALIASES[file.type];
  if (alias) return alias;
  if (
    file.type &&
    !file.type.startsWith("audio/") &&
    file.type !== "application/octet-stream"
  )
    return null;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return TYPE_BY_EXTENSION[extension] ?? null;
}

/** "01 - Tide.mp3" becomes "Tide"; the artist can rename it on the row. */
export function titleFromFileName(fileName: string): string {
  const title = fileName
    .replace(/\.[^.]+$/, "")
    .replace(/^\d{1,3}\s*[-_.]?\s*/, "")
    .replace(/_/g, " ")
    .trim()
    .slice(0, STUDIO_LIMITS.titleMax);
  return title || "Untitled";
}

/** Artist kinds: podcast-format personas upload up to 250 MB a file. */
export function audioMaxBytesFor(format: StudioFormat): number {
  return format === "podcast"
    ? STUDIO_LIMITS.audioMaxBytesPodcast
    : STUDIO_LIMITS.audioMaxBytes;
}

/** The rejection line, with the cap of the release's format. */
export function fileRejectionKeyOf(
  reason: FileRejectionReason,
  format: StudioFormat,
): string {
  return reason === "size" && format === "podcast"
    ? "studio:uploadFlow.files.rejectSizePodcast"
    : FILE_REJECTION_KEY[reason];
}

export interface AcceptedAudioFile {
  file: File;
  contentType: StudioAudioContentType;
  /** A WAV or AIFF: it uploads as the MP3 the browser makes from it. */
  needsConversion: boolean;
}

export function validateAudioFiles(
  files: File[],
  existingCount: number,
  maxBytes: number = STUDIO_LIMITS.audioMaxBytes,
) {
  const accepted: AcceptedAudioFile[] = [];
  const rejected: { fileName: string; reason: FileRejectionReason }[] = [];
  for (const file of files) {
    const recognisedType = audioContentTypeOf(file);
    const needsConversion = recognisedType === null && isConvertibleAudio(file);
    const contentType = needsConversion ? "audio/mpeg" : recognisedType;
    if (!contentType) rejected.push({ fileName: file.name, reason: "type" });
    // The cap applies to the MP3, and the converter checks it.
    else if (!needsConversion && file.size > maxBytes)
      rejected.push({ fileName: file.name, reason: "size" });
    else if (
      existingCount + accepted.length >=
      STUDIO_LIMITS.tracksPerReleaseMax
    )
      rejected.push({ fileName: file.name, reason: "limit" });
    else accepted.push({ file, contentType, needsConversion });
  }
  return { accepted, rejected };
}

/** One line for each way a WAV or AIFF can fail to become an MP3. */
export const CONVERSION_ERROR_KEY: Record<ConvertFailureReason, string> = {
  tooLong: "studio:uploadFlow.files.errorTooLong",
  unsupported: "studio:uploadFlow.files.errorUnsupported",
  failed: "studio:uploadFlow.files.errorConvert",
};

export interface ConversionFailure {
  errorKey: string;
  errorValues: Record<string, number> | null;
  isRetryable: boolean;
}

/** A too-long or unreadable file comes back the same on every Retry; a
 *  failed run may not. */
export function conversionFailureOf(failure: {
  reason: ConvertFailureReason;
  maxMinutes?: number;
}): ConversionFailure {
  return {
    errorKey: CONVERSION_ERROR_KEY[failure.reason],
    errorValues:
      failure.maxMinutes === undefined
        ? null
        : { maxMinutes: failure.maxMinutes },
    isRetryable: failure.reason === "failed",
  };
}

/** A refused Studio write as a catalog key: the shared restriction line for a
 *  member under a moderation restriction, else the Studio code's own line. */
export function studioWriteErrorKeyOf(error: unknown): string {
  return studioErrorMessageKeyOf(error);
}

/** A presign the server refused with 403: the grant, persona ownership, the
 *  persona kind or a restriction. The same request is refused on every Retry. */
const isPresignRefusal = (error: StudioAudioUploadError) =>
  error.stage === "presign" && error.status === 403;

/** One message per failure a row can show. */
export function uploadErrorKeyOf(error: unknown): string {
  if (error instanceof StudioAudioUploadError) {
    if (error.stage === "presign" && error.status === 413)
      return "studio:uploadFlow.files.errorTooLarge";
    if (isPresignRefusal(error)) return studioErrorMessageKeyOf(error.cause);
    return "studio:uploadFlow.files.errorUpload";
  }
  return studioWriteErrorKeyOf(error);
}

/** Refusals that come back the same on every Retry. */
const HARD_ERROR_CODES: ReadonlySet<StudioErrorCode> = new Set([
  "studio_audio_wrong_owner",
  "studio_release_not_draft",
  "studio_track_limit",
]);

/** Failures a Retry cannot fix: the server refuses the same file (413), the
 *  uploaded object belongs to someone else (422 wrong owner), the release
 *  left draft or is full (409), the presign was refused (403), or the member
 *  is under a restriction (403).
 *  The row keeps Remove, so the member can drop it and add the file again. */
export function isRetryableUploadError(error: unknown): boolean {
  if (error instanceof StudioAudioUploadError)
    return !(
      (error.stage === "presign" && error.status === 413) ||
      isPresignRefusal(error)
    );
  if (isAccountRestricted(error)) return false;
  const code = studioErrorCodeOf(error);
  return code === null || !HARD_ERROR_CODES.has(code);
}

/** The line a row shows when removing its track failed. The last playable
 *  track of a published release stays (409, Studio v3). */
export function removeErrorKeyOf(error: unknown): string {
  if (isAccountRestricted(error)) return ACCOUNT_RESTRICTED_COPY.key;
  if (studioErrorCodeOf(error) === "studio_release_needs_playable_track")
    return "studio:errors.releaseNeedsPlayableTrack";
  return "studio:uploadFlow.files.errorRemove";
}
