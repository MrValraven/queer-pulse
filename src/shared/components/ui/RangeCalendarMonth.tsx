/**
 * One month of `RangeCalendar`'s two-month grid: the same `CalendarHeader` +
 * `role="grid"` table + keyboard model as the single-month `Calendar`, plus
 * per-cell range classes and an `onPointerEnter` hook for the hover preview.
 * Not `CalendarCell` itself — that component has no range states or pointer
 * handler — but keeps the same markup shape (`<td role="gridcell">` wrapping
 * a roving-tabindex `<button>`) and reuses `Calendar.module.css`'s cell
 * tokens. Rendered twice by `RangeCalendar` (left/right month), each instance
 * its own independent APG grid widget.
 */

import { useEffect, useRef } from "react";
import { useTranslation } from "../../i18n/useTranslation";
import { formatIsoDate, type PlainDate } from "./plainDate";
import type { CalendarState } from "./useCalendarState";
import { classifyRangeCell, rangeLabelSuffix } from "./rangeCalendarState";
import { CalendarHeader } from "./CalendarHeader";
import { handleCalendarKeyDown } from "./handleCalendarKeyDown";
import type { WeekdayLabel } from "./calendarWeekday";
import styles from "./Calendar.module.css";

export interface RangeCalendarMonthProps {
  state: CalendarState;
  locale: string;
  weekdayLabels: WeekdayLabel[];
  captionId: string;
  labelledBy?: string;
  start: PlainDate | null;
  end: PlainDate | null;
  anchor: PlainDate | null;
  hovered: PlainDate | null;
  onActivate: (date: PlainDate) => void;
  onHover: (date: PlainDate | null) => void;
  className?: string;
}

export function RangeCalendarMonth({
  state,
  locale,
  weekdayLabels,
  captionId,
  labelledBy,
  start,
  end,
  anchor,
  hovered,
  onActivate,
  onHover,
  className,
}: RangeCalendarMonthProps) {
  const { t } = useTranslation();
  const gridLabelledBy = [labelledBy, captionId].filter(Boolean).join(" ") || undefined;
  const cellElements = useRef(new Map<string, HTMLButtonElement>());
  const hasMountedRef = useRef(false);
  // Set by the header's month/year dropdown handlers right before calling
  // `focusDate`, so the roving-tabindex effect below skips its `.focus()`
  // call exactly once: a dropdown pick should leave DOM focus on the Select
  // trigger (APG combobox close behavior) rather than yank it into the grid.
  // Mirrors `Calendar.tsx`'s identical guard.
  const suppressCellFocusRef = useRef(false);

  const registerCellRef = (iso: string, element: HTMLButtonElement | null) => {
    if (element) cellElements.current.set(iso, element);
    else cellElements.current.delete(iso);
  };

  // Roving-tabindex focus follow: after the day that owns DOM focus changes
  // (keyboard nav, header nav, or a click), move real focus to its button.
  // Never on first mount (this internal piece has no `autoFocusDate` seam —
  // a range popover opening shouldn't grab focus before the user interacts),
  // mirroring `Calendar.tsx`'s default (`autoFocusDate = false`).
  useEffect(() => {
    if (suppressCellFocusRef.current) {
      suppressCellFocusRef.current = false;
      return;
    }
    const isInitialMount = !hasMountedRef.current;
    hasMountedRef.current = true;
    if (isInitialMount) return;
    const element = cellElements.current.get(formatIsoDate(state.focusedDate));
    element?.focus?.();
  }, [state.focusedDate]);

  const handleSelectMonth = (month: number) => {
    suppressCellFocusRef.current = true;
    state.focusDate({ ...state.visibleMonth, month, day: 1 });
  };
  const handleSelectYear = (year: number) => {
    suppressCellFocusRef.current = true;
    state.focusDate({ ...state.visibleMonth, year, day: 1 });
  };

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(" ")}>
      <CalendarHeader
        visibleMonth={state.visibleMonth}
        locale={locale}
        captionId={captionId}
        onPrevMonth={() => state.moveFocus("month", -1)}
        onNextMonth={() => state.moveFocus("month", 1)}
        onPrevYear={() => state.moveFocus("year", -1)}
        onNextYear={() => state.moveFocus("year", 1)}
        onSelectMonth={handleSelectMonth}
        onSelectYear={handleSelectYear}
      />
      <table
        role="grid"
        aria-labelledby={gridLabelledBy}
        className={styles.grid}
        onKeyDown={(event) => handleCalendarKeyDown(event, state)}
        onPointerLeave={() => onHover(null)}
      >
        <thead>
          <tr>
            {weekdayLabels.map((weekday) => (
              <th key={weekday.dayOfWeek} scope="col" className={styles.weekdayHeader}>
                <abbr title={weekday.full}>{weekday.short}</abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {state.weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((date) => {
                const iso = formatIsoDate(date);
                const isDisabled = state.isDisabled(date);
                const isToday = state.isToday(date);
                const cellState = classifyRangeCell(date, start, end, anchor, hovered);
                const fullDate = new Intl.DateTimeFormat(locale, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(new Date(date.year, date.month - 1, date.day));
                const suffix = rangeLabelSuffix(
                  cellState,
                  (key) => t(`shared:calendar.state.${key}`),
                  (key) => t(`shared:calendar.${key}`),
                  isToday,
                  isDisabled,
                );
                const richLabel = suffix ? `${fullDate}, ${suffix}` : fullDate;
                return (
                  <td
                    key={iso}
                    role="gridcell"
                    aria-selected={cellState.isRangeStart || cellState.isRangeEnd}
                    aria-disabled={isDisabled}
                    className={styles.cell}
                  >
                    <button
                      ref={(element) => registerCellRef(iso, element)}
                      type="button"
                      tabIndex={iso === formatIsoDate(state.focusedDate) ? 0 : -1}
                      aria-current={isToday ? "date" : undefined}
                      aria-label={richLabel}
                      disabled={isDisabled}
                      className={[
                        styles.dayButton,
                        isToday && styles.today,
                        state.isOutsideMonth(date) && styles.outside,
                        cellState.isRangeStart && styles.rangeStart,
                        cellState.isRangeEnd && styles.rangeEnd,
                        cellState.isInRange && styles.inRange,
                        cellState.isPreviewRange && styles.previewRange,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => onActivate(date)}
                      onPointerEnter={() => {
                        if (!isDisabled) onHover(date);
                      }}
                    >
                      {date.day}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
