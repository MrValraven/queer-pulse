/**
 * Calendar's prev/next navigation + month/year dropdowns + live month/year
 * caption. The dropdowns (Task 4) cover far jumps (e.g. a birthdate decades
 * back) that paging one month/year at a time would make tedious; the paging
 * arrows stay for the common case of nearby dates.
 */

import { useMemo } from "react";
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
import type { PlainDate } from "./plainDate";
import { Select } from "./Select";
import { buildMonthOptions, buildYearOptions } from "./calendarHeaderOptions";
import styles from "./Calendar.module.css";

export interface CalendarHeaderProps {
  visibleMonth: PlainDate;
  locale: string;
  captionId: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onPrevYear: () => void;
  onNextYear: () => void;
  onSelectMonth: (month: number) => void;
  onSelectYear: (year: number) => void;
  minDate?: PlainDate | null;
  maxDate?: PlainDate | null;
}

export function CalendarHeader({
  visibleMonth,
  locale,
  captionId,
  onPrevMonth,
  onNextMonth,
  onPrevYear,
  onNextYear,
  onSelectMonth,
  onSelectYear,
  minDate,
  maxDate,
}: CalendarHeaderProps) {
  const { t } = useTranslation();
  const caption = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
    new Date(visibleMonth.year, visibleMonth.month - 1, 1),
  );
  const monthOptions = useMemo(() => buildMonthOptions(locale), [locale]);
  const yearOptions = useMemo(
    () => buildYearOptions(visibleMonth.year, minDate, maxDate),
    [visibleMonth.year, minDate, maxDate],
  );

  return (
    <div className={styles.header}>
      <div className={styles.navGroup}>
        <button
          type="button"
          className={styles.navButton}
          aria-label={t("shared:calendar.prevYear")}
          onClick={onPrevYear}
        >
          <FiChevronsLeft aria-hidden />
        </button>
        <button
          type="button"
          className={styles.navButton}
          aria-label={t("shared:calendar.prevMonth")}
          onClick={onPrevMonth}
        >
          <FiChevronLeft aria-hidden />
        </button>
      </div>
      {/* Visually hidden: the month/year Selects below now carry the visible
          caption text. Kept in the DOM (not removed) so it stays the grid's
          `aria-labelledby` target and its `aria-live` still announces jumps
          made via the paging arrows. */}
      <h2 id={captionId} className="visuallyHidden" aria-live="polite">
        {caption}
      </h2>
      <div className={styles.selectGroup}>
        <Select
          size="sm"
          className={styles.monthSelect}
          label={t("shared:calendar.monthLabel")}
          searchable={false}
          options={monthOptions}
          value={String(visibleMonth.month)}
          onChange={(chosen) => {
            if (chosen !== null) onSelectMonth(Number(chosen));
          }}
        />
        <Select
          size="sm"
          className={styles.yearSelect}
          label={t("shared:calendar.yearLabel")}
          options={yearOptions}
          value={String(visibleMonth.year)}
          onChange={(chosen) => {
            if (chosen !== null) onSelectYear(Number(chosen));
          }}
        />
      </div>
      <div className={styles.navGroup}>
        <button
          type="button"
          className={styles.navButton}
          aria-label={t("shared:calendar.nextMonth")}
          onClick={onNextMonth}
        >
          <FiChevronRight aria-hidden />
        </button>
        <button
          type="button"
          className={styles.navButton}
          aria-label={t("shared:calendar.nextYear")}
          onClick={onNextYear}
        >
          <FiChevronsRight aria-hidden />
        </button>
      </div>
    </div>
  );
}
