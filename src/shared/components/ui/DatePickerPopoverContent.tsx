/**
 * Shared popover BODY for `DatePicker`'s non-range modes (Task 8): the
 * presets row (if any), the mode-specific content (`Calendar` for
 * date/datetime, `MonthGridPopover` for month, a bare `DateField` for time),
 * and a "Today" footer button. This is the one place that content is
 * rendered — `DatePickerPopover` (desktop, wrapped in a non-modal
 * `role="dialog"`) and `SingleDatePicker`'s mobile `ModalSheet` branch both
 * mount this same component, so the calendar/grid markup itself is never
 * forked between presentations.
 *
 * The "Today" button is suppressed ONLY when a caller-supplied preset's
 * `value` actually collides with today's ISO value for the current mode
 * (`presetHasToday`, computed by the caller — `SingleDatePicker` already has
 * `todayPlain`/`formatIsoDate`/`formatIsoMonth` in scope for `handleToday`).
 * `calendar.today` and a `calendar.preset.today` preset both render the
 * localized string "Today", so if a preset's value happens to BE today, both
 * buttons would carry the same accessible name — a real a11y ambiguity, not
 * just a query nuisance. A `presets` array that does NOT include today (e.g.
 * `[tomorrow, nextWeek]`) leaves the built-in Today shortcut in place.
 * `mode="time"` never shows Today either — there's no "today" concept for a
 * bare time-of-day value.
 */

import { useTranslation } from "../../i18n/useTranslation";
import { DateField, type FieldMode } from "./DateField";
import { Calendar } from "./Calendar";
import { MonthGridPopover } from "./MonthGridPopover";
import { DatePickerPresets, type DatePickerPreset } from "./DatePickerPresets";
import { datePartOf } from "./datePickerValue";
import styles from "./Calendar.module.css";

export interface DatePickerPopoverContentProps {
  mode: FieldMode;
  value: string | null;
  locale: string;
  min?: string;
  max?: string;
  isDateUnavailable?: (iso: string) => boolean;
  size?: "md" | "sm";
  presets?: DatePickerPreset[];
  /** Whether one of `presets`' values equals today's ISO value for `mode` —
   *  computed by the caller (see `SingleDatePicker`), not here, so this file
   *  stays free of date-math imports. Suppresses the Today footer button
   *  when true (see the file header comment for why). */
  presetHasToday?: boolean;
  onSelectDay: (iso: string) => void;
  onSelectMonth: (iso: string) => void;
  onTimeChange: (iso: string | null) => void;
  onPresetSelect: (value: string) => void;
  onToday: () => void;
}

export function DatePickerPopoverContent({
  mode,
  value,
  locale,
  min,
  max,
  isDateUnavailable,
  size,
  presets,
  presetHasToday = false,
  onSelectDay,
  onSelectMonth,
  onTimeChange,
  onPresetSelect,
  onToday,
}: DatePickerPopoverContentProps) {
  const { t } = useTranslation();
  const hasPresets = !!presets && presets.length > 0;
  const showToday = !presetHasToday && (mode === "date" || mode === "datetime" || mode === "month");

  return (
    <div className={styles.pickerBody}>
      {hasPresets && <DatePickerPresets presets={presets} onSelect={onPresetSelect} />}
      {(mode === "date" || mode === "datetime") && (
        <Calendar
          value={datePartOf(mode, value)}
          onChange={onSelectDay}
          min={min}
          max={max}
          isDateUnavailable={isDateUnavailable}
          locale={locale}
          size={size}
          autoFocusDate
        />
      )}
      {mode === "month" && (
        <MonthGridPopover value={value} onSelect={onSelectMonth} min={min} max={max} locale={locale} />
      )}
      {mode === "time" && (
        <DateField mode="time" value={value} onChange={onTimeChange} locale={locale} size={size} />
      )}
      {showToday && (
        <div className={styles.pickerFooter}>
          <button type="button" className={styles.todayButton} onClick={onToday}>
            {t("shared:calendar.today")}
          </button>
        </div>
      )}
    </div>
  );
}
