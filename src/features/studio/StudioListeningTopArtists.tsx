import { AnimatePresence, m, useIsPresent } from "motion/react";
import { useId } from "react";
import { Link } from "react-router-dom";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { MeasuredHeightFrame } from "../../shared/components/layout/MeasuredHeightFrame";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioListeningSummaryView } from "./api/studioListening.adapters";
import { ROW_LAYOUT_TRANSITION } from "./kit/studioTrackRow.types";
import { STUDIO_EXIT, STUDIO_FADE, studioStaggerDelay } from "./studioMotion";
import styles from "./StudioListeningSummary.module.css";

type TopArtist = StudioListeningSummaryView["topArtists"][number];

/** One ranked artist. The name is the row's only interactive element and
 *  stretches over the whole row. It moves as a Top tracks row does: fades
 *  in and out, and a row that stays slides to its new rank. Reduced motion
 *  swaps at once. */
function StudioListeningTopArtistRow({
  row,
  index,
}: {
  row: TopArtist;
  index: number;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const { artist, listens } = row;
  return (
    <m.li
      className={styles.row}
      inert={!isPresent}
      layout={reducedMotion ? false : "position"}
      initial={{ opacity: 0, ...(reducedMotion ? {} : { y: 6 }) }}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        opacity: 0,
        transition: reducedMotion ? { duration: 0 } : STUDIO_EXIT,
      }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : {
              ...STUDIO_FADE,
              delay: studioStaggerDelay(index),
              layout: ROW_LAYOUT_TRANSITION,
            }
      }
    >
      <div className={styles.rowInner}>
        <span className={styles.rank} aria-hidden="true">
          {index + 1}
        </span>
        <Avatar
          initials={artist.initials}
          tint="default"
          size={40}
          src={artist.avatarUrl ?? undefined}
          aria-hidden="true"
        />
        <div className={styles.text}>
          <Link to={artist.href} className={styles.name}>
            {artist.name}
          </Link>
          {/* The count shares the kind's line, as Top tracks carries it, so
              the name keeps the row's width at every size. */}
          <span className={styles.kind}>
            {t(artist.kindLabelKey)}
            <span className={styles.metaDot} aria-hidden="true">
              {"·"}
            </span>
            <span className={styles.count}>
              {t("studio:listening.listens", { count: listens })}
            </span>
          </span>
        </div>
      </div>
    </m.li>
  );
}

/** The listener's most played artists in the chosen range. Rows are keyed by
 *  artist, so a range change fades rows out and in, slides the ones that
 *  stay to their new rank, and the frame eases the list to its new height,
 *  as Top tracks does. */
export function StudioListeningTopArtists({
  artists,
  labelledBy,
}: {
  artists: TopArtist[];
  /** The id of a visible heading elsewhere on the page. When given, the list
   *  is named by it and renders no heading of its own. */
  labelledBy?: string;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  return (
    <div className={styles.listBlock}>
      {labelledBy === undefined && (
        <h2 id={headingId} className={styles.heading}>
          {t("studio:listening.topArtists.heading")}
        </h2>
      )}
      <MeasuredHeightFrame>
        <ol className={styles.list} aria-labelledby={labelledBy ?? headingId}>
          <AnimatePresence>
            {artists.map((row, index) => (
              <StudioListeningTopArtistRow
                key={row.artist.id}
                row={row}
                index={index}
              />
            ))}
          </AnimatePresence>
        </ol>
      </MeasuredHeightFrame>
    </div>
  );
}
