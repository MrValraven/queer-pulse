import { useId } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import {
  Button,
  Collapse,
  CollapseListItem,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { VjClipUploads } from "../upload/useVjClipUploads";
import { VjUploadRow } from "./VjUploadRow";
import styles from "./VjUpload.module.css";

/** Mirrors `--ease` and `--dur-fast` in tokens/effects.css. */
const VJ_CLEAR_FADE_EASE = [0.22, 0.68, 0.16, 1] as const;
const VJ_CLEAR_FADE_DURATION = 0.15;

interface VjUploadRowsProps {
  uploads: VjClipUploads;
  packNameOf: (packId: string | null) => string | null;
}

/**
 * The upload list under the drop zone: one row per picked file, each row
 * growing in and folding away on its own. The whole list folds away once
 * the last row is gone.
 */
export function VjUploadRows({ uploads, packNameOf }: VjUploadRowsProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const headingId = useId();
  const hasRows = uploads.rows.length > 0;
  const hasFinishedRows = uploads.rows.some(
    (row) => row.stage === "done" || row.stage === "cancelled",
  );

  return (
    <Collapse isOpen={hasRows}>
      <section className={styles.rows} aria-labelledby={headingId}>
        <div className={styles.rowsHeader}>
          <h3 id={headingId} className={styles.rowsTitle}>
            {t("vj:upload.rowsLabel")}
          </h3>
          <AnimatePresence initial={false}>
            {hasFinishedRows ? (
              <m.div
                key="clear-finished"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: reducedMotion ? 0 : VJ_CLEAR_FADE_DURATION,
                  ease: VJ_CLEAR_FADE_EASE,
                }}
              >
                <Button
                  variant="quiet"
                  size="sm"
                  onClick={uploads.clearFinished}
                >
                  {t("vj:upload.clearFinished")}
                </Button>
              </m.div>
            ) : null}
          </AnimatePresence>
        </div>
        <ul className={styles.list}>
          <AnimatePresence initial={false}>
            {uploads.rows.map((row) => (
              <CollapseListItem key={row.rowId}>
                <VjUploadRow
                  row={row}
                  packName={packNameOf(row.packId)}
                  onCancel={() => uploads.cancel(row.rowId)}
                  onRetry={() => uploads.retry(row.rowId)}
                  onDismiss={() => uploads.dismiss(row.rowId)}
                />
              </CollapseListItem>
            ))}
          </AnimatePresence>
        </ul>
      </section>
    </Collapse>
  );
}
