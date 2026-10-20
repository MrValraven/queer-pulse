import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "./api/studio.adapters";
import { STUDIO_LIMITS } from "./api/studio.types";
import {
  StudioAudioUploadError,
  uploadStudioAudio,
  type StudioAudioUploadHandle,
} from "./api/studioAudioUpload";
import { useConfirmStudioTrackAudio } from "./api/useStudioTrackMutations";
import { DropZone } from "./StudioUploadDropZone";
import { conversionBarOf, uploadBarOf } from "./studioRowConversion";
import { createProgressReporter } from "./studioUploadQueue";
import {
  conversionFailureOf,
  fileRejectionKeyOf,
  uploadErrorKeyOf,
  validateAudioFiles,
  type FileRejectionReason,
} from "./studioUploadValidation";
import { convertToMp3 } from "./upload/convert/studioWavConverter";
import { useStudioTrackUploads } from "./useStudioTrackUploads";
import css from "./StudioEpisodeUpload.module.css";

type Translate = ReturnType<typeof useTranslation>["t"];

/** A failed upload's line. A file over the cap reads the 250 MB wording; the
 *  generic failure asks for the file again; a refusal with its own line
 *  (the 500 episode cap, a restriction, a conversion) keeps it, with the
 *  values it needs. */
function failureLineOf(
  t: Translate,
  errorKey: string | null,
  fileName: string,
  errorValues: Record<string, number> | null = null,
) {
  if (errorKey === "studio:uploadFlow.files.errorTooLarge")
    return t("studio:uploadFlow.files.rejectSizePodcast", { fileName });
  if (!errorKey || errorKey === "studio:uploadFlow.files.errorUpload")
    return t("studio:episodeUpload.uploadFailed");
  return t(errorKey, errorValues ?? undefined);
}

const rejectionLineOf = (
  t: Translate,
  rejection: { fileName: string; reason: FileRejectionReason },
) =>
  t(fileRejectionKeyOf(rejection.reason, "podcast"), {
    fileName: rejection.fileName,
  });

interface EpisodeAudioProgress {
  fileName: string;
  /** The stage's own 0..100 percent (the converting line shows it). */
  progress: number;
  /** The bar's value: a converted file's one bar, 0..50 then 50..100. */
  barPercent: number;
  isConfirming: boolean;
  /** The browser is turning a WAV or AIFF into MP3 before the upload. */
  isConverting: boolean;
}

/** The visible line (with the percent while converting) and the bar's name. */
function progressLinesOf(t: Translate, progress: EpisodeAudioProgress | null) {
  if (!progress) return { visibleLine: "", progressLabel: "" };
  const { fileName } = progress;
  if (progress.isConverting)
    return {
      visibleLine: t("studio:episodeUpload.converting", {
        fileName,
        percent: progress.progress,
      }),
      progressLabel: t("studio:episodeUpload.convertingLabel", { fileName }),
    };
  const uploadingLine = t("studio:episodeUpload.uploading", { fileName });
  return {
    visibleLine: progress.isConfirming
      ? t("studio:episodeUpload.processing")
      : uploadingLine,
    progressLabel: uploadingLine,
  };
}

/** The episode's one drop zone, or the conversion and upload progress in its
 *  place (a keyed fade), with the outcome lines in a live region. */
function EpisodeAudioZone({
  progress,
  onFile,
  lines,
}: {
  progress: EpisodeAudioProgress | null;
  onFile: (file: File) => void;
  lines: string[];
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const headingId = useId();
  const [extraFilesKeptName, setExtraFilesKeptName] = useState<string | null>(
    null,
  );
  const { visibleLine, progressLabel } = progressLinesOf(t, progress);
  return (
    <section className={css.audio} aria-labelledby={headingId}>
      <h2 id={headingId}>{t("studio:episodeUpload.audioHeading")}</h2>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={progress ? "progress" : "drop"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.18 }}
        >
          {progress ? (
            <div className={css.progress}>
              <p>{visibleLine}</p>
              <progress
                value={progress.barPercent}
                max={100}
                aria-label={progressLabel}
              />
              <Collapse isOpen={progress.isConverting}>
                <p className={css.convertingHint}>
                  {t("studio:uploadFlow.files.convertingHint")}
                </p>
              </Collapse>
            </div>
          ) : (
            <DropZone
              onFiles={(files) => {
                const [file] = files;
                setExtraFilesKeptName(
                  files.length > 1 && file ? file.name : null,
                );
                if (file) onFile(file);
              }}
              isDisabled={false}
              acceptsKey="studio:uploadFlow.files.acceptsPodcast"
              titleKey="studio:episodeUpload.dropTitle"
              chooseKey="studio:episodeUpload.chooseFile"
            />
          )}
        </m.div>
      </AnimatePresence>
      <div role="status" className={css.status}>
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
        {extraFilesKeptName && (
          <p>
            {t("studio:episodeUpload.oneFileOnly", {
              fileName: extraFilesKeptName,
            })}
          </p>
        )}
      </div>
    </section>
  );
}

/** One drop zone for a new episode (spec 6.2). The draft episode is created
 *  and its audio uploaded (a WAV or AIFF converts first); once the audio is
 *  confirmed the page moves to the episode's own address (leaving earlier
 *  would abort the upload). */
export function StudioEpisodeAudioStep({
  release,
  onReady,
}: {
  release: StudioReleaseView;
  onReady: (trackId: string) => void;
}) {
  const { t } = useTranslation();
  const uploads = useStudioTrackUploads(release.id, release.artist.id, [], {
    audioMaxBytes: STUDIO_LIMITS.audioMaxBytesPodcast,
  });
  const row = uploads.rows[0] ?? null;
  const readyTrackId = row?.stage === "ready" ? row.trackId : null;
  const isFailed = row?.stage === "failed";
  const fileName = row?.fileName ?? row?.title ?? "";

  useEffect(() => {
    if (readyTrackId) onReady(readyTrackId);
  }, [readyTrackId, onReady]);

  return (
    <EpisodeAudioZone
      progress={
        row === null || isFailed
          ? null
          : {
              fileName,
              // The row's progress is the bar; converting shows its own percent.
              progress:
                row.stage === "converting" ? row.progress * 2 : row.progress,
              barPercent: row.progress,
              isConfirming: row.stage === "confirming",
              isConverting: row.stage === "converting",
            }
      }
      onFile={(file) => {
        if (row) uploads.remove(row.localId);
        uploads.addFiles([file]);
      }}
      lines={[
        ...(isFailed
          ? [failureLineOf(t, row.errorKey, fileName, row.errorValues ?? null)]
          : []),
        ...uploads.rejections.map((rejection) => rejectionLineOf(t, rejection)),
      ]}
    />
  );
}

/** Uploads and confirms audio for an episode that exists without it (an
 *  upload that stopped); a WAV or AIFF converts first. The confirmed track
 *  lands in the track cache, so the form reads its audio from there.
 *  Unmounting aborts the conversion and the upload. */
function useEpisodeAudioAttach(release: StudioReleaseView, trackId: string) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const confirmAudio = useConfirmStudioTrackAudio();
  const [progress, setProgress] = useState<EpisodeAudioProgress | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const handleRef = useRef<StudioAudioUploadHandle | null>(null);
  const conversionRef = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      handleRef.current?.abort();
      conversionRef.current?.abort();
    },
    [],
  );

  /** The MP3 to upload, or null once the failure line is set. An aborted
   *  conversion never settles, so nothing runs after an unmount. */
  async function convertFirst(file: File): Promise<File | null> {
    const fileName = file.name;
    const controller = new AbortController();
    conversionRef.current = controller;
    const showConverting = (percent: number) =>
      setProgress({
        fileName,
        progress: percent,
        barPercent: conversionBarOf(percent),
        isConfirming: false,
        isConverting: true,
      });
    showConverting(0);
    const reportProgress = createProgressReporter(showConverting);
    const result = await convertToMp3(
      file,
      STUDIO_LIMITS.audioMaxBytesPodcast,
      {
        signal: controller.signal,
        onProgress: (fraction) => reportProgress(fraction * 100),
      },
    );
    conversionRef.current = null;
    if (result.ok) return result.file;
    const failure = conversionFailureOf(result);
    setProgress(null);
    setLines([
      failureLineOf(t, failure.errorKey, fileName, failure.errorValues),
    ]);
    return null;
  }

  async function attach(file: File) {
    const { accepted, rejected } = validateAudioFiles(
      [file],
      0,
      STUDIO_LIMITS.audioMaxBytesPodcast,
    );
    setLines(rejected.map((rejection) => rejectionLineOf(t, rejection)));
    const [first] = accepted;
    if (!first) return;
    const fileName = file.name;
    const uploadFile = first.needsConversion ? await convertFirst(file) : file;
    if (!uploadFile) return;
    const wasConverted = first.needsConversion;
    const showUploading = (percent: number, isConfirming: boolean) =>
      setProgress({
        fileName,
        progress: percent,
        barPercent: uploadBarOf(percent, wasConverted),
        isConfirming,
        isConverting: false,
      });
    showUploading(0, false);
    try {
      const handle = uploadStudioAudio({
        demoMode,
        subprofileId: release.artist.id,
        file: uploadFile,
        contentType: first.contentType,
        onProgress: createProgressReporter((percent) =>
          showUploading(percent, false),
        ),
      });
      handleRef.current = handle;
      const key = await handle.promise;
      handleRef.current = null;
      showUploading(100, true);
      await confirmAudio.mutateAsync({ trackId, releaseId: release.id, key });
    } catch (error) {
      handleRef.current = null;
      if (error instanceof StudioAudioUploadError && error.isAborted) return;
      setProgress(null);
      setLines([failureLineOf(t, uploadErrorKeyOf(error), fileName)]);
    }
  }

  return { progress, lines, attach };
}

/** The drop zone inside the form of an episode that has no audio yet. */
export function StudioEpisodeAudioAttach({
  release,
  trackId,
}: {
  release: StudioReleaseView;
  trackId: string;
}) {
  const { progress, lines, attach } = useEpisodeAudioAttach(release, trackId);
  return (
    <EpisodeAudioZone
      progress={progress}
      onFile={(file) => void attach(file)}
      lines={lines}
    />
  );
}
