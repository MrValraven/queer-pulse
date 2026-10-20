import type { StudioAudioContentType } from "./api/studio.types";
import { createProgressReporter } from "./studioUploadQueue";
import { conversionFailureOf } from "./studioUploadValidation";
import { convertToMp3 } from "./upload/convert/studioWavConverter";
import type { AcceptedUpload, UploadRow } from "./useStudioTrackUploads";

/** The part of a row's work that conversion reads and changes. */
export interface ConvertibleWork {
  file: File;
  contentType: StudioAudioContentType;
  /** The WAV or AIFF the artist picked, until it becomes an MP3. */
  sourceFile: File | null;
  needsConversion: boolean;
  /** True once the MP3 exists: its bar then runs 50..100 (see uploadBarOf). */
  wasConverted: boolean;
  /** Aborts this row's conversion (Remove, unmount). */
  conversion: AbortController | null;
}

/** A converted file's bar is one bar: conversion fills the first half and
 *  the upload the second, so the bar never restarts between them. */
const CONVERSION_BAR_SHARE = 50;

export function conversionBarOf(conversionPercent: number): number {
  return (conversionPercent * CONVERSION_BAR_SHARE) / 100;
}

/** The bar value for an upload percent: 0..100 as it is for an MP3 or M4A,
 *  50..100 for a file that was converted first. */
export function uploadBarOf(
  uploadPercent: number,
  wasConverted: boolean,
): number {
  if (!wasConverted) return uploadPercent;
  return (
    CONVERSION_BAR_SHARE + (uploadPercent * (100 - CONVERSION_BAR_SHARE)) / 100
  );
}

export interface RowConversionContext {
  maxBytes: number;
  patchRow: (localId: string, patch: Partial<UploadRow>) => void;
  isGone: (localId: string) => boolean;
  /** Hands the MP3 to the analysis once it exists. */
  onConverted: (accepted: AcceptedUpload) => void;
}

/** Turns a WAV or AIFF row into an MP3 before its track is made, so a failed
 *  conversion never leaves an empty track. True when the row goes on to
 *  upload; false when it failed (the row says why) or was removed. An
 *  aborted conversion never settles, so a removed row simply stops here. */
export async function convertRowAudio(
  localId: string,
  work: ConvertibleWork,
  context: RowConversionContext,
): Promise<boolean> {
  const sourceFile = work.sourceFile;
  if (!work.needsConversion || !sourceFile) return true;
  const controller = new AbortController();
  work.conversion = controller;
  const reportProgress = createProgressReporter((progress) => {
    if (!context.isGone(localId))
      context.patchRow(localId, {
        stage: "converting",
        progress: conversionBarOf(progress),
      });
  });
  const result = await convertToMp3(sourceFile, context.maxBytes, {
    signal: controller.signal,
    onProgress: (fraction) => reportProgress(fraction * 100),
  });
  work.conversion = null;
  if (context.isGone(localId)) return false;
  if (!result.ok) {
    context.patchRow(localId, {
      stage: "failed",
      ...conversionFailureOf(result),
    });
    return false;
  }
  work.file = result.file;
  work.contentType = "audio/mpeg";
  work.sourceFile = null;
  work.needsConversion = false;
  work.wasConverted = true;
  // Half the bar: the upload carries on from here.
  context.patchRow(localId, {
    stage: "queued",
    progress: uploadBarOf(0, true),
  });
  context.onConverted({
    localId,
    file: result.file,
    contentType: "audio/mpeg",
  });
  return true;
}
