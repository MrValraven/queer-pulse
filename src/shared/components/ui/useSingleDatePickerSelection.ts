/**
 * What each pick in `SingleDatePicker`'s calendar panel does: which picks
 * commit and close the panel, which commit and keep it open, and whether a
 * preset already covers the "Today" shortcut. Split out of `DatePicker.tsx`
 * to keep that component under the line budget.
 *
 * A hook by name so the host can hand it `close`, which reads the trigger
 * ref: the handlers it returns only touch that ref when a pick fires.
 */

import type { FieldMode } from "./DateField";
import type { DatePickerBaseProps } from "./DatePicker";
import { combineDatetimeValue } from "./datePickerValue";
import { formatIsoDate, formatIsoMonth, todayPlain } from "./plainDate";

interface SingleDatePickerSelectionOptions {
  mode: FieldMode;
  value: string | null;
  onChange: (value: string | null) => void;
  presets: DatePickerBaseProps["presets"];
  /** Closes the panel and returns focus to the trigger. */
  close: () => void;
}

export function useSingleDatePickerSelection({
  mode,
  value,
  onChange,
  presets,
  close,
}: SingleDatePickerSelectionOptions) {
  const handleSelectDay = (isoDate: string) => {
    if (mode === "date") {
      onChange(isoDate);
      close();
      return;
    }
    // datetime: keep whatever time was already there (or default midnight)
    // and stay open, so the day and the segmented time can both be set from
    // the same popover visit.
    onChange(combineDatetimeValue(isoDate, value));
  };

  const handleSelectMonth = (isoMonth: string) => {
    onChange(isoMonth);
    close();
  };

  // Reuses `handleSelectDay`/`handleSelectMonth` so it shares their close and
  // stay-open behavior: `date` and `month` close on pick, and `datetime`
  // stays open so the segmented time field is still reachable (mirrors
  // picking a day from the grid). `time` has no case: a bare time-of-day
  // value has no "today", and the button never renders for that mode (see
  // `DatePickerPopoverContent`).
  const handleToday = () => {
    if (mode === "month") {
      handleSelectMonth(formatIsoMonth(todayPlain()));
    } else if (mode === "date" || mode === "datetime") {
      handleSelectDay(formatIsoDate(todayPlain()));
    }
  };

  // Picking a row from the time list commits and closes, exactly as picking a
  // day from the calendar grid does. The popover used to hold a second copy of
  // the segmented field, which had no "picked" moment to close on; a list row
  // does, and leaving it open after a click would strand the popover over the
  // field the host is trying to read back.
  const handleSelectTime = (isoTime: string | null) => {
    onChange(isoTime);
    close();
  };

  const handlePresetSelect = (presetValue: string) => {
    onChange(presetValue);
    close();
  };

  // Suppress the Today footer button only when a preset's value actually
  // collides with today's ISO value for this mode. A `[tomorrow, nextWeek]`
  // preset list keeps Today. `mode="time"` has no today ISO shape;
  // `DatePickerPopoverContent` never shows Today for it regardless, so the
  // comparison there is moot.
  const todayIsoValue =
    mode === "month"
      ? formatIsoMonth(todayPlain())
      : formatIsoDate(todayPlain());
  const presetHasToday =
    presets?.some((preset) => preset.value === todayIsoValue) ?? false;

  return {
    handleSelectDay,
    handleSelectMonth,
    handleToday,
    handleSelectTime,
    handlePresetSelect,
    presetHasToday,
  };
}
