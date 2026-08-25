/**
 * Headless state hook for the shared Calendar/DatePicker primitive. Owns the
 * visible month, keyboard focus, and the 6x7 day grid, all built on the
 * DST-proof `PlainDate` model in `./plainDate` (never JS `Date` arithmetic).
 */

import { useCallback, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addYears,
  isSameDate,
  startOfWeek,
  todayPlain,
  type PlainDate,
} from "./plainDate";
import { isDateDisabled, resolveFocusTarget } from "./calendarFocusTarget";

const WEEKS_IN_GRID = 6;
const DAYS_IN_WEEK = 7;
const DAYS_IN_GRID = WEEKS_IN_GRID * DAYS_IN_WEEK;

export interface UseCalendarStateArgs {
  value: PlainDate | null;
  onSelect: (date: PlainDate) => void;
  minDate?: PlainDate | null;
  maxDate?: PlainDate | null;
  isDateUnavailable?: (date: PlainDate) => boolean;
  weekStart: number; // 0..6
}

export interface CalendarState {
  visibleMonth: PlainDate; // day=1 of the shown month
  focusedDate: PlainDate;
  weeks: PlainDate[][]; // 6 rows x 7 cols of the visible grid (incl. adjacent-month days)
  setVisibleMonth: (month: PlainDate) => void;
  focusDate: (date: PlainDate) => void; // moves focus AND pages visibleMonth if needed
  moveFocus: (unit: "day" | "week" | "month" | "year", amount: number) => void;
  focusWeekEdge: (edge: "start" | "end") => void;
  isSelected: (date: PlainDate) => boolean;
  isDisabled: (date: PlainDate) => boolean;
  isToday: (date: PlainDate) => boolean;
  isOutsideMonth: (date: PlainDate) => boolean;
  select: (date: PlainDate) => void; // no-op if disabled
}

function startOfMonth(month: PlainDate): PlainDate {
  return { year: month.year, month: month.month, day: 1 };
}

function isSameMonth(date: PlainDate, month: PlainDate): boolean {
  return date.year === month.year && date.month === month.month;
}

export function useCalendarState(args: UseCalendarStateArgs): CalendarState {
  const {
    value,
    onSelect,
    minDate = null,
    maxDate = null,
    isDateUnavailable,
    weekStart,
  } = args;

  const initialFocus = value ?? todayPlain();
  const [visibleMonth, setVisibleMonthState] = useState<PlainDate>(
    startOfMonth(initialFocus),
  );
  const [focusedDate, setFocusedDate] = useState<PlainDate>(initialFocus);

  const weeks = useMemo<PlainDate[][]>(() => {
    const gridStart = startOfWeek(startOfMonth(visibleMonth), weekStart);
    const days: PlainDate[] = [];
    for (let dayIndex = 0; dayIndex < DAYS_IN_GRID; dayIndex += 1) {
      days.push(addDays(gridStart, dayIndex));
    }
    const rows: PlainDate[][] = [];
    for (let weekIndex = 0; weekIndex < WEEKS_IN_GRID; weekIndex += 1) {
      rows.push(
        days.slice(
          weekIndex * DAYS_IN_WEEK,
          weekIndex * DAYS_IN_WEEK + DAYS_IN_WEEK,
        ),
      );
    }
    return rows;
  }, [visibleMonth, weekStart]);

  const setVisibleMonth = useCallback((month: PlainDate) => {
    setVisibleMonthState(startOfMonth(month));
  }, []);

  const focusDate = useCallback(
    (date: PlainDate) => {
      const resolvedDate = resolveFocusTarget(
        date,
        minDate,
        maxDate,
        isDateUnavailable,
      );
      setFocusedDate(resolvedDate);
      setVisibleMonthState((currentVisibleMonth) =>
        isSameMonth(resolvedDate, currentVisibleMonth)
          ? currentVisibleMonth
          : startOfMonth(resolvedDate),
      );
    },
    [minDate, maxDate, isDateUnavailable],
  );

  const moveFocus = useCallback(
    (unit: "day" | "week" | "month" | "year", amount: number) => {
      setFocusedDate((currentFocusedDate) => {
        const naturalNextFocusedDate =
          unit === "day"
            ? addDays(currentFocusedDate, amount)
            : unit === "week"
              ? addDays(currentFocusedDate, amount * DAYS_IN_WEEK)
              : unit === "month"
                ? addMonths(currentFocusedDate, amount)
                : addYears(currentFocusedDate, amount);
        const resolvedFocusedDate = resolveFocusTarget(
          naturalNextFocusedDate,
          minDate,
          maxDate,
          isDateUnavailable,
          amount >= 0,
        );
        setVisibleMonthState((currentVisibleMonth) =>
          isSameMonth(resolvedFocusedDate, currentVisibleMonth)
            ? currentVisibleMonth
            : startOfMonth(resolvedFocusedDate),
        );
        return resolvedFocusedDate;
      });
    },
    [minDate, maxDate, isDateUnavailable],
  );

  const focusWeekEdge = useCallback(
    (edge: "start" | "end") => {
      setFocusedDate((currentFocusedDate) => {
        const weekStartDate = startOfWeek(currentFocusedDate, weekStart);
        const naturalNextFocusedDate =
          edge === "start"
            ? weekStartDate
            : addDays(weekStartDate, DAYS_IN_WEEK - 1);
        const resolvedFocusedDate = resolveFocusTarget(
          naturalNextFocusedDate,
          minDate,
          maxDate,
          isDateUnavailable,
          edge === "start",
        );
        setVisibleMonthState((currentVisibleMonth) =>
          isSameMonth(resolvedFocusedDate, currentVisibleMonth)
            ? currentVisibleMonth
            : startOfMonth(resolvedFocusedDate),
        );
        return resolvedFocusedDate;
      });
    },
    [weekStart, minDate, maxDate, isDateUnavailable],
  );

  const isSelected = useCallback(
    (date: PlainDate) => isSameDate(date, value),
    [value],
  );

  const isDisabled = useCallback(
    (date: PlainDate) =>
      isDateDisabled(date, minDate, maxDate, isDateUnavailable),
    [minDate, maxDate, isDateUnavailable],
  );

  const isToday = useCallback(
    (date: PlainDate) => isSameDate(date, todayPlain()),
    [],
  );

  const isOutsideMonth = useCallback(
    (date: PlainDate) => !isSameMonth(date, visibleMonth),
    [visibleMonth],
  );

  const select = useCallback(
    (date: PlainDate) => {
      if (isDisabled(date)) return;
      onSelect(date);
    },
    [isDisabled, onSelect],
  );

  return {
    visibleMonth,
    focusedDate,
    weeks,
    setVisibleMonth,
    focusDate,
    moveFocus,
    focusWeekEdge,
    isSelected,
    isDisabled,
    isToday,
    isOutsideMonth,
    select,
  };
}
