import { useId } from "react";
import { DatePicker, Select } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { HOODS } from "../createGathering.data";
import type { GatheringForm } from "../useGatheringForm";
import styles from "../CreateGatheringPage.module.css";

export function DatePlaceStep({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fieldId = useId();
  return (
    <div>
      <div className={styles.stepTitle}>
        <Translation
          i18nKey="gatherings:create.step2.title"
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.stepSub}>{t("gatherings:create.step2.sub")}</p>
      <div className={styles.row2}>
        <div>
          <label id={`${fieldId}-date-label`} className={styles.label}>
            {t("gatherings:create.step2.dateLabel")}
          </label>
          <DatePicker
            mode="date"
            id={`${fieldId}-date`}
            labelledBy={`${fieldId}-date-label`}
            min={new Date().toISOString().slice(0, 10)}
            invalid={!form.dateValid}
            aria-required={true}
            aria-describedby={
              !form.dateValid ? `${fieldId}-date-hint` : undefined
            }
            value={form.date || null}
            onChange={(value) => form.setDate(value ?? "")}
          />
          {!form.dateValid && (
            <p id={`${fieldId}-date-hint`} className={styles.hint}>
              {t("gatherings:create.step2.dateRequired")}
            </p>
          )}
        </div>
        <div>
          <label id={`${fieldId}-time-label`} className={styles.label}>
            {t("gatherings:create.step2.timeLabel")}
          </label>
          <DatePicker
            mode="time"
            id={`${fieldId}-time`}
            labelledBy={`${fieldId}-time-label`}
            value={form.time || null}
            onChange={(value) => form.setTime(value ?? "")}
          />
        </div>
      </div>
      <div className={styles.row2}>
        <div>
          <label id={`${fieldId}-endTime-label`} className={styles.label}>
            {t("gatherings:create.step2.endTimeLabel")}
          </label>
          <DatePicker
            mode="time"
            id={`${fieldId}-endTime`}
            labelledBy={`${fieldId}-endTime-label`}
            value={form.endTime || null}
            onChange={(value) => form.setEndTime(value ?? "")}
          />
        </div>
        <div>
          <label className={styles.label} htmlFor={`${fieldId}-hood`}>
            {t("gatherings:create.step2.hoodLabel")}
          </label>
          <Select
            id={`${fieldId}-hood`}
            placeholder={t("gatherings:create.step2.hoodPlaceholder")}
            options={HOODS.map((hood) => ({
              value: hood.value,
              label: t(hood.labelKey),
            }))}
            value={form.hood || null}
            onChange={(value) => form.setHood(value ?? "")}
          />
        </div>
      </div>
      <label className={styles.label} htmlFor={`${fieldId}-venue`}>
        {t("gatherings:create.step2.venueLabel")}
      </label>
      <input
        id={`${fieldId}-venue`}
        className={styles.input}
        type="text"
        placeholder={t("gatherings:create.step2.venuePlaceholder")}
        value={form.venue}
        onChange={(e) => form.setVenue(e.target.value)}
      />
      <label className={styles.label} htmlFor={`${fieldId}-address`}>
        {t("gatherings:create.step2.addressLabel")}
      </label>
      <input
        id={`${fieldId}-address`}
        className={styles.input}
        type="text"
        placeholder={t("gatherings:create.step2.addressPlaceholder")}
        value={form.address}
        onChange={(e) => form.setAddress(e.target.value)}
      />
      <label className={styles.label} htmlFor={`${fieldId}-directions`}>
        {t("gatherings:create.step2.directionsLabel")}
      </label>
      <input
        id={`${fieldId}-directions`}
        className={styles.input}
        type="text"
        placeholder={t("gatherings:create.step2.directionsPlaceholder")}
        value={form.directions}
        onChange={(e) => form.setDirections(e.target.value)}
      />
    </div>
  );
}
