/**
 * One day cell of the shared Calendar grid: `<td role="gridcell">` wrapping a
 * roving-tabindex `<button>`. Disabled days stay in the DOM (never removed)
 * so the grid's shape never shifts under keyboard navigation.
 */

import { useTranslation } from "../../i18n/useTranslation";
import { formatIsoDate, type PlainDate } from "./plainDate";
import styles from "./Calendar.module.css";

export interface CalendarCellProps {
  date: PlainDate;
  locale: string;
  isSelected: boolean;
  isDisabled: boolean;
  isToday: boolean;
  isOutsideMonth: boolean;
  isFocused: boolean;
  onActivate: (date: PlainDate) => void;
  cellRef: (iso: string, element: HTMLButtonElement | null) => void;
}

/** Builds the rich accessible name: a full localized date plus a state suffix
 *  ("Thursday, March 5, 2026, selected"). */
function buildRichLabel(
  date: PlainDate,
  locale: string,
  states: { isToday: boolean; isSelected: boolean; isDisabled: boolean },
  translateState: (key: "today" | "selected" | "unavailable") => string,
): string {
  const jsDate = new Date(date.year, date.month - 1, date.day);
  const fullDate = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(jsDate);
  const suffixes: string[] = [];
  if (states.isToday) suffixes.push(translateState("today"));
  if (states.isSelected) suffixes.push(translateState("selected"));
  if (states.isDisabled) suffixes.push(translateState("unavailable"));
  return suffixes.length > 0 ? `${fullDate}, ${suffixes.join(", ")}` : fullDate;
}

export function CalendarCell({
  date,
  locale,
  isSelected,
  isDisabled,
  isToday,
  isOutsideMonth,
  isFocused,
  onActivate,
  cellRef,
}: CalendarCellProps) {
  const { t } = useTranslation();
  const iso = formatIsoDate(date);
  const richLabel = buildRichLabel(
    date,
    locale,
    { isToday, isSelected, isDisabled },
    (key) => t(`shared:calendar.state.${key}`),
  );

  return (
    <td
      role="gridcell"
      aria-selected={isSelected}
      aria-disabled={isDisabled}
      className={styles.cell}
    >
      <button
        ref={(element) => cellRef(iso, element)}
        type="button"
        tabIndex={isFocused ? 0 : -1}
        aria-current={isToday ? "date" : undefined}
        aria-label={richLabel}
        disabled={isDisabled}
        className={[
          styles.dayButton,
          isSelected && styles.selected,
          isToday && styles.today,
          isOutsideMonth && styles.outside,
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => onActivate(date)}
      >
        {date.day}
      </button>
    </td>
  );
}
