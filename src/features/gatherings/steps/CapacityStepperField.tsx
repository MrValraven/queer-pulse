import { useId } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Field, TextInput } from "../CreateGatheringFields";
import type { GatheringForm } from "../useGatheringForm";
import { MAX_CAPACITY, MIN_CAPACITY } from "./whoChapter.data";
import styles from "./WhoChapter.module.css";

/**
 * Capacity as a stepper: fewer and more buttons around the number input.
 *
 * The buttons move the number by one inside the 2..200 range and count as the
 * host touching the field, exactly as typing does, so the format default stops
 * following the family from the first press. An empty field means no cap; a
 * press from empty starts at the minimum.
 */
export function CapacityStepperField({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fieldId = useId();
  const inputId = `${fieldId}-capacity`;
  /**
   * Whether the number on screen is still the format's own suggestion, so the
   * hint under the field is true when it says so.
   *
   * `capacityDefault` is already null once the host has touched the field, and
   * the value comparison covers the other way in: a duplicated gathering that
   * carried no capacity seeds `cap` as an empty string and skips the default,
   * and an empty field must not be told what its number means.
   */
  const formatDefaultCapacity =
    form.capacityDefault !== null &&
    form.cap !== "" &&
    form.cap === String(form.capacityDefault)
      ? form.capacityDefault
      : null;
  const currentCapacity = Number.parseInt(form.cap, 10);
  const hasCapacity = Number.isFinite(currentCapacity);
  const isAtMinimum = hasCapacity && currentCapacity <= MIN_CAPACITY;
  const isAtMaximum = hasCapacity && currentCapacity >= MAX_CAPACITY;

  const stepCapacity = (direction: 1 | -1) => {
    const nextCapacity = hasCapacity
      ? Math.min(
          MAX_CAPACITY,
          Math.max(MIN_CAPACITY, currentCapacity + direction),
        )
      : MIN_CAPACITY;
    form.setCapTouched(String(nextCapacity));
  };

  return (
    <Field
      label={t("gatherings:create.step3.capLabel")}
      htmlFor={inputId}
      // Only while the number on screen is still the format's own suggestion.
      // Once the host changes it, the hint goes: a line claiming a default
      // that no longer applies is worse than none.
      hint={
        formatDefaultCapacity === null
          ? undefined
          : t("gatherings:create.step3.capDefaultHint", {
              count: formatDefaultCapacity,
            })
      }
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
          aria-describedby={
            formatDefaultCapacity === null ? undefined : `${inputId}-hint`
          }
          value={form.cap}
          onChange={(event) => form.setCapTouched(event.target.value)}
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
