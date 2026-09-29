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
 * line) shows for a piece with a publish date and no next action: "Goes live {date}" while scheduled, "Live on the
 * site" once the date has passed below Published, with the clock and globe
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
      : t("magazine:desk.board.liveOnSite");

  return (
    <span className={styles.status} data-align={align} data-compact={isCompact}>
      <StatusIcon aria-hidden="true" className={styles.icon} />
      {text}
    </span>
  );
}
