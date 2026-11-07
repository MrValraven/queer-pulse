import type { ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiAlertCircle, FiFilm } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import type { VjClipDTO } from "../../../shared/contracts/vj";
import {
  Button,
  Collapse,
  CollapseListItem,
  SuccessPanel,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { VjPreviewBackfill } from "../upload/useVjPreviewBackfill";
import {
  vjBackfillProgressOf,
  type VjBackfillProgress,
} from "../upload/vjPreviewBackfillQueue";
import { VjUploadFailure } from "../upload/vjUploadFailure";
import { VjReasonLine } from "../VjReasonLine";
import { VjPreviewBackfillRow } from "./VjPreviewBackfillRow";
import styles from "./VjPreviewBackfill.module.css";

/** Mirrors `--ease`, `--dur-fast` and `--dur-base` in tokens/effects.css. */
const VJ_BACKFILL_EASE = [0.22, 0.68, 0.16, 1] as const;
const VJ_BODY_FADE_DURATION = 0.15;
const VJ_PROGRESS_DURATION = 0.25;

/** The reason an unsupported browser reads, named by its own code. */
const VJ_PREVIEW_UNSUPPORTED_FAILURE = new VjUploadFailure(
  "VJ_PREVIEW_UNSUPPORTED",
);

type VjBackfillView = "idle" | "running" | "finished";

interface VjPreviewBackfillPanelProps {
  backfill: VjPreviewBackfill;
  clipsById: ReadonlyMap<string, VjClipDTO>;
}

function viewOf(backfill: VjPreviewBackfill): VjBackfillView {
  if (backfill.state.rows.length === 0) return "idle";
  return backfill.isRunning ? "running" : "finished";
}

/** The film icon and the text column every state of the panel leads with. */
function VjBackfillHead({
  title,
  children,
  actions,
}: {
  title: ReactNode;
  children?: ReactNode;
  actions: ReactNode;
}) {
  return (
    <div className={styles.head}>
      <span className={styles.icon} aria-hidden="true">
        <FiFilm focusable="false" fill="none" />
      </span>
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        {children}
      </div>
      <div className={styles.actions}>{actions}</div>
    </div>
  );
}

/** A thin bar that fills by `transform: scaleX` as previews settle. */
function VjBackfillProgressBar({ progress }: { progress: VjBackfillProgress }) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const ratio =
    progress.total === 0 ? 0 : progress.settledCount / progress.total;
  return (
    <div
      className={styles.progressTrack}
      role="progressbar"
      aria-valuenow={progress.settledCount}
      aria-valuemin={0}
      aria-valuemax={progress.total}
      aria-label={t("vj:previews.progressLabel")}
    >
      <m.div
        className={styles.progressFill}
        style={{ originX: 0 }}
        initial={false}
        animate={{ scaleX: ratio }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { duration: VJ_PROGRESS_DURATION, ease: VJ_BACKFILL_EASE }
        }
      />
    </div>
  );
}

/** The words a screen reader hears: once per clip while running, then the summary. */
function useVjBackfillAnnouncement(
  view: VjBackfillView,
  progress: VjBackfillProgress,
): string {
  const { t } = useTranslation();
  if (view === "running") {
    return t("vj:previews.progress", {
      current: progress.currentNumber ?? progress.total,
      total: progress.total,
    });
  }
  if (view === "finished") {
    const madeLine = t("vj:previews.summaryMade", {
      count: progress.doneCount,
    });
    if (progress.failedCount === 0) return madeLine;
    const failedLine = t("vj:previews.summaryFailed", {
      count: progress.failedCount,
    });
    return `${madeLine}. ${failedLine}`;
  }
  return "";
}

function VjBackfillIdleBody({ backfill }: { backfill: VjPreviewBackfill }) {
  const { t } = useTranslation();
  return (
    <>
      <VjBackfillHead
        title={t("vj:previews.missing", {
          count: backfill.missingClipIds.length,
        })}
        actions={
          <Button
            variant="soft"
            size="sm"
            className={styles.action}
            aria-disabled={backfill.isSupported ? undefined : true}
            onClick={backfill.isSupported ? backfill.start : undefined}
          >
            {t("vj:previews.start")}
          </Button>
        }
      >
        <p className={styles.hint}>{t("vj:previews.hint")}</p>
      </VjBackfillHead>
      <VjReasonLine
        error={backfill.isSupported ? null : VJ_PREVIEW_UNSUPPORTED_FAILURE}
      />
    </>
  );
}

function VjBackfillRunningBody({
  backfill,
  progress,
  announcement,
}: {
  backfill: VjPreviewBackfill;
  progress: VjBackfillProgress;
  announcement: string;
}) {
  const { t } = useTranslation();
  return (
    <VjBackfillHead
      // The live region below speaks this line; the visible copy stays quiet.
      title={<span aria-hidden="true">{announcement}</span>}
      actions={
        <Button
          variant="quiet"
          size="sm"
          className={styles.action}
          onClick={backfill.stop}
        >
          {t("vj:previews.stop")}
        </Button>
      }
    >
      {/* In the text column right under the title, so on a phone the bar
          stays with it while Stop wraps to its own row. */}
      <VjBackfillProgressBar progress={progress} />
      <p className={styles.hint}>{t("vj:previews.hint")}</p>
    </VjBackfillHead>
  );
}

/**
 * The end of a run, on the app's plum success panel: "Made N previews" with
 * the count in coral, what changed (or how many failed, with Make failed
 * previews again), and Close. A run that made none shows a coral alert mark.
 */
function VjBackfillFinishedBody({
  backfill,
  progress,
}: {
  backfill: VjPreviewBackfill;
  progress: VjBackfillProgress;
}) {
  const { t } = useTranslation();
  const hasFailed = progress.failedCount > 0;
  const hasMadeNone = progress.doneCount === 0;
  return (
    <SuccessPanel
      title={t("vj:previews.doneTitle")}
      em={t("vj:previews.doneTitleEm", { count: progress.doneCount })}
      iconTone={hasMadeNone ? "coral" : "jade"}
      icon={
        hasMadeNone ? (
          <FiAlertCircle
            size={26}
            color="var(--accent)"
            aria-hidden="true"
            fill="none"
            focusable="false"
          />
        ) : undefined
      }
      closeLabel={t("vj:previews.close")}
      onClose={backfill.clear}
      extraActions={
        hasFailed ? (
          <Button
            size="lg"
            aria-disabled={backfill.isSupported ? undefined : true}
            onClick={backfill.isSupported ? backfill.retryFailed : undefined}
          >
            {t("vj:previews.retryFailed")}
          </Button>
        ) : null
      }
    >
      {hasFailed
        ? t("vj:previews.summaryFailed", { count: progress.failedCount })
        : t("vj:previews.doneBody")}
    </SuccessPanel>
  );
}

/**
 * "Make previews": shown in the Clips view while clips lack an animated
 * preview or a run is open. Its body fades between three states (idle,
 * running, finished); under it, one row per clip of the run grows in and
 * folds away on its own. The whole panel folds away once nothing is missing
 * and the last run was closed.
 */
export function VjPreviewBackfillPanel({
  backfill,
  clipsById,
}: VjPreviewBackfillPanelProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { rows } = backfill.state;
  const hasRows = rows.length > 0;
  const isOpen = backfill.missingClipIds.length > 0 || hasRows;
  const view = viewOf(backfill);
  const progress = vjBackfillProgressOf(backfill.state);
  const announcement = useVjBackfillAnnouncement(view, progress);

  return (
    <Collapse isOpen={isOpen}>
      <section
        className={styles.panel}
        data-view={view}
        aria-label={t("vj:previews.rowsLabel")}
      >
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={view}
            className={styles.body}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reducedMotion ? 0 : VJ_BODY_FADE_DURATION,
              ease: VJ_BACKFILL_EASE,
            }}
          >
            {view === "idle" ? (
              <VjBackfillIdleBody backfill={backfill} />
            ) : null}
            {view === "running" ? (
              <VjBackfillRunningBody
                backfill={backfill}
                progress={progress}
                announcement={announcement}
              />
            ) : null}
            {view === "finished" ? (
              <VjBackfillFinishedBody backfill={backfill} progress={progress} />
            ) : null}
          </m.div>
        </AnimatePresence>
        <p role="status" className="visuallyHidden">
          {announcement}
        </p>
        <Collapse isOpen={hasRows}>
          <ul className={styles.list}>
            <AnimatePresence initial={false}>
              {rows.map((row) => (
                <CollapseListItem key={row.clipId}>
                  <VjPreviewBackfillRow
                    row={row}
                    clip={clipsById.get(row.clipId)}
                  />
                </CollapseListItem>
              ))}
            </AnimatePresence>
          </ul>
        </Collapse>
      </section>
    </Collapse>
  );
}
