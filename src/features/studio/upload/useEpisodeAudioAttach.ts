import { useEffect, useRef, useState } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "../api/studio.adapters";
import { studioErrorCodeOf } from "../api/studio.api";
import {
  STUDIO_LIMITS,
  type StudioAudioContentType,
} from "../api/studio.types";
import {
  StudioAudioUploadError,
  uploadStudioAudio,
  type StudioAudioUploadHandle,
} from "../api/studioAudioUpload";
import { useConfirmStudioTrackAudio } from "../api/useStudioTrackMutations";
import { conversionBarOf, uploadBarOf } from "../studioRowConversion";
import { createProgressReporter } from "../studioUploadQueue";
import {
  conversionFailureOf,
  isRetryableUploadError,
  uploadErrorKeyOf,
  validateAudioFiles,
} from "../studioUploadValidation";
import { convertToMp3 } from "./convert/studioWavConverter";
import {
  failureLineOf,
  rejectionLineOf,
  type EpisodeAudioProgress,
} from "./episodeAudioLines";

/** The line a cancelled episode upload shows (the same as a track row's). */
const UPLOAD_CANCELLED_LINE_KEY = "studio:uploadFlow.files.cancelled";

/** What a stopped attach keeps, so Retry resumes where it stopped: the MP3
 *  once converted, and the stored key once uploaded (a failed confirm then
 *  retries the confirm alone, never the upload or the conversion). */
interface HeldAudio {
  sourceFile: File;
  /** The file to upload: the MP3 for a converted WAV or AIFF, else the pick. */
  uploadFile: File | null;
  contentType: StudioAudioContentType;
  wasConverted: boolean;
  uploadedKey: string | null;
}

/** Runs one attach: a token per run, so a run that was cancelled or
 *  replaced stops at its next step without touching the lines. */
function useRunControl() {
  const handleRef = useRef<StudioAudioUploadHandle | null>(null);
  const conversionRef = useRef<AbortController | null>(null);
  const runTokenRef = useRef(0);
  useEffect(
    () => () => {
      handleRef.current?.abort();
      conversionRef.current?.abort();
    },
    [],
  );
  return {
    /** Records the PUT in flight, so Cancel and unmount can abort it. */
    setHandle: (handle: StudioAudioUploadHandle) => {
      handleRef.current = handle;
    },
    /** Forgets `handle` once it settled, unless a newer one replaced it. */
    clearHandle: (handle: StudioAudioUploadHandle) => {
      if (handleRef.current === handle) handleRef.current = null;
    },
    setConversion: (controller: AbortController | null) => {
      conversionRef.current = controller;
    },
    /** Stops whatever runs and returns the check for the run that starts. */
    startRun: () => {
      runTokenRef.current += 1;
      handleRef.current?.abort();
      handleRef.current = null;
      conversionRef.current?.abort();
      conversionRef.current = null;
      const runToken = runTokenRef.current;
      return () => runTokenRef.current === runToken;
    },
  };
}

/**
 * Uploads and confirms audio for an episode that exists without it (an
 * upload that stopped); a WAV or AIFF converts first. The confirmed track
 * lands in the track cache, so the form reads its audio from there.
 * Cancel stops the conversion or the upload and keeps the file; Retry,
 * offered only when it can help, resumes from the last finished step.
 * Unmounting aborts both.
 */
export function useEpisodeAudioAttach(
  release: StudioReleaseView,
  trackId: string,
) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const confirmAudio = useConfirmStudioTrackAudio();
  const [progress, setProgress] = useState<EpisodeAudioProgress | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [held, setHeld] = useState<HeldAudio | null>(null);
  const run = useRunControl();

  /** The MP3, or null once the failure line is set. An aborted conversion
   *  never settles, so nothing runs after a cancel or an unmount. */
  async function convert(work: HeldAudio, isCurrent: () => boolean) {
    const fileName = work.sourceFile.name;
    const controller = new AbortController();
    run.setConversion(controller);
    const showConverting = (percent: number) => {
      if (isCurrent())
        setProgress({
          fileName,
          progress: percent,
          barPercent: conversionBarOf(percent),
          isConfirming: false,
          isConverting: true,
        });
    };
    showConverting(0);
    const reportProgress = createProgressReporter(showConverting);
    const result = await convertToMp3(
      work.sourceFile,
      STUDIO_LIMITS.audioMaxBytesPodcast,
      {
        signal: controller.signal,
        onProgress: (fraction) => reportProgress(fraction * 100),
      },
    );
    run.setConversion(null);
    if (!isCurrent()) return null;
    if (result.ok) return result.file;
    const failure = conversionFailureOf(result);
    setProgress(null);
    setLines([
      failureLineOf(t, failure.errorKey, fileName, failure.errorValues),
    ]);
    setHeld(failure.isRetryable ? work : null);
    return null;
  }

  async function upload(
    work: HeldAudio,
    uploadFile: File,
    isCurrent: () => boolean,
  ) {
    const fileName = work.sourceFile.name;
    const showUploading = (percent: number) => {
      if (isCurrent())
        setProgress({
          fileName,
          progress: percent,
          barPercent: uploadBarOf(percent, work.wasConverted),
          isConfirming: false,
          isConverting: false,
        });
    };
    showUploading(0);
    const handle = uploadStudioAudio({
      demoMode,
      subprofileId: release.artist.id,
      file: uploadFile,
      contentType: work.contentType,
      onProgress: createProgressReporter(showUploading),
    });
    run.setHandle(handle);
    try {
      return await handle.promise;
    } finally {
      run.clearHandle(handle);
    }
  }

  /** Runs the steps `work` still needs: convert, upload, confirm. */
  async function resume(initialWork: HeldAudio) {
    const isCurrent = run.startRun();
    let work = initialWork;
    setHeld(work);
    setLines([]);
    const fileName = work.sourceFile.name;
    try {
      const uploadFile = work.uploadFile ?? (await convert(work, isCurrent));
      if (!uploadFile || !isCurrent()) return;
      // Each finished step is kept, so a Cancel or a failure after it
      // never redoes it.
      work = { ...work, uploadFile };
      setHeld(work);
      const uploadedKey =
        work.uploadedKey ?? (await upload(work, uploadFile, isCurrent));
      if (!isCurrent()) return;
      work = { ...work, uploadedKey };
      setHeld(work);
      setProgress({
        fileName,
        progress: 100,
        barPercent: 100,
        isConfirming: true,
        isConverting: false,
      });
      await confirmAudio.mutateAsync({
        trackId,
        releaseId: release.id,
        key: uploadedKey,
      });
      if (isCurrent()) setHeld(null);
    } catch (error) {
      if (!isCurrent()) return;
      if (error instanceof StudioAudioUploadError && error.isAborted) return;
      // The server deleted an unreadable object: Retry uploads it again.
      if (studioErrorCodeOf(error) === "studio_audio_unreadable")
        work = { ...work, uploadedKey: null };
      const canRetry = isRetryableUploadError(error);
      setProgress(null);
      setHeld(canRetry ? work : null);
      setLines([
        failureLineOf(t, uploadErrorKeyOf(error), fileName, null, canRetry),
      ]);
    }
  }

  function attach(file: File) {
    const { accepted, rejected } = validateAudioFiles(
      [file],
      0,
      STUDIO_LIMITS.audioMaxBytesPodcast,
    );
    const [first] = accepted;
    if (!first) {
      run.startRun();
      setHeld(null);
      setProgress(null);
      setLines(rejected.map((rejection) => rejectionLineOf(t, rejection)));
      return;
    }
    void resume({
      sourceFile: file,
      uploadFile: first.needsConversion ? null : file,
      contentType: first.contentType,
      wasConverted: first.needsConversion,
      uploadedKey: null,
    });
  }

  return {
    progress,
    lines,
    attach,
    /** Shown while a conversion or upload runs, before the confirm. */
    cancel:
      progress && !progress.isConfirming
        ? () => {
            run.startRun();
            setProgress(null);
            setLines([t(UPLOAD_CANCELLED_LINE_KEY)]);
          }
        : null,
    /** Shown once a held file stopped: it resumes from its last step. */
    retry: !progress && held ? () => void resume(held) : null,
    heldFileName: held?.sourceFile.name ?? "",
    isRunning: progress !== null,
    hasHeldFile: progress === null && held !== null,
  };
}
