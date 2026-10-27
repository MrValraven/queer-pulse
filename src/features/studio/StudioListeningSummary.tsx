import { m } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioListeningSummary } from "./api/useStudioListening";
import type { StudioListeningRange } from "./api/studioListening.types";
import { StudioListeningRangePicker } from "./StudioListeningRangePicker";
import { StudioListeningTopArtists } from "./StudioListeningTopArtists";
import { StudioListeningTopTracks } from "./StudioListeningTopTracks";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioLine } from "./StudioSkeletons";
import { STUDIO_FADE } from "./studioMotion";
import styles from "./StudioListeningSummary.module.css";

const SKELETON_ROW_COUNT = 4;

function StudioListeningSummarySkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <div key={index} className={styles.skeletonRow}>
          <StudioLine width={40} height={40} />
          <div className={styles.skeletonText}>
            <StudioLine width="45%" height={14} />
            <StudioLine width="30%" height={12} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** The range picker, the totals and the two top lists. A range change keeps
 *  the lists on screen (marked busy) until the new ones land, then rows that
 *  leave or arrive animate and the block eases to its new height. While
 *  history is paused, an empty range says new plays stay out of it. */
export function StudioListeningSummary({
  range,
  onRangeChange,
  isHistoryPaused = false,
}: {
  range: StudioListeningRange;
  onRangeChange: (range: StudioListeningRange) => void;
  isHistoryPaused?: boolean;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { summary, loadState, isRefreshing } = useStudioListeningSummary(range);
  const isEmpty = summary !== null && summary.isEmpty;
  const emptyKey = isHistoryPaused
    ? "studio:listening.top.pausedEmpty"
    : "studio:listening.top.empty";
  // "0 listens · 0 days with music" says nothing the empty line does not.
  const hasTotals =
    summary !== null && (summary.totalListens > 0 || summary.listeningDays > 0);
  // Announced once the new range has landed. The old lists stay silent.
  const announcement =
    summary === null || isRefreshing
      ? ""
      : hasTotals
        ? `${t("studio:listening.listens", { count: summary.totalListens })}. ${t("studio:listening.days", { count: summary.listeningDays })}`
        : t(emptyKey);
  return (
    <section className={styles.summary} aria-busy={isRefreshing}>
      <StudioListeningRangePicker range={range} onChange={onRangeChange} />
      <p className={styles.visuallyHidden} role="status">
        {announcement}
      </p>
      {/* Each Collapse holds its own space above it (`afterPicker`), so a
          closed one adds no height while it folds or once it is gone. */}
      <Collapse isOpen={hasTotals}>
        <p className={`${styles.afterPicker} ${styles.totals}`}>
          <span className={styles.total}>
            {t("studio:listening.listens", {
              count: summary?.totalListens ?? 0,
            })}
          </span>
          <span className={styles.dot} aria-hidden="true">
            {"·"}
          </span>
          <span className={styles.total}>
            {t("studio:listening.days", { count: summary?.listeningDays ?? 0 })}
          </span>
        </p>
      </Collapse>
      <Collapse isOpen={summary === null && loadState.isLoading}>
        <div className={styles.afterPicker}>
          <StudioListeningSummarySkeleton />
        </div>
      </Collapse>
      <Collapse isOpen={summary === null && loadState.isError}>
        <div className={styles.afterPicker}>
          <StudioLoadError
            loadState={loadState}
            what="studio:errors.what.listening"
          />
        </div>
      </Collapse>
      <Collapse isOpen={isEmpty}>
        {/* Keyed on the line, so pausing or resuming mounts a new line that
            fades its words in (at once under reduced motion). */}
        <m.p
          key={emptyKey}
          className={`${styles.afterPicker} ${styles.empty}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reducedMotion ? { duration: 0 } : STUDIO_FADE}
        >
          {t(emptyKey)}
        </m.p>
      </Collapse>
      <Collapse isOpen={summary !== null && !summary.isEmpty}>
        <div className={`${styles.afterPicker} ${styles.lists}`}>
          <StudioListeningTopArtists artists={summary?.topArtists ?? []} />
          <StudioListeningTopTracks tracks={summary?.topTracks ?? []} />
        </div>
      </Collapse>
    </section>
  );
}
