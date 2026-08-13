import type { TaxYear } from "./tax.calc";
import {
  ACTIVITY_OPTIONS,
  STARTUP_OPTIONS,
  STATUS_OPTIONS,
  YEAR_OPTIONS,
  type ActivityKey,
  type StartupYear,
  type WorkerStatus,
} from "./takeHome.data";
import { Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./TakeHomeCalculatorPage.module.css";

export interface TakeHomeFormProps {
  gross: string;
  activity: ActivityKey;
  year: TaxYear;
  startupYear: StartupYear;
  status: WorkerStatus;
  onChange: (
    patch: Partial<{
      gross: string;
      activity: ActivityKey;
      year: TaxYear;
      startupYear: StartupYear;
      status: WorkerStatus;
    }>,
  ) => void;
}

/** The input column: labelled gross, activity, year, startup and status fields. */
export function TakeHomeForm({
  gross,
  activity,
  year,
  startupYear,
  status,
  onChange,
}: TakeHomeFormProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="th-gross">
          {t("economy:takeHome.grossLabel")}
        </label>
        <input
          id="th-gross"
          className={styles.rcInput}
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          placeholder={t("economy:takeHome.grossPlaceholder")}
          value={gross}
          onChange={(e) => onChange({ gross: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="th-activity">
          {t("economy:takeHome.activityLabel")}
        </label>
        <Select
          id="th-activity"
          options={ACTIVITY_OPTIONS.map((o) => ({
            value: String(o.value),
            label: t(o.labelKey),
          }))}
          value={activity}
          onChange={(value) => onChange({ activity: value as ActivityKey })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="th-status">
          {t("economy:takeHome.statusLabel")}
        </label>
        <Select
          id="th-status"
          options={STATUS_OPTIONS.map((o) => ({
            value: String(o.value),
            label: t(o.labelKey),
          }))}
          value={status}
          onChange={(value) => onChange({ status: value as WorkerStatus })}
        />
      </div>

      <div className={styles.rcRow}>
        <div className={styles.field}>
          <label className={styles.rcLabel} htmlFor="th-year">
            {t("economy:takeHome.yearLabel")}
          </label>
          <Select
            id="th-year"
            options={YEAR_OPTIONS.map((o) => ({
              value: String(o.value),
              label: o.label,
            }))}
            value={String(year)}
            onChange={(value) => onChange({ year: Number(value) as TaxYear })}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.rcLabel} htmlFor="th-startup">
            {t("economy:takeHome.startupLabel")}
          </label>
          <Select
            id="th-startup"
            options={STARTUP_OPTIONS.map((o) => ({
              value: String(o.value),
              label: t(o.labelKey),
            }))}
            value={String(startupYear)}
            onChange={(value) =>
              onChange({ startupYear: Number(value) as StartupYear })
            }
          />
        </div>
      </div>
    </div>
  );
}
