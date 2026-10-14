import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
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
import { createProgressReporter } from "./studioUploadQueue";
import {
  fileRejectionKeyOf,
  uploadErrorKeyOf,
  validateAudioFiles,
  type FileRejectionReason,
} from "./studioUploadValidation";
import { useStudioTrackUploads } from "./useStudioTrackUploads";
import css from "./StudioEpisodeUpload.module.css";

type Translate = ReturnType<typeof useTranslation>["t"];

/** A failed upload's line. A file over the cap reads the 250 MB wording; the
 *  generic failure asks for the file again; a refusal with its own line
 *  (the 500 episode cap, a restriction) keeps it. */
function failureLineOf(
  t: Translate,
  errorKey: string | null,
  fileName: string,
) {
  if (errorKey === "studio:uploadFlow.files.errorTooLarge")
    return t("studio:uploadFlow.files.rejectSizePodcast", { fileName });
  if (!errorKey || errorKey === "studio:uploadFlow.files.errorUpload")
    return t("studio:episodeUpload.uploadFailed");
  return t(errorKey);
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
  progress: number;
  isConfirming: boolean;
}

/** The episode's one drop zone, or the upload's progress in its place (a
 *  keyed fade), with the outcome lines in a live region. */
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
  const uploadingLine = progress
    ? t("studio:episodeUpload.uploading", { fileName: progress.fileName })
    : "";
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
              <p>
                {progress.isConfirming
                  ? t("studio:episodeUpload.processing")
                  : uploadingLine}
              </p>
              <progress
                value={progress.progress}
                max={100}
                aria-label={uploadingLine}
              />
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
 *  and its audio uploaded; once the audio is confirmed the page moves to the
 *  episode's own address (leaving earlier would abort the upload). */
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
              progress: row.progress,
              isConfirming: row.stage === "confirming",
            }
      }
      onFile={(file) => {
        if (row) uploads.remove(row.localId);
        uploads.addFiles([file]);
      }}
      lines={[
        ...(isFailed ? [failureLineOf(t, row.errorKey, fileName)] : []),
        ...uploads.rejections.map((rejection) => rejectionLineOf(t, rejection)),
      ]}
    />
  );
}

/** Uploads and confirms audio for an episode that exists without it (an
 *  upload that stopped). The confirmed track lands in the track cache, so
 *  the form reads its audio from there. Unmounting aborts the upload. */
function useEpisodeAudioAttach(release: StudioReleaseView, trackId: string) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const confirmAudio = useConfirmStudioTrackAudio();
  const [progress, setProgress] = useState<EpisodeAudioProgress | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const handleRef = useRef<StudioAudioUploadHandle | null>(null);
  useEffect(() => () => handleRef.current?.abort(), []);

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
    setProgress({ fileName, progress: 0, isConfirming: false });
    try {
      const handle = uploadStudioAudio({
        demoMode,
        subprofileId: release.artist.id,
        file,
        contentType: first.contentType,
        onProgress: createProgressReporter((percent) =>
          setProgress({ fileName, progress: percent, isConfirming: false }),
        ),
      });
      handleRef.current = handle;
      const key = await handle.promise;
      handleRef.current = null;
      setProgress({ fileName, progress: 100, isConfirming: true });
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
