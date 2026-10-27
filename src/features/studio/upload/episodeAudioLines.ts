import type { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  fileRejectionKeyOf,
  type FileRejectionReason,
} from "../studioUploadValidation";

export type Translate = ReturnType<typeof useTranslation>["t"];

/** A failed upload's line. A file over the cap reads the 250 MB wording; a
 *  plain stop says Retry picks the file up again, or, when Retry cannot,
 *  asks for the file again; a failure with its own line (offline, an
 *  expired link, the 500 episode cap, a restriction, a conversion) keeps it,
 *  with the values it needs. */
export function failureLineOf(
  t: Translate,
  errorKey: string | null,
  fileName: string,
  errorValues: Record<string, number> | null = null,
  isRetryable = false,
) {
  if (errorKey === "studio:uploadFlow.files.errorTooLarge")
    return t("studio:uploadFlow.files.rejectSizePodcast", { fileName });
  if (!errorKey || errorKey === "studio:uploadFlow.files.errorUpload")
    return t(
      isRetryable
        ? "studio:uploadFlow.files.errorUpload"
        : "studio:episodeUpload.uploadFailed",
    );
  return t(errorKey, errorValues ?? undefined);
}

export const rejectionLineOf = (
  t: Translate,
  rejection: { fileName: string; reason: FileRejectionReason },
) =>
  t(fileRejectionKeyOf(rejection.reason, "podcast"), {
    fileName: rejection.fileName,
  });

export interface EpisodeAudioProgress {
  fileName: string;
  /** The stage's own 0..100 percent (the converting line shows it). */
  progress: number;
  /** The bar's value: a converted file's one bar, 0..50 then 50..100. */
  barPercent: number;
  isConfirming: boolean;
  /** The browser is turning a WAV or AIFF into MP3 before the upload. */
  isConverting: boolean;
  /** The browser is reading the file's header, before it says anything
   *  about converting or uploading. */
  isChecking: boolean;
}
