import { m } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioDashboardTrackView } from "./api/studioDashboard.adapters";
import { formatStudioCount } from "./studioCount";
import {
  STUDIO_ROW_BLOCK_EASE,
  STUDIO_ROW_BLOCK_FADE_STAGGER,
} from "./studioMotion";
import css from "./StudioNumbers.module.css";

const INSTANT_TRANSITION = { duration: 0 } as const;

/** Only the first 8 rows stagger their fade; the rest fade with the eighth. */
const FADE_STAGGER_ROW_LIMIT = 8;

/** Fades the text out on a quick ease, so it is gone before the fold has
 *  taken much of the row's height. */
const FADE_OUT_EASE = [0.2, 0, 0.4, 1] as const;

/** The cell motion every cell of every track row shares. Height runs on the
 *  block's clock with no delay, so all of a release's rows grow and fold
 *  together as one panel. The fade alone staggers, top row first, and it
 *  trails the open and leads the fold, so text is never seen squeezed. */
function trackCellMotion({
  index,
  blockDuration,
  isReducedMotion,
}: {
  index: number;
  blockDuration: number;
  isReducedMotion: boolean;
}) {
  if (isReducedMotion) {
    return {
      initial: { height: 0, opacity: 0 },
      animate: { height: "auto", opacity: 1, transition: INSTANT_TRANSITION },
      exit: { height: 0, opacity: 0, transition: INSTANT_TRANSITION },
    };
  }
  const height = { duration: blockDuration, ease: STUDIO_ROW_BLOCK_EASE };
  const fadeDelay =
    blockDuration * 0.2 +
    Math.min(index, FADE_STAGGER_ROW_LIMIT) * STUDIO_ROW_BLOCK_FADE_STAGGER;
  return {
    initial: { height: 0, opacity: 0 },
    animate: {
      height: "auto",
      opacity: 1,
      transition: {
        height,
        opacity: {
          duration: blockDuration * 0.6,
          ease: STUDIO_ROW_BLOCK_EASE,
          delay: fadeDelay,
        },
      },
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: {
        height,
        opacity: { duration: blockDuration * 0.45, ease: FADE_OUT_EASE },
      },
    },
  };
}

/** One track row inside its release's row group. Each cell holds a clip box
 *  that opens from zero height and a padded box inside it, so the measured
 *  height is the whole cell and a row never snaps at the start or end. Every
 *  row of the release grows on one clock (`blockDuration`) from one moment,
 *  so the rows grow and fold as one panel and the content below glides. The
 *  text fades in top row first just behind the open, and fades out ahead of
 *  the fold. Re-clicking mid-move reverses from where the rows are. The
 *  Plays cell shows only when the server sends plays. */
export function StudioNumbersTrackRow({
  trackRow,
  index,
  blockDuration,
  hasPlays,
  isPodcast,
}: {
  trackRow: StudioDashboardTrackView;
  index: number;
  /** Seconds the release's whole block of track rows takes to open or fold. */
  blockDuration: number;
  hasPlays: boolean;
  isPodcast: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const cellMotion = trackCellMotion({
    index,
    blockDuration,
    isReducedMotion: reducedMotion,
  });
  return (
    <m.tr className={css.trackRow}>
      <th scope="row" className={css.trackCell}>
        <m.div className={css.trackCellClip} {...cellMotion}>
          <div className={css.trackCellInner}>
            <span className={css.trackPosition}>{trackRow.track.position}</span>
            {trackRow.track.title}
          </div>
        </m.div>
      </th>
      {hasPlays && (
        <td className={`${css.trackCell} ${isPodcast ? css.notCounted : ""}`}>
          <m.div className={css.trackCellClip} {...cellMotion}>
            <div className={css.trackCellInner}>
              {isPodcast
                ? t("studio:numbers.plays.showsNotCounted")
                : formatStudioCount(trackRow.plays, t, fmt)}
            </div>
          </m.div>
        </td>
      )}
      <td className={css.trackCell}>
        <m.div className={css.trackCellClip} {...cellMotion}>
          <div className={css.trackCellInner}>
            {formatStudioCount(trackRow.saves, t, fmt)}
          </div>
        </m.div>
      </td>
      <td className={css.trackCell}>
        <m.div className={css.trackCellClip} {...cellMotion}>
          <div className={css.trackCellInner}>
            {formatStudioCount(trackRow.playlistInclusions, t, fmt)}
          </div>
        </m.div>
      </td>
    </m.tr>
  );
}
