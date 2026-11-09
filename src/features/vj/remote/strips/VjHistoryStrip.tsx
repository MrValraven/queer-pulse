import type { JSX } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiCornerUpLeft } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { VJ_LIMITS, type VjClipDTO } from "../../../../shared/contracts/vj";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useVjHelpDescribedBy } from "../top/useVjHelpDescribedBy";
import styles from "./VjStrips.module.css";

/** The app's ease-out token (--ease-out) at its fast duration (--dur-fast). */
const VJ_HISTORY_TRANSITION = {
  duration: 0.15,
  ease: [0.16, 1, 0.3, 1] as const,
};
const VJ_HISTORY_INSTANT = { duration: 0 };

export interface VjHistoryStripProps {
  /** stage.latestState.recentClipIds: newest first, each id once. */
  recentClipIds: readonly string[];
  clipsById: ReadonlyMap<string, VjClipDTO>;
  isBlocked: boolean;
  /** The status line naming why the controls are blocked, for aria-describedby. */
  blockedReasonId?: string;
  /** Sends the second entry (the clip before the live one); the dispatcher owns the send. */
  onPrevious: () => void;
  onGoClip: (clipId: string) => void;
  /** The live clip when the caller knows it (null while a generator plays); by default the newest entry. */
  liveClipId?: string | null;
}

interface VjHistoryChipProps {
  clip: VjClipDTO;
  isLive: boolean;
  isBlocked: boolean;
  /** Set while blocked: the status line's id. */
  describedBy: string | undefined;
  transition: typeof VJ_HISTORY_TRANSITION | typeof VJ_HISTORY_INSTANT;
  onGoClip: (clipId: string) => void;
}

function VjHistoryChip({
  clip,
  isLive,
  isBlocked,
  describedBy,
  transition,
  onGoClip,
}: VjHistoryChipProps): JSX.Element {
  const { t } = useTranslation();
  const helpDescribedBy = useVjHelpDescribedBy();
  return (
    <m.button
      type="button"
      layout="position"
      className={`${styles.chip} ${styles.thumbChip}`}
      data-vj-recent-chip={clip.id}
      data-live={isLive ? "true" : undefined}
      aria-current={isLive ? "true" : undefined}
      aria-disabled={isBlocked || undefined}
      aria-describedby={helpDescribedBy("recentClip", describedBy)}
      aria-label={t("vj:strip.recentAria", { title: clip.title })}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={transition}
      onClick={() => {
        if (isBlocked) return;
        onGoClip(clip.id);
      }}
    >
      <span className={styles.thumbFace}>
        <img
          src={clip.thumbnailUrl}
          alt=""
          width={36}
          height={36}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
        {isLive ? <span className={styles.liveDot} aria-hidden="true" /> : null}
      </span>
    </m.button>
  );
}

/**
 * The history strip: Previous first (back to the clip before the live one),
 * then the clips that went live, newest first, up to VJ_LIMITS.recentClipsMax
 * thumbnails. The live one carries a coral ring and a dot. A new clip slides
 * in at the front and its neighbours move along.
 */
export function VjHistoryStrip({
  recentClipIds,
  clipsById,
  isBlocked,
  blockedReasonId,
  onPrevious,
  onGoClip,
  liveClipId,
}: VjHistoryStripProps): JSX.Element {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const helpDescribedBy = useVjHelpDescribedBy();
  const transition = reducedMotion ? VJ_HISTORY_INSTANT : VJ_HISTORY_TRANSITION;
  const shownLiveClipId =
    liveClipId !== undefined ? liveClipId : (recentClipIds[0] ?? null);
  const recentClips = recentClipIds
    .slice(0, VJ_LIMITS.recentClipsMax)
    .flatMap((clipId) => {
      const clip = clipsById.get(clipId);
      return clip === undefined ? [] : [clip];
    });
  const previousClip =
    recentClipIds.length >= 2
      ? (clipsById.get(recentClipIds[1] ?? "") ?? null)
      : null;
  const isPreviousBlocked = isBlocked || recentClipIds.length < 2;
  const blockedDescription = isBlocked ? blockedReasonId : undefined;

  return (
    <div
      className={styles.scroller}
      role="group"
      aria-label={t("vj:strip.recent")}
      data-vj-history-strip=""
    >
      <button
        type="button"
        className={styles.chip}
        data-vj-previous=""
        aria-disabled={isPreviousBlocked || undefined}
        aria-describedby={helpDescribedBy("previousClip", blockedDescription)}
        aria-label={
          previousClip !== null
            ? t("vj:strip.previousAria", { title: previousClip.title })
            : undefined
        }
        onClick={() => {
          if (isPreviousBlocked) return;
          onPrevious();
        }}
      >
        <span className={styles.chipFace}>
          <FiCornerUpLeft aria-hidden="true" focusable="false" fill="none" />
          <span className={styles.chipName}>{t("vj:strip.previous")}</span>
        </span>
      </button>
      <span className={styles.divider} aria-hidden="true" />
      <AnimatePresence initial={false}>
        {recentClips.map((clip) => (
          <VjHistoryChip
            key={clip.id}
            clip={clip}
            isLive={clip.id === shownLiveClipId}
            isBlocked={isBlocked}
            describedBy={blockedDescription}
            transition={transition}
            onGoClip={onGoClip}
          />
        ))}
        {recentClips.length === 0 ? (
          <m.span
            key="empty"
            layout="position"
            className={styles.empty}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
          >
            {t("vj:strip.noRecent")}
          </m.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
