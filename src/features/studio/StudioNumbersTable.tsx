import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { IconButton } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  StudioArtistStatsView,
  StudioStatsReleaseView,
  StudioStatsTrackView,
} from "./api/studio.adapters";
import { formatStudioCount } from "./studioCount";
import { STUDIO_EXIT, STUDIO_FADE } from "./studioMotion";
import css from "./StudioNumbers.module.css";

/** One track row inside its release's row group. It fades in and its cells
 *  open to their height, so a table row never snaps in or out. */
function TrackRow({ trackRow }: { trackRow: StudioStatsTrackView }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const cellMotion = {
    initial: { height: 0, opacity: 0 },
    animate: {
      height: "auto",
      opacity: 1,
      transition: reducedMotion ? { duration: 0 } : STUDIO_FADE,
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: reducedMotion ? { duration: 0 } : STUDIO_EXIT,
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

function ReleaseRows({
  row,
  isOpen,
  onToggle,
}: {
  row: StudioStatsReleaseView;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const tracksId = useId();
  return (
    <tbody className={css.group} id={tracksId}>
      <tr className={css.releaseRow}>
        <th scope="row" className={css.releaseCell}>
          <span className={css.releaseCellInner}>
            <IconButton
              className={css.expand}
              aria-expanded={isOpen}
              aria-controls={tracksId}
              aria-label={t(
                isOpen
                  ? "studio:numbers.hideTracks"
                  : "studio:numbers.showTracks",
                { title: row.release.title },
              )}
              onClick={onToggle}
            >
              <FiChevronRight aria-hidden className={css.chevron} />
            </IconButton>
            <Link to={row.release.href} className={css.releaseLink}>
              {row.release.title}
            </Link>
            {row.status !== "published" && (
              <span className={css.status}>{t(row.statusLabelKey)}</span>
            )}
            {row.reminders && (
              <span className={css.reminders}>
                {t("studio:numbers.reminders", {
                  value: formatStudioCount(row.reminders, t, fmt),
                })}
              </span>
            )}
          </span>
        </th>
        <td>{formatStudioCount(row.saves, t, fmt)}</td>
        <td>{formatStudioCount(row.playlistInclusions, t, fmt)}</td>
      </tr>
      <AnimatePresence initial={false}>
        {isOpen &&
          row.tracks.map((trackRow) => (
            <TrackRow key={trackRow.track.id} trackRow={trackRow} />
          ))}
      </AnimatePresence>
    </tbody>
  );
}

/** Releases (published first, then the rest) with Saves and In public
 *  playlists; each opens to its tracks. */
export function StudioNumbersTable({
  stats,
  personaName,
}: {
  stats: StudioArtistStatsView;
  personaName: string;
}) {
  const { t } = useTranslation();
  const [openReleaseIds, setOpenReleaseIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const toggle = (releaseId: string) =>
    setOpenReleaseIds((previous) => {
      const next = new Set(previous);
      if (next.has(releaseId)) next.delete(releaseId);
      else next.add(releaseId);
      return next;
    });
  return (
    <table className={css.table}>
      <caption className={css.caption}>
        {t("studio:numbers.tableCaption", { name: personaName })}
      </caption>
      <colgroup>
        <col className={css.colName} />
        <col className={css.colFigure} />
        <col className={css.colFigure} />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">{t("studio:numbers.column.releaseOrTrack")}</th>
          <th scope="col">{t("studio:numbers.column.saves")}</th>
          <th scope="col">{t("studio:numbers.column.inPublicPlaylists")}</th>
        </tr>
      </thead>
      {stats.releases.map((row) => (
        <ReleaseRows
          key={row.release.id}
          row={row}
          isOpen={openReleaseIds.has(row.release.id)}
          onToggle={() => toggle(row.release.id)}
        />
      ))}
    </table>
  );
}
