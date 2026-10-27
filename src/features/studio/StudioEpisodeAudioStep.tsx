import { useEffect, useId, useState, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiRefreshCw, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "./api/studio.adapters";
import { STUDIO_LIMITS } from "./api/studio.types";
import { DropZone } from "./StudioUploadDropZone";
import {
  failureLineOf,
  rejectionLineOf,
  type EpisodeAudioProgress,
  type Translate,
} from "./upload/episodeAudioLines";
import { useReportUploadActivity } from "./upload/studioUploadActivityContext";
import { useEpisodeAudioAttach } from "./upload/useEpisodeAudioAttach";
import { useStudioTrackUploads } from "./useStudioTrackUploads";
import css from "./StudioEpisodeUpload.module.css";

/** Cancel during a conversion or an upload, Retry after one stopped. Both
 *  keep the file in memory, so a 250 MB episode is never picked again. */
function EpisodeAudioActions({
  fileName,
  onCancel,
  onRetry,
}: {
  fileName: string;
  onCancel: (() => void) | null;
  onRetry: (() => void) | null;
}) {
  const { t } = useTranslation();
  return (
    <div className={css.audioActions}>
      <Collapse isOpen={onCancel !== null}>
        <Button
          variant="quiet"
          size="sm"
          onClick={() => onCancel?.()}
          aria-label={t("studio:episodeUpload.cancelFor", { fileName })}
        >
          <FiX aria-hidden /> {t("studio:episodeUpload.cancelCta")}
        </Button>
      </Collapse>
      <Collapse isOpen={onRetry !== null}>
        <Button
          variant="quiet"
          size="sm"
          onClick={() => onRetry?.()}
          aria-label={t("studio:episodeUpload.retryFor", { fileName })}
        >
          <FiRefreshCw aria-hidden /> {t("studio:episodeUpload.retryCta")}
        </Button>
      </Collapse>
    </div>
  );
}

/** The visible line (with the percent while converting) and the bar's name. */
function progressLinesOf(t: Translate, progress: EpisodeAudioProgress | null) {
  if (!progress) return { visibleLine: "", progressLabel: "" };
  const { fileName } = progress;
  if (progress.isChecking) {
    const checkingLine = t("studio:uploadFlow.files.stage.checking");
    return { visibleLine: checkingLine, progressLabel: checkingLine };
  }
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
  actions,
}: {
  progress: EpisodeAudioProgress | null;
  onFile: (file: File) => void;
  lines: string[];
  /** Cancel and Retry, under the progress or the drop zone. */
  actions?: ReactNode;
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
      {actions}
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
  // The same stages useStudioTrackUploads lets Cancel stop: a create or a
  // confirm waits for the server.
  const isCancellable =
    row !== null &&
    (row.stage === "queued" ||
      row.stage === "checking" ||
      row.stage === "converting" ||
      row.stage === "uploading");
  useReportUploadActivity("uploads", uploads.hasActiveUploads);
  useReportUploadActivity("heldFiles", uploads.hasHeldFiles);

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
              isChecking: row.stage === "checking",
            }
      }
      onFile={(file) => {
        if (row) uploads.remove(row.localId);
        uploads.addFiles([file]);
      }}
      lines={[
        ...(isFailed
          ? [
              failureLineOf(
                t,
                row.errorKey,
                fileName,
                row.errorValues ?? null,
                row.isRetryable,
              ),
            ]
          : []),
        ...uploads.rejections.map((rejection) => rejectionLineOf(t, rejection)),
      ]}
      actions={
        <EpisodeAudioActions
          fileName={fileName}
          onCancel={isCancellable ? () => uploads.cancel(row.localId) : null}
          onRetry={
            isFailed && row.isRetryable
              ? () => uploads.retry(row.localId)
              : null
          }
        />
      }
    />
  );
}

/** The drop zone inside the form of an episode that has no audio yet. */
export function StudioEpisodeAudioAttach({
  release,
  trackId,
}: {
  release: StudioReleaseView;
  trackId: string;
}) {
  const attachment = useEpisodeAudioAttach(release, trackId);
  useReportUploadActivity("uploads", attachment.isRunning);
  useReportUploadActivity("heldFiles", attachment.hasHeldFile);
  return (
    <EpisodeAudioZone
      progress={attachment.progress}
      onFile={(file) => void attachment.attach(file)}
      lines={attachment.lines}
      actions={
        <EpisodeAudioActions
          fileName={attachment.progress?.fileName ?? attachment.heldFileName}
          onCancel={attachment.cancel}
          onRetry={attachment.retry}
        />
      }
    />
  );
}
