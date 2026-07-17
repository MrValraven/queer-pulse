import type { TaxYear } from "./tax.calc";
import {
  ACTIVITY_OPTIONS,
  STARTUP_OPTIONS,
  YEAR_OPTIONS,
  type ActivityKey,
  type StartupYear,
} from "./comparator.data";
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
        <select
          id="cmp-activity"
          className={styles.rcSelect}
          value={activity}
          onChange={(e) =>
            onChange({ activity: e.target.value as ActivityKey })
          }
        >
          {ACTIVITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {t(o.labelKey)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.rcRow}>
        <div className={styles.field}>
          <label className={styles.rcLabel} htmlFor="cmp-year">
            {t("economy:comparator.form.yearLabel")}
          </label>
          <select
            id="cmp-year"
            className={styles.rcSelect}
            value={year}
            onChange={(e) =>
              onChange({ year: Number(e.target.value) as TaxYear })
            }
          >
            {YEAR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.rcLabel} htmlFor="cmp-startup">
            {t("economy:comparator.form.startupLabel")}
          </label>
          <select
            id="cmp-startup"
            className={styles.rcSelect}
            value={startupYear}
            onChange={(e) =>
              onChange({ startupYear: Number(e.target.value) as StartupYear })
            }
          >
            {STARTUP_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {t(o.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
