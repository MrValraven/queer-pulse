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
  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="th-gross">
          Annual gross income (€)
        </label>
        <input
          id="th-gross"
          className={styles.rcInput}
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          placeholder="e.g. 30000"
          value={gross}
          onChange={(e) => onChange({ gross: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="th-activity">
          Activity type
        </label>
        <select
          id="th-activity"
          className={styles.rcSelect}
          value={activity}
          onChange={(e) =>
            onChange({ activity: e.target.value as ActivityKey })
          }
        >
          {ACTIVITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="th-status">
          Worker status
        </label>
        <select
          id="th-status"
          className={styles.rcSelect}
          value={status}
          onChange={(e) => onChange({ status: e.target.value as WorkerStatus })}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.rcRow}>
        <div className={styles.field}>
          <label className={styles.rcLabel} htmlFor="th-year">
            Tax year
          </label>
          <select
            id="th-year"
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
          <label className={styles.rcLabel} htmlFor="th-startup">
            Start of activity
          </label>
          <select
            id="th-startup"
            className={styles.rcSelect}
            value={startupYear}
            onChange={(e) =>
              onChange({ startupYear: Number(e.target.value) as StartupYear })
            }
          >
            {STARTUP_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
