import { useId } from "react";
import { PiecesCalendarChip } from "./PiecesCalendarDay";
import { formattedCountValues } from "./deskHeaderCopy";
import {
  fromIsoDay,
  lastCalendarDay,
  type CalendarEntry,
  type CalendarLayout,
} from "./piecesCalendarWeeks";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece } from "../data/desk.data";
import { DESK_CALENDAR_DAY_FORMAT } from "../api/pieces.adapters";
import styles from "./PiecesCalendar.module.css";

interface CalendarLaneProps {
  label: string;
  entries: CalendarEntry[];
  /** Print each piece's due day on its chip (lanes that span many days). */
  shouldShowDates: boolean;
  onOpen: (piece: Piece) => void;
}

function CalendarLane({
  label,
  entries,
  shouldShowDates,
  onOpen,
}: CalendarLaneProps) {
  const format = useFormat();
  const headingId = useId();
  return (
    <section className={styles.lane} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.laneHeading}>
        {label}
      </h3>
      <ul className={styles.laneChips}>
        {entries.map((entry) => (
          <li key={entry.piece.id}>
            <PiecesCalendarChip
              entry={entry}
              onOpen={onOpen}
              dateLabel={
                shouldShowDates && entry.dueDate
                  ? format.date(
                      fromIsoDay(entry.dueDate),
                      DESK_CALENDAR_DAY_FORMAT,
                    )
                  : undefined
              }
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export interface PiecesCalendarLanesProps {
  layout: CalendarLayout;
  onOpen: (piece: Piece) => void;
}

/**
 * The lanes above the calendar grid for pieces that have no day inside it:
 * no date yet, due before this week (late, unless already finished), and
 * due past the last week drawn. An empty lane is left out, so the grid starts right under
 * whatever still needs a place.
 */
export function PiecesCalendarLanes({
  layout,
  onOpen,
}: PiecesCalendarLanesProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const { undated, earlier, later } = layout;
  const lastDay = lastCalendarDay(layout);
  if (undated.length + earlier.length + later.length === 0) return null;

  return (
    <div className={styles.lanes}>
      {undated.length > 0 && (
        <CalendarLane
          label={t(
            "magazine:desk.calendar.undated",
            formattedCountValues(undated.length, format.number),
          )}
          entries={undated}
          shouldShowDates={false}
          onOpen={onOpen}
        />
      )}
      {earlier.length > 0 && (
        <CalendarLane
          label={t(
            "magazine:desk.calendar.earlier",
            formattedCountValues(earlier.length, format.number),
          )}
          entries={earlier}
          shouldShowDates
          onOpen={onOpen}
        />
      )}
      {later.length > 0 && lastDay && (
        <CalendarLane
          label={t("magazine:desk.calendar.later", {
            date: format.date(lastDay.date, DESK_CALENDAR_DAY_FORMAT),
            ...formattedCountValues(later.length, format.number),
          })}
          entries={later}
          shouldShowDates
          onOpen={onOpen}
        />
      )}
    </div>
  );
}
