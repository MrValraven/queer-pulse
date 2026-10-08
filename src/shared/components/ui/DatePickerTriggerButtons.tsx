/**
 * The two buttons that close a date picker's trigger row, shared by
 * `SingleDatePicker` (in `DatePicker.tsx`) and `RangeDatePicker`: the icon
 * button that opens and closes the calendar panel, and the optional clear
 * button beside it. The typeable `DateField`s before them stay in each
 * picker, since single and range modes lay those out differently.
 */

import type { Ref } from "react";
import type { IconType } from "react-icons";
import { FiX } from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./Calendar.module.css";
import fieldStyles from "./DateField.module.css";

export interface DatePickerTriggerButtonsProps {
  triggerRef: Ref<HTMLButtonElement>;
  /**
   * FormField's injected `id`. It lands on the trigger button, a labelable
   * element, so a `<label htmlFor>` pointing at it has a real control to
   * focus. The button's own `aria-label` still sets its accessible name
   * (ARIA name computation: aria-label beats a native `<label for>`), so the
   * `id` only gives the label its target.
   */
  id?: string;
  disabled: boolean;
  isOpen: boolean;
  popoverId: string;
  triggerLabel: string;
  icon: IconType;
  onToggle: () => void;
  canClear: boolean;
  onClear: () => void;
}

export function DatePickerTriggerButtons({
  triggerRef,
  id,
  disabled,
  isOpen,
  popoverId,
  triggerLabel,
  icon: TriggerIcon,
  onToggle,
  canClear,
  onClear,
}: DatePickerTriggerButtonsProps) {
  const { t } = useTranslation();
  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={styles.trigger}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? popoverId : undefined}
        aria-label={triggerLabel}
        onClick={onToggle}
      >
        <TriggerIcon aria-hidden />
      </button>
      {canClear && (
        <button
          type="button"
          className={`${styles.clear} ${fieldStyles.clearHitArea}`}
          aria-label={t("shared:calendar.clear")}
          onClick={onClear}
        >
          <FiX aria-hidden />
        </button>
      )}
    </>
  );
}
