import { useId } from "react";
import { Button } from "../../../shared/components/ui";
import { PiecesCalendarChip } from "./PiecesCalendarDay";
import { pieceNextAction, type PieceNextAction } from "./pieceNextAction";
import type { CalendarDay, CalendarEntry } from "./piecesCalendarWeeks";
import type { DeskTrack } from "./deskTrack";
import { cx } from "../../../shared/lib/cx";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece } from "../data/desk.data";
import styles from "./PiecesCalendar.module.css";

interface AgendaDayProps {
  day: CalendarDay;
  track: DeskTrack;
  onOpen: (piece: Piece) => void;
  onNextAction?: (piece: Piece, action: PieceNextAction) => void;
}

interface AgendaPieceRowProps {
  entry: CalendarEntry;
  track: DeskTrack;
  onOpen: (piece: Piece) => void;
  onNextAction?: (piece: Piece, action: PieceNextAction) => void;
}

/**
 * One piece in the phone agenda: the calendar chip plus, when there is one,
 * a next-action button. Its own component so `useId()` gives each entry a
 * fresh id to hang the chip's title and the button's `aria-describedby` on
 * (the action used to read as a bare "Edit" / "Chase"
 * with no piece name, the same gap `PieceRowNextAction.tsx` already closed
 * for the table).
 */
function AgendaPieceRow({
  entry,
  track,
  onOpen,
  onNextAction,
}: AgendaPieceRowProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const nextAction = onNextAction ? pieceNextAction(entry.piece, track) : null;

  return (
    <li className={styles.agendaPiece}>
      <PiecesCalendarChip entry={entry} onOpen={onOpen} titleId={titleId} />
      {nextAction && onNextAction && (
        <Button
          variant="ghost"
          size="sm"
          aria-describedby={titleId}
          onClick={() => onNextAction(entry.piece, nextAction)}
        >
          {t(nextAction.labelKey)}
        </Button>
      )}
    </li>
  );
}

function AgendaDay({ day, track, onOpen, onNextAction }: AgendaDayProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const fullDate = format.date(day.date, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <li
      className={cx(
        styles.agendaDay,
        day.isAfterClose && styles.dayAfterClose,
        day.isCloseDay && styles.agendaClose,
      )}
      data-date={day.isoDate}
    >
      <h3 className={styles.agendaHeading}>
        <span>{fullDate}</span>
        {day.isToday && (
          <span className={styles.todayMarker}>
            {t("magazine:desk.due.today")}
          </span>
        )}
        {day.isCloseDay && (
          <span className={styles.closeMarker}>
            {t("magazine:desk.calendar.closes")}
          </span>
        )}
        {day.isPublishDay && (
          <span className={styles.publishMarker}>
            {t("magazine:desk.calendar.publishes")}
          </span>
        )}
      </h3>
      {day.entries.length > 0 && (
        <ul className={styles.agendaPieces}>
          {day.entries.map((entry) => (
            <AgendaPieceRow
              key={entry.piece.id}
              entry={entry}
              track={track}
              onOpen={onOpen}
              onNextAction={onNextAction}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export interface PiecesCalendarAgendaProps {
  days: CalendarDay[];
  track: DeskTrack;
  onOpen: (piece: Piece) => void;
  onNextAction?: (piece: Piece, action: PieceNextAction) => void;
}

/**
 * The calendar on a phone: a seven-column grid does not fit, so the same
 * placement reads as a list of days, holding only the days that have work
 * due plus the close day. With the extra width each piece also offers its
 * next step.
 */
export function PiecesCalendarAgenda({
  days,
  track,
  onOpen,
  onNextAction,
}: PiecesCalendarAgendaProps) {
  const { t } = useTranslation();
  if (days.length === 0) {
    return (
      <p className={styles.agendaEmpty}>
        {t("magazine:desk.calendar.emptyWeeks")}
      </p>
    );
  }
  return (
    <ol className={styles.agenda}>
      {days.map((day) => (
        <AgendaDay
          key={day.isoDate}
          day={day}
          track={track}
          onOpen={onOpen}
          onNextAction={onNextAction}
        />
      ))}
    </ol>
  );
}
