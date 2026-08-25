/**
 * `DatePicker`'s floating popover body: mode-specific picker content wrapped
 * in a `role="dialog"` + Escape-to-close contract, close cousin of `Select`'s
 * `SelectPanel` (which has no `role="dialog"` at all — this one takes it
 * because unlike a listbox, its content genuinely varies by shape: a grid, a
 * button grid, or a bare field). Deliberately NOT `aria-modal="true"`: no
 * focus trap is implemented here (Tab can still leave the popover), and
 * `aria-modal` on an untrapped dialog actively misleads assistive tech into
 * treating the rest of the page as inert while focus can still reach it.
 * This is an honest non-modal dialog — closed via Escape, outside pointerdown
 * (`useOutsideDismiss` in `DatePicker.tsx`), or picking a value.
 *
 * Escape is caught via a `document` `keydown` listener (like `Modal.tsx`),
 * not an inline `onKeyDown` on the dialog `<div>` itself — `role="dialog"`
 * is a non-interactive role, so a direct handler there trips
 * `jsx-a11y/no-noninteractive-element-interactions`. The actual mode content
 * (`date`/`datetime` show the `Calendar` grid; `month` shows
 * `MonthGridPopover`; `time` shows a bare `DateField`, deliberately no grid
 * per spec §6's "mode=time renders a time field without a date grid"
 * contract) plus the presets row and "Today" button live in
 * `DatePickerPopoverContent`, shared verbatim with the mobile `ModalSheet`
 * branch in `DatePicker.tsx` (Task 8) — this file only supplies the desktop
 * dialog chrome around it.
 */

import { useEffect, useRef } from "react";
import type { FieldMode } from "./DateField";
import { DatePickerPopoverContent } from "./DatePickerPopoverContent";
import type { DatePickerPreset } from "./DatePickerPresets";
import styles from "./Calendar.module.css";

export interface DatePickerPopoverProps {
  id: string;
  mode: FieldMode;
  value: string | null;
  dialogLabel: string;
  locale: string;
  min?: string;
  max?: string;
  isDateUnavailable?: (iso: string) => boolean;
  size?: "md" | "sm";
  presets?: DatePickerPreset[];
  presetHasToday?: boolean;
  onSelectDay: (iso: string) => void;
  onSelectMonth: (iso: string) => void;
  onTimeChange: (iso: string | null) => void;
  onPresetSelect: (value: string) => void;
  onToday: () => void;
  onClose: () => void;
}

export function DatePickerPopover({
  id,
  mode,
  value,
  dialogLabel,
  locale,
  min,
  max,
  isDateUnavailable,
  size,
  presets,
  presetHasToday,
  onSelectDay,
  onSelectMonth,
  onTimeChange,
  onPresetSelect,
  onToday,
  onClose,
}: DatePickerPopoverProps) {
  // Callback read through a ref (mirrors `useOutsideDismiss`) so the effect
  // below subscribes once per mount, not on every render.
  const savedOnClose = useRef(onClose);
  useEffect(() => {
    savedOnClose.current = onClose;
  });
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        savedOnClose.current();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      id={id}
      role="dialog"
      aria-label={dialogLabel}
      className={styles.popover}
    >
      <DatePickerPopoverContent
        mode={mode}
        value={value}
        locale={locale}
        min={min}
        max={max}
        isDateUnavailable={isDateUnavailable}
        size={size}
        presets={presets}
        presetHasToday={presetHasToday}
        onSelectDay={onSelectDay}
        onSelectMonth={onSelectMonth}
        onTimeChange={onTimeChange}
        onPresetSelect={onPresetSelect}
        onToday={onToday}
      />
    </div>
  );
}
