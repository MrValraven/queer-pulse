/**
 * `DatePicker`'s `mode="month"` popover content: a year pager plus 12
 * localized month buttons (`"yyyy-mm"` values). No `role="grid"` — a plain
 * button grid is APG-acceptable for a picker this small, and it keeps the
 * `mode="time"` "no grid" test guarantee unambiguous for every non-date mode.
 * Split out of `DatePickerPopover.tsx` to keep that component small.
 */

import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
import { formatIsoMonth, parseMonth, todayPlain } from "./plainDate";
import styles from "./Calendar.module.css";

export interface MonthGridPopoverProps {
  value: string | null;
  onSelect: (iso: string) => void;
  min?: string;
  max?: string;
  locale: string;
}

const MONTHS_IN_YEAR = 12;

function monthOutOfRange(
  year: number,
  month: number,
  min?: string,
  max?: string,
): boolean {
  const minMonth = min ? parseMonth(min) : null;
  const maxMonth = max ? parseMonth(max) : null;
  const ordinal = year * MONTHS_IN_YEAR + month;
  if (minMonth && ordinal < minMonth.year * MONTHS_IN_YEAR + minMonth.month)
    return true;
  if (maxMonth && ordinal > maxMonth.year * MONTHS_IN_YEAR + maxMonth.month)
    return true;
  return false;
}

export function MonthGridPopover({
  value,
  onSelect,
  min,
  max,
  locale,
}: MonthGridPopoverProps) {
  const { t } = useTranslation();
  const [displayYear, setDisplayYear] = useState(
    () => parseMonth(value ?? "")?.year ?? todayPlain().year,
  );
  const monthFormatter = new Intl.DateTimeFormat(locale, { month: "long" });

  return (
    <div className={styles.monthGrid}>
      <div className={styles.monthGridHeader}>
        <button
          type="button"
          className={styles.navButton}
          aria-label={t("shared:calendar.prevYear")}
          onClick={() => setDisplayYear((year) => year - 1)}
        >
          <FiChevronLeft aria-hidden />
        </button>
        <span className={styles.monthGridYear}>{displayYear}</span>
        <button
          type="button"
          className={styles.navButton}
          aria-label={t("shared:calendar.nextYear")}
          onClick={() => setDisplayYear((year) => year + 1)}
        >
          <FiChevronRight aria-hidden />
        </button>
      </div>
      <div className={styles.monthGridButtons}>
        {Array.from({ length: MONTHS_IN_YEAR }, (_unused, index) => {
          const month = index + 1;
          const iso = formatIsoMonth({ year: displayYear, month, day: 1 });
          const isSelected = value === iso;
          const isOutOfRange = monthOutOfRange(displayYear, month, min, max);
          return (
            <button
              key={month}
              type="button"
              disabled={isOutOfRange}
              aria-pressed={isSelected}
              className={[
                styles.monthGridButton,
                isSelected && styles.monthGridButtonSelected,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelect(iso)}
            >
              {monthFormatter.format(new Date(2000, index, 1))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
