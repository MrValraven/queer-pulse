import { useId, useState } from "react";
import { FiAlertTriangle, FiCheckCircle, FiChevronDown } from "react-icons/fi";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { DESK_CALENDAR_DAY_FORMAT } from "../../api/pieces.adapters";
import type { Piece } from "../../data/desk.data";
import { forecastIssue, type DeskForecastReason } from "../deskForecast";
import { formattedCountValues } from "../deskHeaderCopy";
import { IssueForecastRow } from "./IssueForecastRow";
import styles from "./rail.module.css";

export interface IssueForecastProps {
  /** The issue's pieces (the same scope Issue health already reads). */
  pieces: Piece[];
  /** The issue's close day, or `null`/unset while none has been picked. */
  closesOn?: string | null;
  today: Date;
  /** Opens a listed piece. Without it, the at-risk rows render as text: the
   *  forecast still reads, it just has nothing to click yet. */
  onOpenPiece?: (piece: Piece) => void;
  /** Shows every at-risk piece in the table (the `at-risk` focus chip). When
   *  given, the "N pieces may miss close" headline is the button for it. */
  onShowAtRisk?: () => void;
}

/** How many at-risk pieces the card lists before "+N more" takes over. */
const LISTED_AT_RISK_COUNT = 3;

/** Local midnight of an ISO calendar day, so `closesOn` prints as the day it
 *  names rather than the previous day west of Greenwich. */
function localMidnight(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00`);
}

/**
 * `forecastIssue` (`desk/deskForecast.ts`) always sets an entry for a piece
 * it puts in `atRisk`; this only guards the type, so a lookup miss reads as
 * the mildest reason instead of throwing mid-render.
 */
function reasonFor(
  piece: Piece,
  reasonByPieceId: Record<string, DeskForecastReason>,
): DeskForecastReason {
  return reasonByPieceId[piece.id] ?? "not-enough-time";
}

/**
 * Whether the issue is on track to close on time, read from the same pieces
 * Issue health already shows. The headline count is the door: it filters
 * the table to exactly the pieces it counted, through the `at-risk` focus
 * chip that shares the forecast's rule. Below it each at-risk piece is one
 * line, title and reason; past the first three, "+N more" unfolds the rest
 * in place, so the list answers "which ones?" without leaving the rail.
 * Nothing renders without a known close date: the desk header's countdown
 * already says that one is missing.
 */
export function IssueForecast({
  pieces,
  closesOn,
  today,
  onOpenPiece,
  onShowAtRisk,
}: IssueForecastProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const listId = useId();
  const [isShowingAll, setIsShowingAll] = useState(false);
  if (!closesOn) return null;

  const { atRisk, reasonByPieceId } = forecastIssue(pieces, closesOn, today);

  if (atRisk.length === 0) {
    return (
      <p className={styles.forecastAllClear}>
        <FiCheckCircle aria-hidden="true" />
        {t("magazine:desk.rail.forecast.onTrack", {
          date: format.date(localMidnight(closesOn), DESK_CALENDAR_DAY_FORMAT),
        })}
      </p>
    );
  }

  const countValues = formattedCountValues(atRisk.length, format.number);
  const headline = (
    <>
      <FiAlertTriangle aria-hidden="true" />
      {t("magazine:desk.rail.forecast.atRisk", countValues)}
    </>
  );
  const listedPieces = isShowingAll
    ? atRisk
    : atRisk.slice(0, LISTED_AT_RISK_COUNT);
  const moreCount = atRisk.length - LISTED_AT_RISK_COUNT;

  return (
    <div className={styles.forecast}>
      <p className={styles.forecastAtRisk}>
        {onShowAtRisk ? (
          <button
            type="button"
            className={styles.forecastAtRiskButton}
            aria-label={t(
              "magazine:desk.rail.forecast.showAtRisk",
              countValues,
            )}
            onClick={onShowAtRisk}
          >
            {headline}
          </button>
        ) : (
          headline
        )}
      </p>
      <ul
        id={listId}
        className={styles.rowList}
        aria-label={t("magazine:desk.rail.health.lateRisk")}
      >
        {listedPieces.map((piece) => (
          <li key={piece.id}>
            <IssueForecastRow
              piece={piece}
              reason={reasonFor(piece, reasonByPieceId)}
              onOpenPiece={onOpenPiece}
            />
          </li>
        ))}
      </ul>
      {moreCount > 0 ? (
        <button
          type="button"
          className={styles.textButton}
          aria-expanded={isShowingAll}
          aria-controls={listId}
          onClick={() => setIsShowingAll((wasShowingAll) => !wasShowingAll)}
        >
          <FiChevronDown aria-hidden="true" className={styles.disclosureIcon} />
          {isShowingAll
            ? t("magazine:desk.rail.forecast.fewer")
            : t(
                "magazine:desk.rail.forecast.more",
                formattedCountValues(moreCount, format.number),
              )}
        </button>
      ) : null}
    </div>
  );
}
