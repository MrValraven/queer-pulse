/**
 * The public single-value date/time picker: a `DateField` (the typeable half)
 * plus a trigger button that opens a mode-specific popover (the browse half:
 * `Calendar` for date/datetime, a month grid for month, a `TimeOptionsList`
 * of selectable times for time). Composes Tasks 3-5; see spec §6 for the full
 * contract.
 *
 * This file implements the non-range modes (`date`/`datetime`/`time`/
 * `month`). `mode="range"` dispatches to `RangeDatePicker` (Task 7): a
 * `RangeCalendar` popover plus two `DateField`s (start/end) in the trigger
 * row, split into its own file to keep each component under the line budget.
 *
 * Task 8 adds the mobile bottom sheet, `presets`, and the "Today" shortcut:
 * below the `--mobile` breakpoint the same `DatePickerPopoverContent` renders
 * inside the shared `ModalSheet` primitive (portal + focus trap + scrim
 * already built there). Wider screens get the desktop `DatePickerPopover`.
 */

import { useId, useRef, useState } from "react";
import { FiCalendar, FiClock } from "react-icons/fi";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useOutsideDismiss } from "../../hooks/useOutsideDismiss";
import { useTranslation } from "../../i18n/useTranslation";
import { mediaMax } from "../../theme/breakpoints";
import { DateField, type FieldMode } from "./DateField";
import { DatePickerPopover } from "./DatePickerPopover";
import { DatePickerPopoverContent } from "./DatePickerPopoverContent";
import { DatePickerTriggerButtons } from "./DatePickerTriggerButtons";
import { ModalSheet } from "./Modal";
import { RangeDatePicker } from "./RangeDatePicker";
import { useSingleDatePickerSelection } from "./useSingleDatePickerSelection";
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
   * (see `formFieldControl` below) and leaves `label` alone: its own `<label>`
   * has no referenceable `id` to point `aria-labelledby` at (see
   * `FormField.tsx`).
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
  /** Unused for now: DateField's segments each show their own placeholder
   *  token. Kept typed as a seam for Task 8's mobile sheet / any future
   *  single-line preview. */
  placeholder?: string;
  min?: string;
  max?: string;
  /**
   * Disables matching dates in the calendar grid (`Calendar`/`RangeCalendar`).
   * The typeable `DateField` also consults this predicate, but only against
   * its current COMPLETE value: it accepts the keystroke and marks the field
   * invalid (`aria-invalid` on the segments), matching React Aria's own
   * scope for this split. A user can still type a date this
   * predicate would reject and see it flagged invalid; pair with `min`/
   * `max` and/or downstream (submit-time) validation if a hard block matters.
   */
  isDateUnavailable?: (iso: string) => boolean;
  presets?: Array<{ labelKey: string; value: string }>;
  /**
   * `mode="time"` only: minutes between the rows the popover offers.
   * Defaults to `DEFAULT_TIME_STEP_MINUTES` (15).
   */
  timeStep?: number;
  /**
   * `mode="time"` only: a start time (`"HH:mm"`) each row is measured
   * against, so the list reads "9:00 PM +2h". Pass the START field's value on
   * an END field; leave unset for a plain list. Spans wrap past midnight, so
   * an end before the start reads as a real, positive length (see
   * `durationMinutes`).
   */
  relativeTo?: string | null;
  /**
   * Locale for month/weekday names and 12h/24h formatting. Added beyond the
   * original spec's prop list: every composed primitive (`DateField`,
   * `Calendar`) takes one and defaults to the active app language, so a
   * caller or test that wants a fixed locale sets the same override here.
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
  timeStep,
  relativeTo,
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
  // Held here in the host: `DatePickerPopover`'s panel is portalled to
  // `document.body`, so the outside-press dismiss below needs its own handle
  // on it to tell a press inside the calendar from a press on the page.
  const popoverRef = useRef<HTMLDivElement>(null);
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
  useOutsideDismiss(open && !isMobile, containerRef, close, {
    additionalInsideRef: popoverRef,
  });

  const chooseKey =
    mode === "time"
      ? "chooseTime"
      : mode === "month"
        ? "chooseMonth"
        : "chooseDate";
  const triggerLabel = t(`shared:calendar.${chooseKey}`);
  const {
    handleSelectDay,
    handleSelectMonth,
    handleToday,
    handleSelectTime,
    handlePresetSelect,
    presetHasToday,
  } = useSingleDatePickerSelection({ mode, value, onChange, presets, close });

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
      <DatePickerTriggerButtons
        triggerRef={triggerRef}
        id={id}
        disabled={disabled}
        isOpen={open}
        popoverId={popoverId}
        triggerLabel={triggerLabel}
        icon={mode === "time" ? FiClock : FiCalendar}
        onToggle={() => setOpen((wasOpen) => !wasOpen)}
        canClear={canClear}
        onClear={() => onChange(null)}
      />
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
            timeStep={timeStep}
            relativeTo={relativeTo}
            onSelectDay={handleSelectDay}
            onSelectMonth={handleSelectMonth}
            onTimeChange={handleSelectTime}
            onPresetSelect={handlePresetSelect}
            onToday={handleToday}
          />
        </ModalSheet>
      )}
      {open && !isMobile && (
        <DatePickerPopover
          id={popoverId}
          anchorRef={containerRef}
          popoverRef={popoverRef}
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
          timeStep={timeStep}
          relativeTo={relativeTo}
          onSelectDay={handleSelectDay}
          onSelectMonth={handleSelectMonth}
          onTimeChange={handleSelectTime}
          onPresetSelect={handlePresetSelect}
          onToday={handleToday}
          onClose={close}
        />
      )}
    </div>
  );
}
