import { useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { Collapse } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  StudioArtistStatsView,
  StudioStatsReleaseView,
} from "./api/studio.adapters";
import { formatStudioCount } from "./studioCount";
import css from "./StudioNumbers.module.css";

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
  return (
    <tbody>
      <tr className={css.releaseRow}>
        <th scope="row" className={css.releaseCell}>
          <span className={css.releaseCellInner}>
            <button
              type="button"
              className={css.expand}
              aria-expanded={isOpen}
              aria-label={t(
                isOpen
                  ? "studio:numbers.hideTracks"
                  : "studio:numbers.showTracks",
                { title: row.release.title },
              )}
              onClick={onToggle}
            >
              <FiChevronRight aria-hidden className={css.chevron} />
            </button>
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
      <tr className={css.tracksRow}>
        <td colSpan={3}>
          <Collapse isOpen={isOpen}>
            <table className={css.trackTable} aria-label={row.release.title}>
              <thead className="visuallyHidden">
                <tr>
                  <th scope="col">{t("studio:numbers.column.release")}</th>
                  <th scope="col">{t("studio:numbers.column.saves")}</th>
                  <th scope="col">
                    {t("studio:numbers.column.inPublicPlaylists")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {row.tracks.map((trackRow) => (
                  <tr key={trackRow.track.id}>
                    <th scope="row">
                      <span className={css.trackPosition}>
                        {trackRow.track.position}
                      </span>
                      {trackRow.track.title}
                    </th>
                    <td>{formatStudioCount(trackRow.saves, t, fmt)}</td>
                    <td>
                      {formatStudioCount(trackRow.playlistInclusions, t, fmt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Collapse>
        </td>
      </tr>
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
      <thead>
        <tr>
          <th scope="col">{t("studio:numbers.column.release")}</th>
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
