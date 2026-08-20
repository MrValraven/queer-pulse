import { useId } from "react";
import { FiCheck } from "react-icons/fi";
import { DatePicker, Select } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { CADENCE_OPTIONS, MAX_RECURRENCE_OCCURRENCES, MIN_RECURRENCE_OCCURRENCES } from "../createGathering.data";
import type { GatheringForm } from "../useGatheringForm";
import styles from "../CreateGatheringPage.module.css";

/**
 * MSG-10 — the create-wizard "repeats" step: a deliberately minimal cadence
 * + end-condition pair, never an RFC5545/RRULE picker. Off by default (a
 * normal one-off gathering); switching it on generates a whole series of
 * independent, fully RSVPable/editable/cancelable events on publish — see
 * `formToCreateEventDto` (events.adapters.ts) and `EventsService.create`
 * (backend).
 */
export function RepeatsStep({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fieldId = useId();
  return (
    <div>
      <div className={styles.stepTitle}>
        <Translation
          i18nKey="gatherings:create.step2b.title"
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.stepSub}>{t("gatherings:create.step2b.sub")}</p>

      <div
        className={styles.checkRow}
        onClick={() => form.setRepeats(!form.repeats)}
        role="checkbox"
        aria-checked={form.repeats}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            form.setRepeats(!form.repeats);
          }
        }}
      >
        <div
          className={[styles.check, form.repeats && styles.checkOn]
            .filter(Boolean)
            .join(" ")}
        >
          {form.repeats ? <FiCheck /> : ""}
        </div>
        <span className={styles.checkText}>
          {t("gatherings:create.step2b.toggle")}
        </span>
      </div>

      {form.repeats && (
        <>
          <div className={styles.row2}>
            <div>
              <label className={styles.label} htmlFor={`${fieldId}-cadence`}>
                {t("gatherings:create.step2b.cadenceLabel")}
              </label>
              <Select
                id={`${fieldId}-cadence`}
                options={CADENCE_OPTIONS.map((option) => ({
                  value: option.value,
                  label: t(option.labelKey),
                }))}
                value={form.cadence}
                onChange={(value) =>
                  form.setCadence((value ?? "weekly") as typeof form.cadence)
                }
              />
            </div>
            <div>
              <label className={styles.label} htmlFor={`${fieldId}-endType`}>
                {t("gatherings:create.step2b.endTypeLabel")}
              </label>
              <Select
                id={`${fieldId}-endType`}
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
                  form.setEndType((value ?? "count") as typeof form.endType)
                }
              />
            </div>
          </div>

          {form.endType === "count" ? (
            <>
              <label className={styles.label} htmlFor={`${fieldId}-endCount`}>
                {t("gatherings:create.step2b.endCountLabel")}
              </label>
              <input
                id={`${fieldId}-endCount`}
                className={styles.input}
                type="number"
                min={MIN_RECURRENCE_OCCURRENCES}
                max={MAX_RECURRENCE_OCCURRENCES}
                value={form.endCount}
                onChange={(event) => form.setEndCount(event.target.value)}
              />
              <p className={styles.hint}>
                {t("gatherings:create.step2b.endCountHint", {
                  max: MAX_RECURRENCE_OCCURRENCES,
                })}
              </p>
            </>
          ) : (
            <>
              <label
                id={`${fieldId}-endUntil-label`}
                className={styles.label}
                htmlFor={`${fieldId}-endUntil`}
              >
                {t("gatherings:create.step2b.endUntilLabel")}
              </label>
              <DatePicker
                mode="date"
                id={`${fieldId}-endUntil`}
                labelledBy={`${fieldId}-endUntil-label`}
                min={form.date || new Date().toISOString().slice(0, 10)}
                invalid={!form.recurrenceValid}
                value={form.endUntil || null}
                onChange={(value) => form.setEndUntil(value ?? "")}
              />
            </>
          )}

          {!form.recurrenceValid && (
            <p className={styles.hint}>
              {t("gatherings:create.step2b.invalidHint")}
            </p>
          )}
        </>
      )}
    </div>
  );
}
