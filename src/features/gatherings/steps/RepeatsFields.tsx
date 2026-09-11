import { useId } from "react";
import { DatePicker, SegmentedControl } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Field, SwitchRow, TextInput } from "../CreateGatheringFields";
import {
  CADENCE_OPTIONS,
  GATE_ANCHOR,
  MAX_RECURRENCE_OCCURRENCES,
  MIN_RECURRENCE_OCCURRENCES,
} from "../createGathering.data";
import type { GatheringForm } from "../useGatheringForm";
import { SeriesPreview } from "./SeriesPreview";
import styles from "./WhenWhereChapter.module.css";

/** How the series ends: after a number of dates, or on a last date. Both
 *  controls and the rule's own error share the recurrence anchor, since either
 *  can be the one that is wrong. */
function SeriesEndField({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fieldId = useId();
  const invalidMessage = form.recurrenceValid
    ? undefined
    : t("gatherings:create.step2b.invalidHint");

  if (form.endType === "count") {
    const countId = `${fieldId}-endCount`;
    return (
      <Field
        label={t("gatherings:create.step2b.endCountLabel")}
        htmlFor={countId}
        anchorId={GATE_ANCHOR.recurrence}
        hint={t("gatherings:create.step2b.endCountHint", {
          max: MAX_RECURRENCE_OCCURRENCES,
        })}
        error={invalidMessage}
      >
        <TextInput
          id={countId}
          className={styles.countInput}
          type="number"
          min={MIN_RECURRENCE_OCCURRENCES}
          max={MAX_RECURRENCE_OCCURRENCES}
          aria-invalid={!form.recurrenceValid}
          aria-describedby={
            invalidMessage
              ? `${countId}-hint ${countId}-error`
              : `${countId}-hint`
          }
          value={form.endCount}
          onChange={(event) => form.setEndCount(event.target.value)}
        />
      </Field>
    );
  }

  const untilId = `${fieldId}-endUntil`;
  return (
    <Field
      label={t("gatherings:create.step2b.endUntilLabel")}
      htmlFor={untilId}
      labelId={`${untilId}-label`}
      anchorId={GATE_ANCHOR.recurrence}
      error={invalidMessage}
    >
      <div className={styles.untilPicker}>
        <DatePicker
          mode="date"
          id={untilId}
          labelledBy={`${untilId}-label`}
          min={form.date || new Date().toISOString().slice(0, 10)}
          invalid={!form.recurrenceValid}
          aria-describedby={invalidMessage ? `${untilId}-error` : undefined}
          value={form.endUntil || null}
          onChange={(value) => form.setEndUntil(value ?? "")}
        />
      </div>
    </Field>
  );
}

/**
 * "This gathering repeats": a deliberately minimal cadence and end condition,
 * with the dates it produces read back underneath (MSG-10). Off by default.
 * Switched on, publishing creates a whole series of independent gatherings,
 * each RSVPable, editable and cancellable on its own (`formToCreateEventDto`,
 * `EventsService.create`).
 */
export function RepeatsFields({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fieldId = useId();
  const cadenceLabel = t("gatherings:create.step2b.cadenceLabel");
  const endTypeLabel = t("gatherings:create.step2b.endTypeLabel");

  return (
    <SwitchRow
      title={t("gatherings:create.step2b.toggle")}
      description={t("gatherings:create.v2.when.repeatsDescription")}
      isChecked={form.repeats}
      onChange={(isChecked) => form.setRepeats(isChecked)}
    >
      <div className={styles.repeatRule}>
        <Field label={cadenceLabel} labelId={`${fieldId}-cadence-label`}>
          <SegmentedControl
            fullWidth
            label={cadenceLabel}
            options={CADENCE_OPTIONS.map((option) => ({
              value: option.value,
              label: t(option.labelKey),
            }))}
            value={form.cadence}
            onChange={(value) => {
              const cadence = CADENCE_OPTIONS.find(
                (option) => option.value === value,
              )?.value;
              if (cadence) form.setCadence(cadence);
            }}
          />
        </Field>
        <Field label={endTypeLabel} labelId={`${fieldId}-endType-label`}>
          <SegmentedControl
            fullWidth
            label={endTypeLabel}
            options={[
              {
                value: "count",
                label: t("gatherings:create.step2b.endType.count"),
              },
              {
                value: "date",
                label: t("gatherings:create.step2b.endType.date"),
              },
            ]}
            value={form.endType}
            onChange={(value) =>
              form.setEndType(value === "date" ? "date" : "count")
            }
          />
        </Field>
        <SeriesEndField form={form} />
        <SeriesPreview form={form} />
      </div>
    </SwitchRow>
  );
}
