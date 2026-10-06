import { FiClock, FiGlobe } from "react-icons/fi";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece } from "../data/desk.data";
import { pieceGoLiveState } from "./pieceGoLiveState";
import styles from "./PieceGoLiveStatus.module.css";

/** Day, short month and the hour with its minutes: a scheduled piece goes
 *  live at a set minute, and a bare "10" reads as a day in PT. */
const GOES_LIVE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
};

export interface PieceGoLiveStatusProps {
  piece: Pick<Piece, "publishedAt" | "stage">;
  /** Which edge a wrapped line keeps to: "end" in the table's action cell,
   *  which sits at the row's end. */
  align?: "start" | "end";
  /** Takes the surrounding meta line's size and colour (a calendar chip). */
  isCompact?: boolean;
}

/**
 * The non-interactive line a row's action slot (and a calendar chip's meta
 * line) shows for a piece with a publish date and no next action: "Goes live {date}" while scheduled, "Live since
 * {date}. Publish it to tell the writer." once the date has passed below
 * Published (PRD-437), with the clock and globe
 * marks the board card's locked stage line uses. Renders nothing otherwise.
 */
export function PieceGoLiveStatus({
  piece,
  align = "start",
  isCompact = false,
}: PieceGoLiveStatusProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const status = pieceGoLiveState(piece);
  if (!status) return null;
  const StatusIcon = status.kind === "scheduled" ? FiClock : FiGlobe;
  const text =
    status.kind === "scheduled"
      ? t("magazine:desk.board.goesLive", {
          date: format.date(status.publishesAt, GOES_LIVE_FORMAT),
        })
      : t("magazine:desk.goLive.liveSinceTellWriter", {
          date: format.date(status.liveSince, GOES_LIVE_FORMAT),
        });

  return (
    <span className={styles.status} data-align={align} data-compact={isCompact}>
      <StatusIcon aria-hidden="true" className={styles.icon} />
      {text}
    </span>
  );
}

export interface PieceLiveSinceNoteProps {
  /** The passed instant the piece went live at. */
  publishedAt: string;
  /** So the Publish button beside the note can name it as its description. */
  id?: string;
  align?: "start" | "end";
}

/**
 * PRD-437: the line a pipeline row shows above its Publish verb when a
 * piece's scheduled instant has passed and its stage is still short of
 * Published. Readers can already open it; the writer has not been told,
 * because no job advances the stage and only an editor's Publish rings the
 * writer's bell. So the line says both: when it went live, and what to do.
 *
 * Both forms render: the full sentence, and a one-line "Live since {date}"
 * that the compact desk density shows in its place
 * (`PieceGoLiveStatus.module.css`). The full sentence stays in the
 * accessibility tree in either density (only visually hidden in compact), so
 * the Publish button pointing at `id` is always described by all of it; the
 * short form is hidden from assistive tech, since it repeats the start.
 */
export function PieceLiveSinceNote({
  publishedAt,
  id,
  align = "start",
}: PieceLiveSinceNoteProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const date = format.date(new Date(publishedAt), GOES_LIVE_FORMAT);

  return (
    <span id={id} className={styles.status} data-align={align}>
      <FiGlobe aria-hidden="true" className={styles.icon} />
      <span className={styles.liveNoteFull}>
        {t("magazine:desk.goLive.liveSinceTellWriter", { date })}
      </span>
      <span className={styles.liveNoteShort} aria-hidden="true">
        {t("magazine:desk.goLive.liveSinceShort", { date })}
      </span>
    </span>
  );
}
