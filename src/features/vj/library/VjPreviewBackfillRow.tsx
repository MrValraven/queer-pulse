import { AnimatePresence, m } from "motion/react";
import { FiFilm } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import type { VjClipDTO } from "../../../shared/contracts/vj";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { VjBackfillRow } from "../upload/vjPreviewBackfillQueue";
import { VjUploadFailure } from "../upload/vjUploadFailure";
import { VjReasonLine } from "../VjReasonLine";
import styles from "./VjPreviewBackfill.module.css";

/** Mirrors `--ease` and `--dur-fast` in tokens/effects.css. */
const VJ_BACKFILL_EASE = [0.22, 0.68, 0.16, 1] as const;
const VJ_STAGE_FADE_DURATION = 0.15;

/** A failed row that somehow lost its cause still names the preview step. */
const VJ_UNKNOWN_PREVIEW_FAILURE = new VjUploadFailure("VJ_PREVIEW_FAILED");

interface VjPreviewBackfillRowProps {
  row: VjBackfillRow;
  /** Undefined once the clip left the library mid-run. */
  clip: VjClipDTO | undefined;
}

/**
 * One clip of a "Make previews" run: a small thumbnail, the clip's title, the
 * stage in words (faded from one to the next) and the named cause when its
 * preview could not be made. The panel's own live region speaks the progress,
 * so the stage words stay quiet here.
 */
export function VjPreviewBackfillRow({ row, clip }: VjPreviewBackfillRowProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isFailed = row.stage === "failed";

  return (
    <div className={styles.row} data-stage={row.stage}>
      <div className={styles.rowMain}>
        {clip === undefined ? (
          <span className={styles.rowThumbEmpty} aria-hidden="true">
            <FiFilm focusable="false" fill="none" />
          </span>
        ) : (
          <img
            className={styles.rowThumb}
            src={clip.thumbnailUrl}
            alt=""
            width={clip.width}
            height={clip.height}
            loading="lazy"
            decoding="async"
          />
        )}
        <div className={styles.rowText}>
          <p className={styles.rowTitle}>
            {clip?.title ?? t("vj:previews.clipGone")}
          </p>
          <AnimatePresence mode="wait" initial={false}>
            <m.span
              key={row.stage}
              className={styles.rowStage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: reducedMotion ? 0 : VJ_STAGE_FADE_DURATION,
                ease: VJ_BACKFILL_EASE,
              }}
            >
              {t(`vj:previews.stage.${row.stage}`)}
            </m.span>
          </AnimatePresence>
        </div>
      </div>
      <VjReasonLine
        error={isFailed ? (row.failure ?? VJ_UNKNOWN_PREVIEW_FAILURE) : null}
      />
    </div>
  );
}
