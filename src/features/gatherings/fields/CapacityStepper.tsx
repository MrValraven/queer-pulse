import { useId, type ReactNode } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Field, TextInput } from "../CreateGatheringFields";
import { MAX_CAPACITY, MIN_CAPACITY } from "../steps/whoChapter.data";
import styles from "./CapacityStepper.module.css";

/**
 * Capacity as a stepper: fewer and more buttons around the number input.
 *
 * Shared by the create wizard (`CapacityStepperField`) and the edit-details
 * modal (`EditDetailsAudience`), so both ask the question the same way. The
 * buttons move the number by one inside the 2..200 range and hand it back
 * through `onChange`, exactly as typing does. An empty field means no cap; a
 * press from empty starts at the minimum.
 *
 * Drawn inside the wizard's `Field`, which labels the one native input with a
 * real `<label htmlFor>` and names the hint and error lines after its id. The
 * modal's `FormField` would wire its ids onto the stepper's wrapper `<div>`
 * here, and its label would name that wrapper.
 */
export function CapacityStepper({
  value,
  onChange,
  label,
  hint,
  error,
  className,
}: {
  /** The capacity as typed, or `""` for no cap. */
  value: string;
  onChange: (value: string) => void;
  label: ReactNode;
  /** The muted line under the stepper. */
  hint?: ReactNode;
  /** The coral line under the stepper; also marks the input invalid. */
  error?: ReactNode;
  /** Passed to the `Field` wrapper, so a surface can restyle its label. */
  className?: string;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const inputId = `${fieldId}-capacity`;
  const currentCapacity = Number.parseInt(value, 10);
  const hasCapacity = Number.isFinite(currentCapacity);
  const isAtMinimum = hasCapacity && currentCapacity <= MIN_CAPACITY;
  const isAtMaximum = hasCapacity && currentCapacity >= MAX_CAPACITY;
  // `Field` renders these two lines with exactly these ids, and only when it
  // has something to say, so the input lists an id only while its line is on
  // the page.
  const describedBy =
    [hint ? `${inputId}-hint` : null, error ? `${inputId}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const stepCapacity = (direction: 1 | -1) => {
    const nextCapacity = hasCapacity
      ? Math.min(
          MAX_CAPACITY,
          Math.max(MIN_CAPACITY, currentCapacity + direction),
        )
      : MIN_CAPACITY;
    onChange(String(nextCapacity));
  };

  return (
    <Field
      label={label}
      htmlFor={inputId}
      hint={hint}
      error={error}
      className={className}
    >
      <div className={styles.stepper}>
        {/* aria-disabled keeps a pressed button focusable at the bound, so
            keyboard focus stays put when the number reaches its limit. */}
        <button
          type="button"
          className={styles.stepperButton}
          aria-label={t("gatherings:create.v2.who.capacityDecrease")}
          aria-controls={inputId}
          aria-disabled={isAtMinimum || undefined}
          onClick={() => {
            if (!isAtMinimum) stepCapacity(-1);
          }}
        >
          <FiMinus aria-hidden />
        </button>
        <TextInput
          id={inputId}
          className={styles.stepperInput}
          type="number"
          inputMode="numeric"
          min={MIN_CAPACITY}
          max={MAX_CAPACITY}
          placeholder={t("gatherings:create.step3.capPlaceholder")}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className={styles.stepperButton}
          aria-label={t("gatherings:create.v2.who.capacityIncrease")}
          aria-controls={inputId}
          aria-disabled={isAtMaximum || undefined}
          onClick={() => {
            if (!isAtMaximum) stepCapacity(1);
          }}
        >
          <FiPlus aria-hidden />
        </button>
      </div>
    </Field>
  );
}
