import { useId } from "react";
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
          <label className={styles.label} htmlFor={`${fieldId}-date`}>
            {t("gatherings:create.step2.dateLabel")}
          </label>
          <input
            id={`${fieldId}-date`}
            className={styles.input}
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            required
            aria-invalid={!form.dateValid}
            aria-describedby={
              !form.dateValid ? `${fieldId}-date-hint` : undefined
            }
            value={form.date}
            onChange={(e) => form.setDate(e.target.value)}
          />
          {!form.dateValid && (
            <p id={`${fieldId}-date-hint`} className={styles.hint}>
              {t("gatherings:create.step2.dateRequired")}
            </p>
          )}
        </div>
        <div>
          <label className={styles.label} htmlFor={`${fieldId}-time`}>
            {t("gatherings:create.step2.timeLabel")}
          </label>
          <input
            id={`${fieldId}-time`}
            className={styles.input}
            type="time"
            value={form.time}
            onChange={(e) => form.setTime(e.target.value)}
          />
        </div>
      </div>
      <div className={styles.row2}>
        <div>
          <label className={styles.label} htmlFor={`${fieldId}-endTime`}>
            {t("gatherings:create.step2.endTimeLabel")}
          </label>
          <input
            id={`${fieldId}-endTime`}
            className={styles.input}
            type="time"
            value={form.endTime}
            onChange={(e) => form.setEndTime(e.target.value)}
          />
        </div>
        <div>
          <label className={styles.label} htmlFor={`${fieldId}-hood`}>
            {t("gatherings:create.step2.hoodLabel")}
          </label>
          <select
            id={`${fieldId}-hood`}
            className={styles.select}
            value={form.hood}
            onChange={(e) => form.setHood(e.target.value)}
          >
            <option value="">
              {t("gatherings:create.step2.hoodPlaceholder")}
            </option>
            {HOODS.map((hood) => (
              <option key={hood.value} value={hood.value}>
                {t(hood.labelKey)}
              </option>
            ))}
          </select>
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
