import { AnimatePresence, m } from "motion/react";
import { FiFilm, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button, Collapse, IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { VjUploadRow as VjUploadRowState } from "../upload/vjUploadQueue";
import { VjReasonLine } from "../VjReasonLine";
import { formatVjBytes } from "../vjFormat";
import backfillStyles from "./VjPreviewBackfill.module.css";
import styles from "./VjUpload.module.css";

/** Mirrors `--ease` and `--dur-base` / `--dur-fast` in tokens/effects.css. */
const VJ_UPLOAD_EASE = [0.22, 0.68, 0.16, 1] as const;
const VJ_PROGRESS_DURATION = 0.25;
const VJ_ACTIONS_FADE_DURATION = 0.15;

/** A failed row that somehow lost its cause still shows a line. */
const VJ_UNKNOWN_UPLOAD_FAILURE = new Error("vj_upload_failed");

type VjUploadActionGroup = "running" | "previewing" | "failed" | "settled";

interface VjUploadRowProps {
  row: VjUploadRowState;
  packName: string | null;
  onCancel: () => void;
  onRetry: () => void;
  onDismiss: () => void;
}

function actionGroupOf(row: VjUploadRowState): VjUploadActionGroup {
  if (row.stage === "failed") return "failed";
  if (row.stage === "previewing") return "previewing";
  if (row.stage === "done" || row.stage === "cancelled") return "settled";
  return "running";
}

function clampedPercentOf(row: VjUploadRowState): number {
  if (row.stage === "saving") return 100;
  if (!Number.isFinite(row.percent)) return 0;
  return Math.min(100, Math.max(0, Math.round(row.percent)));
}

/** The words for a row's stage. A failed row says nothing here: its reason
 *  line speaks. `shouldShowPercent` false leaves the percent out, for the
 *  live region, which then speaks once per stage. */
function useVjUploadStatusText(
  row: VjUploadRowState,
  packName: string | null,
  shouldShowPercent: boolean,
): string {
  const { t } = useTranslation();
  switch (row.stage) {
    case "queued":
      return t("vj:upload.status.queued");
    case "checking":
      return t("vj:upload.status.checking");
    case "uploading":
      return shouldShowPercent
        ? t("vj:upload.status.uploading", { percent: clampedPercentOf(row) })
        : t("vj:upload.status.uploadingAnnounced");
    case "waiting":
      return t("vj:upload.status.waiting");
    case "saving":
      return t("vj:upload.status.saving");
    case "previewing":
      return t("vj:upload.status.previewing");
    case "done":
      return row.packId !== null && packName !== null
        ? t("vj:upload.status.donePack", { pack: packName })
        : t("vj:upload.status.doneLibrary");
    case "cancelled":
      return t("vj:upload.status.cancelled");
    case "failed":
      return "";
  }
}

/** A thin bar that fills by `transform: scaleX`, named for its file. */
function VjUploadProgress({
  percent,
  fileName,
}: {
  percent: number;
  fileName: string;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  return (
    <div
      className={styles.progressTrack}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={t("vj:upload.progressLabel", { name: fileName })}
    >
      <m.div
        className={styles.progressFill}
        style={{ originX: 0 }}
        initial={false}
        animate={{ scaleX: percent / 100 }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { duration: VJ_PROGRESS_DURATION, ease: VJ_UPLOAD_EASE }
        }
      />
    </div>
  );
}

/** The buttons a row offers at its stage, faded from one set to the next. */
function VjUploadRowActions({
  row,
  onCancel,
  onRetry,
  onDismiss,
}: Omit<VjUploadRowProps, "packName">) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const actionGroup = actionGroupOf(row);
  const fadeDuration = reducedMotion ? 0 : VJ_ACTIONS_FADE_DURATION;
  const removeButton = (
    <IconButton
      size="sm"
      aria-label={t("vj:upload.removeRowAria", { name: row.fileName })}
      tooltip={t("vj:upload.removeRow")}
      onClick={onDismiss}
    >
      <FiX aria-hidden="true" focusable="false" fill="none" />
    </IconButton>
  );
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={actionGroup}
        className={styles.actions}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: fadeDuration, ease: VJ_UPLOAD_EASE }}
      >
        {actionGroup === "running" ? (
          <Button variant="quiet" size="sm" onClick={onCancel}>
            {t("vj:upload.cancel")}
          </Button>
        ) : null}
        {actionGroup === "previewing" ? (
          <Button variant="quiet" size="sm" onClick={onCancel}>
            {t("vj:upload.skipPreview")}
          </Button>
        ) : null}
        {actionGroup === "failed" ? (
          <Button variant="soft" size="sm" onClick={onRetry}>
            {t("vj:upload.retry")}
          </Button>
        ) : null}
        {actionGroup === "running" || actionGroup === "previewing"
          ? null
          : removeButton}
      </m.div>
    </AnimatePresence>
  );
}

/**
 * One file in the upload list: its name and size, its stage in words, a
 * progress bar while it uploads or saves, and the named cause when it fails.
 * After the clip is saved the row makes its animated preview ("Skip preview"
 * ends it done); a preview that could not be made names its cause under the
 * done row with a hint that "Make previews" tries that clip again.
 */
export function VjUploadRow({
  row,
  packName,
  onCancel,
  onRetry,
  onDismiss,
}: VjUploadRowProps) {
  const { t } = useTranslation();
  const statusText = useVjUploadStatusText(row, packName, true);
  const announcedText = useVjUploadStatusText(row, packName, false);
  const isFailed = row.stage === "failed";
  // The clip is saved, so a preview that could not be made leaves the row done.
  const previewFailure = row.stage === "done" ? row.previewFailure : null;
  const hasPreviewFailure = previewFailure != null;
  const isProgressShown = row.stage === "uploading" || row.stage === "saving";

  return (
    <div className={styles.row} data-stage={row.stage}>
      <div className={styles.rowMain}>
        <FiFilm
          className={styles.rowIcon}
          aria-hidden="true"
          focusable="false"
          fill="none"
        />
        <div className={styles.rowText}>
          <p className={styles.fileLine}>
            <span className={styles.fileName} title={row.fileName}>
              {row.fileName}
            </span>
            <span className={styles.fileSize}>
              {formatVjBytes(row.byteSize)}
            </span>
          </p>
          {/* The percent shows on screen and on the progress bar; the live
              region holds the stage words only, so each tick stays quiet. */}
          <span className={styles.status} aria-hidden="true">
            {statusText}
          </span>
          <span role="status" className="visuallyHidden">
            {announcedText}
          </span>
        </div>
        <VjUploadRowActions
          row={row}
          onCancel={onCancel}
          onRetry={onRetry}
          onDismiss={onDismiss}
        />
      </div>
      <Collapse isOpen={isProgressShown}>
        <VjUploadProgress
          percent={clampedPercentOf(row)}
          fileName={row.fileName}
        />
      </Collapse>
      <VjReasonLine
        error={isFailed ? (row.failure ?? VJ_UNKNOWN_UPLOAD_FAILURE) : null}
        fileByteSize={row.byteSize}
      />
      <VjReasonLine error={previewFailure} />
      <Collapse isOpen={hasPreviewFailure}>
        <p className={backfillStyles.uploadHint}>
          {t("vj:upload.previewRetryHint")}
        </p>
      </Collapse>
    </div>
  );
}
