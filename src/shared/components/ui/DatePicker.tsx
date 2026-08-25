/**
 * The public single-value date/time picker: a `DateField` (the typeable half)
 * plus a trigger button that opens a mode-specific popover (the browse half —
 * `Calendar` for date/datetime, a month grid for month, a bare field for
 * time). Composes Tasks 3-5; see spec §6 for the full contract.
 *
 * This file implements the non-range modes (`date`/`datetime`/`time`/
 * `month`). `mode="range"` dispatches to `RangeDatePicker` (Task 7): a
 * `RangeCalendar` popover plus two `DateField`s (start/end) in the trigger
 * row, split into its own file to keep each component under the line budget.
 *
 * Task 8 adds the mobile bottom sheet, `presets`, and the "Today" shortcut:
 * below the `--mobile` breakpoint the same `DatePickerPopoverContent` renders
 * inside the shared `ModalSheet` primitive (portal + focus trap + scrim
 * already built there) instead of the desktop absolute `DatePickerPopover`.
 */

import { useId, useRef, useState } from "react";
import { FiCalendar, FiClock, FiX } from "react-icons/fi";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useOutsideDismiss } from "../../hooks/useOutsideDismiss";
import { useTranslation } from "../../i18n/useTranslation";
import { mediaMax } from "../../theme/breakpoints";
import { DateField, type FieldMode } from "./DateField";
import { DatePickerPopover } from "./DatePickerPopover";
import { DatePickerPopoverContent } from "./DatePickerPopoverContent";
import { ModalSheet } from "./Modal";
import { RangeDatePicker } from "./RangeDatePicker";
import { combineDatetimeValue } from "./datePickerValue";
import { formatIsoDate, formatIsoMonth, todayPlain } from "./plainDate";
import styles from "./Calendar.module.css";

export interface DateRange {
  start: string | null;
  end: string | null;
}

export interface DatePickerBaseProps {
  /**
   * Accessible name for the whole composite (the `role="group"` wrapping the
   * field + trigger). Prefer `labelledBy` pointing at a visible heading.
   * `FormField` injects `id`/`aria-describedby`/`aria-invalid`/`aria-required`
   * (see `formFieldControl` below) but NOT `label` — its own `<label>` has no
   * referenceable `id` to point `aria-labelledby` at (see `FormField.tsx`).
   * So `<FormField label="Event date"><DatePicker mode="date" .../></FormField>`
   * leaves this group unnamed unless the caller ALSO passes `label`/
   * `labelledBy` here. The trigger button is always named regardless (its
   * own `aria-label` is the localized "Choose date/time/month", set below),
   * and `FormField`'s injected `id` now lands on that same button (a
   * labelable element), so its `<label htmlFor>` at least focuses something
   * real even when this group-level name is skipped.
   */
  label?: string;
  labelledBy?: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  size?: "md" | "sm";
  className?: string;
  clearable?: boolean;
  /** Unused in this task (DateField's segments show their own per-segment
   *  placeholder tokens, not a single field-level placeholder). Kept typed
   *  as a seam for Task 8's mobile sheet / any future single-line preview. */
  placeholder?: string;
  min?: string;
  max?: string;
  /**
   * Disables matching dates in the calendar grid (`Calendar`/`RangeCalendar`).
   * The typeable `DateField` also consults this predicate, but only against
   * its current COMPLETE value: it marks the field invalid (`aria-invalid`
   * on the segments) rather than blocking the keystroke, matching React
   * Aria's own scope for this split. A user can still type a date this
   * predicate would reject and see it flagged invalid; pair with `min`/
   * `max` and/or downstream (submit-time) validation if a hard block matters.
   */
  isDateUnavailable?: (iso: string) => boolean;
  presets?: Array<{ labelKey: string; value: string }>;
  /**
   * Locale for month/weekday names and 12h/24h formatting. Not in the
   * original spec's prop list, but every composed primitive (`DateField`,
   * `Calendar`) takes one and defaults to the active app language — every
   * caller/test that wants a fixed locale needs the same override here.
   */
  locale?: string;
  // FormField injects these when DatePicker opts in via `formFieldControl`.
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
}

export type DatePickerProps =
  | (DatePickerBaseProps & {
      mode: FieldMode;
      value: string | null;
      onChange: (value: string | null) => void;
    })
  | (Omit<DatePickerBaseProps, "presets"> & {
      mode: "range";
      value: DateRange | null;
      onChange: (value: DateRange | null) => void;
    });

type SingleDatePickerProps = Extract<DatePickerProps, { value: string | null }>;

export function DatePicker(props: DatePickerProps) {
  if (props.mode === "range") {
    const { mode: _mode, ...rangeProps } = props;
    return <RangeDatePicker {...rangeProps} />;
  }
  return <SingleDatePicker {...props} />;
}

/** Opt into FormField's a11y wiring, mirroring `Select.formFieldControl`. */
DatePicker.formFieldControl = true;

function SingleDatePicker({
  mode,
  value,
  onChange,
  label,
  labelledBy,
  id,
  disabled = false,
  invalid = false,
  size = "md",
  className,
  clearable = false,
  min,
  max,
  isDateUnavailable,
  locale,
  presets,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-required": ariaRequired,
}: SingleDatePickerProps) {
  const { t, language } = useTranslation();
  const activeLocale = locale ?? language;
  const isMobile = useMediaQuery(mediaMax("mobile"));
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const baseId = useId();
  const popoverId = `${baseId}-popover`;

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  // The mobile `ModalSheet` branch below already owns its own outside-press
  // dismiss (its scrim `onClick`) plus focus trap: `ModalSheet` portals to
  // `document.body`, outside `containerRef`'s subtree, so leaving this active
  // on mobile would fire "outside" on every press inside the sheet (a
  // `pointerdown` there is never inside `containerRef`) and close it
  // instantly.
  useOutsideDismiss(open && !isMobile, containerRef, close);

  const chooseKey =
    mode === "time"
      ? "chooseTime"
      : mode === "month"
        ? "chooseMonth"
        : "chooseDate";
  const triggerLabel = t(`shared:calendar.${chooseKey}`);
  const TriggerIcon = mode === "time" ? FiClock : FiCalendar;

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

  // Reuses `handleSelectDay`/`handleSelectMonth` rather than duplicating
  // their close/stay-open behavior: `date` and `month` close on pick, and
  // `datetime` stays open so the segmented time field is still reachable
  // (mirrors picking a day from the grid). No case for `time` — there's no
  // "today" concept for a bare time-of-day value, and the button never
  // renders for that mode (see `DatePickerPopoverContent`).
  const handleToday = () => {
    if (mode === "month") {
      handleSelectMonth(formatIsoMonth(todayPlain()));
    } else if (mode === "date" || mode === "datetime") {
      handleSelectDay(formatIsoDate(todayPlain()));
    }
  };

  const handlePresetSelect = (presetValue: string) => {
    onChange(presetValue);
    close();
  };

  // Suppress the Today footer button only when a preset's value actually
  // collides with today's ISO value for this mode (not merely "presets were
  // passed" — a `[tomorrow, nextWeek]` preset list must not remove Today).
  // `mode="time"` has no today ISO shape; `DatePickerPopoverContent` never
  // shows Today for it regardless, so the comparison there is moot.
  const todayIsoValue =
    mode === "month"
      ? formatIsoMonth(todayPlain())
      : formatIsoDate(todayPlain());
  const presetHasToday =
    presets?.some((preset) => preset.value === todayIsoValue) ?? false;

  const canClear = clearable && value != null && !disabled;

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      className={[styles.container, size === "sm" && styles.sm, className]
        .filter(Boolean)
        .join(" ")}
    >
      <DateField
        mode={mode}
        value={value}
        onChange={onChange}
        locale={activeLocale}
        min={min}
        max={max}
        disabled={disabled}
        invalid={invalid}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-required={ariaRequired}
        size={size}
        isDateUnavailable={isDateUnavailable}
      />
      <button
        ref={triggerRef}
        // FormField's injected `id` lands here, not on DateField's `<div>`
        // (not a labelable element): a `<label htmlFor>` only ever
        // associates with a labelable/focusable control. `aria-label` below
        // still wins this button's own accessible name either way (ARIA
        // name computation: aria-label beats a native `<label for>`), so
        // moving `id` here only fixes the label's target, not this button's
        // own name.
        id={id}
        type="button"
        className={styles.trigger}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        aria-label={triggerLabel}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <TriggerIcon aria-hidden />
      </button>
      {canClear && (
        <button
          type="button"
          className={styles.clear}
          aria-label={t("shared:calendar.clear")}
          onClick={() => onChange(null)}
        >
          <FiX aria-hidden />
        </button>
      )}
      {open && isMobile && (
        <ModalSheet onClose={close} ariaLabel={triggerLabel}>
          <DatePickerPopoverContent
            mode={mode}
            value={value}
            locale={activeLocale}
            min={min}
            max={max}
            isDateUnavailable={isDateUnavailable}
            size={size}
            presets={presets}
            presetHasToday={presetHasToday}
            onSelectDay={handleSelectDay}
            onSelectMonth={handleSelectMonth}
            onTimeChange={onChange}
            onPresetSelect={handlePresetSelect}
            onToday={handleToday}
          />
        </ModalSheet>
      )}
      {open && !isMobile && (
        <DatePickerPopover
          id={popoverId}
          mode={mode}
          value={value}
          dialogLabel={triggerLabel}
          locale={activeLocale}
          min={min}
          max={max}
          isDateUnavailable={isDateUnavailable}
          size={size}
          presets={presets}
          presetHasToday={presetHasToday}
          onSelectDay={handleSelectDay}
          onSelectMonth={handleSelectMonth}
          onTimeChange={onChange}
          onPresetSelect={handlePresetSelect}
          onToday={handleToday}
          onClose={close}
        />
      )}
    </div>
  );
}
