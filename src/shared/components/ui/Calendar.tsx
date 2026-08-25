/**
 * APG-compliant single-month calendar grid: `<table role="grid">` with a
 * roving-tabindex `<button>` per day, driven by the headless `useCalendarState`.
 * Consumed directly (inline calendar) or wrapped by a popover `DatePicker`
 * (later task). See spec §6 for the full a11y contract this implements.
 */

import { useEffect, useMemo, useRef, useId } from "react";
import { useTranslation } from "../../i18n/useTranslation";
import {
  firstDayOfWeek,
  formatIsoDate,
  parseDate,
  type PlainDate,
} from "./plainDate";
import { useCalendarState } from "./useCalendarState";
import { buildWeekdayLabels } from "./calendarWeekday";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarCell } from "./CalendarCell";
import { handleCalendarKeyDown } from "./handleCalendarKeyDown";
import styles from "./Calendar.module.css";

export interface CalendarProps {
  value: string | null;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  isDateUnavailable?: (iso: string) => boolean;
  locale?: string;
  labelledBy?: string;
  size?: "md" | "sm";
  className?: string;
  autoFocusDate?: boolean;
}

export function Calendar({
  value,
  onChange,
  min,
  max,
  isDateUnavailable,
  locale,
  labelledBy,
  size = "md",
  className,
  autoFocusDate = false,
}: CalendarProps) {
  const { language } = useTranslation();
  const activeLocale = locale ?? language;
  const baseId = useId();
  const captionId = `${baseId}-caption`;
  const gridLabelledBy =
    [labelledBy, captionId].filter(Boolean).join(" ") || undefined;
  const hasMountedRef = useRef(false);
  const cellElements = useRef(new Map<string, HTMLButtonElement>());
  // Set by the header's month/year dropdown handlers right before calling
  // `focusDate`, so the roving-tabindex effect below skips its `.focus()`
  // call exactly once: a dropdown pick should leave DOM focus on the Select
  // trigger (APG combobox close behavior) rather than yank it into the grid.
  const suppressCellFocusRef = useRef(false);

  const parsedValue = useMemo(() => parseDate(value ?? ""), [value]);
  const minDate = useMemo(() => (min ? parseDate(min) : null), [min]);
  const maxDate = useMemo(() => (max ? parseDate(max) : null), [max]);
  const weekStart = useMemo(() => firstDayOfWeek(activeLocale), [activeLocale]);
  const weekdayLabels = useMemo(
    () => buildWeekdayLabels(activeLocale, weekStart),
    [activeLocale, weekStart],
  );

  const isUnavailable = useMemo(() => {
    if (!isDateUnavailable) return undefined;
    return (date: PlainDate) => isDateUnavailable(formatIsoDate(date));
  }, [isDateUnavailable]);

  const state = useCalendarState({
    value: parsedValue,
    onSelect: (date) => onChange(formatIsoDate(date)),
    minDate,
    maxDate,
    isDateUnavailable: isUnavailable,
    weekStart,
  });

  // Roving-tabindex focus follow: after the day that owns DOM focus changes
  // (keyboard nav, header nav, or a click), move real focus to its button.
  // On first mount, only do this when `autoFocusDate` was requested: a plain
  // inline calendar must never steal page focus just by rendering.
  useEffect(() => {
    if (suppressCellFocusRef.current) {
      suppressCellFocusRef.current = false;
      return;
    }
    const isInitialMount = !hasMountedRef.current;
    hasMountedRef.current = true;
    if (isInitialMount && !autoFocusDate) return;
    const element = cellElements.current.get(formatIsoDate(state.focusedDate));
    element?.focus?.();
  }, [state.focusedDate, autoFocusDate]);

  const registerCellRef = (iso: string, element: HTMLButtonElement | null) => {
    if (element) cellElements.current.set(iso, element);
    else cellElements.current.delete(iso);
  };

  const handleActivate = (date: PlainDate) => {
    state.focusDate(date);
    state.select(date);
  };

  // Jumping via the header's month/year dropdown goes through `focusDate`
  // (not the bare `setVisibleMonth` setter) so the focused day moves with
  // it: otherwise the previously-focused date falls outside the newly
  // shown month and no grid cell keeps the roving tabindex, making the grid
  // unreachable by keyboard right after the jump (the same "header nav
  // moves focus into the grid" behaviour the paging arrows already have).
  // But unlike the paging arrows, a dropdown pick already returns DOM focus
  // to its own trigger (APG combobox close behavior) — flag the update so
  // the roving-tabindex effect above skips yanking focus into the grid and
  // Tab keeps flowing Month Select -> Year Select.
  const handleSelectMonth = (month: number) => {
    suppressCellFocusRef.current = true;
    state.focusDate({ ...state.visibleMonth, month, day: 1 });
  };
  const handleSelectYear = (year: number) => {
    suppressCellFocusRef.current = true;
    state.focusDate({ ...state.visibleMonth, year, day: 1 });
  };

  return (
    <div
      className={[styles.wrapper, size === "sm" && styles.sm, className]
        .filter(Boolean)
        .join(" ")}
    >
      <CalendarHeader
        visibleMonth={state.visibleMonth}
        locale={activeLocale}
        captionId={captionId}
        minDate={minDate}
        maxDate={maxDate}
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
      >
        <thead>
          <tr>
            {weekdayLabels.map((weekday) => (
              <th
                key={weekday.dayOfWeek}
                scope="col"
                className={styles.weekdayHeader}
              >
                <abbr title={weekday.full}>{weekday.short}</abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {state.weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((date) => (
                <CalendarCell
                  key={formatIsoDate(date)}
                  date={date}
                  locale={activeLocale}
                  isSelected={state.isSelected(date)}
                  isDisabled={state.isDisabled(date)}
                  isToday={state.isToday(date)}
                  isOutsideMonth={state.isOutsideMonth(date)}
                  isFocused={
                    formatIsoDate(date) === formatIsoDate(state.focusedDate)
                  }
                  onActivate={handleActivate}
                  cellRef={registerCellRef}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
