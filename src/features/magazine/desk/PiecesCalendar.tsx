import { useMemo } from "react";
import { PiecesCalendarAgenda } from "./PiecesCalendarAgenda";
import { PiecesCalendarDay } from "./PiecesCalendarDay";
import { PiecesCalendarLanes } from "./PiecesCalendarLanes";
import { PiecesCalendarLegend } from "./PiecesCalendarLegend";
import {
  agendaDays,
  buildCalendarWeeks,
  fromIsoDay,
  lastCalendarDay,
  type CalendarLayout,
} from "./piecesCalendarWeeks";
import type { PieceNextAction } from "./pieceNextAction";
import type { DeskTrack } from "./deskTrack";
import { mediaMax } from "../../../shared/theme/breakpoints";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Editor, Piece } from "../data/desk.data";
import { DESK_CALENDAR_DAY_FORMAT } from "../api/pieces.adapters";
import styles from "./PiecesCalendar.module.css";

/** Below 768px the grid gives way to the agenda list, the same phone cutoff
 *  the focus bar and the peek sheet use. */
const AGENDA_QUERY = mediaMax(767);

/** A stable empty directory, so the layout memo holds while none is given. */
const NO_EDITORS: Editor[] = [];

export interface PiecesCalendarProps {
  /** The visible pieces: the same filtered list the table would show. */
  pieces: Piece[];
  /** The day the calendar counts from, read once per desk render. */
  today: Date;
  /** ISO date of the issue close, when known. */
  closesOn: string | null;
  /** ISO publish date, when known. */
  publishesOn: string | null;
  /** The viewer's editor id: pieces waiting on them get the "your turn" edge. */
  me: string;
  /** The editor directory, so a piece waiting on a colleague names them the
   *  way the table's "Waiting on" does. */
  editors?: Editor[];
  track: DeskTrack;
  /** Opens the peek. */
  onOpen: (piece: Piece) => void;
  /** Runs a piece's next step; the phone agenda offers it beside each piece. */
  onNextAction?: (piece: Piece, action: PieceNextAction) => void;
}

/** The grid for wider screens: a semantic table with a caption, one row per
 *  week and one cell per day, each day headed by its full date. */
function CalendarGrid({
  layout,
  onOpen,
}: {
  layout: CalendarLayout;
  onOpen: (piece: Piece) => void;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const firstWeek = layout.weeks[0];
  const lastDay = lastCalendarDay(layout);
  if (!firstWeek || !lastDay) return null;
  const firstDay = firstWeek.days[0];

  return (
    <div className={styles.gridFrame}>
      <table className={styles.grid}>
        <caption className={styles.caption}>
          {t("magazine:desk.calendar.caption", {
            start: firstDay
              ? format.date(firstDay.date, DESK_CALENDAR_DAY_FORMAT)
              : "",
            end: format.date(lastDay.date, DESK_CALENDAR_DAY_FORMAT),
          })}
        </caption>
        <thead>
          <tr>
            {firstWeek.days.map((day) => (
              <th key={day.isoDate} scope="col" className={styles.weekday}>
                <span aria-hidden="true">
                  {format.date(day.date, { weekday: "short" })}
                </span>
                <span className="visuallyHidden">
                  {format.date(day.date, { weekday: "long" })}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {layout.weeks.map((week, weekIndex) => (
            <tr key={week.id}>
              {week.days.map((day, dayIndex) => (
                <PiecesCalendarDay
                  key={day.isoDate}
                  day={day}
                  shouldShowMonth={
                    (weekIndex === 0 && dayIndex === 0) ||
                    day.date.getDate() === 1
                  }
                  onOpen={onOpen}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The desk's calendar layout: the close-week collision view. Every visible
 * piece sits on its due day across the weeks from this Monday to the issue's
 * close, so a pile-up in the last days before the deadline shows at a glance.
 * Pieces with no day inside the grid wait in lanes above it. On a phone the
 * grid becomes an agenda of the days that have work due.
 */
export function PiecesCalendar({
  pieces,
  today,
  closesOn,
  publishesOn,
  me,
  editors = NO_EDITORS,
  track,
  onOpen,
  onNextAction,
}: PiecesCalendarProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const isAgenda = useMediaQuery(AGENDA_QUERY);
  const layout = useMemo(
    () => buildCalendarWeeks(pieces, today, closesOn, publishesOn, me, editors),
    [pieces, today, closesOn, publishesOn, me, editors],
  );

  return (
    <section
      className={styles.calendar}
      aria-label={t("magazine:desk.workbar.layout.calendar")}
    >
      {/* Visually hidden: names the layout for screen readers, giving the
          lane, day and agenda headings below (all `h3`) a step down of
          exactly one level from it, directly under the page's own `h1`. */}
      <h2 className="visuallyHidden">
        {t("magazine:desk.workbar.layout.calendar")}
      </h2>
      <div className={styles.calendarMeta}>
        <PiecesCalendarLegend />
        {/* Always shown when the issue has a publish date, even when that day
            falls past the last week the grid draws (`weekCount` only reads to
            the close date): the close date gets exactly this billing in the
            issue header, and a publish date past close never had anywhere
            else to surface on the calendar at all. */}
        {layout.publishesOn && (
          <span className={styles.publishBanner}>
            {t("magazine:desk.header.metaPublishesOnly", {
              publishes: format.date(
                fromIsoDay(layout.publishesOn),
                DESK_CALENDAR_DAY_FORMAT,
              ),
            })}
          </span>
        )}
      </div>
      <PiecesCalendarLanes layout={layout} onOpen={onOpen} />
      {isAgenda ? (
        <PiecesCalendarAgenda
          days={agendaDays(layout)}
          track={track}
          onOpen={onOpen}
          onNextAction={onNextAction}
        />
      ) : (
        <CalendarGrid layout={layout} onOpen={onOpen} />
      )}
    </section>
  );
}
