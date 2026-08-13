import type { TaxYear } from "./tax.calc";
import {
  ACTIVITY_OPTIONS,
  STARTUP_OPTIONS,
  YEAR_OPTIONS,
  type ActivityKey,
  type StartupYear,
} from "./comparator.data";
import { Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ComparatorPage.module.css";

export interface ComparatorFormProps {
  gross: string;
  activity: ActivityKey;
  year: TaxYear;
  startupYear: StartupYear;
  onChange: (
    patch: Partial<{
      gross: string;
      activity: ActivityKey;
      year: TaxYear;
      startupYear: StartupYear;
    }>,
  ) => void;
}

/** The input column: labelled gross, activity, year and start-of-activity fields. */
export function ComparatorForm({
  gross,
  activity,
  year,
  startupYear,
  onChange,
}: ComparatorFormProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="cmp-gross">
          {t("economy:comparator.form.grossLabel")}
        </label>
        <input
          id="cmp-gross"
          className={styles.rcInput}
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          placeholder={t("economy:comparator.form.grossPlaceholder")}
          value={gross}
          onChange={(e) => onChange({ gross: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="cmp-activity">
          {t("economy:comparator.form.activityLabel")}
        </label>
        <Select
          id="cmp-activity"
          value={activity}
          onChange={(value) => onChange({ activity: value as ActivityKey })}
          options={ACTIVITY_OPTIONS.map((option) => ({
            value: option.value,
            label: t(option.labelKey),
          }))}
        />
      </div>

      <div className={styles.rcRow}>
        <div className={styles.field}>
          <label className={styles.rcLabel} htmlFor="cmp-year">
            {t("economy:comparator.form.yearLabel")}
          </label>
          <Select
            id="cmp-year"
            value={String(year)}
            onChange={(value) => onChange({ year: Number(value) as TaxYear })}
            options={YEAR_OPTIONS.map((option) => ({
              value: String(option.value),
              label: option.label,
            }))}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.rcLabel} htmlFor="cmp-startup">
            {t("economy:comparator.form.startupLabel")}
          </label>
          <Select
            id="cmp-startup"
            value={String(startupYear)}
            onChange={(value) =>
              onChange({ startupYear: Number(value) as StartupYear })
            }
            options={STARTUP_OPTIONS.map((option) => ({
              value: String(option.value),
              label: t(option.labelKey),
            }))}
          />
        </div>
      </div>
    </div>
  );
}
