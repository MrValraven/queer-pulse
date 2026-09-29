import { useId, useState } from "react";
import { DeskToneDot } from "./DeskToneDot";
import { formattedCountValues } from "./deskHeaderCopy";
import { waitingOnLabel } from "./deskWaitingOn";
import type { CalendarDay, CalendarEntry } from "./piecesCalendarWeeks";
import { cx } from "../../../shared/lib/cx";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece } from "../data/desk.data";
import styles from "./PiecesCalendar.module.css";

/** A day shows this many chips before the rest fold behind "+N more". */
const VISIBLE_CHIPS_PER_DAY = 3;

export interface PiecesCalendarChipProps {
  entry: CalendarEntry;
  onOpen: (piece: Piece) => void;
  /** A short date printed on the chip, for the lanes that hold several days. */
  dateLabel?: string;
  /** Set on the chip itself, so a sibling control (the phone agenda's own
   *  next-action button, `PiecesCalendarAgenda.tsx`) can point its own
   *  `aria-describedby` at this piece's title instead of a bare "Edit" /
   *  "Chase" (the `PieceRowNextAction.tsx` pattern). */
  titleId?: string;
}

/**
 * One piece on the calendar: its title in the editorial serif on one line,
 * with a dot for who holds it. Work waiting on the viewer carries the "your
 * turn" edge and late work the late edge, which wins; work due after
 * the issue closes says so in words. The state the colour shows is spelled
 * out for screen readers too, in the table's own "Waiting on" words.
 */
export function PiecesCalendarChip({
  entry,
  onOpen,
  dateLabel,
  titleId,
}: PiecesCalendarChipProps) {
  const { t } = useTranslation();
  const spokenStatus = [
    entry.isLate ? t("magazine:desk.calendar.late") : null,
    entry.waitingOn
      ? entry.waitingOn.tone === "you"
        ? t("magazine:desk.pieceRow.waitingOnYouAria")
        : t("magazine:desk.pieceRow.waitingOnAria", {
            who: waitingOnLabel(entry.waitingOn, t),
          })
      : null,
  ].filter((part): part is string => part !== null);

  return (
    <button
      type="button"
      id={titleId}
      className={cx(
        styles.chip,
        entry.isYourTurn && styles.chipYourTurn,
        entry.isLate && styles.chipLate,
      )}
      data-late={entry.isLate}
      title={entry.piece.title}
      onClick={() => onOpen(entry.piece)}
    >
      <DeskToneDot tone={entry.waitTone} className={styles.chipDot} />
      <span className={styles.chipBody}>
        <span className={styles.chipTitle}>{entry.piece.title}</span>
        {(dateLabel || entry.isAfterClose) && (
          <span className={styles.chipMeta}>
            {dateLabel && <span>{dateLabel}</span>}
            {entry.isAfterClose && (
              <span className={styles.afterClose}>
                {t("magazine:desk.calendar.afterClose")}
              </span>
            )}
          </span>
        )}
      </span>
      {spokenStatus.length > 0 && (
        <span className="visuallyHidden">, {spokenStatus.join(", ")}</span>
      )}
    </button>
  );
}

export interface PiecesCalendarDayProps {
  day: CalendarDay;
  /** Print the month beside the day number (the first cell and each 1st). */
  shouldShowMonth: boolean;
  onOpen: (piece: Piece) => void;
}

/**
 * One day cell of the calendar grid. Its heading carries the full date for
 * screen readers, with the day number on show. Today is outlined, the close
 * day carries "Closes" and a strong rule on its trailing edge, the publish
 * day "Publishes", and days after the close are shaded. Past three pieces the
 * rest fold behind "+N more", which opens the day in place.
 */
export function PiecesCalendarDay({
  day,
  shouldShowMonth,
  onOpen,
}: PiecesCalendarDayProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const headingId = useId();
  const [isExpanded, setIsExpanded] = useState(false);
  const hiddenCount = Math.max(0, day.entries.length - VISIBLE_CHIPS_PER_DAY);
  const shownEntries = isExpanded
    ? day.entries
    : day.entries.slice(0, VISIBLE_CHIPS_PER_DAY);
  const dayLabel = format.date(
    day.date,
    shouldShowMonth ? { day: "numeric", month: "short" } : { day: "numeric" },
  );
  const fullDate = format.date(day.date, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <td
      className={cx(
        styles.day,
        day.isPast && styles.dayPast,
        day.isAfterClose && styles.dayAfterClose,
        day.isCloseDay && styles.dayClose,
        day.isToday && styles.dayToday,
      )}
      data-date={day.isoDate}
    >
      <h3 id={headingId} className={styles.dayHeading}>
        <span aria-hidden="true">{dayLabel}</span>
        <span className="visuallyHidden">
          {fullDate}
          {day.isToday && `, ${t("magazine:desk.due.today")}`}
        </span>
      </h3>
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
      {shownEntries.length > 0 && (
        <ul className={styles.chips}>
          {shownEntries.map((entry) => (
            <li key={entry.piece.id}>
              <PiecesCalendarChip entry={entry} onOpen={onOpen} />
            </li>
          ))}
        </ul>
      )}
      {hiddenCount > 0 && (
        <button
          type="button"
          className={styles.more}
          aria-expanded={isExpanded}
          aria-describedby={headingId}
          onClick={() => setIsExpanded((wasExpanded) => !wasExpanded)}
        >
          {isExpanded
            ? t("magazine:desk.calendar.fewer")
            : t(
                "magazine:desk.calendar.more",
                formattedCountValues(hiddenCount, format.number),
              )}
        </button>
      )}
    </td>
  );
}
