import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { AnimatePresence } from "motion/react";
import { IconButton } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  StudioDashboardReleaseView,
  StudioDashboardStatsView,
} from "./api/studioDashboard.adapters";
import { formatStudioCount } from "./studioCount";
import { StudioNumbersTrackRow } from "./StudioNumbersTrackRow";
import css from "./StudioNumbers.module.css";

function ReleaseRows({
  row,
  isOpen,
  hasPlays,
  onToggle,
}: {
  row: StudioDashboardReleaseView;
  isOpen: boolean;
  hasPlays: boolean;
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
            {row.tracks.length > 0 ? (
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
            ) : (
              <span aria-hidden className={css.expandSpacer} />
            )}
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
        {hasPlays && (
          <td
            className={
              row.release.type === "podcast" ? css.notCounted : undefined
            }
          >
            {row.release.type === "podcast"
              ? t("studio:numbers.plays.showsNotCounted")
              : formatStudioCount(row.plays, t, fmt)}
          </td>
        )}
        <td>{formatStudioCount(row.saves, t, fmt)}</td>
        <td>{formatStudioCount(row.playlistInclusions, t, fmt)}</td>
      </tr>
      <AnimatePresence initial={false}>
        {isOpen &&
          row.tracks.map((trackRow, index) => (
            <StudioNumbersTrackRow
              key={trackRow.track.id}
              trackRow={trackRow}
              index={index}
              hasPlays={hasPlays}
              isPodcast={row.release.type === "podcast"}
            />
          ))}
      </AnimatePresence>
    </tbody>
  );
}

/** Releases (published first, then the rest) with Plays (when the server
 *  sends them), Saves and In public playlists; each opens to its tracks. */
export function StudioNumbersTable({
  stats,
  personaName,
}: {
  stats: StudioDashboardStatsView;
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
        {stats.hasPlays && <col className={css.colFigure} />}
        <col className={css.colFigure} />
        <col className={css.colFigure} />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">{t("studio:numbers.column.releaseOrTrack")}</th>
          {stats.hasPlays && (
            <th scope="col">{t("studio:numbers.column.plays")}</th>
          )}
          <th scope="col">{t("studio:numbers.column.saves")}</th>
          <th scope="col">{t("studio:numbers.column.inPublicPlaylists")}</th>
        </tr>
      </thead>
      {stats.releases.map((row) => (
        <ReleaseRows
          key={row.release.id}
          row={row}
          isOpen={openReleaseIds.has(row.release.id)}
          hasPlays={stats.hasPlays}
          onToggle={() => toggle(row.release.id)}
        />
      ))}
    </table>
  );
}
