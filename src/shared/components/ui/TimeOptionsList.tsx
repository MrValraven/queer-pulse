/**
 * The clickable time list inside `DatePicker`'s `mode="time"` popover.
 *
 * This replaces what that popover used to render: a second copy of the very
 * `DateField` already sitting in the trigger row. Clicking the clock icon
 * promised a picker and delivered a duplicate, so the only way to set a time
 * was still to focus each segment in turn and arrow or type digits through
 * hour, minute and AM/PM. The segmented field stays where it is for anyone
 * who prefers typing; this gives everyone else a row to click.
 *
 * Follows `SelectPanel`'s listbox contract rather than inventing a second
 * one: a focusable `role="listbox"` driving `aria-activedescendant`, with
 * `role="option"` buttons at `tabIndex={-1}` reached by pointer or by the
 * list's own key handler. Escape is left to the popover/sheet that owns
 * dismissal (`DatePickerPopover`, `ModalSheet`).
 *
 * `relativeTo` turns on the duration column: given the gathering's start
 * time, the end-time list reads "9:00 PM  +2h", "10:00 PM  +3h", which is the
 * question a host is actually answering. Spans wrap past midnight (see
 * `durationMinutes`), so a late gathering shows a real length instead of a
 * negative one.
 */

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useTranslation } from "../../i18n/useTranslation";
import {
  buildTimeOptions,
  createTimeLabelFormatter,
  durationMinutes,
  formatDuration,
  formatTimeValue,
  parseTimeValue,
} from "./timeOptions";
import styles from "./TimeOptionsList.module.css";

export const DEFAULT_TIME_STEP_MINUTES = 15;

/** Rows a PageUp/PageDown jumps, roughly one visible panel of the list. */
const PAGE_ROWS = 6;

export interface TimeOptionsListProps {
  /** The current `"HH:mm"` value, or `null` when the field is still empty. */
  value: string | null;
  onSelect: (value: string) => void;
  locale: string;
  /** Minutes between rows. */
  step?: number;
  /** Inclusive `"HH:mm"` bounds on the rows offered. */
  min?: string;
  max?: string;
  /**
   * A start time to measure each row against. When set, every row carries the
   * span from it ("+2h 30m"). Leave unset for a plain list.
   */
  relativeTo?: string | null;
  /** Accessible name for the listbox itself. */
  label: string;
}

export function TimeOptionsList({
  value,
  onSelect,
  locale,
  step = DEFAULT_TIME_STEP_MINUTES,
  min,
  max,
  relativeTo,
  label,
}: TimeOptionsListProps) {
  const { t } = useTranslation();
  const baseId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  // Both memoized against the ~96 rows a full day at the default step
  // produces: this list re-renders on every arrow key, and neither the rows
  // nor the formatter change when only the keyboard position moves.
  const options = useMemo(
    () => buildTimeOptions({ step, min, max, value }),
    [step, min, max, value],
  );
  const formatLabel = useMemo(() => createTimeLabelFormatter(locale), [locale]);
  const selectedMinutes = parseTimeValue(value);
  const relativeMinutes = parseTimeValue(relativeTo);

  // The row the keyboard is on. Seeded from the current value, falling back to
  // the row nearest it, then to the top of the list: opening a list that has
  // no active row would leave `aria-activedescendant` pointing at nothing and
  // the first arrow key jumping to midnight.
  const initialIndex = () => {
    if (selectedMinutes === null) return 0;
    const exact = options.indexOf(selectedMinutes);
    if (exact !== -1) return exact;
    const after = options.findIndex((minutes) => minutes >= selectedMinutes);
    return after === -1 ? Math.max(0, options.length - 1) : after;
  };
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const optionId = (index: number) => `${baseId}-time-${index}`;

  // Focus the list and centre the active row on open. `block: "center"` (not
  // "nearest") on this first pass so the selected time lands mid-panel with
  // the hours either side of it visible — a list scrolled so the selection
  // sits flush against an edge reads as though there is nothing beyond it.
  // Both calls are optional-chained: jsdom and older embedded webviews
  // implement neither, and a missing scroll must never break selection.
  useEffect(() => {
    listRef.current?.focus();
    document
      .getElementById(optionId(activeIndex))
      ?.scrollIntoView?.({ block: "center" });
    // Open-time only: later moves scroll themselves, below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveActive = (nextIndex: number) => {
    if (options.length === 0) return;
    const clamped = Math.min(Math.max(nextIndex, 0), options.length - 1);
    setActiveIndex(clamped);
    document
      .getElementById(optionId(clamped))
      ?.scrollIntoView?.({ block: "nearest" });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveActive(activeIndex + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveActive(activeIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        moveActive(0);
        break;
      case "End":
        event.preventDefault();
        moveActive(options.length - 1);
        break;
      case "PageDown":
        event.preventDefault();
        moveActive(activeIndex + PAGE_ROWS);
        break;
      case "PageUp":
        event.preventDefault();
        moveActive(activeIndex - PAGE_ROWS);
        break;
      case "Enter":
      case " ": {
        event.preventDefault();
        const target = options[activeIndex];
        if (target !== undefined) onSelect(formatTimeValue(target));
        break;
      }
      default:
        break;
    }
  };

  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label={label}
      aria-activedescendant={
        options.length > 0 ? optionId(activeIndex) : undefined
      }
      tabIndex={0}
      className={styles.list}
      onKeyDown={handleKeyDown}
    >
      {options.map((minutes, index) => {
        const isSelected = minutes === selectedMinutes;
        return (
          <button
            key={minutes}
            type="button"
            id={optionId(index)}
            role="option"
            tabIndex={-1}
            aria-selected={isSelected}
            data-active={index === activeIndex}
            className={[styles.option, isSelected && styles.optionSelected]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onSelect(formatTimeValue(minutes))}
            onMouseMove={() => setActiveIndex(index)}
          >
            <span className={styles.optionLabel}>{formatLabel(minutes)}</span>
            {/* The row that IS the start time is left bare: `durationMinutes`
                reads an equal end as a full wrap, and "+24h" beside the start
                time of a party is noise, never information. */}
            {relativeMinutes !== null && relativeMinutes !== minutes && (
              <span className={styles.optionDuration}>
                {t("shared:calendar.durationFromStart", {
                  duration: formatDuration(
                    durationMinutes(relativeMinutes, minutes),
                    t,
                  ),
                })}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
