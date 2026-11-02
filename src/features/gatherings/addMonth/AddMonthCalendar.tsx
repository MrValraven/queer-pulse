import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { buildWeekdayLabels } from "../../../shared/components/ui/calendarWeekday";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { cx } from "../../../shared/lib/cx";
import { EVENT_BATCH_MAX_ROWS } from "./addMonth.data";
import {
  dateAfterCalendarKey,
  dateLabelLocale,
  formatMonthCaption,
  formatRowDateLong,
  isDateSelectable,
  monthCells,
  monthOf,
  rovingStartDate,
  shiftMonth,
  weekStartFor,
} from "./addMonthDates";
import styles from "./AddMonthCalendar.module.css";

export interface AddMonthCalendarProps {
  /** Picked dates as `YYYY-MM-DD`, in any order. */
  selectedDates: string[];
  /** Today in the template's zone, the first pickable date. */
  today: string;
  /** The last pickable date (today plus twelve calendar months). */
  lastDate: string;
  /** The month on screen as `YYYY-MM`. */
  visibleMonth: string;
  onVisibleMonthChange: (month: string) => void;
  onToggle: (date: string) => void;
  /** The id of the visible heading that names the calendar. */
  labelledBy: string;
}

/** How one day joins the grid's single Tab stop and its arrow keys. */
interface DayRoving {
  isTabStop: boolean;
  register: (date: string, element: HTMLButtonElement | null) => void;
  onFocus: (date: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, date: string) => void;
}

/** One day as a toggle. A disabled day stays focusable through
 *  `aria-disabled`, so the arrow keys reach it and its description reads the
 *  line that says why: the pickable window, or the cap on dates per batch. */
function DayButton({
  date,
  label,
  isToday,
  isPicked,
  isOutsideWindow,
  isAtCap,
  windowHintId,
  capId,
  onToggle,
  roving,
}: {
  date: string;
  label: string;
  isToday: boolean;
  isPicked: boolean;
  isOutsideWindow: boolean;
  isAtCap: boolean;
  windowHintId: string;
  capId: string;
  onToggle: (date: string) => void;
  roving: DayRoving;
}) {
  const isBlockedByCap = !isOutsideWindow && isAtCap && !isPicked;
  const isBlocked = isOutsideWindow || isBlockedByCap;
  const describedBy = isOutsideWindow
    ? windowHintId
    : isBlockedByCap
      ? capId
      : undefined;
  return (
    <button
      ref={(element) => roving.register(date, element)}
      type="button"
      tabIndex={roving.isTabStop ? 0 : -1}
      className={cx(styles.day, isToday && styles.today)}
      aria-pressed={isPicked}
      aria-label={label}
      aria-describedby={describedBy}
      aria-disabled={isBlocked || undefined}
      onClick={() => {
        if (!isBlocked) onToggle(date);
      }}
      onFocus={() => roving.onFocus(date)}
      onKeyDown={(event) => roving.onKeyDown(event, date)}
    >
      {Number(date.slice(8, 10))}
    </button>
  );
}

/**
 * Roving focus for the day grid: one Tab stop (the focused day, else a picked
 * day, else today, else the first pickable day), arrows step a day or a week,
 * Home and End reach the week's edges, PageUp and PageDown change the month.
 * Space and Enter toggle through the button's own click.
 */
function useRovingDay({
  visibleMonth,
  pickedDates,
  today,
  lastDate,
  weekStart,
  onVisibleMonthChange,
}: {
  visibleMonth: string;
  pickedDates: ReadonlySet<string>;
  today: string;
  lastDate: string;
  weekStart: number;
  onVisibleMonthChange: (month: string) => void;
}) {
  const [focusedDate, setFocusedDate] = useState<string | null>(null);
  const dayElements = useRef(new Map<string, HTMLButtonElement>());
  const shouldMoveFocusRef = useRef(false);
  const tabStopDate =
    focusedDate !== null && monthOf(focusedDate) === visibleMonth
      ? focusedDate
      : rovingStartDate(visibleMonth, pickedDates, { today, lastDate });

  // A key press moves real focus once the target day has rendered, which
  // may take a month change in the parent first.
  useEffect(() => {
    if (!shouldMoveFocusRef.current || focusedDate === null) return;
    const element = dayElements.current.get(focusedDate);
    if (!element) return;
    shouldMoveFocusRef.current = false;
    element.focus();
  }, [focusedDate, visibleMonth]);

  const register = (date: string, element: HTMLButtonElement | null) => {
    if (element) dayElements.current.set(date, element);
    else dayElements.current.delete(date);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, date: string) => {
    const target = dateAfterCalendarKey(date, event.key, weekStart);
    if (target === null) return;
    event.preventDefault();
    const targetMonth = monthOf(target);
    const isShownMonth =
      targetMonth >= monthOf(today) && targetMonth <= monthOf(lastDate);
    if (target === date || !isShownMonth) return;
    if (targetMonth !== visibleMonth) onVisibleMonthChange(targetMonth);
    shouldMoveFocusRef.current = true;
    setFocusedDate(target);
  };

  return (date: string): DayRoving => ({
    isTabStop: date === tabStopDate,
    register,
    onFocus: setFocusedDate,
    onKeyDown,
  });
}

/**
 * A month grid where every day is a toggle button behind one Tab stop. Picks
 * live in the parent, so moving between months keeps them. Days before today
 * and after the last allowed date are disabled, and so is every unpicked day
 * once the month holds the most dates one batch can create.
 */
export function AddMonthCalendar({
  selectedDates,
  today,
  lastDate,
  visibleMonth,
  onVisibleMonthChange,
  onToggle,
  labelledBy,
}: AddMonthCalendarProps) {
  const { t, language } = useTranslation();
  const captionId = useId();
  const windowHintId = useId();
  const capId = useId();
  const weekStart = weekStartFor(language);
  const weekdayLabels = useMemo(
    () => buildWeekdayLabels(dateLabelLocale(language), weekStart),
    [language, weekStart],
  );
  const cells = useMemo(
    () => monthCells(visibleMonth, weekStart),
    [visibleMonth, weekStart],
  );
  const pickedDates = useMemo(() => new Set(selectedDates), [selectedDates]);
  const rovingFor = useRovingDay({
    visibleMonth,
    pickedDates,
    today,
    lastDate,
    weekStart,
    onVisibleMonthChange,
  });
  const isAtCap = selectedDates.length >= EVENT_BATCH_MAX_ROWS;
  const isFirstMonth = visibleMonth <= monthOf(today);
  const isLastMonth = visibleMonth >= monthOf(lastDate);

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <IconButton
          aria-label={t("gatherings:addMonth.calendar.previousMonth")}
          disabled={isFirstMonth}
          onClick={() => onVisibleMonthChange(shiftMonth(visibleMonth, -1))}
        >
          <FiChevronLeft aria-hidden />
        </IconButton>
        <h3 id={captionId} className={styles.caption} aria-live="polite">
          {formatMonthCaption(visibleMonth, language)}
        </h3>
        <IconButton
          aria-label={t("gatherings:addMonth.calendar.nextMonth")}
          disabled={isLastMonth}
          onClick={() => onVisibleMonthChange(shiftMonth(visibleMonth, 1))}
        >
          <FiChevronRight aria-hidden />
        </IconButton>
      </div>
      <div
        role="group"
        aria-labelledby={`${labelledBy} ${captionId}`}
        className={styles.grid}
      >
        {weekdayLabels.map((label) => (
          <span key={label.dayOfWeek} className={styles.weekday} aria-hidden>
            {label.short}
          </span>
        ))}
        {cells.map((date, index) =>
          date === null ? (
            <span key={`blank-${index}`} aria-hidden />
          ) : (
            <DayButton
              key={date}
              date={date}
              label={formatRowDateLong(date, language)}
              isToday={date === today}
              isPicked={pickedDates.has(date)}
              isOutsideWindow={!isDateSelectable(date, { today, lastDate })}
              isAtCap={isAtCap}
              windowHintId={windowHintId}
              capId={capId}
              onToggle={onToggle}
              roving={rovingFor(date)}
            />
          ),
        )}
      </div>
      <p id={windowHintId} className="visuallyHidden">
        {t("gatherings:addMonth.calendar.windowHint", {
          lastDate: formatRowDateLong(lastDate, language),
        })}
      </p>
      <p className={styles.count}>
        {t("gatherings:addMonth.calendar.count", {
          count: selectedDates.length,
        })}
      </p>
      <div aria-live="polite">
        <Collapse isOpen={isAtCap}>
          <p id={capId} className={styles.cap}>
            {t("gatherings:addMonth.calendar.cap", {
              limit: EVENT_BATCH_MAX_ROWS,
            })}
          </p>
        </Collapse>
      </div>
    </div>
  );
}
