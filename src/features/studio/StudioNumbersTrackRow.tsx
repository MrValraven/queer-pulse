import { m } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioDashboardTrackView } from "./api/studioDashboard.adapters";
import { formatStudioCount } from "./studioCount";
import {
  STUDIO_DISCLOSURE,
  STUDIO_DISCLOSURE_EXIT,
  studioStaggerDelay,
} from "./studioMotion";
import css from "./StudioNumbers.module.css";

const INSTANT_TRANSITION = { duration: 0 } as const;

/** One track row inside its release's row group. Its cells open to their
 *  height, so a table row never snaps in or out. Text fades in just behind
 *  the open and fades out ahead of the fold, so no clipped text shows. The
 *  Plays cell shows only when the server sends plays. */
export function StudioNumbersTrackRow({
  trackRow,
  index,
  hasPlays,
  isPodcast,
}: {
  trackRow: StudioDashboardTrackView;
  index: number;
  hasPlays: boolean;
  isPodcast: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const staggerDelay = studioStaggerDelay(index);
  const cellMotion = {
    initial: { height: 0, opacity: 0 },
    animate: {
      height: "auto",
      opacity: 1,
      transition: reducedMotion
        ? { height: INSTANT_TRANSITION, opacity: INSTANT_TRANSITION }
        : {
            height: { ...STUDIO_DISCLOSURE, delay: staggerDelay },
            opacity: {
              duration: 0.3,
              ease: STUDIO_DISCLOSURE.ease,
              delay: staggerDelay + 0.06,
            },
          },
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: reducedMotion
        ? { height: INSTANT_TRANSITION, opacity: INSTANT_TRANSITION }
        : {
            height: STUDIO_DISCLOSURE_EXIT,
            opacity: { duration: 0.16, ease: STUDIO_DISCLOSURE_EXIT.ease },
          },
    },
  };
  return (
    <m.tr className={css.trackRow}>
      <th scope="row" className={css.trackCell}>
        <m.div className={css.trackCellInner} {...cellMotion}>
          <span className={css.trackPosition}>{trackRow.track.position}</span>
          {trackRow.track.title}
        </m.div>
      </th>
      {hasPlays && (
        <td className={`${css.trackCell} ${isPodcast ? css.notCounted : ""}`}>
          <m.div className={css.trackCellInner} {...cellMotion}>
            {isPodcast
              ? t("studio:numbers.plays.showsNotCounted")
              : formatStudioCount(trackRow.plays, t, fmt)}
          </m.div>
        </td>
      )}
      <td className={css.trackCell}>
        <m.div className={css.trackCellInner} {...cellMotion}>
          {formatStudioCount(trackRow.saves, t, fmt)}
        </m.div>
      </td>
      <td className={css.trackCell}>
        <m.div className={css.trackCellInner} {...cellMotion}>
          {formatStudioCount(trackRow.playlistInclusions, t, fmt)}
        </m.div>
      </td>
    </m.tr>
  );
}
