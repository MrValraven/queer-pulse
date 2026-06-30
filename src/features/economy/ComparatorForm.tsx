import type { TaxYear } from "./tax.calc";
import {
  ACTIVITY_OPTIONS,
  STARTUP_OPTIONS,
  YEAR_OPTIONS,
  type ActivityKey,
  type StartupYear,
} from "./comparator.data";
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
  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="cmp-gross">
          Annual gross income (€)
        </label>
        <input
          id="cmp-gross"
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
        <label className={styles.rcLabel} htmlFor="cmp-activity">
          Freelance activity type
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
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.rcRow}>
        <div className={styles.field}>
          <label className={styles.rcLabel} htmlFor="cmp-year">
            Tax year
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
            Start of activity
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
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
