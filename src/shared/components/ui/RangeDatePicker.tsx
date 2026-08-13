/**
 * Range-mode counterpart to `SingleDatePicker` (in `DatePicker.tsx`): two
 * `DateField`s (start/end) in the trigger row plus a `RangeCalendar` popover,
 * instead of one field + a single-month `Calendar`. Split into its own file
 * to keep each component under the line budget. Wires up Task 7's runtime for
 * `DatePicker`'s `mode="range"`, previously a throwing stub.
 *
 * Task 8's mobile bottom sheet applies here too (same `RangeCalendar` content,
 * swapped into `ModalSheet` below `--mobile`). `presets` and the "Today"
 * button are deliberately NOT wired up for range: `presets`' `onChange(value:
 * string)` contract doesn't fit `onChange(value: DateRange)`, and
 * `RangeCalendar` has no "move focus to today" seam (it would need new
 * props threaded through `useCalendarState`) — both stay documented gaps
 * rather than a half-built affordance.
 */

import { useEffect, useId, useRef, useState } from "react";
import { FiCalendar, FiX } from "react-icons/fi";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useOutsideDismiss } from "../../hooks/useOutsideDismiss";
import { useTranslation } from "../../i18n/useTranslation";
import { mediaMax } from "../../theme/breakpoints";
import { DateField } from "./DateField";
import { ModalSheet } from "./Modal";
import { RangeCalendar } from "./RangeCalendar";
import type { DatePickerBaseProps, DateRange } from "./DatePicker";
import styles from "./Calendar.module.css";

export interface RangeDatePickerProps extends DatePickerBaseProps {
  value: DateRange | null;
  onChange: (value: DateRange | null) => void;
}

export function RangeDatePicker({
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
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-required": ariaRequired,
}: RangeDatePickerProps) {
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
  // Disabled on mobile: `ModalSheet` below portals to `document.body`, so a
  // press inside it is never "inside" `containerRef` and would otherwise
  // fire an immediate outside-dismiss on top of `ModalSheet`'s own scrim
  // click/drag/Escape handling (mirrors `SingleDatePicker`).
  useOutsideDismiss(open && !isMobile, containerRef, close);

  // Escape-to-close, matching `DatePickerPopover`'s non-modal dialog contract
  // (no focus trap, no `aria-modal`): closed via Escape, an outside press, or
  // (below) once both endpoints of the range are picked. `close` is read
  // through a ref (mirrors `DatePickerPopover`) so this effect subscribes
  // once per open/close, not on every render. Skipped on mobile: `ModalSheet`
  // already owns its own Escape handling there.
  const savedClose = useRef(close);
  useEffect(() => {
    savedClose.current = close;
  });
  useEffect(() => {
    if (!open || isMobile) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        savedClose.current();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, isMobile]);

  const triggerLabel = t("shared:calendar.chooseRange");
  const startLabel = t("shared:calendar.startDate");
  const endLabel = t("shared:calendar.endDate");
  const canClear = clearable && (value?.start != null || value?.end != null) && !disabled;

  const handleRangeChange = (next: DateRange) => {
    onChange(next);
    if (next.start && next.end) close();
  };

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      className={[styles.container, size === "sm" && styles.sm, className].filter(Boolean).join(" ")}
    >
      <div className={styles.rangeField} role="group" aria-label={startLabel}>
        <DateField
          mode="date"
          value={value?.start ?? null}
          onChange={(nextStart) => onChange({ start: nextStart, end: value?.end ?? null })}
          locale={activeLocale}
          min={min}
          max={max}
          disabled={disabled}
          invalid={invalid}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          aria-required={ariaRequired}
          size={size}
        />
      </div>
      <div className={styles.rangeField} role="group" aria-label={endLabel}>
        <DateField
          mode="date"
          value={value?.end ?? null}
          onChange={(nextEnd) => onChange({ start: value?.start ?? null, end: nextEnd })}
          locale={activeLocale}
          min={value?.start ?? min}
          max={max}
          disabled={disabled}
          invalid={invalid}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          aria-required={ariaRequired}
          size={size}
        />
      </div>
      <button
        ref={triggerRef}
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
        <FiCalendar aria-hidden />
      </button>
      {canClear && (
        <button
          type="button"
          className={styles.clear}
          aria-label={t("shared:calendar.clear")}
          onClick={() => onChange({ start: null, end: null })}
        >
          <FiX aria-hidden />
        </button>
      )}
      {open && isMobile && (
        <ModalSheet onClose={close} ariaLabel={triggerLabel}>
          <RangeCalendar
            value={value}
            onChange={handleRangeChange}
            min={min}
            max={max}
            isDateUnavailable={isDateUnavailable}
            locale={activeLocale}
            size={size}
          />
        </ModalSheet>
      )}
      {open && !isMobile && (
        <div id={popoverId} role="dialog" aria-label={triggerLabel} className={styles.popover}>
          <RangeCalendar
            value={value}
            onChange={handleRangeChange}
            min={min}
            max={max}
            isDateUnavailable={isDateUnavailable}
            locale={activeLocale}
            size={size}
          />
        </div>
      )}
    </div>
  );
}
