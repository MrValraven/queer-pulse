/**
 * Two-month range picker: a left/right pair of `RangeCalendarMonth` grids
 * (each its own APG grid widget, reusing `CalendarHeader` + the keyboard
 * model), kept adjacent (right always = left + 1 month) as either side pages.
 * First click sets the range's `start` (and clears `end`); hovering a
 * candidate end paints a provisional `.previewRange`; second click commits
 * `end`, swapping so `start <= end`. Below the `--mobile` breakpoint only the
 * left month renders (see `Calendar.module.css` `.rangeSecondMonth`) — a
 * fuller mobile sheet is Task 8's seam.
 */

import { useId, useMemo, useState } from "react";
import { useTranslation } from "../../i18n/useTranslation";
import {
  addMonths,
  compareDate,
  firstDayOfWeek,
  formatIsoDate,
  formatIsoMonth,
  parseDate,
  todayPlain,
  type PlainDate,
} from "./plainDate";
import { useCalendarState } from "./useCalendarState";
import { buildWeekdayLabels } from "./calendarWeekday";
import { RangeCalendarMonth } from "./RangeCalendarMonth";
import type { DateRange } from "./DatePicker";
import styles from "./Calendar.module.css";

export interface RangeCalendarProps {
  value: DateRange | null;
  onChange: (value: DateRange) => void;
  min?: string;
  max?: string;
  isDateUnavailable?: (iso: string) => boolean;
  locale?: string;
  labelledBy?: string;
  size?: "md" | "sm";
  className?: string;
}

export function RangeCalendar({
  value,
  onChange,
  min,
  max,
  isDateUnavailable,
  locale,
  labelledBy,
  size = "md",
  className,
}: RangeCalendarProps) {
  const { language } = useTranslation();
  const activeLocale = locale ?? language;
  const weekStart = useMemo(() => firstDayOfWeek(activeLocale), [activeLocale]);
  const weekdayLabels = useMemo(
    () => buildWeekdayLabels(activeLocale, weekStart),
    [activeLocale, weekStart],
  );

  const minDate = useMemo(() => (min ? parseDate(min) : null), [min]);
  const maxDate = useMemo(() => (max ? parseDate(max) : null), [max]);
  const isUnavailable = useMemo(() => {
    if (!isDateUnavailable) return undefined;
    return (date: PlainDate) => isDateUnavailable(formatIsoDate(date));
  }, [isDateUnavailable]);

  const start = useMemo(
    () => (value?.start ? parseDate(value.start) : null),
    [value],
  );
  const end = useMemo(
    () => (value?.end ? parseDate(value.end) : null),
    [value],
  );

  // The first click of a new pair (uncommitted until the second click, which
  // reads this via closure and clears it). Kept separate from the controlled
  // `value` so an in-progress pick renders immediately even when the caller
  // doesn't feed the intermediate `{ start, end: null }` back as a new prop.
  const [anchorDate, setAnchorDate] = useState<PlainDate | null>(null);
  const [hoveredDate, setHoveredDate] = useState<PlainDate | null>(null);

  const handleRangeSelect = (date: PlainDate) => {
    if (anchorDate === null) {
      setAnchorDate(date);
      setHoveredDate(null);
      onChange({ start: formatIsoDate(date), end: null });
      return;
    }
    const [rangeStart, rangeEnd] =
      compareDate(anchorDate, date) <= 0
        ? [anchorDate, date]
        : [date, anchorDate];
    setAnchorDate(null);
    setHoveredDate(null);
    onChange({
      start: formatIsoDate(rangeStart),
      end: formatIsoDate(rangeEnd),
    });
  };

  const anchorSeed = start ?? todayPlain();
  const leftState = useCalendarState({
    value: anchorSeed,
    onSelect: handleRangeSelect,
    minDate,
    maxDate,
    isDateUnavailable: isUnavailable,
    weekStart,
  });
  const rightState = useCalendarState({
    value: addMonths(anchorSeed, 1),
    onSelect: handleRangeSelect,
    minDate,
    maxDate,
    isDateUnavailable: isUnavailable,
    weekStart,
  });

  // Keep the pair adjacent: whichever month's `visibleMonth` changed since
  // the last render (paging arrows, a month/year dropdown pick, or focus
  // crossing a month boundary) drives the other to follow it, always one
  // month apart. Adjusted during render (React's recommended pattern over a
  // setState-in-effect — same trick `DateField.tsx` uses to reseed its
  // working parts), not an effect, so the pair never paints a mismatched
  // frame first.
  const leftMonthKey = formatIsoMonth(leftState.visibleMonth);
  const rightMonthKey = formatIsoMonth(rightState.visibleMonth);
  const [lastLeftMonthKey, setLastLeftMonthKey] = useState(leftMonthKey);
  const [lastRightMonthKey, setLastRightMonthKey] = useState(rightMonthKey);
  if (leftMonthKey !== lastLeftMonthKey) {
    setLastLeftMonthKey(leftMonthKey);
    setLastRightMonthKey(formatIsoMonth(addMonths(leftState.visibleMonth, 1)));
    rightState.setVisibleMonth(addMonths(leftState.visibleMonth, 1));
  } else if (rightMonthKey !== lastRightMonthKey) {
    setLastRightMonthKey(rightMonthKey);
    setLastLeftMonthKey(formatIsoMonth(addMonths(rightState.visibleMonth, -1)));
    leftState.setVisibleMonth(addMonths(rightState.visibleMonth, -1));
  }

  const baseId = useId();

  return (
    <div
      className={[styles.rangeGrids, size === "sm" && styles.sm, className]
        .filter(Boolean)
        .join(" ")}
    >
      <RangeCalendarMonth
        state={leftState}
        locale={activeLocale}
        weekdayLabels={weekdayLabels}
        captionId={`${baseId}-left-caption`}
        labelledBy={labelledBy}
        start={start}
        end={end}
        anchor={anchorDate}
        hovered={hoveredDate}
        onActivate={(date) => {
          leftState.focusDate(date);
          leftState.select(date);
        }}
        onHover={setHoveredDate}
      />
      <RangeCalendarMonth
        state={rightState}
        locale={activeLocale}
        weekdayLabels={weekdayLabels}
        captionId={`${baseId}-right-caption`}
        labelledBy={labelledBy}
        start={start}
        end={end}
        anchor={anchorDate}
        hovered={hoveredDate}
        onActivate={(date) => {
          rightState.focusDate(date);
          rightState.select(date);
        }}
        onHover={setHoveredDate}
        className={styles.rangeSecondMonth}
      />
    </div>
  );
}
