import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { cx } from "../../../../shared/lib/cx";
import type { Piece } from "../../data/desk.data";
import type { DeskForecastReason } from "../deskForecast";
import styles from "./rail.module.css";

const REASON_KEY: Record<DeskForecastReason, string> = {
  late: "magazine:desk.rail.forecast.reasonLate",
  "due-after-close": "magazine:desk.rail.forecast.reasonDueAfterClose",
  "not-enough-time": "magazine:desk.rail.forecast.reasonNotEnoughTime",
};

export interface IssueForecastRowProps {
  piece: Piece;
  reason: DeskForecastReason;
  /** Opens the piece. Without it the row renders as text. */
  onOpenPiece?: (piece: Piece) => void;
}

/**
 * One at-risk piece in the forecast: its title and a short reason tag. The
 * tag keeps its whole label, since the reason is the news; the title gives
 * way and truncates, and hovering shows it whole.
 */
export function IssueForecastRow({
  piece,
  reason,
  onOpenPiece,
}: IssueForecastRowProps) {
  const { t } = useTranslation();
  const content = (
    <>
      <span className={styles.forecastTitle} title={piece.title}>
        {piece.title}
      </span>
      <span className={styles.forecastReason}>{t(REASON_KEY[reason])}</span>
    </>
  );

  if (!onOpenPiece) {
    return (
      <span
        className={cx(
          styles.rowButton,
          styles.forecastRow,
          styles.forecastRowStatic,
        )}
      >
        {content}
      </span>
    );
  }
  return (
    <button
      type="button"
      className={cx(styles.rowButton, styles.forecastRow)}
      onClick={() => onOpenPiece(piece)}
    >
      {content}
    </button>
  );
}
